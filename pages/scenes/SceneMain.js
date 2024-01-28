
const speed = 150;
export class SceneMain extends Phaser.Scene {
    constructor() {
        super("SceneMain");
    }
    preload() {
        this.load.image("tiles","/assets/tileset.png");
        this.load.tilemapTiledJSON('map',"/assets/othman_map.json");
        this.load.image("perso","/assets/kirby.png")
    }
    create() {


        const map = this.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16});
        const tileset = map.addTilesetImage("tiles1","tiles");
        const layer = map.createLayer("Calque de Tuiles 1", tileset, 0, 0);
        const colision = map.createLayer("Collision",tileset,0,0)
        this.player = this.physics.add.sprite(700,500,"perso");
        colision.setCollisionByProperty({ collideBottom: true });
        this.physics.world.setBounds(0, 0, colision.width, colision.height);
        this.physics.add.collider(this.player, colision);
        // Align.scaleToGameW(this.player,0.15,this)
        this.cursors = this.input.keyboard.createCursorKeys()

    }
    update() {
        this.player.setVelocity(0,0);
        if(this.cursors.up.isDown == true){
            this.player.setVelocityY(-speed);
        }
        else if(this.cursors.left.isDown == true ){
            this.player.setVelocityX(-speed);
        }
        else if(this.cursors.right.isDown == true){
            this.player.setVelocityX(speed);
        }
        else if(this.cursors.down.isDown == true){
            this.player.setVelocityY(speed);
        }

    }
}
export default SceneMain;
