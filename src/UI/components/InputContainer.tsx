import React, { useRef, useState } from 'react'
import { HiOutlineArrowCircleUp, HiOutlineStop } from 'react-icons/hi'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'
import { AnimatePresence, motion } from 'framer-motion'

interface InputContainerProps {
    isProcessing: boolean
    onSend: (text: string) => void
    onAbort: () => void
}

const InputContainer = ({ isProcessing, onSend, onAbort }: InputContainerProps) => {
    const [text, setText] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useAutoResizeTextarea(textareaRef)

    const handleSend = () => {
        if (!text.trim() || isProcessing) {
            return
        }
        onSend(text.trim())
        setText('')
    }

    return (
        <div className="flex px-3 py-2 items-center rounded-xl" style={{ backgroundColor: 'var(--vscode-editor-background)' }}>
            <textarea
                placeholder="Ask here..."
                className="w-full resize-none outline-none text-sm font-semibold text-[var(--text-color)] bg-transparent"
                rows={1}
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                    }
                }}
                disabled={isProcessing}
            />
            <AnimatePresence mode="wait">
                {((!isProcessing && text.trim()) || isProcessing) && (
                    <motion.div
                        key={isProcessing ? 'stop' : 'send'}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.12 }}
                    >
                        {isProcessing ? (
                            <HiOutlineStop
                                className="w-5 h-5 cursor-pointer hover:text-[var(--vscode-errorForeground)]"
                                onClick={onAbort}
                            />
                        ) : (
                            <HiOutlineArrowCircleUp
                                className="w-5 h-5 cursor-pointer hover:text-[var(--vscode-button-hoverBackground)]"
                                onClick={handleSend}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default InputContainer