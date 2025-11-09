import React, { useEffect, useState } from 'react'
import PopupMessageCard from './PopupMessageCard'
import { vscode } from '../../utils/vscodeApi'
import useOpenSettings from '../hooks/useOpenSettings'

interface PopupMessageData {
    content: string
    type: 'error' | 'warning' | 'info'
    title?: string
    actionLabel?: string
    onAction?: () => void
}

const ChatContainer = () => {
    const [messages, setMessages] = useState<string[]>([])
    const [popupMessage, setPopupMessage] = useState<PopupMessageData | null>(null)
    const openSettings = useOpenSettings()

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const message = event.data
            switch (message.type) {
                case 'serviceUnavailable':
                    setPopupMessage({
                        content: message.content,
                        type: 'error',
                        title: 'Service Unavailable',
                        actionLabel: 'Open Settings',
                        onAction: handleOpenSettings
                    })
                    break
                case 'response':
                    setMessages((prev) => [...prev, message.content])
                    break
                case 'error':
                    setPopupMessage({
                        content: message.content,
                        type: 'error',
                        title: 'Error'
                    })
                    break
                case 'warning':
                    setPopupMessage({
                        content: message.content,
                        type: 'warning',
                        title: 'Warning'
                    })
                    break
            }
        }
        window.addEventListener('message', handler)
        vscode.postMessage({ type: 'webviewReady' })
        return () => window.removeEventListener('message', handler)
    }, [])

    const handleOpenSettings = () => {
        openSettings('ollot.ollamaUrl')
    }

    useEffect(() => {
        if (!popupMessage) return
        const timer = setTimeout(() => {
            setPopupMessage(null)
        }, 7000)
        return () => clearTimeout(timer)
    }, [popupMessage])

    return (
        <div className='relative h-full'>
            {
                popupMessage && (
                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50'>
                        <PopupMessageCard
                            title={popupMessage.title ?? ''}
                            message={popupMessage.content}
                            actionLabel={popupMessage.actionLabel}
                            onAction={popupMessage.onAction}
                            type={popupMessage.type}
                        />
                    </div>
                )
            }
            {
                messages.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-center text-[var(--text-color)] opacity-70'>
                        <h1 className='text-xl font-bold mb-2'>Welcome to Ollot</h1>
                        <p className='text-sm max-w-sm'>
                            Start a conversation with your ollama model by typing your question below.
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={index}>
                            {message}
                        </div>
                    ))
                )
            }
        </div>
    )
}

export default ChatContainer