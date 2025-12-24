import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { HiRefresh, HiOutlineCog, HiOutlineViewGrid } from 'react-icons/hi'
import useOpenSettings from '../hooks/useOpenSettings'
import ModelContainer from './ModelContainer'
import useRefreshHandler from '../hooks/useRefreshHandler'

const MenuBar = () => {
    const openSettings = useOpenSettings()
    const { isRefreshing, handleRefresh } = useRefreshHandler()
    const [isModelButtonClicked, setIsModelButtonClicked] = useState(false)
    const handleGetModels = () => {
        setIsModelButtonClicked(prev => !prev)      
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full bg-[var(--vscode-editor-background)]/90 border border-[var(--vscode-editor-foreground)]/10 rounded-xl flex flex-col gap-0.5 mb-1.5"
        >
            <div className='relative'>
                <button
                    className="flex items-center px-2.5 py-2 rounded-xl text-sm text-[var(--text-color)] hover:bg-[var(--vscode-button-hoverBackground)]/60 transition-colors duration-150"
                    onClick={handleGetModels}
                >
                    <HiOutlineViewGrid className="w-4 h-4" />
                </button>
                <AnimatePresence mode='wait'>
                    {isModelButtonClicked && <ModelContainer/>}
                </AnimatePresence>
            </div>
            <button
                className={`flex items-center px-2.5 py-2 rounded-xl text-sm text-[var(--text-color)] ${isRefreshing ? "opacity-60 cursor-not-allowed" : "hover:bg-[var(--vscode-button-hoverBackground)]/60"} transition-colors duration-150`}
                onClick={handleRefresh}
            >
                <motion.div
                    key={isRefreshing ? "spin" : "idle"}
                    animate={isRefreshing ? { rotate: -360 } : { rotate: 0 }}
                    transition={{
                        duration: 1,
                        repeat: isRefreshing ? Infinity : 0,
                        ease: "linear"
                    }}
                >
                    <HiRefresh className="w-4 h-4" />
                </motion.div>
            </button>
            <button
                className="flex items-center px-2.5 py-2 rounded-xl text-sm text-[var(--text-color)] hover:bg-[var(--vscode-button-hoverBackground)]/60 transition-colors duration-150"
                onClick={() => openSettings('ollot.ollamaUrl')}
            >
                <HiOutlineCog className="w-4 h-4" />
            </button>
        </motion.div>
    )
}

export default MenuBar