import React from 'react';
import { GameProvider } from '../src/GameContext'; // Assurez-vous que le chemin d'accès est correct
import '../public/styles/globals.css';

function MyApp({ Component, pageProps }) {
    return (
        <GameProvider>
            <Component {...pageProps} />
        </GameProvider>
    );
}

export default MyApp;
