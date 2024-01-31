import Phaser from 'phaser';
import {router} from "next/router";

const speed = 150;

export class SceneMain extends Phaser.Scene {
    constructor() {
        super("SceneMain");
    }

    preload() {
        this.load.image("tiles", "/assets/tileset.png");
        this.load.tilemapTiledJSON('map', "/assets/othman_map.json");
        this.load.spritesheet('character', '/assets/perso.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const map = this.make.tilemap({key: "map", tileWidth: 16, tileHeight: 16});
        const tileset = map.addTilesetImage("tiles1", "tiles");
        const layer = map.createLayer("Calque de Tuiles 1", tileset, 0, 0);
        const colision = map.createLayer("Collision", tileset, 0, 0)
        this.player = this.physics.add.sprite(785,655,"character").setFrame(5);
        // this.player = this.physics.add.sprite(926,1177,"character").setFrame(5);
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
            frames: this.anims.generateFrameNumbers('character', { frames: [1, 4] }), // Replace [0, 1] with the actual frame numbers you want to use
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('character', { frames: [3, 6] }), // Replace [0, 1] with the actual frame numbers you want to use
            frameRate: 10,
            repeat: -1
        });
        // colision.setCollisionByProperty({ collideBottom: true });
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

        this.player.setScale(1.5);

    }


    handleCollision(player, collisionLayer) {
        if (Math.abs(this.player.x >= 925) && Math.abs(this.player.x <= 975)
            && Math.abs(this.player.y >= 1177) && Math.abs(this.player.y <= 1180)) {
            // Charger la nouvelle carte
            router.push('/scenes/SceneShop');
        }
    }



    update() {
        this.player.setVelocity(0);

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play('up', true);
        }
        else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('right', true);
        }
        else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play('down', true);
        }
        else {
            // If no cursor is down, stop the animation
            this.player.anims.stop();

            // Optionally, set to a default frame without movement
            this.player.setFrame(5);
        }

    }
}

export default SceneMain;
