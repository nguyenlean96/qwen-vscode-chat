import * as vscode from 'vscode';
import OpenAI from 'openai';



export function convertMessages(
	messages: readonly vscode.LanguageModelChatRequestMessage[],
	toolData: Record<string, unknown>,
): OpenAI.Chat.ChatCompletionMessageParam[] {
	const converted: OpenAI.Chat.ChatCompletionMessageParam[] = [];

	for (const message of messages) {
		const role = mapRole(message);
		const textParts: string[] = [];
		const toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];
		const toolResults: { tool_call_id: string; name: string; content: string }[] = [];

		for (const part of message.content ?? []) {
			if (part instanceof vscode.LanguageModelTextPart) {
				textParts.push(part.value);
			} else if (part instanceof vscode.LanguageModelToolCallPart) {
				const id = part.callId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
				const args = JSON.stringify(part.input ?? {});
				toolCalls.push({
					id,
					type: 'function',
					function: { name: part.name, arguments: args },
				});
			} else if (isToolResultPart(part)) {
				const callId = (part as { callId?: string }).callId ?? '';
				const content = collectToolResultText(part as { content?: ReadonlyArray<unknown> });
				toolResults.push({
					tool_call_id: callId,
					name: toolData[callId] as string ?? '',
					content,
				});
			}
		}

		const content = textParts.join('\n') || null;

		// Handle assistant message with tool calls
		if (role === 'assistant' && toolCalls.length > 0) {
			converted.push({
				role: 'assistant',
				content,
				tool_calls: toolCalls,
			});
		}
		else if (role === 'assistant') {
			converted.push({
				role: 'assistant',
				content,
			});
		}
		else if (role === 'tool') {
			// Add tool results as separate tool messages
			for (const result of toolResults) {
				converted.push({
					role: 'tool',
					content: result.content,
					tool_call_id: result.tool_call_id,
				});
			}
		}
		else if (role === 'user') {
			converted.push({
				role: 'user',
				content: content ?? '',
			});
		}
		else if (role === 'system') {
			converted.push({
				role: 'system',
				content: content ?? '',
			});
		}
	}

	return converted;
}

function mapRole(
	message: vscode.LanguageModelChatRequestMessage,
): 'system' | 'user' | 'assistant' | 'tool' | 'thinking' {
	const USER = vscode.LanguageModelChatMessageRole.User as unknown as number;
	const ASSISTANT = vscode.LanguageModelChatMessageRole.Assistant as unknown as number;

	const r = message.role as unknown as number;

	if (r === USER) {
		if (
			message?.content.length > 0 &&
			message?.content.some((part: any) => part?.callId !== undefined)
		) {
			return 'tool';
		}
		return 'user';
	}
	if (r === ASSISTANT) {
		return 'assistant';
	}

	return 'system';
}

export function isToolResultPart(
	unknown_part: unknown,
): unknown_part is { callId: string; content?: ReadonlyArray<unknown> } {
	if (!unknown_part || typeof unknown_part !== 'object') {
		return false;
	}

	const obj = unknown_part as Record<string, unknown>;
	const hasCallId = typeof obj.callId === 'string';
	const hasContent = 'content' in obj;
	return hasCallId && hasContent;
}

function collectToolResultText(content_part: { content?: ReadonlyArray<unknown> }): string {
	let text = '';
	for (const c of content_part.content ?? []) {
		if (c instanceof vscode.LanguageModelTextPart) {
			text += c.value;
		} else if (typeof c === 'string') {
			text += c;
		} else {
			try {
				text += JSON.stringify(c);
			} catch (err) {
				console.error('Failed to parse tool results data:', err);
			}
		}
	}

	return text;
}

export interface OpenAIFunctionToolDef {
	type: 'function';
	function: { name: string; description?: string; parameters?: object };
}