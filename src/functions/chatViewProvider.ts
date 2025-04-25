import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { OllamaService } from '../ollama/ollama';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ollot.chatView';
    private _view?: vscode.WebviewView;
    private _activeRequest?: AbortController;
    private _isCancelled = false;

    constructor (
        private readonly _extensionUri: vscode.Uri,
        private readonly _ollamaService: OllamaService
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
                case 'cancelRequest':
                    this.cancelActiveRequest();
                    break;
            }
        });

        webviewView.title = 'Ollama Chat';
    }

    private async handleMessage(message: string) {
        this._isCancelled = false;

        try {
            this._activeRequest = new AbortController();
            const signal = this._activeRequest.signal;

            if (!await this._ollamaService.checkAvailability()) {
                this._view?.webview.postMessage({
                    type: 'error', 
                    content: 'Ollama service is not available' 
                });
                return;
            }

            if (this._isCancelled || signal.aborted) {
                this._view?.webview.postMessage({
                    type: 'responseCancelled',
                    content: '',
                    done: true
                });
                return;
            }

            let response = '';
            try {
                for await (const chunk of this._ollamaService.streamResponse(message, signal)) {
                    if (this._isCancelled || signal.aborted) {
                        throw new Error('Request aborted');
                    }

                    response += chunk;
                    this._view?.webview.postMessage({ 
                        type: 'response', 
                        content: chunk,
                        done: false
                    });
                }
    
                if (!signal.aborted) {
                    this._view?.webview.postMessage({
                        type: 'response', 
                        content: response,
                        done: true
                    });
                }
            } catch (error: any) {
                if (error.name === 'AbortError' || this._isCancelled) {
                    this._view?.webview.postMessage({
                        type: 'responseCancelled',
                        content: response,
                        done: true
                    });
                    // this._isCancelled = false;
                    return;
                }
                throw error;
            } finally {
                this._activeRequest = undefined;
                // this._isCancelled = false;
            }

        } catch (error: any) {
            if (!this._isCancelled) {
                this._view?.webview.postMessage({ 
                    type: 'error', 
                    content: error.message
                });
            }
        }
    }

    private cancelActiveRequest() {
        this._isCancelled = true;

        if (this._activeRequest) {
            this._activeRequest.abort();
            this._activeRequest = undefined;
        } else {
            this._view?.webview.postMessage({
                type: 'responseCancelled',
                content: '',
                done: true
            });
            // this._isCancelled = false;
        }
    }

    private _getHtmlWebview(): string {
        const htmlPath = path.join(this._extensionUri.fsPath, 'src', 'UI', 'sidebar.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'src', 'UI', 'script.js');
        const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'src', 'UI', 'style.css');
        
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