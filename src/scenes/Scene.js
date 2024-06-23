import React, {useEffect, useRef, useContext, useState} from "react";
import {GameContext} from '../GameContext';
import {supabase} from "../../pages/api/supabaseClient";
import '/public/personalisation.css';
import Cookies from "js-cookie";

const speed = 250;
let currentSkin = 1;
const POSITION_UPDATE_INTERVAL = 200; // Mise à jour toutes les 200ms
let isMouseDown = false;

function Scene() {
    const gameContainerRef = useRef(null);
    const { currentScene, setCurrentScene } = useContext(GameContext);
    const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
    const sceneRef = useRef(null);

    useEffect(() => {
        const Phaser = require('phaser');

        class SceneMain extends Phaser.Scene {
            constructor() {
                super({ key: 'SceneMain' });
                this.otherPlayers = {};
                this.player = null; // Initialisation de player
                this.collisionLayer = null; // Initialisation de collisionLayer
            }

            preload() {
                this.load.image("tiles", "/assets/tileset.png");
                this.load.tilemapTiledJSON('map', "/assets/othman_map.json");
                for (let i = 1; i <= 10; i++) {
                    this.load.spritesheet(`character${i}`, `/assets/Perso/perso${i}.png`, { frameWidth: 64, frameHeight: 64 });
                }
            }

            create() {
                const map = this.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16 });
                const tileset = map.addTilesetImage("tiles1", "tiles");
                const layer = map.createLayer("Calque de Tuiles 1", tileset, 0, 0);
                this.collisionLayer = map.createLayer("Collision", tileset, 0, 0); // Utiliser this.collisionLayer ici
                this.otherPlayers = {};
                this.isCameraFollowing = true;

                // Ajouter le joueur et définir les animations pour le premier personnage
                this.player = this.physics.add.sprite(785, 655, `character${currentSkin}`).setFrame(0);
                this.player.setScale(0.85);
                this.player.setCrop(0, 1, 64, 64); // setCrop(x, y, width, height)

                // Créer les animations pour chaque personnage
                for (let i = 1; i <= 10; i++) {
                    this.anims.create({
                        key: `down${i}`,
                        frames: this.anims.generateFrameNumbers(`character${i}`, { frames: [0, 1, 2, 3]}),
                        frameRate: 10,
                        repeat: -1,
                    });
                    this.anims.create({
                        key: `left${i}`,
                        frames: this.anims.generateFrameNumbers(`character${i}`, { frames: [4, 5, 6, 7]}),
                        frameRate: 10,
                        repeat: -1,
                    });
                    this.anims.create({
                        key: `right${i}`,
                        frames: this.anims.generateFrameNumbers(`character${i}`, { frames: [8, 9, 10, 11]}),
                        frameRate: 10,
                        repeat: -1,
                    });
                    this.anims.create({
                        key: `up${i}`,
                        frames: this.anims.generateFrameNumbers(`character${i}`, { frames: [12, 13 ,14 ,15]}),
                        frameRate: 10,
                        repeat: -1,
                    });
                }

                this.cursors = this.input.keyboard.createCursorKeys();

                this.input.on('pointerdown', () => {
                    isMouseDown = true;
                    this.isCameraFollowing = false;
                    this.cameras.main.stopFollow();
                });

                this.input.on('pointerup', () => {
                    isMouseDown = false;
                });

                this.input.on('pointermove', (pointer) => {
                    if (isMouseDown) {
                        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
                    }
                });

                // Gérer les collisions avec la couche de collision
                this.collisionLayer.setCollisionByExclusion([-1]); // Utiliser this.collisionLayer ici
                this.physics.add.collider(this.player, this.collisionLayer); // Utiliser this.collisionLayer ici

                // Configurer la caméra pour suivre le joueur
                this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                this.cameras.main.startFollow(this.player);
                this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
                    const zoomAmount = deltaY < 0 ? 1.09 : 0.95;
                    const newZoom = this.cameras.main.zoom * zoomAmount;

                    if (newZoom >= 0.5 && newZoom <= 1.5) {
                        this.cameras.main.zoom = newZoom;
                    }
                });
                this.cameras.main.setFollowOffset(-100, -100);
                this.cursors = this.input.keyboard.createCursorKeys();

                // Initialiser les zones de transition
                this.createTransitionZones();

                // Initialiser la mise à jour de la position
                this.updatePlayerPosition();

                // Écouter les mises à jour de position des autres joueurs
                this.subscribeToPlayerUpdates();
            }

            update() {
                const speed = 200; // Définir la vitesse du joueur
                this.player.setVelocity(0);
                if (this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown) {
                    if (!this.isCameraFollowing) {
                        this.isCameraFollowing = true;
                        this.cameras.main.startFollow(this.player);
                    }
                }

                if (this.cursors.up.isDown) {
                    this.player.setVelocityY(-speed);
                    this.player.anims.play(`up${currentSkin}`, true);
                } else if (this.cursors.left.isDown) {
                    this.player.setVelocityX(-speed);
                    this.player.anims.play(`left${currentSkin}`, true);
                } else if (this.cursors.right.isDown) {
                    this.player.setVelocityX(speed);
                    this.player.anims.play(`right${currentSkin}`, true);
                } else if (this.cursors.down.isDown) {
                    this.player.setVelocityY(speed);
                    this.player.anims.play(`down${currentSkin}`, true);
                } else {
                    this.player.anims.stop();
                }

                // Interpoler les positions des autres joueurs
                this.interpolateOtherPlayers();
            }

            getDirection() {
                if (this.cursors.up.isDown) return 'up';
                if (this.cursors.down.isDown) return 'down';
                if (this.cursors.left.isDown) return 'left';
                if (this.cursors.right.isDown) return 'right';
                return '';
            }

            updatePlayerPosition() {
                setInterval(() => {
                    const pseudo = Cookies.get('Pseudo');
                    if (!pseudo) {
                        console.error('Pseudo non trouvé dans les cookies');
                        return;
                    }
                    const direction = this.getDirection(); // Obtenez la direction actuelle du joueur
                    supabase
                        .from('player_positions')
                        .upsert({
                            pseudo: pseudo,
                            place: currentScene,
                            x: this.player.x,
                            y: this.player.y,
                            direction: direction, // Ajoutez la direction
                            last_updated: new Date().toISOString()
                        }, {onConflict: 'pseudo'})
                        .then(({data, error}) => {
                            if (error) {
                                console.error('Erreur lors de la mise à jour de la position:', error);
                            } else {
                                // console.log('Position mise à jour avec succès');
                            }
                        });
                }, POSITION_UPDATE_INTERVAL);
            }

            subscribeToPlayerUpdates() {
                const channel = supabase
                    .channel('player_positions')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'player_positions'
                        },
                        (payload) => {
                            if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new.place === currentScene) { // Vérifiez si la scène est la même
                                this.updateOtherPlayer(payload.new);
                            }
                        }
                    )
                    .subscribe();

                // Stockez la référence du canal pour pouvoir le fermer plus tard si nécessaire
                this.playerPositionsChannel = channel;
            }

            updateOtherPlayer(playerData) {
                if (playerData.pseudo === Cookies.get('Pseudo') || playerData.place !== currentScene) return; // Ignorer le joueur actuel ou si la scène est différente

                if (!this.otherPlayers[playerData.pseudo]) {
                    // Créer un nouveau sprite pour le joueur
                    const playerSprite = this.add.sprite(playerData.x, playerData.y, 'character1');
                    playerSprite.setScale(0.85);

                    // Ajouter le texte du pseudo au-dessus du sprite
                    const playerText = this.add.text(playerData.x, playerData.y - 20, playerData.pseudo, {
                        font: '20px Arial',
                        fill: '#000000',
                        align: 'center'
                    });
                    playerText.setOrigin(0.5, 1.5); // Centrer le texte

                    // Stocker à la fois le sprite et le texte
                    this.otherPlayers[playerData.pseudo] = {
                        sprite: playerSprite,
                        text: playerText,
                        targetX: playerData.x,
                        targetY: playerData.y
                    };
                } else {
                    // Mettre à jour la position cible du joueur existant et de son texte
                    const otherPlayer = this.otherPlayers[playerData.pseudo];
                    otherPlayer.targetX = playerData.x;
                    otherPlayer.targetY = playerData.y;
                }

                // Mettre à jour l'animation en fonction de la direction
                this.updatePlayerAnimation(this.otherPlayers[playerData.pseudo].sprite, playerData.direction);
            }

            updatePlayerAnimation(player, direction) {
                if (player && player.anims) {
                    switch (direction) {
                        case 'up':
                            player.anims.play('up', true);
                            break;
                        case 'down':
                            player.anims.play('down', true);
                            break;
                        case 'left':
                            player.anims.play('left', true);
                            break;
                        case 'right':
                            player.anims.play('right', true);
                            break;
                        default:
                            player.anims.stop();
                            break;
                    }
                }
            }

            interpolateOtherPlayers() {
                const interpolationFactor = 0.1; // Ajustez cette valeur pour un lissage plus ou moins rapide
                Object.values(this.otherPlayers).forEach(player => {
                    const {sprite, text, targetX, targetY} = player;
                    sprite.x += (targetX - sprite.x) * interpolationFactor;
                    sprite.y += (targetY - sprite.y) * interpolationFactor;
                    text.x = sprite.x;
                    text.y = sprite.y - 20;
                });
            }

            reloadPlayer(skin) {
                console.log("ENTRE");
                const textureKey = `character${skin}`;
                if (!this.textures.exists(textureKey)) {
                    console.error(`La texture '${textureKey}' n'existe pas.`);
                    return;
                }

                // Conserver les coordonnées actuelles du joueur
                const oldPlayerX = this.player.x;
                const oldPlayerY = this.player.y;

                // Détruire l'ancien sprite du joueur
                if (this.player) {
                    this.player.destroy();
                }

                // Créer un nouveau sprite pour le joueur avec la nouvelle texture
                this.player = this.physics.add.sprite(oldPlayerX, oldPlayerY, textureKey);
                this.player.setFrame(0);
                this.player.setScale(0.85);
                this.player.setCrop(0, 1, 64, 64);

                // Configurer la physique et les collisions
                this.physics.add.collider(this.player, this.collisionLayer); // Utiliser this.collisionLayer ici

                // Configurer la caméra pour suivre le nouveau joueur
                this.cameras.main.startFollow(this.player);

                currentSkin = skin;
                console.log("Skin actuel :", currentSkin);

                // Recréer les zones de transition après le changement de skin
                this.createTransitionZones();
            }

            createTransitionZone(x, y, fillColor, buttonText) {
                // Créer la zone de transition
                this.doorZone = this.add.zone(x, y, 85, 32);
                const doorGraphics = this.add.graphics();
                doorGraphics.fillStyle(fillColor, 1);
                doorGraphics.fillRoundedRect(this.doorZone.x - this.doorZone.width / 2, this.doorZone.y - this.doorZone.height / 2, this.doorZone.width, this.doorZone.height, 8);
                doorGraphics.lineStyle(2, 0xffffff, 1);
                doorGraphics.strokeRoundedRect(this.doorZone.x - this.doorZone.width / 2, this.doorZone.y - this.doorZone.height / 2, this.doorZone.width, this.doorZone.height, 8);

                // Ajouter le texte à l'intérieur de la zone de transition
                const doorText = this.add.text(this.doorZone.x, this.doorZone.y, buttonText, {
                    fontSize: '25px',
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
            createTransitionZones() {
                // Effacer les anciennes zones de transition
                if (this.doorZone) {
                    this.doorZone.destroy();
                }

                // Créer la zone de transition en fonction de la scène actuelle
                if (currentScene === 'home') {
                    this.createTransitionZone(943, 1178, 0xf06543, 'Shop'); // Zone pour aller vers "Shop"
                } else {
                    this.createTransitionZone(320, 480, 0x3f98b9, 'Home'); // Zone pour retourner à "Home"
                }
            }


        }

        const config = {
            type: Phaser.AUTO,
            parent: gameContainerRef.current,
            width: window.innerWidth - 700,
            height: window.innerHeight - 260,
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

        // Attendre que le jeu soit complètement chargé avant d'assigner la scène
        game.events.on('ready', () => {
            sceneRef.current = game.scene.keys['SceneMain'];
        });

        const gameContainer = gameContainerRef.current;
        gameContainer.style.cursor = 'pointer';

        return () => {
            game.destroy(true);
        };
    }, [currentScene]);

    const characterImages = [];
    for (let i = 1; i <= 10; i++) {
        characterImages.push(`/assets/Perso/perso${i}.png`);
    }

    const handleCharacterChange = (frame) => {
        console.log("Changement de personnage vers le frame :", frame);
        if (sceneRef.current) {
            sceneRef.current.reloadPlayer(frame);
        }
        setShowPersonalizationModal(false); // Fermer la modal après avoir choisi un personnage
    };

    return (
        <div>
            <div ref={gameContainerRef} />
            {showPersonalizationModal && (
                <div className="modal-personalization">
                    <div className="modal-content-personalization">
                        <span className="close-personalization" onClick={() => setShowPersonalizationModal(false)}>&times;</span>
                        <h2 style={{fontFamily: "arial", paddingBottom: "25px"}}>Choisir un style de personnage</h2>
                        <div className="character-options" style={{paddingBottom: "5px"}}>
                            {characterImages.map((img, index) => (
                                <img
                                    key={index}
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        background: `url(${img}) -${0}px -${0}px`,
                                        backgroundSize: 'auto',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleCharacterChange(index + 1)}
                                    alt=""
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <button className="buttonChange" onClick={() => setShowPersonalizationModal(true)}>Style personnage</button>
            </div>
        </div>
    );
}

export default Scene;
