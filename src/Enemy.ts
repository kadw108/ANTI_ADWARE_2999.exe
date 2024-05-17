import GameMain from "./Game";
import Player from "./Player";
import { EnemyType, TextConfig, BoomerangConfig } from "./EnemyGroup";

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
    addCollision(velocity: Phaser.Math.Vector2): void;

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

    // velocity needed so we can determine which wall the enemy SHOULDN'T be destroyed on contact with.
    constructor(scene: GameMain, type: EnemyType, initialVelocity: Phaser.Math.Vector2, hp?: number) {
        super(scene, 0, 0, "squareSmall");
        this.scene = scene;

        if (hp !== undefined) {
            this.setHp(hp);
        } else {
            this.setHp(type.hp);
        }

        this.enemyType = type;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;

        // this.addCollision(initialVelocity);
        // this.establishCollision(initialVelocity);
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

    establishCollision(initialVelocity: Phaser.Math.Vector2) {
        const skipUp: boolean = initialVelocity.y > 0; // going down = don't kill when it hits upper edge
        const skipDown: boolean = initialVelocity.y < 0; // going up = don't kill when it hits lower edge
        const skipLeft: boolean = initialVelocity.x > 0; // going right = don't kill when it hits left edge
        const skipRight: boolean = initialVelocity.x > 0; // going left = don't kill when it hits right edge
        this.onWorldBounds = function (up: boolean, down: boolean, left: boolean, right: boolean) {
            if (up && !skipUp) {
                this.kill();
                console.log("kill up");
            } else if (down && !skipDown) {
                this.kill();
                console.log("kill down");
            } else if (left && !skipLeft) {
                this.kill();
                console.log("kill left");
            } else if (right && !skipRight) {
                this.kill();
                console.log("kill right");
            }
        };
    }

    addCollision() {
        this.dynamicBody.setCollideWorldBounds(true);
        this.dynamicBody.onWorldBounds = true;
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2) {
        this.currentHp = this.maxHP;
        this.hitNum = 0;
        this.clearHit();

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
}

export class Enemy extends EnemyAbstract {
    constructor(scene: GameMain, type: EnemyType, velocity: Phaser.Math.Vector2, hp?: number) {
        super(scene, type, velocity, hp);

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

        this.setTexture('circle')

        this.scale = type.width / 50;
        this.setCircle(type.width);
    }
}

export class BoomerangEnemy extends Enemy {

    stayTime: number;
    stayEvent: Phaser.Time.TimerEvent | null;

    reverseTime: number;
    reverseEvent: Phaser.Time.TimerEvent | null;

    initialVelocity: Phaser.Math.Vector2;

    constructor(scene: GameMain, type: EnemyType, velocity: Phaser.Math.Vector2, boomerangConfig: BoomerangConfig) {
        super(scene, type, velocity);

        this.stayTime = boomerangConfig.stayTime;
        this.stayEvent = null;
        this.reverseTime = boomerangConfig.reverseTime;
        this.reverseEvent = null;
        this.initialVelocity = velocity;
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2, boomerangConfig?: BoomerangConfig) {
        super.start(x, y, velocity);

        this.stayEvent = this.scene.time.delayedCall(this.stayTime, () => {
            this.dynamicBody.velocity.set(0);
        });

        this.reverseEvent = this.scene.time.delayedCall(this.stayTime + this.reverseTime, () => {
            this.onWorldBounds = function () {
                this.kill();
            };
            this.dynamicBody.velocity = this.initialVelocity.negate();
        });
    }

    kill() {
        super.kill();
        console.log("boomerang dead");
    }
}

export class TextEnemy extends EnemyAbstract {
    bitmapText: Phaser.GameObjects.BitmapText;
    text: string;

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig, initialVelocity: Phaser.Math.Vector2, hp?: number) {
        super(scene, type, initialVelocity, hp);

        this.bitmapText = new Phaser.GameObjects.BitmapText(scene, 0, 0, "DisplayFont", textConfig.text, textConfig.fontSize);
        scene.add.existing(this.bitmapText);

        this.setScale(this.bitmapText.width, this.bitmapText.height);

        this.text = this.bitmapText.text;
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2) {
        super.start(x, y, velocity);

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

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig, initialVelocity: Phaser.Math.Vector2, hp?: number) {
        super(scene, type, textConfig, initialVelocity, hp);

        if (textConfig.text.length !== 1) {
            console.error("Character length of LetterEnemy is not 1!");
            console.error(textConfig);
        }
    }

    restart(x: number, y: number, velocity: Phaser.Math.Vector2, fontSize: number) {
        super.start(x, y, velocity);
        this.bitmapText.setFontSize(fontSize);
    }

    kill() {
        this.bitmapText.setActive(false);
        this.bitmapText.setVisible(false);
        this.setActive(false);
    }
}

