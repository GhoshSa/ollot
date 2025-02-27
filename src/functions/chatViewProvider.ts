import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ollot.chatView';
    private _view?: vscode.WebviewView;

    constructor (
        private readonly _extensionUri: vscode.Uri,
        private readonly _ollamaService: any
    ) {}

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlWebview();

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this.handleMessage(data.message);
                    break;
            }
        });

        webviewView.title = 'Ollama Chat';
        webviewView.description = 'Chat with your Ollama model';
    }

    private async handleMessage(message: string) {
        try {
            if (!await this._ollamaService.checkAvailability()) {
                this._view?.webview.postMessage({ 
                    type: 'error', 
                    content: 'Ollama service is not available' 
                });
                return;
            }

            let response = '';
            for await (const chunk of this._ollamaService.streamResponse(message)) {
                response += chunk;
                this._view?.webview.postMessage({ 
                    type: 'response', 
                    content: chunk,
                    done: false
                });
            }

            this._view?.webview.postMessage({ 
                type: 'response', 
                content: response,
                done: true
            });

        } catch (error: any) {
            console.error('Error in handleMessage:', error);
            this._view?.webview.postMessage({ 
                type: 'error', 
                content: error.message
            });
        }
    }

    private _getHtmlWebview(): string {
        const htmlPath = path.join(this._extensionUri.fsPath, 'media', 'sidebar.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'script.js');
        const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css');
        
        const scriptUri = this._view?.webview.asWebviewUri(scriptPathOnDisk);
        const styleUri = this._view?.webview.asWebviewUri(stylePathOnDisk);

        html = html.replace('#{scriptUri}', scriptUri?.toString() ?? '');
        html = html.replace('#{styleUri}', styleUri?.toString() ?? '');
        
        if (this._view) {
            html = html.replace(/#{webview.cspSource}/g, this._view.webview.cspSource);
        }

        return html;
    }
}