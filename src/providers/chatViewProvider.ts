import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { OllamaService } from '../service/ollama';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ollot.chatview';
    private _view?: vscode.WebviewView;
    private _activeRequest?: AbortController;
    private _isCancelled = false;
    private _currentModel = "";

    constructor (
        private readonly _extensionUri: vscode.Uri,
        private readonly _ollamaService: OllamaService
    ) {}

    async resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlWebview();
        webviewView.title = 'Ollama Chat';
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'webviewReady':
                    await this.handleWebviewReady();
                    break;
                case 'refreshAvailability':
                    await this.handleWebviewReady();
                    break;
                case 'openSettings':
                    await vscode.commands.executeCommand('workbench.action.openSettings', data.setting);
                    break;
                case 'sendMessage':
                    await this.handleMessage(data.message);
                    break;
                case 'cancelRequest':
                    this.cancelActiveRequest();
                    break;
                case 'modelChanged':
                    // this._currentModel = data.model;
                    await this.handleModelChange(data.model);
                    break;
                case 'getModels':
                    await this.sendAvailableModels();
                    break;
            }
        });
    }

    private async handleWebviewReady() {
        try {
            const available = await this._ollamaService.checkAvailability();
            if (!available) {
                this._view?.webview.postMessage({
                    type: 'serviceUnavailable',
                    content: 'Please ensure that Ollama is running and URL is correctly configured in user settings'
                });
            } else {
                this._view?.webview.postMessage({
                    type: 'ollamaConnected',
                    content: 'Connection established with your ollama service.'
                });
            }
        } catch (error: any) {}
    }

    private async handleMessage(message: string) {
        if (!message.trim()) {
            return;
        }
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
                for await (const chunk of this._ollamaService.streamResponse(message, this._currentModel, signal)) {
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
                    return;
                }
                throw error;
            } finally {
                this._activeRequest = undefined;
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
        }
    }

    private _getHtmlWebview(): string {
        const htmlPath = path.join(this._extensionUri.fsPath, 'out', 'UI', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'out', 'UI', 'bundle.js');
        const scriptUri = this._view?.webview.asWebviewUri(scriptPathOnDisk);
        html = html.replace('#{scriptUri}', scriptUri?.toString() ?? '');
        html = html.replace(/#{webview.cspSource}/g, this._view?.webview.cspSource ?? '');
        return html;
    }

    private async sendAvailableModels() {
        try {
            const models = await this._ollamaService.getModels();
            if (!models || models.length === 0) {
                this._view?.webview.postMessage({
                    type: 'noAvailableModels',
                    content: 'Please download an Ollama model.'
                });
            } else {
                this._currentModel = models[0];
                this._view?.webview.postMessage({
                    type: 'availableModels',
                    models: models,
                    currentModel: this._currentModel
                });
            }
        } catch (error: any) {}
    }

    private async handleModelChange(model: string) {
        try {
            this._currentModel = model;
            this._view?.webview.postMessage({
                type: 'modelChangedSuccessfully',
                content: 'Model changed successfully.'
            });
        } catch (error) {
            this._view?.webview.postMessage({
                type: 'failedToChangedModel',
                content: 'Failed to change model.'
            });
        }
    }
}