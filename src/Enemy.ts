import { CONSTANTS } from "./CONSTANTS_FILE";
import GameMain from "./Game";
import Player from "./Player";

type TextConfig = {
    text: string;
    fontSize: number;
};

type ReleaseEvent = {
    x: number;
    y: number;
    velocity: Phaser.Math.Vector2;
    time: number;
    type: string;
    textConfig?: TextConfig;
};

type EnemyType = {
    width: number;
    height: number;
    hp: number;
    text?: true | undefined;
};

/*
Function that turns ReleaseEvents, each for a single word/phrase, into 
individual letter enemies.
*/
function generateLetterText(releaseEvents: Array<ReleaseEvent>): undefined | Array<ReleaseEvent> {
    const results = [];

    for (const releaseEvent of releaseEvents) {
        if (releaseEvent.textConfig === undefined) {
            console.error("generateLetterText running on event with undefined textConfig");
            return undefined;
        }
        if (releaseEvent.type !== "word") {
            console.log('Advise: run generateLetterText only on events with "word" type enemies.');
        }

        const FONTWIDTH = 29; // 29 is obtained from the 'xadvance' property in the bitmap xml file

        // 29 is for a 72 height font; must adjust width for variable fontsizes
        const sizeAdjustedWidth = FONTWIDTH * (releaseEvent.textConfig.fontSize / 72);

        const real_starting_x = releaseEvent.x - (sizeAdjustedWidth * releaseEvent.textConfig.text.length) / 2;

        for (let i = 0; i < releaseEvent.textConfig.text.length; i++) {
            let newRelease: ReleaseEvent = {
                x: real_starting_x + i * sizeAdjustedWidth,
                y: releaseEvent.y,
                velocity: releaseEvent.velocity,
                time: releaseEvent.time,
                type: "letter",
                textConfig: { text: releaseEvent.textConfig.text[i], fontSize: releaseEvent.textConfig.fontSize },
            };
            results.push(newRelease);
        }
    }

    return results;
}

function generateConfig(): Array<ReleaseEvent> {
    let config: Array<ReleaseEvent> = [];

    /*
    config = [
        { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "0" },
        { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 2000, type: "0" },
        { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: "0" },
        { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: "0" },
    ];
    */

    const letters = generateLetterText([
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "word", textConfig: { text: "ARE YOU READY?", fontSize: 72 } },
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: "word", textConfig: { text: "GET SET", fontSize: 72 } },
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: "word", textConfig: { text: "GO!", fontSize: 72 } },

        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 7000, type: "word", textConfig: { text: "TEST LMAO. GET SET GO", fontSize: 72 } },
    ]);

    for (const i of letters!) {
        config.push(i);
    }

    for (let i = 0; i < 30; i++) {
        config.push({ x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 5000 + 720 * i, type: "wavy" });
    }

    return config;
}

export class EnemyGroup extends Phaser.Physics.Arcade.Group {
    config: Array<ReleaseEvent>;
    typeList: { [id: string]: EnemyType };

    constructor(scene: GameMain) {
        super(scene.physics.world, scene);

        this.typeList = {
            "0": { width: 200, height: 75, hp: 2 },
            "1": { width: 50, height: 50, hp: 1 },
            "2": { width: 18, height: 18, hp: 1 },
            "3": { width: CONSTANTS.width, height: 2, hp: 1 },
            "wavy": { width: CONSTANTS.width, height: 9, hp: -1 },
            word: { width: -1, height: -1, hp: 4, text: true },
            letter: { width: -1, height: -1, hp: 1, text: true },
        };

        this.config = generateConfig();
    }

    start() {
        for (const releaseEvent of this.config) {
            this.scene.time.addEvent({
                delay: releaseEvent.time,
                callback: () => {
                    this.release(releaseEvent.x, releaseEvent.y, releaseEvent.velocity, releaseEvent.type, releaseEvent.textConfig);
                },
            });
        }
    }

    release(x: number, y: number, velocity: Phaser.Math.Vector2, enemyTypeKey: string, textConfig: TextConfig | undefined) {
        const enemyType = this.typeList[enemyTypeKey];

        if (enemyType.text === undefined) {
            let newEnemy: Enemy;

            this.getChildren().forEach((child) => {
                if (!child.active && (child as Enemy).enemyType === enemyType) {
                    //  We found a dead matching enemy, so resurrect it
                    newEnemy = child as Enemy;
                }
            });

            // @ts-ignore
            if (newEnemy === undefined) {
                if (enemyTypeKey !== "wavy") {
                    newEnemy = new Enemy(this.scene as GameMain, enemyType);
                }
                else {
                    newEnemy = new WavyEnemy(this.scene as GameMain, enemyType);
                }

                this.add(newEnemy);
            }

            newEnemy.start(x, y, velocity);

        } else {
            if (textConfig === undefined) {
                console.error("Text config is undefined for text enemy!");
                return;
            }

            let newEnemy: TextEnemy;

            if (enemyTypeKey === "letter") {
                this.getChildren().forEach((child) => {
                    if (!child.active && (child as Enemy).enemyType === enemyType && (child as LetterEnemy).character === textConfig.text) {
                        // We found a dead matching enemy, so resurrect it
                        newEnemy = child as LetterEnemy;

                        (newEnemy as LetterEnemy).restart(x, y, velocity, textConfig.fontSize);
                    }
                });

                // @ts-ignore
                if (newEnemy === undefined) {
                    newEnemy = new LetterEnemy(this.scene as GameMain, enemyType, textConfig);
                    this.add(newEnemy);
                    newEnemy.start(x, y, velocity);
                }
            }
            else {
                newEnemy = new TextEnemy(this.scene as GameMain, enemyType, textConfig);
                this.add(newEnemy);
                newEnemy.start(x, y, velocity);
            }
        }
    }

