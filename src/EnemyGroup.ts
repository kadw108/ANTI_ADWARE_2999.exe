import { CONSTANTS } from "./CONSTANTS_FILE";
import { EnemyAbstract, Enemy, WavyEnemy, LetterEnemy, TextEnemy, BoomerangEnemy, CircleEnemy, BlockyEnemy } from "./Enemy";
import { generateConfig } from "./EnemyPatternConfig";
import GameMain from "./Game";

export type TextConfig = {
    text: string;
    fontSize: number;
};

export type BoomerangConfig = {
    stayTime: number;
    reverseTime: number; // additive onto stayTime, i.e. relative not absolute
    newVelocity?: Phaser.Math.Vector2; // if undefined, it's the reverse of the original velocity,
    fireMissile?: number; // number of missiles enemy should fire at player while unmoving; undefined = 0
};

export type EnemyType = {
    width: number;
    height: number;
    hp: number;
    text?: true | undefined;
};

export type EnemyConfig = {
    width?: number;
    height?: number;
    hp?: number;
    counterClockwise?: number; // number of 90 degree counterclockwise rotations. 0 to 3; number > 3 will be % 4
}

export type ReleaseEvent = {
    x: number;
    y: number;
    velocity: Phaser.Math.Vector2;
    time: number;
    type: string;
    enemyConfig?: EnemyConfig; // can override default enemy settings for that type
    textConfig?: TextConfig;
    boomerangConfig?: BoomerangConfig;
};

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
            blocky: { width: CONSTANTS.width, height: 9, hp: -1 },
            word: { width: -1, height: -1, hp: 4, text: true },
            letter: { width: -1, height: -1, hp: 1, text: true },
            boomerang: { width: 75, height: 75, hp: 999 },
            circle: { width: 10, height: -1, hp: -1 }, // height doesn't matter,
        };

        this.config = generateConfig();
        // scene.physics.add.group({ collideWorldBounds: true });
    }

    start() {
        for (const releaseEvent of this.config) {
            this.scene.time.addEvent({
                delay: releaseEvent.time,
                callback: () => {
                    this.release(releaseEvent.x, releaseEvent.y, releaseEvent.velocity, releaseEvent.type, releaseEvent.enemyConfig, releaseEvent.textConfig, releaseEvent.boomerangConfig);
                },
            });
        }
    }

    release(x: number, y: number, velocity: Phaser.Math.Vector2, enemyTypeKey: string, enemyConfig: EnemyConfig | undefined, textConfig: TextConfig | undefined, boomerangConfig: BoomerangConfig | undefined): void {
        const enemyType = this.typeList[enemyTypeKey];

        if (enemyType.text !== undefined) {
            if (textConfig === undefined) {
                console.error("Text config is undefined for text enemy!");
                return;
            }
            if (enemyTypeKey !== "word" && enemyTypeKey !== "letter") {
                console.error("Enemy type has defined text property, but is not 'word' or 'letter'!");
                return;
            }
        }
        if (enemyTypeKey === "boomerang" && boomerangConfig === undefined) {
            console.error("Boomerang config is undefined for boomerang enemy!");
            return;
        }

        if (this.resurrectEnemy(x, y, velocity, enemyTypeKey, enemyConfig, textConfig!, boomerangConfig!)) {
            return;
        }

        let newEnemy: EnemyAbstract;
        if (enemyType.text === undefined) {
            if (enemyTypeKey === "wavy") {
                newEnemy = new WavyEnemy(this.scene as GameMain, enemyType, velocity);
            } else if (enemyTypeKey === "blocky") {
                newEnemy = new BlockyEnemy(this.scene as GameMain, enemyType, velocity);
            } else if (enemyTypeKey === "boomerang") {
                newEnemy = new BoomerangEnemy(this.scene as GameMain, enemyType, velocity);
            } else if (enemyTypeKey === "circle") {
                newEnemy = new CircleEnemy(this.scene as GameMain, enemyType, velocity);
            } else {
                newEnemy = new Enemy(this.scene as GameMain, enemyType, velocity);
            }

            this.add(newEnemy as unknown as Phaser.GameObjects.GameObject);
            if (enemyTypeKey === "boomerang") {
                (newEnemy as BoomerangEnemy).start(x, y, velocity, enemyConfig, boomerangConfig);
            }
            else {
                newEnemy.start(x, y, velocity, enemyConfig);
            }
        } else {
            if (enemyTypeKey === "letter") {
                newEnemy = new LetterEnemy(this.scene as GameMain, enemyType, textConfig!, velocity);
            } else if (enemyTypeKey === "word") {
                newEnemy = new TextEnemy(this.scene as GameMain, enemyType, textConfig!, velocity);
            }
            // the checks at the start catch the 'else' category

            this.add(newEnemy! as unknown as Phaser.GameObjects.GameObject);
            newEnemy!.start(x, y, velocity, enemyConfig);
        }
    }

    resurrectEnemy(x: number, y: number, velocity: Phaser.Math.Vector2, enemyTypeKey: string, enemyConfig: EnemyConfig | undefined, textConfig: TextConfig, boomerangConfig: BoomerangConfig): boolean {
        const enemyType = this.typeList[enemyTypeKey];

        if (enemyType.text === undefined) {
            for (const child of this.getChildren()) {
                if (!child.active && (child as Enemy).enemyType === enemyType) {
                    const newEnemy = child as Enemy;

                    if (enemyTypeKey === "boomerang") {
                        (newEnemy as BoomerangEnemy).start(x, y, velocity, enemyConfig, boomerangConfig);
                    } else {
                        (newEnemy as Enemy).start(x, y, velocity, enemyConfig);
                    }
                    return true;
                }
            }
        } else if (enemyTypeKey === "letter") {
            for (const child of this.getChildren()) {
                if (!child.active && (child as Enemy).enemyType === enemyType && (child as LetterEnemy).text === textConfig.text) {
                    (child as LetterEnemy).restart(x, y, velocity, textConfig.fontSize, enemyConfig);
                    return true;
                }
            }
        }

        return false;
    }

    stop() {
        this.getChildren().forEach((child) => {
            (child as unknown as EnemyAbstract).kill();
        });
    }

    updateAll() {
        this.getChildren().forEach((child) => {
            child.update();
        });
    }
}
