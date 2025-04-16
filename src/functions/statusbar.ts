// import * as vscode from 'vscode';

// export class StatusBarService {
//     private statusBarItem: vscode.StatusBarItem;
//     private static instance: StatusBarService | undefined;

//     private constructor() {
//         this.statusBarItem = vscode.window.createStatusBarItem(
//             vscode.StatusBarAlignment.Right
//         );
//     }

//     public static getInstance(): StatusBarService {
//         if (!StatusBarService.instance) {
//             StatusBarService.instance = new StatusBarService();
//         }
//         return StatusBarService.instance;
//     }

//     public initialize(context: vscode.ExtensionContext): void {
//         context.subscriptions.push(this.statusBarItem);
//         this.setReady();
//     }

//     public setProcessing(): void {
//         this.updateStatus('$(sync~spin) Processing...');
//     }

//     public setReady(): void {
//         this.updateStatus('$(sync~spin) Ready');
//     }

//     public setError(message: string): void {
//         this.updateStatus(`$(error) ${message}`, true);
//     }

//     private updateStatus(text: string, isError: boolean = false): void {
//         this.statusBarItem.text = text;
//         this.statusBarItem.backgroundColor = isError ? new vscode.ThemeColor('statusBarItem.errorBackground') : undefined;
//         this.statusBarItem.show();
//     }
//     public dispose(): void {
//         this.statusBarItem.dispose();
//     }
// }