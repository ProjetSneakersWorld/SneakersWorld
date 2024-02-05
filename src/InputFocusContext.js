import React from 'react';

export const InputFocusContext = React.createContext({
    isInputFocused: false,
    setInputFocused: () => {},
});
