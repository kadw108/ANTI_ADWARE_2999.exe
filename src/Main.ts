import 'phaser';

import Boot from './Boot';
import Preloader from './Preloader';
import GameMain from './Game';
import Menu from "./Menu";

import { CONSTANTS } from './CONSTANTS_FILE';

const configObject: Phaser.Types.Core.GameConfig = {
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'thegame',
        width: CONSTANTS.width,
        height: CONSTANTS.height
    },
    // scene: GameMain,
    scene: [ Boot, Preloader, Menu,GameMain ],
    physics: {
        default: "arcade"
    }
};
 
const game = new Phaser.Game(configObject);