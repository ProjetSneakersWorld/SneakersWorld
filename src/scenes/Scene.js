import React, {useEffect, useRef, useContext} from "react";
import {GameContext} from '../GameContext';

const speed = 250;

function Scene() {
    const gameContainer = useRef(null);
    const {currentScene, setCurrentScene} = useContext(GameContext);

    useEffect(() => {
        const Phaser = require('phaser');

        class SceneMain extends Phaser.Scene {
            constructor() {
                super("Scene");
            }

            preload() {
                this.load.image("tiles", "/assets/tileset.png");
                this.load.tilemapTiledJSON('map', "/assets/othman_map.json");
                this.load.spritesheet('character', '/assets/perso.png', {frameWidth: 32, frameHeight: 32});
            }

            create() {
                const map = this.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16 });
                const tileset = map.addTilesetImage("tiles1", "tiles");
                const layer = map.createLayer("Calque de Tuiles 1", tileset, 0, 0);
                const collisionLayer = map.createLayer("Collision", tileset, 0, 0);

                // Ajouter le joueur et définir les animations
                this.player = this.physics.add.sprite(785, 655, "character").setFrame(5);
                this.anims.create({
                    key: 'up',
                    frames: this.anims.generateFrameNumbers('character', { frames: [0, 2] }),
                    frameRate: 10,
                    repeat: -1,
                });
                this.anims.create({
                    key: 'down',
                    frames: this.anims.generateFrameNumbers('character', { frames: [5, 8] }),
                    frameRate: 10,
                    repeat: -1,
                });
                this.anims.create({
                    key: 'right',
                    frames: this.anims.generateFrameNumbers('character', { frames: [1, 4] }),
                    frameRate: 10,
                    repeat: -1,
                });
                this.anims.create({
                    key: 'left',
                    frames: this.anims.generateFrameNumbers('character', { frames: [3, 6] }),
                    frameRate: 10,
                    repeat: -1,
                });

                // Gérer les collisions avec la couche de collision
                collisionLayer.setCollisionByExclusion([-1]);
                this.physics.add.collider(this.player, collisionLayer);

                // Configurer la caméra pour suivre le joueur
                this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                this.cameras.main.startFollow(this.player);
                this.cameras.main.setFollowOffset(-100, -100);
                this.player.setScale(1.5);
                this.cursors = this.input.keyboard.createCursorKeys();

                // Créer la zone de transition en fonction de la scène actuelle
                if (currentScene === 'home') {
                    this.createTransitionZone(943, 1190, 0xf06543, 'Shop'); // Zone pour aller vers "Shop"
                } else {
                    this.createTransitionZone(320, 480, 0x3f98b9, 'Home'); // Zone pour retourner à "Home"
                }
            }

            createTransitionZone(x, y, fillColor, buttonText) {
                // Créer la zone de transition
                this.doorZone = this.add.zone(x, y, 64, 32);
                const doorGraphics = this.add.graphics();
                doorGraphics.fillStyle(fillColor, 1);
                doorGraphics.fillRoundedRect(this.doorZone.x - this.doorZone.width / 2, this.doorZone.y - this.doorZone.height / 2, this.doorZone.width, this.doorZone.height, 8);
                doorGraphics.lineStyle(2, 0xffffff, 1);
                doorGraphics.strokeRoundedRect(this.doorZone.x - this.doorZone.width / 2, this.doorZone.y - this.doorZone.height / 2, this.doorZone.width, this.doorZone.height, 8);

                // Ajouter le texte à l'intérieur de la zone de transition
                const doorText = this.add.text(this.doorZone.x, this.doorZone.y, buttonText, {
                    fontSize: '20px',
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    fill: '#ffffff',
                });
                doorText.setOrigin(0.5, 0.5);

                // Activer la physique pour la zone de transition
                this.physics.world.enable(this.doorZone);
                this.doorZone.body.setAllowGravity(false);
                this.doorZone.body.moves = false;

                // Détecter la collision entre le joueur et la zone de transition
                this.physics.add.overlap(this.player, this.doorZone, () => {
                    // Gérer le changement de scène en fonction du texte de la zone
                    if (buttonText === 'Shop') {
                        setCurrentScene('SceneShop');
                    } else if (buttonText === 'Home') {
                        setCurrentScene('home')
                    }
                }, null, this);
            }



            update() {
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
                    this.player.anims.stop();
                    this.player.setTexture('character', 5); // Réinitialise la texture du joueur à une position neutre
                }
            }
        }

        const config = {
            type: Phaser.AUTO,
            parent: gameContainer.current,
            width: window.innerWidth - 700,
            height: window.innerHeight - 180,
            scene: [SceneMain],
            audio: {
                disableWebAudio: true,
            },
            physics: {
                default: 'arcade',
                arcade: {
                    fps: 120,
                    debug: false,
                }
            },
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, [currentScene]);

    return <div ref={gameContainer}/>;
}

export default Scene;
