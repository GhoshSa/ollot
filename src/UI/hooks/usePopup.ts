import { useContext } from "react";
import { PopupContext } from "../context/PopupContext";

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopup must be used inside PopupProvider");
    }
    return context;
};