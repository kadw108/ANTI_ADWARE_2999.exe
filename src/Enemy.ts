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

/*
Function that turns a ReleaseEvent for one word/phrase into 
individual letter enemies.
*/
function generateLetterText(releaseEvent: ReleaseEvent) {
    if (releaseEvent.textConfig === undefined) {
        console.error("generateLetterText running on event with undefined textConfig");
        return;
    }

    const FONTWIDTH = 29; // 29 is obtained from the 'xadvance' property in the bitmap xml file
    const real_starting_x = releaseEvent.x - (29 * (releaseEvent.textConfig.text.length) / 2);

    const results = [];
    for (let i = 0; i < releaseEvent.textConfig.text.length; i++) {
        let newRelease: ReleaseEvent = {
            x: real_starting_x + i * FONTWIDTH,
            y: releaseEvent.y,
            velocity: releaseEvent.velocity,
            time: releaseEvent.time,
            type: releaseEvent.type,
            textConfig: {text: releaseEvent.textConfig.text[i], fontSize: releaseEvent.textConfig.fontSize}
        };
        results.push(newRelease);
    };
   
    return results;
}

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
        const buy1 = generateLetterText(
            { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "5", textConfig: { text: "BUY 1 GET 1 FREE", fontSize: 72 } });
        this.config = [...buy1!];

        this.typeList = {
            "0": { width: 200, height: 75, hp: 2 }, // 0
            "1": { width: 50, height: 50, hp: 1 }, // 1
            "2": { width: 18, height: 18, hp: 1 }, // 2
            "3": { width: CONSTANTS.width, height: 2, hp: 1 }, // 3
            "4": { width: -1, height: -1, hp: 4, text: true },
            "5": { width: -1, height: -1, hp: 1, text: true },
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

                    console.log("normal enemy resurrected");
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

            let newEnemy: TextEnemy;

            if (enemyTypeKey === "5") {
                this.getChildren().forEach((child) => {
                    if (!child.active && (child as Enemy).enemyType === enemyType && (child as LetterEnemy).character === textConfig.text) {
                        //  We found a dead matching enemy, so resurrect it
                        newEnemy = child as TextEnemy;

                        console.log("letter enemy resurrected");
                    }
                });
            }
            // @ts-ignore
            if (newEnemy === undefined) {
                newEnemy = new TextEnemy(this.scene as GameMain, enemyType, textConfig);
                this.add(newEnemy);
            }

            newEnemy.start(x, y, velocity);
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

class Enemy extends EnemyAbstract {

    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);

        this.scaleX = type.width;
        this.scaleY = type.height;
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

    kill() {
        this.setActive(false);
        this.setVisible(false);
        this.bitmapText.setActive(false);
        this.bitmapText.setVisible(false);
    }
}