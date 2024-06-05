import { CONSTANTS } from "./CONSTANTS_FILE";
import GameMain from "./Game";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    scene: GameMain;

    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    dynamicBody: Phaser.Physics.Arcade.Body;

    canShoot: boolean;

    canBeHit: boolean;

    isAlive: boolean;

    constructor(scene: GameMain) {
        super(scene, CONSTANTS.originX, CONSTANTS.originY + 200, "atlas1", "player.png");
        // super(scene, 450, 550, "circle");
        /* this.scale = 0.24; // sprite = circle w radius 13 */

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        // @ts-ignore

        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;

        // physics body is always positioned from the top-left of the game object
        // hardcoded value from looking at image
        this.dynamicBody.setCircle(3, 7.5, 7.5);

        this.dynamicBody.setCollideWorldBounds(true, 0, 0);
        this.dynamicBody.setImmovable(true);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.scene.input.keyboard!.on('keydown-SPACE', () => {
            this.fire();
        });

        this.canShoot = true;

        this.canBeHit = true;

        this.isAlive = false;

        this.depth = 3;
    }

    start() {
        this.isAlive = true;
    }

    moveHorizontal() {
        if (this.cursors.left.isDown) {
            this.dynamicBody.setVelocityX(-CONSTANTS.playerSpeed);
        } else if (this.cursors.right.isDown) {
            this.dynamicBody.setVelocityX(CONSTANTS.playerSpeed);
        } else {
            this.dynamicBody.setVelocityX(0);
        }
    }

    moveVertical() {
        if (this.cursors.up.isDown) {
            this.dynamicBody.setVelocityY(-CONSTANTS.playerSpeed);
        } else if (this.cursors.down.isDown) {
            this.dynamicBody.setVelocityY(CONSTANTS.playerSpeed);
        } else {
            this.dynamicBody.setVelocityY(0);
        }
    }

    fire() {
        if (this.canShoot) {
            this.canShoot = false;

            this.scene.playerBulletGroup.fireBullet(this.x, this.y - 5);
            // this.scene.changePerformanceEvent("Fire Bullet", CONSTANTS.playerFirePointLoss);

            this.scene.time.delayedCall(CONSTANTS.playerShootCooldown, () => {
                this.canShoot = true;
            });
        }
    }

    update() {
        if (this.isAlive) {
            this.moveHorizontal();
            this.moveVertical();
        }
    }

    hit() {
        if (this.canBeHit) {
            this.scene.changePerformanceEvent("Damaged", CONSTANTS.playerHitPointLoss);

            this.canBeHit = false;

            this.setTintFill(0xff0000);
            this.scene.sound.play("sfxHurt");

            this.scene.time.delayedCall(CONSTANTS.playerHitCooldown, () => {
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
