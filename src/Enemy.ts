import GameMain from "./Game";
import Player from "./Player";
import { EnemyType, TextConfig, BoomerangConfig, EnemyConfig } from "./EnemyGroup";
import { CONSTANTS } from "./CONSTANTS_FILE";

export abstract class EnemyAbstract extends Phaser.Physics.Arcade.Sprite {
    scene: GameMain;

    dynamicBody: Phaser.Physics.Arcade.Body;
    onWorldBounds: Function;

    currentHp: number;
    maxHP: number;
    canHit: boolean;
    enemyType: EnemyType;

    hitNum: number;

    skipCollision: [boolean, boolean, boolean, boolean]; // whether to skip collision: up down left right

    // velocity needed so we can determine which edge the enemy SHOULDN'T be destroyed on collision with.
    constructor(scene: GameMain, type: EnemyType) {
        super(scene, 0, 0, "squareSmall");
        this.setOrigin(0.5);
        this.scene = scene;

        this.enemyType = type;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;

        // leave skipCollision undefined for now
        // this.skipCollision = [true, true, true, true];
    }

    setHp(hp: number) {
        if (hp > 0) {
            this.maxHP = hp;
            this.canHit = true;
        } else {
            this.maxHP = -1;
            this.canHit = false;
        }
        this.currentHp = this.maxHP;
    }

    start(x: number, y: number, initialVelocity?: Phaser.Math.Vector2, enemyConfig?: EnemyConfig, boomerangConfig?: BoomerangConfig) {
        if (enemyConfig !== undefined && enemyConfig.hp !== undefined) {
            this.setHp(enemyConfig.hp);
        } else {
            this.setHp(this.enemyType.hp);
        }

        if (enemyConfig !== undefined && enemyConfig.counterClockwise !== undefined) {
            switch (enemyConfig.counterClockwise % 4) {
                case 0:
                    break;
                case 1:
                    this.angle = -90;
                    break;
                case 2:
                    this.angle = -180;
                    break;
                case 3:
                    this.angle = -270;
                    break;
            }
        }

        this.hitNum = 0;
        this.clearHit();

        this.dynamicBody.reset(x, y);

        if (initialVelocity !== undefined) {
            this.dynamicBody.setVelocity(initialVelocity.x, initialVelocity.y);

            if (enemyConfig !== undefined && enemyConfig.skipCollision !== undefined) {
                this.skipCollision = enemyConfig.skipCollision;
            }
            else {
                this.skipCollision = [initialVelocity.y > 0, initialVelocity.y < 0, initialVelocity.x > 0, initialVelocity.x > 0];
            }
        }

        this.setActive(true);
        this.setVisible(true);
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
    }

    hit() {
        this.currentHp -= 1;

        if (this.currentHp <= 0) {
            this.scene.sound.play("sfxDestroy2");
            this.kill();
        } else {
            this.setTint(0xff0000);
            this.hitNum++;
            this.scene.time.delayedCall(300, () => {
                this.hitNum--;
                if (this.hitNum === 0) {
                    this.clearHit();
                }
            });

            this.scene.sound.play("sfxDestroy");
        }
    }

    clearHit() {
        this.clearTint();
    }

    onHitPlayer(player: Player): void {
        player.hit();
    }

    checkWithinWorldBounds(): void {
        const GRACE_AREA = 100;

        const collideUp = this.y < 0 - GRACE_AREA;
        if (collideUp && !this.skipCollision[0]) {
            this.kill();
            return;
        }

        const collideDown = this.y > CONSTANTS.height + GRACE_AREA;
        if (collideDown && !this.skipCollision[1]) {
            this.kill();
            return;
        }

        const collideLeft = this.x < 0 - GRACE_AREA;
        if (collideLeft && !this.skipCollision[2]) {
            this.kill();
            return;
        }

        const collideRight = this.x > CONSTANTS.width + GRACE_AREA;
        if (collideRight && !this.skipCollision[3]) {
            this.kill();
            return;
        }
    }

    update() {
        this.checkWithinWorldBounds();
    }
}

export class Enemy extends EnemyAbstract {
    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);
    }

    start(x: number, y: number, initialVelocity?: Phaser.Math.Vector2, enemyConfig?: EnemyConfig, boomerangConfig? :BoomerangConfig) {
        super.start(x, y, initialVelocity, enemyConfig);


        this.scaleX = this.enemyType.width;
        this.scaleY = this.enemyType.height;
        if (enemyConfig !== undefined) {
            if (enemyConfig.width !== undefined) {
                this.scaleX = enemyConfig.width;
            }
            if (enemyConfig.height !== undefined) {
                this.scaleY = enemyConfig.height;
            }
        }
    }
}

