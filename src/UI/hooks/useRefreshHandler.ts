import { useEffect, useRef, useState } from "react";
import { vscode } from "../../utils/vscodeApi";

function useRefreshHandler(minSpinMs: number = 600) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startRef = useRef<number | null>(null);
    const handleRefresh = () => {
        if (isRefreshing) {
            return;
        }
        startRef.current = Date.now();
        setIsRefreshing(true);
        vscode.postMessage({ type: 'refreshAvailability' });
    };
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'serviceUnavailable' || message.type === 'ollamaConnected') {
                const elapsed = Date.now() - (startRef.current ?? 0);
                const remaining = Math.max(0, minSpinMs - elapsed);
                setTimeout(() => {
                    setIsRefreshing(false);
                }, remaining);
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [minSpinMs]);
    return { isRefreshing, handleRefresh };
}

export default useRefreshHandler;