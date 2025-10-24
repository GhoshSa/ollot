import { RefObject, useEffect } from "react";

function useAutoResizeTextarea(textareaRef: RefObject<HTMLTextAreaElement | null>, maxRows: number = 10) {
    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
            const maxHeight = lineHeight * maxRows;
            if (textarea.scrollHeight <= maxHeight) {
                textarea.style.overflowY = 'hidden';
                textarea.style.height = `${textarea.scrollHeight}px`;
            } else {
                textarea.style.overflowY = 'auto';
                textarea.style.height = `${maxHeight}px`;
            }
        }
    };
    useEffect (() => {
        const textarea = textareaRef.current;
        if (textarea) {
            resizeTextarea();
            textarea.addEventListener('input', resizeTextarea);
            return () => {
                textarea.removeEventListener('input', resizeTextarea);
            };
        }
    }, []);
}

export default useAutoResizeTextarea;