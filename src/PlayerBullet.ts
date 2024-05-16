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
    constructor (scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, 'circle');
        this.scale = 0.1;
        scene.physics.add.existing(this);
    }

    fire (x: number, y: number)
    {
        this.body!.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(-200);
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