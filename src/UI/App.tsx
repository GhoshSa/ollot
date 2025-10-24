import React from 'react'
import InputContainer from './components/InputContainer'
import ChatContainer from './components/ChatContainer'

const App = () => {
    return (
        <div className='flex flex-col h-screen p-4'>
            <div className="flex-1 overflow-y-auto space-y-3">
                <ChatContainer/>
            </div>
            <InputContainer/>
        </div>
    )
}

export default App