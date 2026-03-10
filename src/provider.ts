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
import { convertMessages } from './utils/messages';
import {
	QWEN_MODELS,
	MINIMAX_MODELS,
	DEEPSEEK_MODELS,
	KIMI_MODELS,
	GLM_MODELS,
} from '@/config/models'
import { StreamingToolCallParser } from './utils/parsers/streamingToolCallParser';
import { QwenClient } from './core/api/client';
import { GlobalStateStore } from './utils/storage';

export const API_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
export const CODING_API_BASE_URL = 'https://coding-intl.dashscope.aliyuncs.com/v1';

export class QwenChatModelProvider implements LanguageModelChatProvider {
	private store: GlobalStateStore;
	private _qwenClient: QwenClient | undefined;
	private _toolCallBuffers = new Map<
		string,
		{ id: string; name: string; args: Record<string, unknown> }
	>();

	/**
	 * Create a provider using the given secret storage for the API key.
	 * @param secrets VS Code secret storage.
	 */
	constructor(
		private context: vscode.ExtensionContext,
	) {
		this.store = new GlobalStateStore(context.globalState);
	}

	async provideLanguageModelChatInformation(): Promise<LanguageModelChatInformation[]> {
		return [
			...QWEN_MODELS,
			...MINIMAX_MODELS,
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
		let textContentBuffer = '';
		let processPartId: string | undefined;
		let streamingToolCallParser = new StreamingToolCallParser()
		/** Indices for which a tool call has been fully emitted. */
		let completedToolCallIndices = new Set<number>();

		let isAnswering = false;
		let inCodeBlock = false;

		const trackingProgress: Progress<LanguageModelResponsePart> = {
			report: (part) => {
				try {
					progress.report(part);
				} catch (e) {
					console.error('[Qwen Provider] Progress.report failed', {
						modelId: model.id,
						error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
					});
					vscode.window.showErrorMessage(
						e instanceof Error ? e.message : String(e)
					)
				}
			},
		};
		try {
			const apiKey = await this.ensureApiKey(true);
			if (!apiKey) {
				throw new Error('Qwen API key not found');
			}

			if (!this._qwenClient) {
				const lastUsedUrl = await this.store.get<string>('alibabaCloud.qwen.lastUsedUrl');
				this._qwenClient = new QwenClient(apiKey, lastUsedUrl);
			}

			const openaiMessages = convertMessages(
				messages,
				Object.fromEntries(this._toolCallBuffers),
			);

			/**
			 * All tools are available by default.
			 */
			const openaiCompatibleTools = options.tools
				?.map((tool) => ({
					type: 'function' as const,
					function: {
						name: tool.name,
						description: tool.description,
						parameters: tool.inputSchema ?? { type: 'object' },
					},
				}));

			let allowClientRotation: boolean = true;
			while (allowClientRotation) {
				try {
					const stream = await this._qwenClient.stream({
						model: model.id,
						messages: openaiMessages,
						stream_options: {
							include_usage: true,
						},
						...(openaiCompatibleTools?.length ? { tools: openaiCompatibleTools } : {}),
					});

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

								if (/\n\n/.test(modelThought as string) || processPartId === undefined) {
									processPartId = `thought_${Math.random().toString(36).slice(2, 10)}`;
								}
								let id: string = processPartId;
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
									streamingToolCallParser.addChunk(
										tc.index ?? 0,
										tc.function?.arguments ?? '',
										tc.id,
										tc.function?.name,
									);
								}
							}
							if (deltaObj.content !== undefined && deltaObj.content) {
								const content = deltaObj.content ?? '';

								if (!isAnswering) {
									isAnswering = true;
								}

								// Accumulate content in buffer to handle models that break content into lines
								textContentBuffer += content;

								// Process buffer to flush complete paragraphs or code blocks
								let bufferProcessed = true;
								while (bufferProcessed) {
									bufferProcessed = false;

									let splitIndex = -1;
									let tempInCodeBlock = inCodeBlock;
									for (let i = 0; i < textContentBuffer.length; i++) {
										// JS considers '\n' is *one* character
										const isStartOfLine = i === 0 || textContentBuffer[i - 1] === '\n';

										if (isStartOfLine && textContentBuffer.startsWith('```', i)) {
											tempInCodeBlock = !tempInCodeBlock;
											i += 2;
											continue;
										}

										if (textContentBuffer.startsWith('\n\n', i)) {
											if (!tempInCodeBlock) {
												splitIndex = i;
												break;
											}
											i += 1;
										}
									}

									if (splitIndex !== -1) {
										const completedChunk = textContentBuffer.slice(0, splitIndex + 2);
										trackingProgress.report(new vscode.LanguageModelTextPart(completedChunk));
										textContentBuffer = textContentBuffer.slice(splitIndex + 2);
										inCodeBlock = false;
										bufferProcessed = true;
									} else if (textContentBuffer.length > 1000) {
										const lastNewline = textContentBuffer.lastIndexOf('\n');

										if (lastNewline !== -1) {
											const completedChunk = textContentBuffer.slice(0, lastNewline + 1);

											for (let i = 0; i < completedChunk.length; i++) {
												const isStartOfLine = i === 0 || completedChunk[i - 1] === '\n';
												if (isStartOfLine && completedChunk.startsWith('```', i)) {
													inCodeBlock = !inCodeBlock;
													i += 2;
												}
											}

											trackingProgress.report(new vscode.LanguageModelTextPart(completedChunk));

											textContentBuffer = textContentBuffer.slice(lastNewline + 1);
											bufferProcessed = true;
										} else {
											if (textContentBuffer.length > 5000) {
												if (textContentBuffer.startsWith('```')) {
													inCodeBlock = !inCodeBlock;
												}
												trackingProgress.report(new vscode.LanguageModelTextPart(textContentBuffer));
												textContentBuffer = '';
											}
										}
									}
								}
							}

							if (chunk.choices[0]?.finish_reason) {
								for (const completed of streamingToolCallParser.getCompletedToolCalls()) {
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
								streamingToolCallParser.reset();
								this._toolCallBuffers.clear();
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

					allowClientRotation = false;
					await this.store.set('alibabaCloud.qwen.lastUsedUrl', this._qwenClient.getUrl());
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);

					// Match 4 followed by 2 digits (400-499), with word boundaries
					const match = message.match(/\b4\d{2}\b/);

					if (match) {
						const errorCode = parseInt(match[0]);
						switch (errorCode) {
							case 401:
							case 402:
							case 403:
								this._qwenClient.throwEndpointException(message);
								this._qwenClient.rotate();
								vscode.window.showInformationMessage("Switching API endpoint.")
								continue;

							default:
								console.error(`[Qwen Provider] HTTP ${errorCode}:`, err);
								throw err;
						}
					} else {
						allowClientRotation = false;
					}
				}
			}
		} catch (e) {
			console.error('[Qwen Chat Provider] Chat completion request failed', {
				modelId: model.id,
				messageCount: messages.length,
				error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
			});
			vscode.window.showErrorMessage(
				e instanceof Error ? e.message : String(e)
			)
		} finally {
			// Flush any remaining content in the buffer when the stream ends
			if (textContentBuffer.trim().length > 0) {
				trackingProgress.report(new vscode.LanguageModelTextPart(textContentBuffer));
			}

			textContentBuffer = '';
			processPartId = undefined;

			isAnswering = false;
			inCodeBlock = false

			streamingToolCallParser.reset();
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
		let apiKey = await this.context.secrets.get('alibabaCloud.qwen.apiKey');
		if (!apiKey && !silent) {
			const entered = await vscode.window.showInputBox({
				title: 'Qwen API Key',
				prompt: 'Enter your Qwen API Key',
				ignoreFocusOut: true,
				password: true,
			});

			if (entered && entered.trim()) {
				apiKey = entered.trim();
				await this.context.secrets.store('alibabaCloud.qwen.apiKey', apiKey);
			}
		}

		return apiKey;
	}
}
