import React, { useRef, useState } from 'react'
import { HiOutlineArrowCircleUp, HiOutlineStop } from 'react-icons/hi'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'
import { AnimatePresence, motion } from 'framer-motion'

const InputContainer = () => {
    const [text, setText] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useAutoResizeTextarea(textareaRef)
    const handleSend = () => {
        setIsProcessing(true)
    }
    const handleAbort = () => {
        setIsProcessing(false)
    }
    return (
        <div className="flex p-2 items-center rounded-xl relative bg-[var(--background-color)]/5 backdrop-blur-[2px] border border-[var(--vscode-editor-foreground)]/10 shadow-[0_2px_8px_-1px_var(--vscode-widget-shadow),0_4px_12px_-2px_var(--vscode-widget-shadow),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <textarea
                placeholder="Ask here..."
                className="w-full resize-none outline-none text-sm font-semibold text-[var(--text-color)]"
                rows={1}
                ref={textareaRef}
                onChange={(e) => setText(e.target.value)}
            />
            <AnimatePresence mode="wait">
                {((!isProcessing && text.trim()) || isProcessing) && (
                    <motion.div
                        key={isProcessing ? 'stop' : 'send'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.1 }}
                    >
                        {!isProcessing ? (
                            <HiOutlineArrowCircleUp className="w-5 h-5 cursor-pointer" onClick={handleSend} />
                        ) : (
                            <HiOutlineStop className="w-5 h-5 cursor-pointer" onClick={handleAbort} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default InputContainer