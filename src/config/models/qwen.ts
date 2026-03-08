import { LanguageModelChatInformation } from "vscode";

export const SUPPORTED_MODELS: LanguageModelChatInformation[] = [
	// Qwen Max
	{
		id: 'qwen3-max',
		name: 'Qwen3 Max',
		family: 'Qwen3',
		version: 'stable',
		maxInputTokens: 258_048,
		maxOutputTokens: 32_768,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-max-2026-01-23',
		name: 'Qwen3 Max (2026-01-23)',
		family: 'Qwen3',
		version: 'snapshot',
		maxInputTokens: 258_048,
		maxOutputTokens: 32_768,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-max-2025-09-23',
		name: 'Qwen3 Max (2025-09-23)',
		family: 'Qwen3',
		version: 'snapshot',
		maxInputTokens: 258_048,
		maxOutputTokens: 65_536,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-max-preview',
		name: 'Qwen3 Max (Preview)',
		family: 'Qwen3',
		version: 'preview',
		maxInputTokens: 258_048,
		maxOutputTokens: 32_768,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	
	// Qwen Plus
	{
		id: 'qwen3.5-plus',
		name: 'Qwen3.5 Plus',
		family: 'Qwen3',
		version: 'stable',
		maxInputTokens: 983_616,
		maxOutputTokens: 65_536,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3.5-plus-2026-02-15',
		name: 'Qwen3.5 Plus (2026-02-15)',
		family: 'Qwen3',
		version: 'snapshot',
		maxInputTokens: 983_616,
		maxOutputTokens: 65_536,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen-plus',
		name: 'Qwen Plus',
		family: 'Qwen',
		version: 'stable',
		maxInputTokens: 995_904,
		maxOutputTokens: 32_768,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen-plus-latest',
		name: 'Qwen Plus (Latest)',
		family: 'Qwen',
		version: 'latest',
		maxInputTokens: 995_904,
		maxOutputTokens: 32_768,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},

	// Qwen Flash
	{
		id: 'qwen3.5-flash',
		name: 'Qwen3.5 Flash',
		family: 'Qwen3',
		version: 'stable',
		maxInputTokens: 983_616,
		maxOutputTokens: 65_536,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3.5-flash-2026-02-23',
		name: 'Qwen3.5 Flash (2026-02-23)',
		family: 'Qwen3',
		version: 'snapshot',
		maxInputTokens: 983_616,
		maxOutputTokens: 65_536,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen-flash',
		name: 'Qwen Flash',
		family: 'Qwen',
		version: 'stable',
		maxInputTokens: 995_904,
		maxOutputTokens: 32_768,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen-flash-2025-07-28',
		name: 'Qwen Flash (2025-07-28)',
		family: 'Qwen',
		version: 'snapshot',
		maxInputTokens: 995_904,
		maxOutputTokens: 32_768,
		capabilities: {
			// TODO: Enable this
			// imageInput: true,
			toolCalling: true,
		},
	},

	// Qwen3
	{
		id: 'qwen3-next-80b-a3b-thinking',
		name: 'Qwen3 Next 80B Thinking',
		family: 'Qwen3',
		version: '3',
		maxInputTokens: 126_976,
		maxOutputTokens: 32_768,
		capabilities: {
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-235b-a22b-thinking-2507',
		name: 'Qwen3 235B Thinking (2507)',
		family: 'Qwen3',
		version: '3',
		maxInputTokens: 126_976,
		maxOutputTokens: 32_768,
		capabilities: {
			// imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-30b-a3b-thinking-2507',
		name: 'Qwen3 30B Thinking (2507)',
		family: 'Qwen3',
		version: '3',
		maxInputTokens: 126_976,
		maxOutputTokens: 32_768,
		capabilities: {
			// imageInput: true,
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
	
	// Qwen Coder
	{
		id: 'qwen3-coder-plus',
		name: 'Qwen3 Coder Plus',
		family: 'QwenCoder',
		version: 'stable',
		maxInputTokens: 997_952,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-coder-plus-2025-09-23',
		name: 'Qwen3 Coder Plus (2025-09-23)',
		family: 'QwenCoder',
		version: 'snapshot',
		maxInputTokens: 997_952,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-coder-plus-2025-07-22',
		name: 'Qwen3 Coder Plus (2025-07-22)',
		family: 'QwenCoder',
		version: 'snapshot',
		maxInputTokens: 997_952,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-coder-flash',
		name: 'Qwen3 Coder Flash',
		family: 'QwenCoder',
		version: 'stable',
		maxInputTokens: 997_952,
		maxOutputTokens: 65_536,
		capabilities: {
			imageInput: true,
			toolCalling: true,
		},
	},
	{
		id: 'qwen3-coder-flash-2025-07-28',
		name: 'Qwen3 Coder Flash (2025-07-28)',
		family: 'QwenCoder',
		version: 'snapshot',
		maxInputTokens: 997_952,
		maxOutputTokens: 65_536,
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
];
