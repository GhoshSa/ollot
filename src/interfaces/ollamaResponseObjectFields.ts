export interface OllamaResponse {
	model: string;
	creates_at: string;
	response?: string;
	error?: string;
	done: boolean;
}