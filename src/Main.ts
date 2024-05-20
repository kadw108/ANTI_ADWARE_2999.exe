import "phaser";

import Preloader from "./Preloader";
import GameMain from "./Game";
import Menu from "./Menu";
import EndScreen from "./EndScreen";

import { CONSTANTS } from "./CONSTANTS_FILE";

// import GameShader from "./ShaderGray";
// import FishEyePostFx from 'phaser3-rex-plugins/plugins/fisheyepipeline.js';

const configObject: Phaser.Types.Core.GameConfig = {
    scale: {
        mode: Phaser.Scale.NONE,
        zoom: 1.25,
        autoCenter: Phaser.Scale.NO_CENTER,
        parent: "thegame",
        width: CONSTANTS.width,
        height: CONSTANTS.height,
    },
    scene: [Preloader, Menu, GameMain, EndScreen],
    physics: {
        default: "arcade",
    },
    transparent: true

    // type: Phaser.WEBGL,
    // @ts-ignore, see https://github.com/phaserjs/examples/blob/master/public/src/renderer/grayscale%20pipeline.js
    // pipeline: {"fisheye": FishEyePostFx }
    // pipeline: [FishEyePostFx]
};

new Phaser.Game(configObject);
