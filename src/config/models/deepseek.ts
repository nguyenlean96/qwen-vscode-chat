import { LanguageModelChatInformation } from "vscode";


export const SUPPORTED_MODELS: LanguageModelChatInformation[] = [
  {
		id: 'deepseek-v3.2',
		name: 'Deepseek 3.2',
		family: 'Deepseek',
		version: '3.2',
		maxInputTokens: 98_304,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
  {
		id: 'deepseek-v3.2-exp',
		name: 'Deepseek 3.2 (Experimental)',
		family: 'Deepseek',
		version: '3.2',
		maxInputTokens: 98_304,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
  {
		id: 'deepseek-v3.1',
		name: 'Deepseek 3.1',
		family: 'Deepseek',
		version: '3.1',
		maxInputTokens: 98_304,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
  {
		id: 'deepseek-r1',
		name: 'Deepseek R1',
		family: 'Deepseek',
		version: 'R1',
		maxInputTokens: 98_304,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
  {
		id: 'deepseek-r1-0528',
		name: 'Deepseek R1 (0528)',
		family: 'Deepseek',
		version: 'R1',
		maxInputTokens: 98_304,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
]