export class LineEnemy extends EnemyAbstract {
    start(x: number, y: number, initialVelocity?: Phaser.Math.Vector2, enemyConfig?: EnemyConfig, boomerangConfig?: BoomerangConfig) {
        super.start(x, y, initialVelocity, enemyConfig);

        // IMPORTANT: dynamicBody.setSize must be called after this.play(animation)
        // otherwise the collision breaks completely
        // I don't know why?
        if (enemyConfig !== undefined && enemyConfig.width !== undefined && enemyConfig.height !== undefined) {
            this.dynamicBody.setSize(enemyConfig.width, enemyConfig.height);
        }
        else {
            // don't want to set scale because that affects image/anim size, so just
            // set size of body
            this.dynamicBody.setSize(this.enemyType.width, this.enemyType.height);
        }

        if (enemyConfig !== undefined) {
            if (enemyConfig.counterClockwise !== undefined) {
                switch (enemyConfig.counterClockwise % 4) {
                    case 0:
                    case 2:
                        break;
                    case 1:
                    case 3:
                        const newHeight = this.dynamicBody.width;
                        const newWidth = this.dynamicBody.height;
                        this.dynamicBody.setSize(newWidth, newHeight);
                        break;
                }
            }
        }
    }
}

export class WavyEnemy extends LineEnemy {
    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);
        this.play("wavy");
    }

    onHitPlayer(player: Player): void {
        if (player.dynamicBody.speed === 0) {
            player.hit();
        }
    }
}

export class BlockyEnemy extends LineEnemy {
    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);
        this.play("blocky");
    }

    onHitPlayer(player: Player): void {
        if (player.dynamicBody.speed !== 0) {
            player.hit();
        }
    }
}

export class CircleEnemy extends EnemyAbstract {
    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);

        this.setTexture("atlas1", "circle.png");
    }

    start(x: number, y: number, initialVelocity?: Phaser.Math.Vector2, enemyConfig?: EnemyConfig, boomerangConfig?: BoomerangConfig) {
        super.start(x, y, initialVelocity, enemyConfig);

        let newWidth = this.enemyType.width;
        if (enemyConfig !== undefined && enemyConfig.width !== undefined) {
            newWidth = enemyConfig.width;
        }
        this.setCircle(newWidth/2);
    }
}

export class BoomerangEnemy extends EnemyAbstract {
    stayEvent: Phaser.Time.TimerEvent | undefined;
    fireEvents: Array<Phaser.Time.TimerEvent>;
    reverseEvent: Phaser.Time.TimerEvent | undefined;

    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);

        // leave them undefined for now
        /*
        this.stayEvent = null;
        this.reverseEvent = null;
        */
        this.fireEvents = [];

        this.setTexture("atlas1", "boomerangSmall.png");
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2, enemyConfig?: EnemyConfig, boomerangConfig?: BoomerangConfig) {
        super.start(x, y, velocity, enemyConfig);

        if (boomerangConfig === undefined) {
            // optional only for type purposes, should be mandatory
            console.error("boomerangConfig is undefined on start call");
            return;
        }

        let newWidth = this.enemyType.width;
        if (enemyConfig !== undefined && enemyConfig.width !== undefined) {
            newWidth = enemyConfig.width;
        }
        if (newWidth > 60) { // hardcoded; possible TODO - improve?
            this.play("boomerangBig");
        }
        else {
            this.stop();
            this.setTexture("atlas1", "boomerangSmall.png");
        }
        this.setCircle(newWidth/2);

        let newVelocity: Phaser.Math.Vector2;
        if (boomerangConfig.newVelocity === undefined) {
            newVelocity = velocity.negate();
        } else {
            newVelocity = boomerangConfig.newVelocity;
        }

        this.stayEvent = this.scene.time.delayedCall(boomerangConfig.stayTime, () => {
            this.dynamicBody.velocity.set(0);
        });
        if (boomerangConfig.missileCount !== undefined && boomerangConfig.missileCount > 0) {
            const WAIT_BEFORE_FIRE = 500;
            if (boomerangConfig.reverseTime <= WAIT_BEFORE_FIRE) {
                console.log("Boomerang that fires projectiles does not have enough time to give warning.", boomerangConfig);
            }
            const timeBetweenFire = (boomerangConfig.reverseTime - WAIT_BEFORE_FIRE) / boomerangConfig.missileCount;

            for (let i = 0; i < boomerangConfig.missileCount; i++) {
                this.fireEvents.push(
                    this.scene.time.delayedCall(boomerangConfig.stayTime + WAIT_BEFORE_FIRE + timeBetweenFire * i, () => {
                        const homingEnemyType = { width: 20, height: 20, hp: 1 };
                        const homingEnemy = new HomingEnemy(this.scene, homingEnemyType);
                        this.scene.enemyGroupManager.add(homingEnemy);
                        homingEnemy.start(this.x, this.y, undefined);
                    })
                );
            }
        }
        this.reverseEvent = this.scene.time.delayedCall(boomerangConfig.stayTime + boomerangConfig.reverseTime, () => {
            this.skipCollision = [false, false, false, false];
            this.dynamicBody.velocity = newVelocity;
        });
    }

    kill() {
        super.kill();

        this.stayEvent?.destroy();
        this.reverseEvent?.destroy();
        for (const fireEvent of this.fireEvents) {
            fireEvent.destroy();
        }
    }
}

