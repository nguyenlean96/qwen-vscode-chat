import { LanguageModelChatInformation } from "vscode";


export const SUPPORTED_MODELS: LanguageModelChatInformation[] = [
  {
		id: 'kimi-k2.5',
		name: 'Kimi K2.5',
		family: 'Kimi',
		version: '2.5',
		maxInputTokens: 258_048,
		maxOutputTokens: 32_768,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
  {
		id: 'kimi-k2-thinking',
		name: 'Kimi K2 Thinking',
		family: 'Kimi',
		version: '2',
		maxInputTokens: 229_376,
		maxOutputTokens: 16_384,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
]