import "phaser";

import Boot from "./Boot";
import Preloader from "./Preloader";
import GameMain from "./Game";
import Menu from "./Menu";
import EndScreen from "./EndScreen";

import { PassData } from "./PassData";

import { CONSTANTS } from "./CONSTANTS_FILE";

// import GameShader from "./ShaderGray";
// import FishEyePostFx from 'phaser3-rex-plugins/plugins/fisheyepipeline.js';

const configObject: Phaser.Types.Core.GameConfig = {
    scale: {
        mode: Phaser.Scale.NONE,
        zoom: 1.25,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "thegame",
        width: CONSTANTS.width,
        height: CONSTANTS.height,
    },
    scene: [Boot, Preloader, Menu, GameMain, EndScreen],
    physics: {
        default: "arcade",
    },

    plugins: {
        global: [
            //make the Player global to all scenes (and other plugins)
            // key is plugin key, plugin is class, start true/false if there
            // is a start method to run, mapping is the name tagged of this
            // to access the plugin class
            { key: "PassData", plugin: PassData, start: false, mapping: "PassData" },
        ],
    },

    // type: Phaser.WEBGL,
    // @ts-ignore, see https://github.com/phaserjs/examples/blob/master/public/src/renderer/grayscale%20pipeline.js
    // pipeline: {"fisheye": FishEyePostFx }
    // pipeline: [FishEyePostFx]
};

new Phaser.Game(configObject);
