import React, { createContext, useState } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [currentScene, setCurrentScene] = useState('SceneMain');

    return (
        <GameContext.Provider value={{ currentScene, setCurrentScene }}>
            {children}
        </GameContext.Provider>
    );
};
