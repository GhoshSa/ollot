import * as vscode from 'vscode';
import axios from 'axios';

interface OllamaResponse {
	model: string;
	creates_at: string;
	response: string;
	done: boolean;
}

async function callOllamaAPI(input: string): Promise<string> {
	try {
		console.log('Sending request to Ollama API with input: ', input);
		const response = await axios.post<OllamaResponse>('http://127.0.0.1:11434/api/generate', {
			model: 'stable-code',
			prompt: input,
			stream: false
		});

		console.log('Raw API response: ', response.data);
		
		if (response.data.response) {
			return response.data.response;
		} else {
			const responseStr = JSON.stringify(response.data, null, 2);
			console.log('Fallback response: ', responseStr);
			return `Unable to parse response. Raw data: ${responseStr}`;
		}
	} catch (error: any) {
		console.log('Error calling Ollama API: ', error);
		vscode.window.showErrorMessage('Error communicating with ollama model' + error.message);
		return '';
	}
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('ollot.ollamaChat', async () => {
		try {
			const input = await vscode.window.showInputBox({
				prompt: 'Enter your query',
				placeHolder: 'Type your question here...',
			});
	
			if (input) {
				const outputChannel = vscode.window.createOutputChannel('Ollama Chat');
				outputChannel.clear();
				outputChannel.appendLine('Processing your request...');
				outputChannel.show(true);

				const result = await callOllamaAPI(input);

				outputChannel.clear();
				if (result) {
					outputChannel.appendLine('Query: ' + input);
					outputChannel.appendLine('\nResponse: ');
					outputChannel.appendLine(result);
				} else {
					outputChannel.appendLine('No response received from the model.');
				}
			}
		} catch (error: any) {
			console.error('Error in command execution:', error);
            vscode.window.showErrorMessage('Error executing command: ' + error.message);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}