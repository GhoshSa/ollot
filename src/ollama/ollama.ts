import axios from "axios";
import { StatusBarService } from "../functions/statusbar";

const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'stable-code';

export class OllamaService {
    private static instance: OllamaService | undefined;
    private statusBarService: StatusBarService;

    private constructor() {
        this.statusBarService = StatusBarService.getInstance();
    }

    public static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }

    async checkAvailability(): Promise<boolean> {
        try {
            const response = await axios.get('http://127.0.0.1:11434/api/tags', {
                timeout: 2000
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    async* streamResponse(input: string): AsyncGenerator<string, void, unknown> {
        if (!input.trim()) {
            throw new Error("No input provided");
        }

        try {
            const response = await axios.post(OLLAMA_API_URL, {
                model: MODEL_NAME,
                prompt: input,
                stream: true
            }, {
                responseType: 'stream'
            });

            const stream = response.data;
            let buffer = '';

            for await (const chunk of stream) {
                buffer += chunk.toString();

                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, newlineIndex).trim();
                    buffer = buffer.substring(newlineIndex + 1);

                    if (line) {
                        try {
                            const jsonData = JSON.parse(line);
                            if (jsonData.response) {
                                yield jsonData.response;
                            } else {
                                try {
                                    const finalJson = JSON.parse(buffer);
                                    if (!finalJson.response) {
                                        return;
                                    }
                                } catch (finalJsonError) {
                                    if (stream.readableEnded) {
                                        return;
                                    }
                                    console.debug('Remaining buffer is not a complete JSON object');
                                }
                            }
                        } catch (jsonError) {
                            console.error('Error parsing JSON:', jsonError, line);
                        }
                    }
                }

                if (stream.readableEnded && buffer.trim() !== "") {
                    try {
                        const finalJson = JSON.parse(buffer);
                        if (!finalJson.response) {
                            return;
                        }
                    } catch (finalJsonError) {
                        console.debug("Buffer has some content but is not valid json and stream is ended:", finalJsonError, buffer);
                    }
                }
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error('Could not connect to Ollama. Make sure it is running.');
                } else if (error.response) {
                    throw new Error(`API Error (${error.response.status}): ${error.response.data?.error || error.message}`);
                } else if (error.request) {
                    throw new Error('No response received from Ollama');
                }
            }
            throw error;
        }
    }
}