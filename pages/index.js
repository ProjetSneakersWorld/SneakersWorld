/*jshint esversion: 6 */
import Phaser from 'phaser';
import {SceneMain} from "./scenes/SceneMain"
import {SceneShop} from "./scenes/SceneShop"

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: "100%",
    height: "100%",
    scene: SceneMain,
    
    physics :{
        default: "arcade",
        arcade :{
            debug :true
        }
    }
};

const game = new Phaser.Game(config);
