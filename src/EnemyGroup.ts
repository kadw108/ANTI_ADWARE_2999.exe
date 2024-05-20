import { CONSTANTS } from "./CONSTANTS_FILE";
import { EnemyAbstract, Enemy, WavyEnemy, LetterEnemy, TextEnemy, BoomerangEnemy, CircleEnemy, BlockyEnemy } from "./Enemy";
import { generateConfig } from "./EnemyPatternConfig";
import GameMain from "./Game";

export type EnemyConfig = {
    width?: number;
    height?: number;
    hp?: number;
    counterClockwise?: number; // number of 90 degree counterclockwise rotations. 0 to 3; number > 3 will be % 4
    skipCollision?: [boolean, boolean, boolean, boolean]; // whether to skip collision if out of bounds on up/down/left/right side; if not undefined, overrides default skipCollision which is automatically determined by starting velocity
};
export type TextConfig = {
    text: string;
    fontSize: number;
};
export type BoomerangConfig = {
    stayTime: number;
    reverseTime: number; // additive onto stayTime, i.e. relative not absolute
    newVelocity?: Phaser.Math.Vector2; // if undefined, it's the reverse of the original velocity,
    missileCount?: number; // number of missiles enemy should fire at player while unmoving; undefined = 0
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
    enemyConfig?: EnemyConfig; // can override default enemy settings for that type
    textConfig?: TextConfig;
    boomerangConfig?: BoomerangConfig;
};

class EnemyParent extends Phaser.Physics.Arcade.Group {

    addEnemy(newEnemy: EnemyAbstract) {
        this.add(newEnemy as unknown as Phaser.GameObjects.GameObject);
        return newEnemy;
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

export class EnemyGroupManager extends EnemyParent {
    static config: Array<ReleaseEvent> = generateConfig();

    typeList: { [id: string]: EnemyGroup };

    constructor(scene: GameMain) {
        super(scene.physics.world, scene);

        this.typeList = {
            wavy: new EnemyGroup(scene,
                { width: CONSTANTS.width, height: 9, hp: -1 },
                WavyEnemy),
            blocky: new EnemyGroup(scene,
                { width: CONSTANTS.width, height: 9, hp: -1 },
                BlockyEnemy),
            letter: new EnemyGroup(scene,
                { width: -1, height: -1, hp: 1, text: true },
                LetterEnemy),
            boomerang: new EnemyGroup(scene,
                { width: 75, height: 75, hp: 999 },
                BoomerangEnemy),
            circle: new EnemyGroup(scene,
                { width: 10, height: -1, hp: -1 },
                CircleEnemy), // height doesn't matter
        };
    }

    start() {
        for (const releaseEvent of EnemyGroupManager.config) {
            this.scene.time.addEvent({
                delay: releaseEvent.time,
                callback: () => {
                    this.release(releaseEvent.x, releaseEvent.y, releaseEvent.velocity, releaseEvent.type, releaseEvent.enemyConfig, releaseEvent.textConfig, releaseEvent.boomerangConfig);
                },
            });
        }
    }

    release(x: number, y: number, velocity: Phaser.Math.Vector2, enemyTypeKey: string, enemyConfig: EnemyConfig | undefined, textConfig: TextConfig | undefined, boomerangConfig: BoomerangConfig | undefined): void {
        if (this.resurrectEnemy(x, y, velocity, enemyTypeKey, enemyConfig, textConfig!, boomerangConfig!)) {
            return;
        }

        const group = this.typeList[enemyTypeKey];
        if (group !== null) {
            const newEnemy = group.createOne(this.scene as GameMain, textConfig!);
            this.addEnemy(newEnemy);
            newEnemy.start(x, y, velocity, enemyConfig, boomerangConfig);
        } else {
            // currently the only enemy type without a group is 'word', and it's unused
            console.error("Not implemented yet.");
        }
    }

    resurrectEnemy(x: number, y: number, velocity: Phaser.Math.Vector2, enemyTypeKey: string, enemyConfig: EnemyConfig | undefined, textConfig: TextConfig, boomerangConfig: BoomerangConfig): boolean {
        const group = this.typeList[enemyTypeKey];
        return group.resurrectOne(x, y, velocity, enemyConfig, textConfig, boomerangConfig);
    }
}

class EnemyGroup extends EnemyParent {
    enemyType: EnemyType;
    enemyClass: typeof EnemyAbstract;

    constructor(scene: GameMain, enemyType: EnemyType, enemyClass: typeof EnemyAbstract) {
        super(scene.physics.world, scene);
        this.enemyType = enemyType;
        this.enemyClass = enemyClass;
    }

    createOne(scene: GameMain, textConfig: TextConfig): EnemyAbstract {
        // @ts-ignore (this is probably fine? TODO)
        const newEnemy = new this.enemyClass(scene as GameMain, this.enemyType, textConfig);
        return this.addEnemy(newEnemy);
    }

    resurrectOne(x: number, y: number, velocity: Phaser.Math.Vector2, enemyConfig: EnemyConfig | undefined, textConfig: TextConfig, boomerangConfig: BoomerangConfig): boolean {
        const enemy = this.getFirstDead();
        if (enemy !== null) {
            enemy.start(x, y, velocity, enemyConfig, textConfig, boomerangConfig);
            return true;
        }
        return false;
    }
}
