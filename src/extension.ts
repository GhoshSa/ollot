import * as vscode from 'vscode';
import { StatusBarService } from './functions/statusbar';
import { OllamaService } from './ollama/ollama';
import { ChatViewProvider } from './functions/chatViewProvider';

export async function activate(context: vscode.ExtensionContext) {
	const statusBarService = StatusBarService.getInstance();
	statusBarService.initialize(context);
	statusBarService.setReady();

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

export function deactivate() {
	StatusBarService.getInstance().dispose();
}