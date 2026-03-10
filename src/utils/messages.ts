import * as vscode from 'vscode';
import OpenAI from 'openai';



/**
 * Converts VS Code Language Model chat messages to OpenAI API compatible message format.
 * 
 * This function transforms VS Code's LanguageModelChatRequestMessage array into the format
 * expected by the OpenAI Chat Completion API. It handles various message types including:
 * - Regular text messages (user, assistant, system)
 * - Tool calls (function calls from assistant)
 * - Tool results (responses from tool executions)
 * 
 * The conversion process:
 * 1. Maps VS Code message roles to OpenAI roles (user/assistant/system/tool)
 * 2. Extracts text content from LanguageModelTextPart instances
 * 3. Converts LanguageModelToolCallPart to OpenAI tool call format
 * 4. Processes tool result parts and maps them to tool messages
 * 5. Handles edge cases like missing content or call IDs
 * 
 * @param messages - Array of VS Code LanguageModelChatRequestMessage objects to convert
 * @param toolData - Mapping of tool call IDs to tool names for proper tool result formatting
 * 
 * @returns Array of OpenAI ChatCompletionMessageParam objects ready for API consumption
 * 
 * @example
 * const vscodeMessages = [
 *   { role: LanguageModelChatMessageRole.User, content: ['Hello'] },
 *   { role: LanguageModelChatMessageRole.Assistant, content: ['Hi there!'] }
 * ];
 * 
 * const openaiMessages = convertMessages(vscodeMessages, {});
 * // Returns: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi there!' }]
 */
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

/**
 * Maps VS Code LanguageModelChatMessageRole to OpenAI-compatible role strings.
 * 
 * Converts numeric role values from VS Code's LanguageModelChatMessageRole enum
 * to string roles used by OpenAI API. Also handles special case where user messages
 * containing tool call results should be mapped to 'tool' role.
 * 
 * @param message - The VS Code chat message to map
 * @returns OpenAI-compatible role string: 'system', 'user', 'assistant', 'tool', or 'thinking'
 */
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

/**
 * Type guard to check if a message part is a tool result part.
 * 
 * Validates that an unknown object conforms to the tool result part interface,
 * which requires a callId string and optional content array.
 * 
 * @param unknown_part - The unknown object to check
 * @returns true if the object is a valid tool result part, false otherwise
 */
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

/**
 * Extracts and formats text content from tool result parts.
 * 
 * Processes the content array of a tool result part, handling different content types:
 * - LanguageModelTextPart: extracts the value property
 * - String: uses the string directly
 * - Other types: attempts JSON stringification
 * 
 * @param content_part - The tool result part containing content to extract
 * @returns Concatenated string of all content parts
 */
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