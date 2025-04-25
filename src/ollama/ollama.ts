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

    public async* streamResponse(input: string, signal?: AbortSignal): AsyncGenerator<string> {
        const response = await axios.post(OLLAMA_API_URL, {
            model: MODEL_NAME,
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