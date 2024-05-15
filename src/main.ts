import 'phaser';

import Boot from './Boot';
import Preloader from './Preloader';
import GameMain from './Game';
 
const configObject: Phaser.Types.Core.GameConfig = {
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'thegame',
        width: 900,
        height: 700
    },
    // scene: GameMain,
    scene: [ Boot, Preloader, GameMain ],
    physics: {
        default: "arcade"
    }
};
 
const game = new Phaser.Game(configObject);