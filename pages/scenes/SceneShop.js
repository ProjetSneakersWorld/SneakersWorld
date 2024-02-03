import {useEffect, useRef } from "react";
import dynamic from 'next/dynamic';

const speed = 700;

// Importez Phaser dynamiquement avec SSR désactivé
const Phaser = dynamic(() => import('phaser'), { ssr: false });

function GameComponent() {
    const gameContainer = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined") { // Vérifiez si le code s'exécute dans un navigateur
            const Phaser = require('phaser');

            class SceneShop extends Phaser.Scene {
                constructor() {
                    super("SceneShop");
                }
                preload() {
                    this.load.image("tiles","/assets/store.png");
                    this.load.tilemapTiledJSON('map',"/assets/shopMapOthman.json");
                    this.load.spritesheet('perso', '/assets/perso.png', { frameWidth: 32, frameHeight: 32 });
                }
                create() {

                    const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32});

                    const tileset = map.addTilesetImage("tiles","tiles");
                    const layer = map.createLayer("void", tileset, 0, 0);
                    const colision = map.createLayer("colision",tileset,0,0)
                    this.player = this.physics.add.sprite(437,844,"perso");

                    colision.addCollidesWith(this.player);
                    colision.setCollisionByExclusion([-1]);
                    this.physics.add.collider(this.player, colision, this.handleCollision, null, this);
                    // Align.scaleToGameW(this.player,0.15,this)
                    this.cursors = this.input.keyboard.createCursorKeys()
                    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                    this.cameras.main.startFollow(this.player);
                    this.physics.add.collider(this.player, colision);
                    this.cameras.main.startFollow(this.player);
                    this.cameras.main.setFollowOffset(-100, -100);
                    this.cameras.main.setZoom(0.5);

                }

                handleCollision(player, collisionLayer) {

                }
                update() {

                    this.player.setVelocity(0,0);
                    if(this.cursors.up.isDown === true){
                        this.player.setVelocityY(-speed);
                    }
                    else if(this.cursors.left.isDown === true ){
                        this.player.setVelocityX(-speed);
                    }
                    else if(this.cursors.right.isDown === true){
                        this.player.setVelocityX(speed);
                    }
                    else if(this.cursors.down.isDown === true){
                        this.player.setVelocityY(speed);
                    }
                    if(this.cursors.space.isDown === true){
                        console.log(this.player.x,this.player.y);
                    }
                }

            }

            const config = {
                type: Phaser.AUTO, parent: gameContainer.current, width: "75%", // Utilisez la largeur de la fenêtre
                height: "84%", // Utilisez la hauteur de la fenêtre
                scene: [SceneShop], // Utilisez un tableau pour la scène
                audio: {
                    disableWebAudio: true,
                },
                physics: {
                    default: 'arcade',
                    arcade: {
                        fps: 60,
                        gravity: {y: 0},
                    }
                },
            };

            const game = new Phaser.Game(config);

            game.scene.scenes.forEach(scene => {
                scene.events.on('create', () => {
                    // Ajustez ces valeurs en fonction de la taille de votre carte
                    const mapWidth = 2208;
                    const mapHeight = 1408;

                    scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight, true);
                    scene.cameras.main.setZoom(Math.min(game.scale.width / mapWidth, game.scale.height / mapHeight));
                    scene.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
                });
            });

            return () => {
                // Destroy the game instance when the component is unmounted
                game.destroy(true);
            };
        }
    }, []);

    return <div ref={gameContainer} />;
}

export default GameComponent;
