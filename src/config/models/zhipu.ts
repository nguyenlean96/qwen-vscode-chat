import { LanguageModelChatInformation } from "vscode";


export const SUPPORTED_MODELS: LanguageModelChatInformation[] = [
  {
		id: 'glm-5',
		name: 'GLM-5',
		family: 'GLM',
		version: '5',
		maxInputTokens: 202_752,
		maxOutputTokens: 16_384,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
  {
		id: 'glm-4.7',
		name: 'GLM-4.7',
		family: 'GLM',
		version: '4',
		maxInputTokens: 169_984,
		maxOutputTokens: 16_384,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
  {
		id: 'glm-4.6',
		name: 'GLM-4.6',
		family: 'GLM',
		version: '4',
		maxInputTokens: 169_984,
		maxOutputTokens: 16_384,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
]