import * as vscode from 'vscode';
import {
	Progress,
	CancellationToken,
	LanguageModelChatInformation,
	LanguageModelChatProvider,
	LanguageModelResponsePart,
	LanguageModelChatRequestMessage,
	/**
	 * 	[DEPRECATED]
	 * 	LanguageModelChatRequestHandleOptions
	 *
	 * 	replaced by:
	 */
	ProvideLanguageModelChatResponseOptions,
} from 'vscode';
import OpenAI from 'openai';
import { convertMessages } from './utils/messages';
import {
  QWEN_MODELS,
  DEEPSEEK_MODELS,
  KIMI_MODELS,
  GLM_MODELS,
} from '@/config/models'
import { StreamingToolCallParser } from './utils/parsers/streamingToolCallParser';

export const API_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

function getLastUserMessage(
	messages: OpenAI.Chat.ChatCompletionMessageParam[],
): OpenAI.Chat.ChatCompletionMessageParam | null {
	let lastUserMessage = null;

	for (let i = messages.length - 1; i >= 0; i--) {
		if (messages[i].role === 'user') {
			return messages[i];
		}
	}
	return lastUserMessage;
}

function extractRequestedTools(content: string): Set<string> {
	const tools = new Set<string>();
	const toolReferencesMatch = content.match(/<toolReferences>([\s\S]*?)<\/toolReferences>/);
	const toolReferencesContent = toolReferencesMatch ? toolReferencesMatch[1].trim() : null;

	if (toolReferencesContent === null) {
		return tools;
	}

	const toolLines = toolReferencesContent.match(/^\s*-\s+([^\s]+)/gm) ?? [];
	for (const t of toolLines.map((line) => line.replace(/^\s*-\s+/, '').trim())) {
		tools.add(t);
	}

	return tools;
}

export class QwenChatModelProvider implements LanguageModelChatProvider {
	private _processPartId: string | undefined;
	private _isAnswering = false;
	private _textContentBuffer = '';
	private _toolCallBuffers = new Map<
		string,
		{ id: string; name: string; args: Record<string, unknown> }
	>();

	private readonly _streamingToolCallParser = new StreamingToolCallParser();

	/** Indices for which a tool call has been fully emitted. */
	private _completedToolCallIndices = new Set<number>();

	/**
	 * Create a provider using the given secret storage for the API key.
	 * @param secrets VS Code secret storage.
	 */
	constructor(private readonly secrets: vscode.SecretStorage) {}

	async provideLanguageModelChatInformation(): Promise<LanguageModelChatInformation[]> {
		return [
			...QWEN_MODELS,
			...DEEPSEEK_MODELS,
			...KIMI_MODELS,
			...GLM_MODELS,
		];
	}

