import React, { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'

interface ChatMessages {
    content: string
    sender: 'user' | 'model'
}

interface Props {
    messsages: ChatMessages[]
}

const ChatMessageList: React.FC<Props> = ({ messsages }) => {
    const bottomRef = useRef<HTMLDivElement>(null)
    useEffect (() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
    return (
        <div>
            {messsages.map((msg, index) => (
                <ChatMessage
                    key={index}
                    content={msg.content}
                    sender={msg.sender}
                />
            ))}
            <div ref={ bottomRef }/>
        </div>
    )
}

export default ChatMessageList