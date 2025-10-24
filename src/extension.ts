import * as vscode from 'vscode';
import { OllamaService } from './service/ollama';
import { ChatViewProvider } from './providers/chatViewProvider';

export async function activate(context: vscode.ExtensionContext) {
	const ollamaService = OllamaService.getInstance();
	const chatViewProvider = new ChatViewProvider(context.extensionUri, ollamaService);
	const chatView = vscode.window.registerWebviewViewProvider(
		'ollot.chatview',
		chatViewProvider,
		{
			webviewOptions: {
				retainContextWhenHidden: true
			}
		}
	);
	const openChatCommand = vscode.commands.registerCommand('ollot.openchat', () => {
		vscode.commands.executeCommand('workbench.view.extension.ollot-sidebar');
	});
	context.subscriptions.push(chatView, openChatCommand);
}

export function deactivate() {}