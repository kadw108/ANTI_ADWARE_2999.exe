import { CONSTANTS } from "./CONSTANTS_FILE";

export default class Preloader extends Phaser.Scene {
    loadText: Phaser.GameObjects.Text;

    constructor() {
        super("Preloader");
    }

    preload() {
        this.loadText = this.add.text(CONSTANTS.originX, CONSTANTS.originY, "Loading ...", { fontFamily: "DisplayFont", fontSize: 74, color: "#e3f2ed" });
        this.loadText.setOrigin(0.5);
        this.loadText.setStroke("#203c5b", 6);
        this.loadText.setShadow(2, 2, "#2d2d2d", 4, true, false);

        this.load.audio("sfxDestroy", ["assets/sfx_destroy.wav"]);
        this.load.audio("sfxDestroy2", ["assets/sfx_destroy2.wav"]);
        this.load.audio("sfxFire", ["assets/sfx_fire.wav"]);
        this.load.audio("sfxHurt", ["assets/sfx_hurt.wav"]);
        this.load.audio("wearyWillow", ["assets/wearyWillow.mp3", "assets/wearyWillow.ogg"]);

        this.load.bitmapFont("DisplayFont", "assets/VT323Bitmap.png", "assets/VT323Bitmap.xml");

        // this.load.image("circle", "assets/circle.png");
        this.load.image("squareSmall", "assets/squareSmall.png");
        // this.load.image("square", "assets/square.png");
        this.load.atlas("atlas1", "assets/texture.png", "assets/texture.json");

        /*
        this.load.setPath('assets/games/snowmen-attack/');
        this.load.image([ 'background', 'overlay', 'gameover', 'title' ]);
        this.load.atlas('sprites', 'sprites.png', 'sprites.json');
        this.load.glsl('snow', 'snow.glsl.js');
        */
    }

    create() {
        // wavy0.png - wavy2.png
        this.anims.create({
            key: "wavy",
            frames: this.anims.generateFrameNames("atlas1", { prefix: 'wavy', end: 2, suffix: ".png" }),
            frameRate: 8,
            repeat: -1
        });

        // blocky0.png - blocky2.png
        this.anims.create({
            key: "blocky",
            frames: this.anims.generateFrameNames("atlas1", { prefix: 'blocky', end: 2, suffix: ".png" }),
            frameRate: 8,
            repeat: -1
        });

        // boomerangBig1.png - boomerangBig3.png
        this.anims.create({
            key: "boomerangBig",
            frames: this.anims.generateFrameNames("atlas1", { prefix: 'boomerangBig', start: 1, end: 3, suffix: ".png" }),
            frameRate: 8,
            repeat: -1
        });

        if (this.sound.locked) {
            this.loadText.setText("Click to Start");

            this.input.once("pointerdown", () => {
                this.scene.start("Menu");
            });
        } else {
            this.scene.start("Menu");
        }
    }
}
