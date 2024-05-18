import { CONSTANTS } from "./CONSTANTS_FILE";

export class PlayerBulletGroup extends Phaser.Physics.Arcade.Group
{
    constructor (scene: Phaser.Scene)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 30,
            key: 'bullet',
            active: false,
            visible: false,
            classType: PlayerBullet
        });
    }

    fireBullet (x: number, y: number)
    {
        let bullet = this.getFirstDead(false);

        if (bullet)
        {
            bullet.fire(x, y);
            this.scene.sound.play("sfxFire");
        }
    }

    stop() {
        // this.timedEvent.remove();

        this.getChildren().forEach((child) => {
            (child as PlayerBullet).kill();
        });
    }
}

export class PlayerBullet extends Phaser.Physics.Arcade.Sprite
{
    dynamicBody: Phaser.Physics.Arcade.Body;

    constructor (scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, 'circle');
        this.scale = 0.2;

        scene.physics.add.existing(this);
        // @ts-ignore
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;
    }

    fire (x: number, y: number)
    {
        this.dynamicBody.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(-CONSTANTS.bulletSpeed);
    }

    kill ()
    {
        this.setActive(false);
        this.setVisible(false);
    }

    preUpdate (time: number, delta: number)
    {
        super.preUpdate(time, delta);

        if (this.y <= -32)
        {
            this.kill();
        }
    }
}