import axios from "axios";
import { MODEL_NAME, OLLAMA_API_URL, OLLAMA_AVAILABILITY } from "../constants/constant";

export class OllamaService {
    private static instance: OllamaService | undefined;

    private constructor() {}

    public static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }

    async checkAvailability(): Promise<boolean> {
        try {
            const response = await axios.get(OLLAMA_AVAILABILITY, {
                timeout: 2000
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    public async* streamResponse(input: string): AsyncGenerator<string> {
        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: input,
                stream: true
            })
        });

        if (!response.ok || !response.body) {
            throw new Error('Failed to get response from Ollama.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) { break; }

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

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
        } finally {
            reader.releaseLock();
        }
    }
}