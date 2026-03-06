import { LanguageModelChatInformation } from "vscode";

export const SUPPORTED_MODELS: LanguageModelChatInformation[] = [
	{
		id: 'kimi-k2-thinking',
		name: 'Kimi K2 Thinking',
		family: 'Kimi',
		version: '2',
		maxInputTokens: 1000000,
		maxOutputTokens: 65536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'kimi-k2.5',
		name: 'Kimi K2.5',
		family: 'Kimi',
		version: '2.5',
		maxInputTokens: 1000000,
		maxOutputTokens: 65536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-vl-235b-a22b-thinking',
		name: 'Qwen3 VL 235B Thinking',
		family: 'qwen',
		version: '3',
		maxInputTokens: 1000000,
		maxOutputTokens: 65536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen2.5-7b-instruct-1m',
		name: 'Qwen2.5 7B Instruct',
		family: 'qwen',
		version: '2.5',
		maxInputTokens: 1000000,
		maxOutputTokens: 65536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3.5-plus',
		name: 'Qwen3.5 Plus',
		family: 'qwen',
		version: '3.5',
		maxInputTokens: 1000000,
		maxOutputTokens: 65536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-coder-next',
		name: 'Qwen3 Coder Next',
		family: 'qwen',
		version: '3',
		maxInputTokens: 1000000,
		maxOutputTokens: 65536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-coder-plus',
		name: 'Qwen3 Coder Plus',
		family: 'qwen',
		version: '3',
		maxInputTokens: 1000000,
		maxOutputTokens: 65536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-max',
		name: 'Qwen3 Max',
		family: 'qwen',
		version: '3',
		maxInputTokens: 262144,
		maxOutputTokens: 32768, // 65536 in non-thinking mode
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-max-2026-01-23',
		name: 'Qwen3 Max (2026-01-23)',
		family: 'qwen',
		version: '3',
		maxInputTokens: 262144,
		maxOutputTokens: 32768, // 65536 in non-thinking mode
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
];

export const API_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';