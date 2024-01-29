/*jshint esversion: 6 */

const speed = 700;

export class SceneShop extends Phaser.Scene {
    constructor() {
        super("SceneShop");
    }
    preload() {
        this.load.image("tiles","/assets/store.png");
        this.load.tilemapTiledJSON('map',"/assets/shopMapOthman.json");
        this.load.image("perso","/assets/kirby.png");
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

export default SceneShop;