	async provideLanguageModelChatResponse(
		model: LanguageModelChatInformation,
		messages: readonly vscode.LanguageModelChatMessage[],
		options: ProvideLanguageModelChatResponseOptions,
		progress: Progress<LanguageModelResponsePart>,
		token: CancellationToken,
	): Promise<void> {
		let requestBody: Record<string, unknown> | undefined;

		try {
			// Initialize the text content buffer for this request
			this._textContentBuffer = '';
			
			const apiKey = await this.ensureApiKey(true);
			if (!apiKey) {
				throw new Error('Qwen API key not found');
			}

			const trackingProgress: Progress<LanguageModelResponsePart> = {
				report: (part) => {
					try {
						progress.report(part);
					} catch (e) {
						console.error('[Qwen Provider] Progress.report failed', {
							modelId: model.id,
							error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
						});
					}
				},
			};

			const client = new OpenAI({
				apiKey,
				baseURL: API_BASE_URL,
			});

			const openaiMessages = convertMessages(
				messages,
				Object.fromEntries(this._toolCallBuffers),
			);
			const lastUserMessage = getLastUserMessage(openaiMessages);
			const userRequestedTools = extractRequestedTools(
				(lastUserMessage?.content as string) ?? '',
			);

			const openaiTools = options.tools
				?.map((tool) =>
					userRequestedTools.has(tool.name)
						? {
								type: 'function' as const,
								function: {
									name: tool.name,
									description: tool.description,
									parameters: tool.inputSchema ?? { type: 'object' },
								},
							}
						: null,
				)
				.filter((t) => t !== null);
			const stream = await client.chat.completions.create(
				{
					model: model.id,
					messages: openaiMessages,
					stream: true,
				},
				{
					body: {
						model: model.id,
						messages: openaiMessages,
						stream: true,
						stream_options: {
							include_usage: true,
						},
						enable_thinking: true,
						...(openaiTools?.length ? { tools: openaiTools } : {}),
					},
				},
			);

			// 3. Process the streaming response.
			for await (const chunk of stream) {
				if (token.isCancellationRequested) {
					break;
				}
				// The last chunk does not contain choices, but it contains usage information.
				if (chunk.choices && chunk.choices.length > 0) {
					const deltaObj: any = chunk.choices[0]?.delta;

					const maybeThinking = (deltaObj as Record<string, unknown> | undefined)
						?.reasoning_content;
					if (maybeThinking !== undefined) {
						const vsAny = vscode as unknown as Record<string, unknown>;
						const ThinkingCtor = vsAny['LanguageModelThinkingPart'];

						const modelThought = deltaObj.reasoning_content;

						if (/\n\n/.test(modelThought as string) || this._processPartId === undefined) {
							this._processPartId = `thought_${Math.random().toString(36).slice(2, 10)}`;
						}
						let id: string = this._processPartId;
						let metadata: unknown;

						trackingProgress.report(
							new (ThinkingCtor as new (
								text: string,
								id?: string,
								metadata?: unknown,
							) => unknown)(
								modelThought,
								id,
								metadata,
							) as unknown as vscode.LanguageModelResponsePart,
						);
					}

					if (deltaObj.tool_calls !== undefined && deltaObj.tool_calls) {
						for (const tc of deltaObj.tool_calls) {
							this._streamingToolCallParser.addChunk(
								tc.index ?? 0,
								tc.function?.arguments ?? '',
								tc.id,
								tc.function?.name,
							);
						}
					}
					if (deltaObj.content !== undefined && deltaObj.content) {
						const content = deltaObj.content ?? '';

						if (!this._isAnswering) {
							this._isAnswering = true;
						}
						
						// Accumulate content in buffer to handle models that break content into lines
						this._textContentBuffer += content;
						
						/**
						 * 	Check if we have a paragraph break (\n\n) or similar indicators
						 * 	to flush the buffer. This helps handle models that send content
						 * 	in smaller chunks with line breaks
						 */
						if (this._textContentBuffer.includes('\n\n')) {
							// Report the accumulated content when we detect paragraph breaks
							const currentBufferParts = this._textContentBuffer.split('\n\n');

							trackingProgress.report(new vscode.LanguageModelTextPart(`${currentBufferParts.shift() ?? ''}\n\n`));
							
							// Reset the buffer after reporting
							this._textContentBuffer = currentBufferParts.join('\n\n');
						}
						else if (this._textContentBuffer.length > 1000) {
							// For smoother UX, we can also report shorter chunks if they've been accumulating for a while
							// or if the buffer gets too large without paragraph breaks
							trackingProgress.report(new vscode.LanguageModelTextPart(this._textContentBuffer));
							this._textContentBuffer = '';
						}
					}

					if (chunk.choices[0]?.finish_reason) {
						for (const completed of this._streamingToolCallParser.getCompletedToolCalls()) {
							this._toolCallBuffers.set(
								completed.id ?? `call_${Math.random().toString(36).slice(2, 10)}`,
								{
									id: completed.id ?? `call_${Math.random().toString(36).slice(2, 10)}`,
									name: completed.name!,
									args: completed.args,
								},
							);
							progress.report(
								new vscode.LanguageModelToolCallPart(
									completed.id ?? `call_${Math.random().toString(36).slice(2, 10)}`,
									completed.name!,
									completed.args,
								),
							);
						}

						// Clear the toolCallsBuffer
						this._toolCallBuffers.clear();
						this._streamingToolCallParser.reset();
					}
				} else if (chunk.usage) {
					/**
					 * TODO: When the request is complete:
					 *
					 * 	- Input Tokens: chunk.usage.prompt_tokens
					 * 	- Output Tokens: chunk.usage.completion_tokens
					 * 	- Total Tokens: chunk.usage.total_tokens
					 */
				}
			}

			// Flush any remaining content in the buffer when the stream ends
			if (this._textContentBuffer) {
				trackingProgress.report(new vscode.LanguageModelTextPart(this._textContentBuffer));
				this._textContentBuffer = '';
			}

			this._isAnswering = false;
		} catch (e) {
			console.error('[Qwen Chat Provider] Chat completion request failed', {
				modelId: model.id,
				messageCount: messages.length,
				error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
			});
			vscode.window.showErrorMessage(
				e instanceof Error ? e.message : String(e)
			)
		}
	}

	async provideTokenCount(
		model: LanguageModelChatInformation,
		text: string | LanguageModelChatRequestMessage,
		token: CancellationToken,
	): Promise<number> {
		if (typeof text === 'string') {
			return Math.ceil(text.length / 4);
		} else {
			let totalTokens = 0;
			for (const part of text.content) {
				if (part instanceof vscode.LanguageModelTextPart) {
					totalTokens += Math.ceil(part.value.length / 4);
				}
			}

			return totalTokens;
		}
	}

	private async ensureApiKey(silent: boolean): Promise<string | undefined> {
		let apiKey = await this.secrets.get('alibabaCloud.qwen.apiKey');
		if (!apiKey && !silent) {
			const entered = await vscode.window.showInputBox({
				title: 'Qwen API Key',
				prompt: 'Enter your Qwen API Key',
				ignoreFocusOut: true,
				password: true,
			});

			if (entered && entered.trim()) {
				apiKey = entered.trim();
				await this.secrets.store('alibabaCloud.qwen.apiKey', apiKey);
			}
		}

		return apiKey;
	}
}
