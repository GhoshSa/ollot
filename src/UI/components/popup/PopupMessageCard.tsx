import React from 'react'
import { motion } from 'framer-motion'

interface PopupMessageCardProps {
    title: string
    message: string
    actionLabel?: string
    onAction?: () => void
    type: 'error' | 'success'
}

const PopupMessageCard = ({ title, message, actionLabel, onAction, type = 'success' }: PopupMessageCardProps) => {
    const colors = {
        error: 'border-red-500/30 text-red-400',
        success: 'border-green-500/30 text-green-400'
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`rounded-xl backdrop-blur-lg bg-[var(--vscode-editor-background)]/70 border ${colors[type]} max-w-[250px]`}>
                <div className="p-2.5">
                    <h1 className='text-sm font-semibold text-center'>{title}</h1>
                    <p className='text-xs text-center leading-relaxed opacity-80 mt-1'>{message}</p>
                </div>
                {actionLabel && (
                    <div className="flex justify-center px-2 pb-3">
                        <button
                            onClick={onAction}
                            className={`text-xs font-medium bg-[var(--vscode-button-background)] ${colors[type]} px-3 py-1 rounded-md hover:bg-[var(--vscode-button-hoverBackground)]`}
                        >
                            {actionLabel}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default PopupMessageCard