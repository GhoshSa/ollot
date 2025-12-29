import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineCog, HiRefresh } from 'react-icons/hi'
import useRefreshHandler from '../../hooks/useRefreshHandler'

interface NavbarProps {
    models: string[]
    selectedModel: string
    onModelChange: (model: string) => void
    onOpenSettings: () => void
}

const Navbar: React.FC<NavbarProps> = ({ models, selectedModel, onModelChange, onOpenSettings }) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const { isRefreshing, handleRefresh } = useRefreshHandler()
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])
    return (
        <div className="w-full flex items-center justify-between px-4 py-2 gap-3">
            <button
                className="text-[var(--text-color)]/70 hover:text-[var(--text-color)] cursor-pointer transition-colors duration-200"
                onClick={onOpenSettings}
            >
                <HiOutlineCog className="w-4 h-4" />
            </button>
            <div
                ref={containerRef}
                className='relative flex flex-1 justify-center'
            >
                <button
                    onClick={() => setOpen(v => !v)}
                    className='w-full max-w-xs py-1.5 px-5 rounded-md bg-[var(--vscode-editor-background)] text-[var(--text-color)] text-center cursor-pointer flex items-center justify-between'
                >
                    <span className='truncate'>
                        {selectedModel || 'No models available'}
                    </span>
                    <svg
                        className="w-4 h-4 text-[var(--text-color)]/60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className='absolute top-full mt-1 w-full max-w-xs rounded-md overflow-hidden z-50 bg-[var(--vscode-editor-background)]'
                        >
                            {models.length === 0 && (
                                <div className='px-4 py-2 text-sm opacity-60 text-center'>
                                    No models available
                                </div>
                            )}
                            {models.map(model => (
                                <div
                                    key={model}
                                    onClick={() => {
                                        onModelChange(model)
                                        setOpen(false)
                                    }}
                                    className={`px-4 py-1.5 text-sm cursor-pointer transition-colors ${model === selectedModel ? 'bg-[var(--vscode-list-activeSelectionBackground)]' : 'hover:bg-[var(--vscode-list-hoverBackground)]'}`}
                                >
                                    {model}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <button
                className={`text-[var(--text-color)]/70 ${isRefreshing ? "opacity-60 cursor-not-allowed" : "hover:text-[var(--text-color)]"} cursor-pointer transition-colors duration-200`}
                onClick={handleRefresh}
            >
                <motion.div
                    key={isRefreshing ? 'spin' : 'idle'}
                    animate = {isRefreshing ? { rotate: -360 } : { rotate: 0 }}
                    transition={{
                        duration: 1,
                        repeat: isRefreshing ? Infinity : 0,
                        ease: 'linear'
                    }}
                >
                    <HiRefresh className="w-4 h-4"/>
                </motion.div>
            </button>
        </div>
    )
}

export default Navbar