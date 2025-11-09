import React, { useRef, useState } from 'react'
import { HiMenu, HiOutlineArrowCircleUp, HiOutlineStop, HiX } from 'react-icons/hi'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'
import { AnimatePresence, motion } from 'framer-motion'
import MenuBar from './MenuBar'

const InputContainer = () => {
    const [text, setText] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useAutoResizeTextarea(textareaRef)

    const handleSend = () => setIsProcessing(true)
    const handleAbort = () => setIsProcessing(false)
    const handleRefresh = () => console.log('Refresh clicked!')

    return (
        <div className="flex items-end gap-2">
            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(prev => !prev)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[var(--vscode-button-hoverBackground)]/60 text-[var(--text-color)] bg-transparent transition-all duration-200 shadow-[0_2px_8px_-1px_var(--vscode-widget-shadow),0_4px_12px_-2px_var(--vscode-widget-shadow),inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:shadow-md focus:outline-none"
                >
                    <AnimatePresence mode="wait">
                        {isMenuOpen ? (
                            <motion.div
                                key="open"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.12 }}
                            >
                                <HiX className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="closed"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.12 }}
                            >
                                <HiMenu className="w-5 h-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                <AnimatePresence>
                    {isMenuOpen && <MenuBar/>}
                </AnimatePresence>
            </div>

            <div className="flex flex-1 p-2 items-center rounded-xl bg-[var(--background-color)]/5 backdrop-blur-[2px] shadow-[0_2px_8px_-1px_var(--vscode-widget-shadow),0_4px_12px_-2px_var(--vscode-widget-shadow),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <textarea
                    placeholder="Ask here..."
                    className="w-full resize-none outline-none text-sm font-semibold text-[var(--text-color)] bg-transparent"
                    rows={1}
                    ref={textareaRef}
                    value={text}
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
                                <HiOutlineArrowCircleUp
                                    className="w-5 h-5 cursor-pointer hover:text-[var(--vscode-button-hoverBackground)]"
                                    onClick={handleSend}
                                />
                            ) : (
                                <HiOutlineStop
                                    className="w-5 h-5 cursor-pointer hover:text-[var(--vscode-errorForeground)]"
                                    onClick={handleAbort}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default InputContainer