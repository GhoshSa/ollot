import React, { createContext, useContext, useState } from "react"

interface PopupData {
    title: string
    message: string
    actionLabel?: string
    onAction?: () => void
    type: 'error' | 'success'
}

interface PopupContextType {
    popup: PopupData | null
    showPopup: (data: PopupData) => void
    hidePopup: () => void
}

export const PopupContext = createContext<PopupContextType | null>(null)

export const PopupProvider = ({ children }: { children: React.ReactNode }) => {
    const [popup, setPopup] = useState<PopupData | null>(null)
    const showPopup = (data: PopupData) => setPopup(data)
    const hidePopup = () => setPopup(null)
    return (
        <PopupContext.Provider value={{ popup, showPopup, hidePopup }}>
            {children}
        </PopupContext.Provider>
    )
}