/*
export class TextEnemy extends Phaser.GameObjects.BitmapText implements EnemyI {
    scene: GameMain;

    dynamicBody: Phaser.Physics.Arcade.Body;
    onWorldBounds: Function;

    currentHp: number;
    maxHp: number;
    canHit: boolean;
    enemyType: EnemyType;

    hitNum: number;

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig, initialVelocity: Phaser.Math.Vector2, hp?: number) {
        super(scene, 0, 0, "DisplayFont", textConfig.text, textConfig.fontSize);

        // taken from EnemyAbstract
        if (hp !== undefined) {
            this.setHp(hp);
        } else {
            this.setHp(type.hp);
        }

        this.enemyType = type;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;

        // this.addCollision(initialVelocity);
        // this.establishCollision(initialVelocity);
    }

    setHp(hp: number) {
        if (hp > 0) {
            this.maxHp = hp;
            this.canHit = true;
        } else {
            this.maxHp = -1;
            this.canHit = false;
        }
        this.currentHp = this.maxHp;
    }

    establishCollision(initialVelocity: Phaser.Math.Vector2) {
        const skipUp: boolean = initialVelocity.y > 0; // going down = don't kill when it hits upper edge
        const skipDown: boolean = initialVelocity.y < 0; // going up = don't kill when it hits lower edge
        const skipLeft: boolean = initialVelocity.x > 0; // going right = don't kill when it hits left edge
        const skipRight: boolean = initialVelocity.x > 0; // going left = don't kill when it hits right edge
        this.onWorldBounds = function (up: boolean, down: boolean, left: boolean, right: boolean) {
            if (up && !skipUp) {
                this.kill();
                console.log("kill up");
            } else if (down && !skipDown) {
                this.kill();
                console.log("kill down");
            } else if (left && !skipLeft) {
                this.kill();
                console.log("kill left");
            } else if (right && !skipRight) {
                this.kill();
                console.log("kill right");
            }
        };
    }

    addCollision() {
        this.dynamicBody.setCollideWorldBounds(true, 0, 0, true);
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2) {
        this.currentHp = this.maxHp;
        this.hitNum = 0;
        this.clearHit();

        this.dynamicBody.reset(x, y);
        this.dynamicBody.setVelocity(velocity.x, velocity.y);

        this.setActive(true);
        this.setVisible(true);
    }

    kill() {
        this.destroy();
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

    update() {

    }
}

export class LetterEnemy extends TextEnemy {
    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig, velocity: Phaser.Math.Vector2) {
        super(scene, type, textConfig, velocity);

        if (textConfig.text.length !== 1) {
            console.error("Character length of LetterEnemy is not 1!");
            console.error(textConfig);
        }
    }

    restart(x: number, y: number, velocity: Phaser.Math.Vector2, fontSize: number) {
        super.start(x, y, velocity);
        this.setFontSize(fontSize);
    }

    hit() {
        super.hit();
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
    }
}
*/
