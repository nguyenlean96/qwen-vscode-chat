import { LanguageModelChatInformation } from "vscode";


export const SUPPORTED_MODELS: LanguageModelChatInformation[] = [
  {
		id: 'MiniMax-M2.5',
		name: 'MiniMax M2.5',
		family: 'MiniMax',
		version: 'M2.5',
		maxInputTokens: 258_048,
		maxOutputTokens: 32_768,
		capabilities: {
			toolCalling: true,
		},
	},
];