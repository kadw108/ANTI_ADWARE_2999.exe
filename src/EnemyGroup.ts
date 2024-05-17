import { CONSTANTS } from "./CONSTANTS_FILE";
import { Enemy, WavyEnemy, LetterEnemy, TextEnemy, EnemyAbstract } from "./Enemy";
import GameMain from "./Game";

export type TextConfig = {
    text: string;
    fontSize: number;
};

export type EnemyType = {
    width: number;
    height: number;
    hp: number;
    text?: true | undefined;
};

type ReleaseEvent = {
    x: number;
    y: number;
    velocity: Phaser.Math.Vector2;
    time: number;
    type: string;
    textConfig?: TextConfig;
};

/*
Function that turns ReleaseEvents, each for a single word/phrase, into 
individual letter enemies.

DOES NOT WORK WITH STRINGS CONTAINING UNICODE SPECIAL CHARACTERS DUE TO WIDTH (xadvance)
TODO - if you want it to work, must dynamically get FONTWIDTH
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
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "word", textConfig: { text: "ARE*YOU*READY?", fontSize: 72 } },
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: "word", textConfig: { text: "GET*SET", fontSize: 72 } },
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: "word", textConfig: { text: "GO!", fontSize: 72 } },
    ]);
    for (const i of letters!) {
        config.push(i);
    }

    // diagonal ups
    const diag1 = ["✦", "✧"];
    const diag2 = ["$", "€"];
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 28; j++)  {
            if (i % 2 === 0) {
                config.push({ x: 0 + j * 25, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 5000 + 1440 * i + 22 * j, type: "letter", textConfig: {text: diag1[j % 2], fontSize: 30}} );
            }
            else {
                config.push({ x: CONSTANTS.width - j * 25, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 5000 + 1440 * i + 22 * j, type: "letter", textConfig: {text: diag2[j % 2], fontSize: 50}} );
            }
        }
    }

    // coming from left
    const diag3 = ["Y", "U", "B"];
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 3; j++)  {
            if (i % 2 === 0) {
                config.push({ x: -50, y: 475, velocity: new Phaser.Math.Vector2(200, 0), time: 7880 + 1440 * i + 200 * j, type: "letter", textConfig: {text: diag2[j % 2], fontSize: 70, }} );
            }
            else {
                config.push({ x: -50, y: 525, velocity: new Phaser.Math.Vector2(200, 0), time: 7880 + 1440 * i + 200 * j, type: "letter", textConfig: {text: diag3[j % 3], fontSize: 70, }} );
            }
        }
    }

    for (let i = 0; i < 28; i++) {
        config.push({ x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 23720 + 720 * i, type: "wavy" });
    }

    // coming from right
    const diag4 = ["Y", "U", "B"];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++)  {
            if (i % 2 === 0) {
                config.push({ x: CONSTANTS.width + 50, y: 475, velocity: new Phaser.Math.Vector2(-200, 0), time: 35960 + 1440 * i + 200 * j, type: "letter", textConfig: {text: diag2[j % 2], fontSize: 70, }} );
            }
            else {
                config.push({ x: CONSTANTS.width + 50, y: 525, velocity: new Phaser.Math.Vector2(-200, 0), time: 35960 + 1440 * i + 200 * j, type: "letter", textConfig: {text: diag4[j % 3], fontSize: 70, }} );
            }
        }
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
                    newEnemy = new Enemy(this.scene as GameMain, enemyType, velocity);
                }
                else {
                    newEnemy = new WavyEnemy(this.scene as GameMain, enemyType, velocity);
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
                    newEnemy = new LetterEnemy(this.scene as GameMain, enemyType, textConfig, velocity);
                    this.add(newEnemy);
                    newEnemy.start(x, y, velocity);
                }
            }
            else {
                newEnemy = new TextEnemy(this.scene as GameMain, enemyType, textConfig, velocity);
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