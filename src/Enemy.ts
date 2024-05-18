import GameMain from "./Game";
import Player from "./Player";
import { EnemyType, TextConfig, BoomerangConfig, EnemyConfig } from "./EnemyGroup";
import { CONSTANTS } from "./CONSTANTS_FILE";

export interface EnemyI {
    scene: GameMain;

    dynamicBody: Phaser.Physics.Arcade.Body;
    onWorldBounds: Function;

    currentHp: number;
    canHit: boolean;
    enemyType: EnemyType;

    hitNum: number;

    start(x: number, y: number, velocity: Phaser.Math.Vector2): void;
    hit(): void;
    onHitPlayer(player: Player): void;
    kill(): void;

    /* stuff most gameobjects and sprites have */

    active: boolean;
}

export abstract class EnemyAbstract extends Phaser.Physics.Arcade.Sprite implements EnemyI {
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
    constructor(scene: GameMain, type: EnemyType, initialVelocity: Phaser.Math.Vector2) {
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

    start(x: number, y: number, initialVelocity?: Phaser.Math.Vector2, enemyConfig?: EnemyConfig) {
        if (enemyConfig !== undefined && enemyConfig.hp !== undefined) {
            this.setHp(enemyConfig.hp);
        } else {
            this.setHp(this.enemyType.hp);
        }
        this.hitNum = 0;
        this.clearHit();

        this.dynamicBody.reset(x, y);

        if (initialVelocity !== undefined) {
            this.dynamicBody.setVelocity(initialVelocity.x, initialVelocity.y);
            this.skipCollision = [initialVelocity.y > 0, initialVelocity.y < 0, initialVelocity.x > 0, initialVelocity.x > 0];
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
            this.setTintFill(0xff0000);
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
    constructor(scene: GameMain, type: EnemyType, velocity: Phaser.Math.Vector2) {
        super(scene, type, velocity);

        this.scaleX = type.width;
        this.scaleY = type.height;
    }
}

export class WavyEnemy extends EnemyAbstract {
    constructor(scene: GameMain, type: EnemyType, velocity: Phaser.Math.Vector2) {
        super(scene, type, velocity);

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

export class CircleEnemy extends EnemyAbstract {
    constructor(scene: GameMain, type: EnemyType, velocity: Phaser.Math.Vector2) {
        super(scene, type, velocity);

        this.setTexture("circle");

        this.scale = type.width / 50;
        this.setCircle(type.width);
    }
}

export class BoomerangEnemy extends Enemy {
    stayEvent: Phaser.Time.TimerEvent | undefined;
    fireEvents: Array<Phaser.Time.TimerEvent>;
    reverseEvent: Phaser.Time.TimerEvent | undefined;

    constructor(scene: GameMain, type: EnemyType, velocity: Phaser.Math.Vector2) {
        super(scene, type, velocity);

        // leave them undefined for now
        /*
        this.stayEvent = null;
        this.reverseEvent = null;
        */
        this.fireEvents = [];
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2, enemyConfig?: EnemyConfig, boomerangConfig?: BoomerangConfig) {
        super.start(x, y, velocity, enemyConfig);

        if (boomerangConfig === undefined) {
            // optional only for type purposes, should be mandatory
            console.error("boomerangConfig is undefined on start call");
            return;
        }

        let newVelocity: Phaser.Math.Vector2;
        if (boomerangConfig.newVelocity === undefined) {
            newVelocity = velocity.negate();
        } else {
            newVelocity = boomerangConfig.newVelocity;
        }

        this.stayEvent = this.scene.time.delayedCall(boomerangConfig.stayTime, () => {
            this.dynamicBody.velocity.set(0);
        });
        if (boomerangConfig.fireMissile !== undefined) {
            const timeBetweenFire = boomerangConfig.reverseTime / boomerangConfig.fireMissile;

            for (let i = 0; i < boomerangConfig.fireMissile; i++) {
                this.fireEvents.push(
                    this.scene.time.delayedCall(boomerangConfig.stayTime + timeBetweenFire * i, () => {
                        const homingEnemyType = {width: 20, height: 20, hp: 1};
                        const homingEnemy = new HomingEnemy(this.scene, homingEnemyType, new Phaser.Math.Vector2(0, 0));
                        this.scene.enemyGroup.add(homingEnemy);
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

export class HomingEnemy extends Enemy {

    constructor(scene: GameMain, type: EnemyType, velocity: Phaser.Math.Vector2) {
        super(scene, type, velocity);
    }

    start(x: number, y: number, initialVelocity?: Phaser.Math.Vector2, enemyConfig?: EnemyConfig) {
        super.start(x, y, initialVelocity!, enemyConfig);
        this.skipCollision = [false, false, false, false];
        this.scene.physics.moveToObject(this, this.scene.player, CONSTANTS.enemySpeed);
    }
}

export class TextEnemy extends EnemyAbstract {
    bitmapText: Phaser.GameObjects.BitmapText;
    text: string;

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig, initialVelocity: Phaser.Math.Vector2) {
        super(scene, type, initialVelocity);

        this.bitmapText = new Phaser.GameObjects.BitmapText(scene, 0, 0, "DisplayFont", textConfig.text, textConfig.fontSize);
        this.bitmapText.setOrigin(0.5);
        scene.add.existing(this.bitmapText);

        this.setScale(this.bitmapText.width, this.bitmapText.height);

        this.text = this.bitmapText.text;
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2, enemyConfig?: EnemyConfig) {
        super.start(x, y, velocity, enemyConfig);

        if (enemyConfig !== undefined) {
            if (enemyConfig.width !== undefined) {
                console.error("EnemyConfig has width for TextEnemy; value will be ignored:", enemyConfig.width);
            }
            if (enemyConfig.height !== undefined) {
                console.error("EnemyConfig has height for TextEnemy; value will be ignored:", enemyConfig.height);
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
    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig, initialVelocity: Phaser.Math.Vector2) {
        super(scene, type, textConfig, initialVelocity);

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
