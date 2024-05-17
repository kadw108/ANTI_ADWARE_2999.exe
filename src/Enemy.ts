import GameMain from "./Game";
import Player from "./Player";
import { EnemyType, TextConfig } from "./EnemyGroup";

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

    /* stuff most gameobjects and sprites have */

    active: boolean;
}

export abstract class EnemyAbstract extends Phaser.Physics.Arcade.Sprite implements EnemyI {
    scene: GameMain;

    dynamicBody: Phaser.Physics.Arcade.Body;
    onWorldBounds: Function;

    currentHp: number;
    canHit: boolean;
    enemyType: EnemyType;

    hitNum: number;

    // velocity needed so we can determine which wall the enemy SHOULDN'T be destroyed on contact with.
    constructor(scene: GameMain, type: EnemyType, initialVelocity: Phaser.Math.Vector2) {
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

        this.addPhysics(initialVelocity);
    }

    addPhysics(initialVelocity: Phaser.Math.Vector2) {
        this.scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;
        this.dynamicBody.setCollideWorldBounds(true);
        this.dynamicBody.onWorldBounds = true;

        const skipUp: boolean = initialVelocity.y > 0; // going down = don't kill when it hits upper edge
        const skipDown: boolean = initialVelocity.y < 0; // going up = don't kill when it hits lower edge
        const skipLeft: boolean = initialVelocity.x > 0; // going right = don't kill when it hits left edge
        const skipRight: boolean = initialVelocity.x > 0; // going left = don't kill when it hits right edge

        this.onWorldBounds = function (up: boolean, down: boolean, left: boolean, right: boolean) {
            if (up && !skipUp) {
                this.kill(); 
                console.log("kill up");
            }
            else if (down && !skipDown) {
                this.kill();
                console.log("kill down");
            }
            else if (left && !skipLeft) {
                this.kill();
                console.log("kill left");
            }
            else if (right && !skipRight) {
                this.kill();
                console.log("kill right");
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
            this.scene.sound.play("sfxDestroy2");
            this.kill();
        }
        else {
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

export class TextEnemy extends Phaser.GameObjects.BitmapText implements EnemyI {
    scene: GameMain;

    dynamicBody: Phaser.Physics.Arcade.Body;
    onWorldBounds: Function;

    currentHp: number;
    canHit: boolean;
    enemyType: EnemyType;

    hitNum: number;

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig, initialVelocity: Phaser.Math.Vector2) {
        super(scene, 0, 0, "DisplayFont", textConfig.text, textConfig.fontSize);
        this.scene.add.existing(this);

        this.setOrigin(0.5);

        // taken from EnemyAbstract
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

        this.addPhysics(initialVelocity);
    }

    addPhysics(initialVelocity: Phaser.Math.Vector2) {
        this.scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;
        this.dynamicBody.setCollideWorldBounds(true);
        this.dynamicBody.onWorldBounds = true;

        const skipUp: boolean = initialVelocity.y > 0; // going down = don't kill when it hits upper edge
        const skipDown: boolean = initialVelocity.y < 0; // going up = don't kill when it hits lower edge
        const skipLeft: boolean = initialVelocity.x > 0; // going right = don't kill when it hits left edge
        const skipRight: boolean = initialVelocity.x > 0; // going left = don't kill when it hits right edge

        this.onWorldBounds = function (up: boolean, down: boolean, left: boolean, right: boolean) {
            if (up && !skipUp) {
                this.kill(); 
                console.log("kill up");
            }
            else if (down && !skipDown) {
                this.kill();
                console.log("kill down");
            }
            else if (left && !skipLeft) {
                this.kill();
                console.log("kill left");
            }
            else if (right && !skipRight) {
                this.kill();
                console.log("kill right");
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
        this.destroy();
    }

    hit() {
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
            this.scene.sound.play("sfxDestroy2");
            this.kill();
        }
        else {
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

export class LetterEnemy extends TextEnemy {
    character: string;

    constructor(scene: GameMain, type: EnemyType, textConfig: TextConfig, velocity: Phaser.Math.Vector2) {
        super(scene, type, textConfig, velocity);

        this.character = textConfig.text;
        if (this.character.length !== 1) {
            console.error("Character length of LetterEnemy is not 1!");
            console.error(textConfig);
        }
    }

    restart(x: number, y: number, velocity: Phaser.Math.Vector2, fontSize: number) {
        super.start(x, y, velocity);
        this.setFontSize(fontSize);
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
    }
}
