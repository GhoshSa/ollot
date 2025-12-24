import React from "react"
import { usePopup } from "../../hooks/usePopup"
import PopupMessageCard from "./PopupMessageCard"

export const PopupHost = () => {
    const { popup } = usePopup()
    if (!popup) return
    return (
        <div>
            <PopupMessageCard
                title={popup.title}
                message={popup.message}
                type={popup.type}
                actionLabel={popup.actionLabel}
                onAction={popup.onAction}
            />
        </div>
    )
}