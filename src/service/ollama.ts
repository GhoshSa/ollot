import axios from "axios";
import * as vscode from "vscode";

export class OllamaService {
    private static instance: OllamaService | undefined;
    private baseUrl: string | null = null;
    private isValid: boolean = false;

    private constructor() {
        const url = vscode.workspace.getConfiguration("ollot").get<string>("ollamaUrl");
        if (!url || url.trim() === "") {
            this.isValid = false;
            return;
        }
        try {
            new URL(url);
            this.baseUrl = url.replace(/\/+$/, "");
            this.isValid = true;
        } catch(e) {
            this.isValid = false;
        }
    }

    public static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }

    private isConfigured(): boolean {
        return this.isValid && this.baseUrl !== null;
    }

    private get modelsUrl(): string {
        return `${this.baseUrl}/api/tags`;
    }

    private get generateResponseUrl(): string {
        return `${this.baseUrl}/api/generate`;
    }

    public async checkAvailability(): Promise<boolean> {
        if (!this.isConfigured()) {return false;}
        try {
            const response = await axios.get(this.baseUrl!, {
                timeout: 2000
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    public async getModels(): Promise<string[]> {
        if (!this.isConfigured()) {return [];}
        try {
            const response = await axios.get(this.modelsUrl, {
                timeout: 2000
            });
            if (response.status === 200 && response.data && Array.isArray(response.data.models)) {
                return response.data.models.map((model: any) => model.name);
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    public async* streamResponse(input: string, model: string, signal?: AbortSignal): AsyncGenerator<string> {
        if (!this.isConfigured()) {throw new Error("Ollama is not configured.");}
        const response = await axios.post(this.generateResponseUrl, {
            model: model,
            prompt: input,
            stream: true
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'stream',
            signal
        });
        if (!response.data) {
            throw new Error('Failed to get response from Ollama.');
        }
        try {
            for await (const chunk of response.data) {
                if (signal?.aborted) {
                    throw new Error('Request cancelled');
                }
                const lines = chunk.toString().split('\n').filter((line: string) => line.trim());
                for (const line of lines) {
                    try {
                        const jsonResponse = JSON.parse(line);
                        if (jsonResponse.response) {
                            yield jsonResponse.response;
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                }
            }
        } catch (error) {
            throw new Error(`Stream error: ${error}`);
        }
    }
}