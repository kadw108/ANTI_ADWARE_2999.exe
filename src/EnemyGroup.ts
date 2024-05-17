import { CONSTANTS } from "./CONSTANTS_FILE";
import { EnemyI, Enemy, WavyEnemy, LetterEnemy, TextEnemy, EnemyAbstract, BoomerangEnemy, CircleEnemy } from "./Enemy";
import { generateConfig } from "./EnemyConfig";
import GameMain from "./Game";

export type TextConfig = {
    text: string;
    fontSize: number;
};

export type BoomerangConfig = {
    stayTime: number;
    reverseTime: number; // additive onto stayTime, i.e. relative not absolute
};

export type EnemyType = {
    width: number;
    height: number;
    hp: number;
    text?: true | undefined;
};

export type ReleaseEvent = {
    x: number;
    y: number;
    velocity: Phaser.Math.Vector2;
    time: number;
    type: string;
    hp?: number | undefined;
    textConfig?: TextConfig;
    boomerangConfig?: BoomerangConfig;
};

/*
Function that turns ReleaseEvents, each for a single word/phrase, into 
individual letter enemies.

DOES NOT WORK WITH STRINGS CONTAINING UNICODE SPECIAL CHARACTERS DUE TO WIDTH (xadvance)
TODO - if you want it to work, must dynamically get FONTWIDTH
*/
export function generateLetterText(releaseEvents: Array<ReleaseEvent>): undefined | Array<ReleaseEvent> {
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
            wavy: { width: CONSTANTS.width, height: 9, hp: -1 },
            word: { width: -1, height: -1, hp: 4, text: true },
            letter: { width: -1, height: -1, hp: 1, text: true },
            boomerang: { width: 75, height: 75, hp: 999 },
            circle: { width: 10, height: -1, hp: -1 }, // height doesn't matter
        };

        this.config = generateConfig();
        // scene.physics.add.group({ collideWorldBounds: true });
    }

    start() {
        for (const releaseEvent of this.config) {
            this.scene.time.addEvent({
                delay: releaseEvent.time,
                callback: () => {
                    this.release(releaseEvent.x, releaseEvent.y, releaseEvent.velocity, releaseEvent.type, releaseEvent.textConfig, releaseEvent.boomerangConfig);
                },
            });
        }
    }

    release(x: number, y: number, velocity: Phaser.Math.Vector2, enemyTypeKey: string, textConfig: TextConfig | undefined, boomerangConfig: BoomerangConfig | undefined) {
        const enemyType = this.typeList[enemyTypeKey];

        if (enemyType.text !== undefined && textConfig === undefined) {
            console.error("Text config is undefined for text enemy!");
            return;
        }
        if (enemyTypeKey === "boomerang" && boomerangConfig === undefined) {
            console.error("Boomerang config is undefined for boomerang enemy!");
            return;
        }

        let newEnemy: EnemyI = this.resurrectEnemy(x, y, velocity, enemyTypeKey, textConfig!, boomerangConfig!) as EnemyI;

        if (enemyType.text === undefined && newEnemy === undefined) {
            if (enemyTypeKey === "wavy") {
                newEnemy = new WavyEnemy(this.scene as GameMain, enemyType, velocity);
            } else if (enemyTypeKey === "boomerang") {
                newEnemy = new BoomerangEnemy(this.scene as GameMain, enemyType, velocity, boomerangConfig!);
            } else if (enemyTypeKey === "circle") {
                newEnemy = new CircleEnemy(this.scene as GameMain, enemyType, velocity);
            } else {
                newEnemy = new Enemy(this.scene as GameMain, enemyType, velocity);
            }

            this.add(newEnemy as unknown as Phaser.GameObjects.GameObject);
            newEnemy.start(x, y, velocity);
        } else if (enemyType.text !== undefined && newEnemy === undefined) {
            if (enemyTypeKey === "letter") {
                newEnemy = new LetterEnemy(this.scene as GameMain, enemyType, textConfig!, velocity);
            } else if (enemyTypeKey === "word") {
                newEnemy = new TextEnemy(this.scene as GameMain, enemyType, textConfig!, velocity);
            }

            this.add(newEnemy as unknown as Phaser.GameObjects.GameObject);
            newEnemy.start(x, y, velocity);
        }
    }

    resurrectEnemy(x: number, y: number, velocity: Phaser.Math.Vector2, enemyTypeKey: string, textConfig: TextConfig, boomerangConfig: BoomerangConfig): EnemyI | undefined {
        const enemyType = this.typeList[enemyTypeKey];

        if (enemyType.text === undefined) {
            this.getChildren().forEach((child) => {
                if (!child.active && (child as Enemy).enemyType === enemyType) {
                    //  We found a dead matching enemy, so resurrect it
                    const newEnemy = child as Enemy;

                    if (enemyTypeKey === "boomerang") {
                        (newEnemy as BoomerangEnemy).start(x, y, velocity, boomerangConfig);
                    } else {
                        (newEnemy as Enemy).start(x, y, velocity);
                    }
                    return newEnemy;
                }
            });
        } else if (enemyTypeKey === "letter") {
            this.getChildren().forEach((child) => {
                if (!child.active && (child as Enemy).enemyType === enemyType && (child as LetterEnemy).text === textConfig.text) {
                    // We found a dead matching enemy, so resurrect it
                    const newEnemy = child as LetterEnemy;
                    (newEnemy as LetterEnemy).restart(x, y, velocity, textConfig.fontSize);
                    return newEnemy;
                }
            });
        }

        return undefined;
    }

    stop() {
        this.getChildren().forEach((child) => {
            (child as unknown as EnemyI).kill();
        });
    }

    updateAll() {
        this.getChildren().forEach((child) => {
            child.update();
        });
    }
}
