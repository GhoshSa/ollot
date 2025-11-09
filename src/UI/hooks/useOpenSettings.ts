import { vscode } from "../../utils/vscodeApi";

const useOpenSettings = () => {
    return (settingsKey: string) => {
        vscode.postMessage({
            type: 'openSettings',
            setting: settingsKey
        });
    };
};

export default useOpenSettings;