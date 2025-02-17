import * as vscode from 'vscode';
import { StatusBarService } from './functions/statusbar';
import { OllamaService } from './ollama/ollama';

export async function activate(context: vscode.ExtensionContext) {
	const statusBarService = StatusBarService.getInstance();
	statusBarService.initialize(context);
	statusBarService.setReady();

	const disposable = vscode.commands.registerCommand('ollot.ollamaChat', async () => {
		const ollamaService = OllamaService.getInstance();
		const outputChannel = vscode.window.createOutputChannel('Ollama Chat');
		try {
			if (!await ollamaService.checkAvailability()) {
				throw new Error('Ollama service is not available. Please make sure it is running');
			}

			const input = await vscode.window.showInputBox({
				prompt: 'Enter your query',
				placeHolder: 'Type your question here...',
				ignoreFocusOut: true,
				validateInput: text => {
					return text.trim() ? null : 'Query cannot be empty';
				}
			});

			if (input) {
				statusBarService.setProcessing();
				outputChannel.clear();
				outputChannel.appendLine('Processing your request...');
				outputChannel.show(true);

				let fullResponse = '';
				for await (const chunk of ollamaService.streamResponse(input)) {
					outputChannel.append(chunk);
					fullResponse += chunk;
				}

				statusBarService.setReady();
			}
		} catch (error: any) {
			console.error('Error in command execution:', error);
			statusBarService.setError('Error');
			vscode.window.showErrorMessage(`Error: ${error.message}`);
			outputChannel.appendLine(`\nError occurred: ${error.message}`);
		}
	});
	context.subscriptions.push(disposable);
}

export function deactivate() {
	StatusBarService.getInstance().dispose();
}