    stop() {
        // this.timedEvent.remove();

        this.getChildren().forEach((child) => {
            (child as EnemyAbstract).kill();
        });
    }

    updateAll() {
        this.getChildren().forEach((child) => {
            (child as EnemyAbstract).update();
        });
    }
}

export abstract class EnemyAbstract extends Phaser.Physics.Arcade.Sprite {
    scene: GameMain;

    dynamicBody: Phaser.Physics.Arcade.Body;
    onWorldBounds: Function;

    currentHp: number;
    canHit: boolean;
    enemyType: EnemyType;

    hitNum: number;

    constructor(scene: GameMain, type: EnemyType) {
        super(scene, 0, 0, "squareSmall");
        this.scene = scene;

        if (type.hp > 0) {
            this.currentHp = type.hp;
            this.canHit = true;
        }
        else {
            this.currentHp = -1;
            this.canHit = false;
        }
        this.enemyType = type;

        this.hitNum = 0;

        this.scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;
        this.dynamicBody.setCollideWorldBounds(true);
        this.dynamicBody.onWorldBounds = true;
        this.onWorldBounds = function (up: boolean, down: boolean, left: boolean, right: boolean) {
            if (up === false) {
                this.kill(); // they spawn from up so don't kill there
            }
        };
        this.scene.add.existing(this);
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2) {
        this.dynamicBody.reset(x, y);
        this.dynamicBody.setVelocity(velocity.x, velocity.y);

        this.setActive(true);
        this.setVisible(true);
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
    }

    hit() {
        this.scene.sound.play("popupBlocked");
        this.currentHp -= 1;

        this.setTintFill(0xff0000);
        this.hitNum++;
        this.scene.time.delayedCall(300, () => {
            this.hitNum--;
            if (this.hitNum === 0) {
                this.clearHit();
            }
        });

        if (this.currentHp <= 0) {
            this.kill();
        }
    }

    clearHit() {
        this.clearTint();
    }

    onHitPlayer(player: Player): void {
        player.hit();
    }
}

class Enemy extends EnemyAbstract {
    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);

        this.scaleX = type.width;
        this.scaleY = type.height;
    }
}

class WavyEnemy extends EnemyAbstract {
    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);

        this.play("wavy");

        // don't want to set scale because that affects image/anim size, so just
        // set size of body
        this.dynamicBody.setSize(type.width, type.height);
    }

    onHitPlayer(player: Player): void {
        if (player.dynamicBody.speed === 0) {
            player.hit();
        }
    }
}

class TextEnemy extends EnemyAbstract {
    bitmapText: Phaser.GameObjects.BitmapText;

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig) {
        super(scene, type);
        this.bitmapText = new Phaser.GameObjects.BitmapText(scene, 0, 0, "DisplayFont", textConfig.text, textConfig.fontSize);
        this.scene.add.existing(this.bitmapText);

        this.setOrigin(0.5);
        this.bitmapText.setOrigin(0.5);

        this.scaleX = this.bitmapText.width;
        this.scaleY = this.bitmapText.height;

        this.setTintFill(0x0000ff);

        this.setDepth(0);
        this.bitmapText.setDepth(1);
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2) {
        super.start(x, y, velocity);
        this.bitmapText.setActive(true);
        this.bitmapText.setVisible(true);
    }

    kill() {
        this.bitmapText.destroy();
        this.destroy();
    }

    update() {
        super.update();
        this.bitmapText.setX(this.x);
        this.bitmapText.setY(this.y);
    }
}

class LetterEnemy extends TextEnemy {
    character: string;

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig) {
        super(scene, type, textConfig);

        this.character = textConfig.text;
        if (this.character.length !== 1) {
            console.error("Character length of LetterEnemy is not 1!");
            console.error(textConfig);
        }
    }

    restart(x: number, y: number, velocity: Phaser.Math.Vector2, fontSize: number) {
        super.start(x, y, velocity);

        this.setTintFill(0x0000ff);

        this.bitmapText.setFontSize(fontSize);
        this.scaleX = this.bitmapText.width;
        this.scaleY = this.bitmapText.height;
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
        this.bitmapText.setActive(false);
        this.bitmapText.setVisible(false);
    }
}
