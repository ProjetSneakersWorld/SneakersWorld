import React, {useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import {InputFocusContext} from "../InputFocusContext";
const speed = 700;

// Importez Phaser dynamiquement avec SSR désactivé
const Phaser = dynamic(() => import('phaser'), { ssr: false });

function GameComponent() {
    const gameContainer = useRef(null);
    const { isInputFocused } = React.useContext(InputFocusContext);
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
                update = () => {
                    if (isInputFocused) {
                        return;
                    }

                    this.cursors = this.cursors || this.input.keyboard.createCursorKeys();

                    this.player.setVelocity(0);

                    if (this.cursors.up.isDown) {
                        this.player.setVelocityY(-speed);
                        this.player.anims.play('up', true);
                    } else if (this.cursors.left.isDown) {
                        this.player.setVelocityX(-speed);
                        this.player.anims.play('left', true);
                    } else if (this.cursors.right.isDown) {
                        this.player.setVelocityX(speed);
                        this.player.anims.play('right', true);
                    } else if (this.cursors.down.isDown) {
                        this.player.setVelocityY(speed);
                        this.player.anims.play('down', true);
                    } else {
                        // If no cursor is down, stop the animation
                        this.player.anims.stop();
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
