// import * as PIXI from "pixi.js"
// import { Tilemap } from '@pixi/tilemap';
// import { Assets } from '@pixi/assets';
// import {useEffect, useRef} from "react";
//
// const PixiComponent = () => {
//     const pixiContainer = useRef(null);
//     const windowSize = useRef([0, 0]);
//
//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             windowSize.current = [window.innerWidth, window.innerHeight];
//         }
//
//         // Set up Pixi.js
//         let renderer = PIXI.autoDetectRenderer({
//             width: windowSize.current[0] - 380,
//             height: windowSize.current[1] - 110
//         });
//
//         // Add the renderer view element to the DOM
//         pixiContainer.current.innerHTML = ""; // Clear the container
//         pixiContainer.current.appendChild(renderer.view);
//
//         // Create the stage
//         const stage = new PIXI.Container();
//
//         // Load the Tiled map
//         Assets.load('/map.json').then((resources) => {
//
//             // Render the stage
//             renderer.render(stage);
//         });
//     }, []);
//
//     // Ajoutez le return ici
//     return <div ref={pixiContainer}></div>;
// };
//
// export default PixiComponent;
