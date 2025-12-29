import React from 'react'
import InputContainer from './components/InputContainer'
import ChatContainer from './components/chat/ChatContainer'
import { PopupProvider } from './context/PopupContext'
import { PopupHost } from './components/popup/PopupHost'

const App = () => {
    return (
        <PopupProvider>
            <PopupHost/>
            <ChatContainer/>
        </PopupProvider>
    )
}

export default App