import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { vscode } from '../../utils/vscodeApi'

const ModelContainer = () => {
    const [models, setModels] = useState<string[]>([])
    const [messageData, setMessageData] = useState<string>("")

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const message = event.data
            switch (message.type) {
                case 'noAvailableModels':
                    setMessageData(message.content)
                    setModels([])
                    break
                case 'availableModels':
                    if (Array.isArray(message.models)) {
                        setModels(message.models)
                        setMessageData("")
                    } else {
                        
                    }
                    break
                case 'modelChangedSuccessfully':
                    setMessageData(message.content)
                    break
                case 'failedToChangedModel':
                    setMessageData(message.content)
                    break
                default:
                    break
            }
        }
        window.addEventListener('message', handler)
        vscode.postMessage({ type: 'getModels' })
        return () => window.removeEventListener('message', handler)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className='fixed top-4 left-1/2 -translate-x-1/2 z-50 min-w-[220px] max-w-xs bg-[var(--vscode-editor-background)]/90 backdrop-blur-md border border-[var(--vscode-editor-foreground)]/10 rounded-lg shadow-lg p-2'
        >
            {messageData ? (
                <div className='text-sm text-[var(--text-color)] opacity-70 p-2'>
                    {messageData}
                </div>
            ) : (
                <div className='flex flex-col gap-1'>
                    {models.map((model) => (
                        <button
                            key={model}
                            onClick={() => vscode.postMessage({ type: 'modelChanged', model })}
                            className='text-sm text-left px-2 py-1 rounded-md hover:bg-[var(--vscode-button-hoverBackground)]/30 text-[var(--text-color)]'
                        >
                            {model}
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export default ModelContainer