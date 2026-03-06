// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { QwenChatModelProvider } from './provider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const provider = new QwenChatModelProvider(context.secrets);

	vscode.lm.registerLanguageModelChatProvider("qwen", provider);

	const qwenManageCmd = vscode.commands.registerCommand('qwen.manage', async () => {
		const existing = await context.secrets.get('alibabaCloud.qwen.apiKey');
		const apiKey = await vscode.window.showInputBox({
			title: 'Alibaba Cloud - Qwen API Key',
			prompt: existing ? 'Update your API key' : 'Enter your API key',
			ignoreFocusOut: true,
			password: true,
			value: existing ?? '',
		});

		if (apiKey === undefined) {
			return; // user canceled
		}

		if (!apiKey.trim()) {
			await context.secrets.delete('alibabaCloud.qwen.apiKey');
			vscode.window.showInformationMessage('Alibaba Cloud Qwen - API key cleared.');
			return;
		}
		
		await context.secrets.store('alibabaCloud.qwen.apiKey', apiKey.trim());
		vscode.window.showInformationMessage('Qwen API key saved.');
	});

	context.subscriptions.push(qwenManageCmd);
}

// This method is called when your extension is deactivated
export function deactivate() {}
