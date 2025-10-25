export const vscode = window.acquireVsCodeApi ? window.acquireVsCodeApi() : {
    postMessage: (message: any) => {
        console.log('Mock vscode API:', message);
    },
    setState: (state: any) => {},
    getState: () => null
};