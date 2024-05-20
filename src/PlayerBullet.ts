import { CONSTANTS } from "./CONSTANTS_FILE";

export class PlayerBulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene: Phaser.Scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 30,
            key: "bullet",
            active: false,
            visible: false,
            classType: PlayerBullet,
        });
    }

    fireBullet(x: number, y: number) {
        let bullet = this.getFirstDead(false);

        if (bullet) {
            bullet.fire(x, y);
            this.scene.sound.play("sfxFire");
        }
    }

    stop() {
        this.clear(true, true);
    }
}

export class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
    dynamicBody: Phaser.Physics.Arcade.Body;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "atlas1", "bullet.png");

        scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;

        // Think if center is false,
        // then the physics body is always positioned from the top-left
        // so it's ok that bullet.png has height greater than 9px
        this.dynamicBody.setSize(9, 9, false);
    }

    fire(x: number, y: number) {
        this.dynamicBody.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(-CONSTANTS.bulletSpeed);
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        if (this.y <= -32) {
            this.kill();
        }
    }
}
