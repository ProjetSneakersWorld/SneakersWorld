import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import '../../public/pixi.css';

const NewScene = () => {
    const pixiContainer = useRef(null);

    useEffect(() => {
        // Créez une instance de PIXI.Application
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000, // Changer la couleur de fond ici
        });

        // Ajoutez le PIXI.Application à la div pixi-container
        pixiContainer.current.appendChild(app.view);

        // Créez un conteneur pour la scène
        const stage = new PIXI.Container();

        // Créez un style pour votre texte
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        });

        // Créez le texte
        const text = new PIXI.Text('Bonjour', style);
        text.anchor.set(0.5);
        text.position.set(app.screen.width / 2, app.screen.height / 2);

        // Ajoutez le texte à la scène
        stage.addChild(text);

        // Ajoutez la scène au PIXI.Application
        app.stage.addChild(stage);

        // Définissez la boucle d'animation
        function animate() {
            app.renderer.render(app.stage);
            requestAnimationFrame(animate);
        }

        // Commencez l'animation
        animate();

        // Redimensionnez le rendu PIXI en cas de changement de taille de fenêtre
        window.addEventListener('resize', () => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            text.position.set(app.screen.width / 2, app.screen.height / 2);
        });

        // Nettoyez l'instance PIXI.Application lors du démontage du composant
        return () => {
            app.destroy();
        };
    }, []);

    return (
        <div>
            <div ref={pixiContainer} className="pixi-container"></div>
        </div>
    );
};

export default NewScene;
