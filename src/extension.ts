import * as vscode from 'vscode';
import { OllamaService } from './ollama/ollama';
import { ChatViewProvider } from './functions/chatViewProvider';

export async function activate(context: vscode.ExtensionContext) {
	const ollamaService = OllamaService.getInstance();
	const chatViewProvider = new ChatViewProvider(context.extensionUri, ollamaService);

	const chatView = vscode.window.registerWebviewViewProvider(
		'ollot.chatView',
		chatViewProvider,
		{
			webviewOptions: {
				retainContextWhenHidden: true
			}
		}
	);

	const openChatCommand = vscode.commands.registerCommand('ollot.openChat', () => {
		vscode.commands.executeCommand('workbench.view.extension.ollot-sidebar');
	});

	context.subscriptions.push(chatView, openChatCommand);
}

export function deactivate() {}