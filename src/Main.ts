import "phaser";

import Boot from "./Boot";
import Preloader from "./Preloader";
import GameMain from "./Game";
import Menu from "./Menu";

import { CONSTANTS } from "./CONSTANTS_FILE";

import GameShader from "./ShaderGray";

const configObject: Phaser.Types.Core.GameConfig = {
    scale: {
        mode: Phaser.Scale.NONE,
        zoom: 1.25,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "thegame",
        width: CONSTANTS.width,
        height: CONSTANTS.height,
    },
    scene: [Boot, Preloader, Menu, GameMain],
    physics: {
        default: "arcade",
    },

    type: Phaser.WEBGL,
    // @ts-ignore, see https://github.com/phaserjs/examples/blob/master/public/src/renderer/grayscale%20pipeline.js
    pipeline: {"gray": GameShader }
};

new Phaser.Game(configObject);