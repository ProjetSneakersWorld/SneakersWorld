import React, {useEffect, useRef, useContext} from "react";
import {router} from "next/router";
import {InputFocusContext} from "../InputFocusContext";
import {GameContext} from '../GameContext';

const speed = 250;

function Scene() {
    const gameContainer = useRef(null);
    const {currentScene,setCurrentScene} = useContext(GameContext);
    useEffect(() => {
        console.log(currentScene); // S'exécute chaque fois que currentScene change
    }, [currentScene]);
    useEffect(() => {
        // console.log(currentScene);
        const Phaser = require('phaser');

        class SceneMain extends Phaser.Scene {
            constructor() {
                super("Scene");
            }

            preload() {
                if(currentScene === ""){
                    this.load.image("tiles", "/assets/tileset.png");
                    this.load.tilemapTiledJSON('map', "/assets/othman_map.json");
                    this.load.spritesheet('character', '/assets/perso.png', {frameWidth: 32, frameHeight: 32});
                }
                else{
                    this.load.image("tiles", "/assets/tileset.png");
                    this.load.tilemapTiledJSON('map', "/assets/othman_map.json");
                    this.load.spritesheet('character', '/assets/perso.png', {frameWidth: 32, frameHeight: 32});
                }
            }

            create() {
                // setCurrentScene('');
                const map = this.make.tilemap({key: "map", tileWidth: 16, tileHeight: 16});
                const tileset = map.addTilesetImage("tiles1", "tiles");
                const layer = map.createLayer("Calque de Tuiles 1", tileset, 0, 0);
                const colision = map.createLayer("Collision", tileset, 0, 0)
                this.player = this.physics.add.sprite(785, 655, "character").setFrame(5);
                this.anims.create({
                    key: 'up',
                    frames: this.anims.generateFrameNumbers('character', {frames: [0, 2]}),
                    frameRate: 10,
                    repeat: -1,
                });
                this.anims.create({
                    key: 'down',
                    frames: this.anims.generateFrameNumbers('character', {frames: [5, 8]}),
                    frameRate: 10,
                    repeat: -1,
                });

                this.anims.create({
                    key: 'right',
                    frames: this.anims.generateFrameNumbers('character', {frames: [1, 4]}),
                    frameRate: 10,
                    repeat: -1
                });
                this.anims.create({
                    key: 'left',
                    frames: this.anims.generateFrameNumbers('character', {frames: [3, 6]}),
                    frameRate: 10,
                    repeat: -1
                });
                // colision.setCollisionByProperty({ collideBottom: true });
                colision.addCollidesWith(this.player);
                colision.setCollisionByExclusion([-1]);
                this.physics.add.collider(this.player, colision, this.handleCollision, null, this);
                // Align.scaleToGameW(this.player,0.15,this)

                this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                this.cameras.main.startFollow(this.player);
                this.physics.add.collider(this.player, colision);
                this.cameras.main.setFollowOffset(-100, -100);
                this.player.setScale(1.5);
                this.cursors = this.input.keyboard.createCursorKeys();
            }

            update = () => {
                // console.log("X: "+this.player.x + " Y:"+ this.player.y)
                // console.log(isInputFocused)
                if(currentScene === ""){
                    this.game.canvas.style.border = "5px solid white";
                    this.game.canvas.style.borderRadius = "15px";
                }else{
                    this.game.canvas.style.border = "7px solid red";
                    this.game.canvas.style.borderRadius = "15px";
                }


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

            handleCollision(player, collisionLayer) {
                if (Math.abs(this.player.x >= 912) && Math.abs(this.player.x <= 974)
                    && Math.abs(this.player.y >= 1177) && Math.abs(this.player.y <= 1208)) {
                    // Charger la nouvelle carte
                    console.log("ENTRER dans SceneShop");
                    this.scene.start('SceneShop'); // Changez à la scène 'SceneShop'
                    setCurrentScene('SceneShop');
                }
            }

        }


        // class SceneShop extends Phaser.Scene {
        //     constructor() {
        //         super("SceneShop");
        //     }
        //
        //     preload() {
        //         this.load.image("tiles","/assets/store.png");
        //         this.load.tilemapTiledJSON('map',"/assets/shopMapOthman.json");
        //         this.load.spritesheet('perso', '/assets/perso.png', { frameWidth: 32, frameHeight: 32 });
        //     }
        //
        //     create() {
        //         const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32});
        //
        //         const tileset = map.addTilesetImage("tiles","tiles");
        //         const layer = map.createLayer("void", tileset, 0, 0);
        //         const colision = map.createLayer("colision",tileset,0,0)
        //         this.player = this.physics.add.sprite(437,844,"perso");
        //
        //
        //         // colision.setCollisionByProperty({ collideBottom: true });
        //         // colision.addCollidesWith(this.player);
        //         // colision.setCollisionByExclusion([-1]);
        //         // this.physics.add.collider(this.player, colision, this.handleCollision, null, this);
        //         // Align.scaleToGameW(this.player,0.15,this)
        //
        //         this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        //         this.cameras.main.startFollow(this.player);
        //         this.physics.add.collider(this.player, colision);
        //         this.cameras.main.setFollowOffset(-100, -100);
        //         this.player.setScale(1.5);
        //         this.cursors = this.input.keyboard.createCursorKeys();
        //     }
        //
        //     update = () => {
        //         // console.log("X: "+this.player.x + " Y:"+ this.player.y)
        //         // console.log(isInputFocused)
        //         this.game.canvas.style.border = "5px solid white";
        //         this.game.canvas.style.borderRadius = "15px";
        //
        //         this.player.setVelocity(0);
        //
        //         if (this.cursors.up.isDown) {
        //             this.player.setVelocityY(-speed);
        //             this.player.anims.play('up', true);
        //         } else if (this.cursors.left.isDown) {
        //             this.player.setVelocityX(-speed);
        //             this.player.anims.play('left', true);
        //         } else if (this.cursors.right.isDown) {
        //             this.player.setVelocityX(speed);
        //             this.player.anims.play('right', true);
        //         } else if (this.cursors.down.isDown) {
        //             this.player.setVelocityY(speed);
        //             this.player.anims.play('down', true);
        //         } else {
        //             // If no cursor is down, stop the animation
        //             this.player.anims.stop();
        //         }
        //     }
        //     handleCollision(player, collisionLayer) {
        //
        //     }
        // }


        const config = {
            type: Phaser.AUTO,
            parent: gameContainer.current,
            width: "75%",
            height: "84%",
            scene: [SceneMain], // Utilisez un tableau pour la scène
            audio: {
                disableWebAudio: true,
            },
            physics: {
                default: 'arcade',
                arcade: {
                    fps: 120,
                }
            },
        };


        const game = new Phaser.Game(config);

        return () => {
            // Destroy the game instance when the component is unmounted
            game.destroy(true);
        };
    }, [currentScene]);

    return (

        <div ref={gameContainer}/>
    );
}

export default Scene;

