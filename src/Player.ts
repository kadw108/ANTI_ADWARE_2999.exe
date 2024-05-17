import GameMain from "./Game";

const SHOOT_COOLDOWN: number = 500;
const HIT_COOLDOWN: number = 700;
const SPEED: number = 160;
const MAX_HP: number = 20;

export default class Player extends Phaser.Physics.Arcade.Sprite {
    scene: GameMain;

    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    spacebar: Phaser.Input.Keyboard.Key;
    dynamicBody: Phaser.Physics.Arcade.Body;

    canShoot: boolean;

    canBeHit: boolean;
    currentHP: number;
    maxHP: number;

    isAlive: boolean;

    constructor(scene: GameMain) {
        super(scene, 450, 550, "circle");
        this.scale = 0.26; // sprite = circle w radius 13

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;
        this.dynamicBody.setCollideWorldBounds(true, 0, 0);
        this.dynamicBody.setImmovable(true);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.spacebar = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.canShoot = true;

        this.canBeHit = true;
        this.maxHP = MAX_HP;
        this.currentHP = this.maxHP;

        this.isAlive = false;
    }

    start() {
        this.isAlive = true;
    }

    moveHorizontal() {
        if (this.cursors.left.isDown) {
            this.dynamicBody!.setVelocityX(-SPEED);
        } else if (this.cursors.right.isDown) {
            this.dynamicBody!.setVelocityX(SPEED);
        } else {
            this.dynamicBody!.setVelocityX(0);
        }
    }

    moveVertical() {
        if (this.cursors.up.isDown) {
            this.dynamicBody!.setVelocityY(-SPEED);
        } else if (this.cursors.down.isDown) {
            this.dynamicBody.setVelocityY(SPEED);
        } else {
            this.dynamicBody.setVelocityY(0);
        }
    }

    fire() {
        // if (this.cursors.space.isDown && this.canShoot) {
        if (this.cursors.space.isDown && this.canShoot) {
            this.canShoot = false;

            this.scene.playerBulletGroup.fireBullet(this.x, this.y);

            this.scene.time.delayedCall(SHOOT_COOLDOWN, () => {
                this.canShoot = true;
            });
        }
    }

    update() {
        if (this.isAlive) {
            this.moveHorizontal();
            this.moveVertical();
            this.fire();
        }
    }

    hit() {
        if (this.canBeHit) {
            this.canBeHit = false;

            this.setTintFill(0xff0000);
            this.scene.sound.play("popupBlocked");

            this.currentHP--;
            this.scene.hpText.text = "HP: " + this.currentHP + "/" + this.maxHP;

            if (this.currentHP <= 0) {
                this.scene.gameOver();
            }

            this.scene.time.delayedCall(HIT_COOLDOWN, () => {
                this.clearTint();
                this.canBeHit = true;
            });
        }
    }

    die() {
        this.isAlive = false;
        this.dynamicBody.stop;
    }
}
