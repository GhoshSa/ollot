import React from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessagesProps {
    content: string
    sender: 'user' | 'model'
}

const ChatMessage: React.FC<ChatMessagesProps> = ({ content, sender }) => {
    const isUser = sender === 'user'
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "self-end bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)]" : "self-start bg-[var(--vscode-editorWidget-background)] text-[var(--text-color)]"}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ inline, children }: any) {
                        return inline ? (
                            <code className='px-1 py-0.5 rounded bg-[var(--vscode-textBlockQuote-background)] text-xs'>
                                { children }
                            </code>
                        ) : (
                            <pre className='mt-2 p-2 rounded-lg overflow-x-auto bg-[var(--vscode-textBlockQuote-background)] text-xs'>
                                <code>
                                    { children }
                                </code>
                            </pre>
                        )
                    }
                }}
            >
                { content }
            </ReactMarkdown>
        </motion.div>
    )
}

export default ChatMessage