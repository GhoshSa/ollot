import React, { useEffect, useState } from 'react'
import PopupMessageCard from './PopupMessageCard'
import { vscode } from '../../utils/vscodeApi'

const ChatContainer = () => {
    const [messages, setMessages] = useState<string[]>([])
    const [popupMessage, setPopupMessage] = useState<string | null>(null)
    useEffect(() => {
        vscode.postMessage({type: 'webviewReady'})
        const handler = (event: MessageEvent) => {
            const message = event.data
            switch (message.type) {
                case 'serviceUnavailable':
                    setPopupMessage(message.content)
                    break
                case 'response':
                    setMessages((prev) => [...prev, message.content])
                    break
            }
        }
        window.addEventListener('message', handler)
        return () => window.removeEventListener('message', handler)
    }, [])
    return (
        <div className='h-full'>
            {
                popupMessage && (
                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50'>
                        <PopupMessageCard title='Service Unavailable' message={popupMessage} actionLabel='Open Settings' onAction={() => vscode.postMessage({ type: 'openSettings', setting: 'ollot.ollamaUrl' })} onClose={() => setPopupMessage(null)} type='error' />
                    </div>
                )
            }
            {
                messages.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full text-center text-[var(--text-color)] opacity-80'>
                        <h1 className='text-xl font-bold mb-2'>👋 Welcome to Ollot</h1>
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