export class HomingEnemy extends EnemyAbstract {
    constructor(scene: GameMain, type: EnemyType) {
        super(scene, type);

        this.setTexture("atlas1", "homing.png");
    }

    start(x: number, y: number, initialVelocity?: Phaser.Math.Vector2, enemyConfig?: EnemyConfig, boomerangConfig?: BoomerangConfig) {
        super.start(x, y, initialVelocity!, enemyConfig);

        let collisionWidth = this.enemyType.width;
        let collisionHeight = this.enemyType.height;
        if (enemyConfig !== undefined) {
            if (enemyConfig.width !== undefined) {
                collisionWidth = enemyConfig.width;
            }
            if (enemyConfig.height !== undefined) {
                collisionHeight = enemyConfig.height;
            }
        }
        this.dynamicBody.setSize(collisionWidth, collisionHeight, true);

        this.skipCollision = [false, false, false, false];
        this.scene.physics.moveToObject(this, this.scene.player, CONSTANTS.enemySpeed);
    }
}

export class TextEnemy extends EnemyAbstract {
    bitmapText: Phaser.GameObjects.BitmapText;
    text: string;

    constructor(scene: GameMain, type: EnemyType, textConfig?: TextConfig) {
        super(scene, type);

        if (textConfig === undefined) {
            console.error("TextEnemy constructor: textConfig is undefined.");
            return;
        }

        this.bitmapText = new Phaser.GameObjects.BitmapText(scene, 0, 0, "DisplayFont", textConfig.text, textConfig.fontSize);
        this.bitmapText.setOrigin(0.5);
        scene.add.existing(this.bitmapText);

        this.setScale(this.bitmapText.width, this.bitmapText.height);

        this.text = this.bitmapText.text;
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2, enemyConfig?: EnemyConfig, boomerangConfig?: BoomerangConfig) {
        super.start(x, y, velocity, enemyConfig);

        if (enemyConfig !== undefined) {
            if (enemyConfig.width !== undefined) {
                console.error("EnemyConfig has width for TextEnemy; value will be ignored:", enemyConfig.width);
            }
            if (enemyConfig.height !== undefined) {
                console.error("EnemyConfig has height for TextEnemy; value will be ignored:", enemyConfig.height);
            }
            if (enemyConfig.counterClockwise !== undefined) {
                console.error("EnemyConfig has counterClockwise for TextEnemy; value will be ignored:", enemyConfig.counterClockwise);
            }
        }

        this.bitmapText.setActive(true);
        this.bitmapText.setVisible(true);

        this.setVisible(false);
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

export class LetterEnemy extends TextEnemy {
    constructor(scene: GameMain, type: EnemyType, textConfig?: TextConfig) {
        super(scene, type, textConfig);

        if (textConfig === undefined) {
            console.error("LetterEnemy constructor: textConfig is undefined.");
            return;
        }

        if (textConfig.text.length !== 1) {
            console.error("Character length of LetterEnemy is not 1!");
            console.error(textConfig);
        }
    }

    restart(x: number, y: number, velocity: Phaser.Math.Vector2, fontSize: number, enemyConfig?: EnemyConfig) {
        super.start(x, y, velocity, enemyConfig);
        this.bitmapText.setFontSize(fontSize);
        this.setScale(this.bitmapText.width, this.bitmapText.height);
    }

    kill() {
        this.bitmapText.setActive(false);
        this.bitmapText.setVisible(false);
        this.setActive(false);
    }

    hit() {
        super.hit();
    }
}
