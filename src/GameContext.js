import React, { createContext, useState } from 'react';
export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [currentScene, setCurrentScene] = useState('home');
    const [updateChat, setUpdateChat] = useState(false);

    // Fonction pour forcer la mise à jour
    const forceUpdate = () => {
        setUpdateChat(prev => !prev);
    };

    return (
        <GameContext.Provider value={{ currentScene, setCurrentScene, updateChat, setUpdateChat}}>
            {children}
        </GameContext.Provider>
    );
};
