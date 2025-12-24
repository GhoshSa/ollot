import React from 'react'
import InputContainer from './components/InputContainer'
import ChatContainer from './components/ChatContainer'
import { PopupProvider } from './context/PopupContext'
import { PopupHost } from './components/popup/PopupHost'

const App = () => {
    return (
        <PopupProvider>
            <PopupHost/>
            <div className='flex flex-col h-screen p-4'>
                <div className="flex-1 overflow-y-auto space-y-3">
                    <ChatContainer />
                </div>
                <InputContainer />
            </div>
        </PopupProvider>
    )
}

export default App