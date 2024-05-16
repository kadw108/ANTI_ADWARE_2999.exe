import { CONSTANTS } from "./CONSTANTS_FILE";
import GameMain from "./Game";

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
TODO - 
add hue rotate to enemies (optional?)
create dynamic text enemies

make undertale's blue and orange thingies (or just orange to start with)
but you'll have to do something besides color I think... maybe wavy lines...?
*/

export class EnemyGroup extends Phaser.Physics.Arcade.Group {
    config: Array<ReleaseEvent>;
    typeList: { [id: string]: EnemyType };

    constructor(scene: GameMain) {
        super(scene.physics.world, scene);

        /* this.config = [
            { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: 0 },
            { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 2000, type: 0 },
            { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: 0 },
            { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: 0 },
        ]; */
        this.config = [{ x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "4", textConfig: { text: "WEARY WILLOW", fontSize: 72 } }];

        this.typeList = {
            "0": { width: 200, height: 75, hp: 2 }, // 0
            "1": { width: 50, height: 50, hp: 1 }, // 1
            "2": { width: 18, height: 18, hp: 1 }, // 2
            "3": { width: CONSTANTS.width, height: 2, hp: 1 }, // 3
            "4": { width: -1, height: -1, hp: 1, text: true },
        };

        for (let i = 0; i < 30; i++) {
            this.config.push({ x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 5000 + 720 * i, type: "3" });
        }
    }

    start() {
        for (const releaseEvent of this.config) {
            this.scene.time.addEvent({
                delay: releaseEvent.time,
                callback: () => {
                    this.release(releaseEvent.x, releaseEvent.y, releaseEvent.velocity, this.typeList[releaseEvent.type], releaseEvent.textConfig);
                },
            });
        }
    }

    release(x: number, y: number, velocity: Phaser.Math.Vector2, enemyType: EnemyType, textConfig: TextConfig | undefined) {
        if (enemyType.text === undefined) {
            let newEnemy: Enemy;
            this.getChildren().forEach((child) => {
                if (!child.active && (child as Enemy).enemyType === enemyType) {
                    //  We found a dead matching germ, so resurrect it
                    newEnemy = child as Enemy;
                }
            });

            // @ts-ignore
            if (newEnemy === undefined) {
                newEnemy = new Enemy(this.scene as GameMain, enemyType);
                this.add(newEnemy);
            }
            newEnemy.start(x, y, velocity);
        }
        else {
            if (textConfig === undefined) {
                console.error("Text config is undefined for text enemy!");
                return;
            }
            let newEnemy: TextEnemy = new TextEnemy(this.scene as GameMain, enemyType, textConfig);
            this.add(newEnemy);
            newEnemy.start(x, y, velocity);
        }
    }

    stop() {
        // this.timedEvent.remove();

        this.getChildren().forEach((child) => {
            (child as EnemyAbstract).kill();
        });
    }
}

export class EnemyAbstract extends Phaser.Physics.Arcade.Sprite {
    scene: GameMain;

    dynamicBody: Phaser.Physics.Arcade.Body;
    onWorldBounds: Function;

    currentHp: number;
    enemyType: EnemyType;

    hitNum: number;

    constructor(scene: GameMain, type: EnemyType) {
        super(scene, 0, 0, "squareSmall");
        this.scene = scene;

        this.currentHp = type.hp;
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

}

export class Enemy extends EnemyAbstract {

    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);

        this.scaleX = type.width;
        this.scaleY = type.height;
    }
}

export class TextEnemy extends EnemyAbstract {
    bitmapText: Phaser.GameObjects.BitmapText;

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig) {
        super(scene, type);
        this.bitmapText = new Phaser.GameObjects.BitmapText(scene, 0, 0, "DisplayFont", textConfig.text, textConfig.fontSize);
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2) {
        super.start(x, y, velocity);

        this.bitmapText.setX(x);
        this.bitmapText.setY(y);
        this.bitmapText.setVisible(true);
    }

    kill() {
        this.bitmapText.destroy();
        this.destroy();
    }
}
