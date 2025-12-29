import React, { useEffect, useRef, useState } from 'react'
import PopupMessageCard from '../popup/PopupMessageCard'
import { vscode } from '../../../utils/vscodeApi'
import useOpenSettings from '../../hooks/useOpenSettings'
import InputContainer from '../InputContainer'
import Navbar from '../navbar/Navbar'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PopupMessageData {
    content: string
    type: 'error' | 'success'
    title?: string
    actionLabel?: string
    onAction?: () => void
}

type ChatMessage = {
    id: string
    content: string
    role: 'user' | 'model'
    isLoading?: boolean
}

const ChatContainer = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [popupMessage, setPopupMessage] = useState<PopupMessageData | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [models, setModels] = useState<string[]>([])
    const [selectedModel, setSelectedModel] = useState<string>('')
    const activeResponseRef = useRef<string>('')
    const streamingMessageIdRef = useRef<string | null>(null)
    const cardRef = useRef<HTMLDivElement>(null)
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
                case 'ollamaConnected':
                    setPopupMessage({
                        content: message.content,
                        type: 'success',
                        title: 'Ollama Connected'
                    })
                    break
                case 'availableModels':
                    const incomingModels = message.models ?? []
                    setModels(incomingModels)
                    if (incomingModels.length > 0) {
                        setSelectedModel(message.currentModel ?? incomingModels[0])
                    }
                    break
                case 'noAvailableModels':
                    setPopupMessage({
                        content: message.content,
                        type: 'error',
                        title: 'No Models Found'
                    })
                    break
                case 'modelChangedSuccessfully':
                    break
                case 'response':
                    const streamingId = streamingMessageIdRef.current
                    if (!streamingId) {
                        break
                    }
                    activeResponseRef.current += message.content
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === streamingId ? {
                                ...m, content: activeResponseRef.current, isLoading: false
                            } : m
                        )
                    )
                    break
                case 'responseCancelled':
                case 'responseComplete':
                    streamingMessageIdRef.current = null
                    activeResponseRef.current = ''
                    setIsProcessing(false)
                    break
                case 'error':
                    setPopupMessage({
                        content: message.content,
                        type: 'error',
                        title: 'Error'
                    })
                    streamingMessageIdRef.current = null
                    activeResponseRef.current = ''
                    setIsProcessing(false)
                    break
                default:
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

    const handleSend = (text: string) => {
        if (!text.trim()) {
            return
        }
        setIsProcessing(true)
        const streamingId = crypto.randomUUID()
        streamingMessageIdRef.current = streamingId
        activeResponseRef.current = ''
        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: 'user', content: text },
            { id: streamingId, role: 'model', content: '', isLoading: true }
        ])
        console.log(selectedModel)
        vscode.postMessage({ type: 'sendMessage', message: text })
    }

    const handleAbort = () => {
        vscode.postMessage({ type: 'cancelRequest' })
        streamingMessageIdRef.current = null
        activeResponseRef.current = ''
        setIsProcessing(false)
    }

    const handleModelChange = (model: string) => {
        setSelectedModel(model)
        if (isProcessing) {
            vscode.postMessage({ type: 'cancelRequest' })
            streamingMessageIdRef.current = null
            activeResponseRef.current = ''
            setIsProcessing(false)
        }
        vscode.postMessage({ type: 'modelChanged', model })
    }

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!cardRef.current?.contains(e.target as Node)) {
                setPopupMessage(null)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [popupMessage])

    return (
        <div className='flex flex-col h-screen'>
            <div className='shrink-0'>
                <Navbar
                    models={models}
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                    onOpenSettings={handleOpenSettings}
                />
            </div>
            <div className='flex-1 flex flex-col overflow-hidden'>
                {popupMessage && (
                    <div
                        ref={cardRef}
                        className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50'
                    >
                        <PopupMessageCard
                            title={popupMessage.title ?? ''}
                            message={popupMessage.content}
                            actionLabel={popupMessage.actionLabel}
                            onAction={popupMessage.onAction}
                            type={popupMessage.type}
                        />
                    </div>
                )}
                <div className='flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none'>
                    {messages.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-full opacity-70 text-center'>
                            <image path={'../../icon/icon_s.svg'} />
                            <h1 className='text-xl font-bold mb-2'>Welcome to Ollot</h1>
                            <p className='text-sm max-w-sm'>
                                Start a conversation with your ollama model by typing your question below.
                            </p>
                        </div>
                    ) : (
                        messages.map((m) => (
                            <div
                                key={m.id}
                                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'ml-auto bg-[var(--vscode-button-background)]' : 'mr-auto bg-[var(--vscode-button-background)]/40'}`}
                            >
                                {m.role === 'model' && m.isLoading ? (
                                    <div className="flex items-center justify-center min-h-[24px]">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <motion.span
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-current"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        delay: i * 0.15
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ inline, className, children }: any) {
                                                if (inline) {
                                                    return (
                                                        <code
                                                            className="inline-block align-middle px-1.5 py-0.5 rounded-md bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] text-sm font-mono"
                                                            style={{ width: 'auto', display: 'inline-block', maxWidth: '100%' }}
                                                        >
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                                return (
                                                    <pre className="max-w-full overflow-x-auto rounded-md bg-[var(--vscode-editor-background)] p-3 text-sm">
                                                        <code className={className}>
                                                            {children}
                                                        </code>
                                                    </pre>
                                                )
                                            }
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className='shrink-0 px-4 pt-2 pb-4'>
                <InputContainer
                    isProcessing={isProcessing}
                    onSend={handleSend}
                    onAbort={handleAbort}
                />
            </div>
        </div>
    )
}

export default ChatContainer