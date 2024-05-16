import { CONSTANTS } from "./CONSTANTS_FILE";

export default class Preloader extends Phaser.Scene
{
    loadText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Preloader');

    }

    preload ()
    {
        this.loadText = this.add.text(CONSTANTS.originX, CONSTANTS.originY, 'Loading ...', { fontFamily: 'DisplayFont', fontSize: 74, color: '#e3f2ed' });
        this.loadText.setOrigin(0.5);
        this.loadText.setStroke('#203c5b', 6);
        this.loadText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        this.load.image('logo', 'assets/phaser3-logo.png');    

        this.load.audio("popupBlocked", ["assets/popup_blocked.wav", "assets/popup_blocked.mp3"]);
        this.load.audio("wearyWillow", ["assets/wearyWillow.mp3", "assets/wearyWillow.ogg"]);

        this.load.bitmapFont('DisplayFont', 'assets/VT323Bitmap.png', 'assets/VT323Bitmap.xml');

        this.load.image("circle", "assets/circle.png");
        this.load.image("square", "assets/square.png");
        this.load.image("squareSmall", "assets/squareSmall.png");

        /*
        this.load.setPath('assets/games/snowmen-attack/');
        this.load.image([ 'background', 'overlay', 'gameover', 'title' ]);
        this.load.atlas('sprites', 'sprites.png', 'sprites.json');
        this.load.glsl('snow', 'snow.glsl.js');

        //  Audio ...
        this.load.setPath('assets/games/snowmen-attack/sounds/');

        this.load.audio('music', [ 'music.ogg', 'music.m4a', 'music.mp3' ]);
        this.load.audio('throw', [ 'throw.ogg', 'throw.m4a', 'throw.mp3' ]);
        this.load.audio('move', [ 'move.ogg', 'move.m4a', 'move.mp3' ]);
        this.load.audio('hit-snowman', [ 'hit-snowman.ogg', 'hit-snowman.m4a', 'hit-snowman.mp3' ]);
        this.load.audio('gameover', [ 'gameover.ogg', 'gameover.m4a', 'gameover.mp3' ]);
        */
    }

    create ()
    {
        /*
        //  Create our global animations

        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'die', start: 0, end: 0, zeroPad: 3 })
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'idle', start: 0, end: 3, zeroPad: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'throwStart',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'throw', start: 0, end: 8, zeroPad: 3 }),
            frameRate: 26
        });

        this.anims.create({
            key: 'throwEnd',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'throw', start: 9, end: 11, zeroPad: 3 }),
            frameRate: 26
        });

        this.anims.create({
            key: 'snowmanIdleBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-idle', start: 0, end: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'snowmanWalkBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-walk', start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'snowmanThrowStartBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-throw', start: 0, end: 5 }),
            frameRate: 20
        });

        this.anims.create({
            key: 'snowmanThrowEndBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-throw', start: 6, end: 8 }),
            frameRate: 20
        });

        this.anims.create({
            key: 'snowmanDieBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-die', start: 0, end: 4 }),
            frameRate: 14
        });

        this.anims.create({
            key: 'snowmanIdleSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-idle', start: 0, end: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'snowmanWalkSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-walk', start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'snowmanThrowStartSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-throw', start: 0, end: 5 }),
            frameRate: 20
        });

        this.anims.create({
            key: 'snowmanThrowEndSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-throw', start: 6, end: 8 }),
            frameRate: 20
        });

        this.anims.create({
            key: 'snowmanDieSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-die', start: 0, end: 4 }),
            frameRate: 14
        });
        */

        if (this.sound.locked)
        {
            this.loadText.setText('Click to Start');

            this.input.once('pointerdown', () => {

                this.scene.start('Menu');

            });
        }
        else
        {
            this.scene.start('Menu');
        }
    }
}
