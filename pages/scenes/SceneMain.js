import Phaser from 'phaser';

const speed = 150;

export class SceneMain extends Phaser.Scene {
    constructor() {
        super("SceneMain");
    }

    preload() {
        this.load.image("tiles", "/assets/tileset.png");
        this.load.tilemapTiledJSON('map', "/assets/othman_map.json");
        this.load.image("perso", "/assets/kirby.png")
    }

    create() {


        const map = this.make.tilemap({key: "map", tileWidth: 16, tileHeight: 16});

        const tileset = map.addTilesetImage("tiles1", "tiles");
        const layer = map.createLayer("Calque de Tuiles 1", tileset, 0, 0);
        const colision = map.createLayer("Collision", tileset, 0, 0)
        this.player = this.physics.add.sprite(785, 655, "perso");
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

    }

    handleCollision(player, collisionLayer) {
        if (Math.abs(player.x >= 925) && Math.abs(player.x <= 975)
            && Math.abs(player.y >= 1177) && Math.abs(player.y <= 1180)) {
            console.log("RENTRER");
        }
        //   // this.switchToScene("SceneShop");
        //   // Phaser.Scene.call(this,"SceneShop")
        // }
        //947.5 1177

        // Ajoutez ici le code que vous souhaitez exécuter lorsque le joueur est en collision avec la layer
    }

    update() {
        // console.log(this.player.x + " / "+this.player.y);
        this.player.setVelocity(0, 0);
        if (this.cursors.up.isDown === true) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.left.isDown === true) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown === true) {
            this.player.setVelocityX(speed);
        } else if (this.cursors.down.isDown === true) {
            this.player.setVelocityY(speed);
        }

    }
}

export default SceneMain;
