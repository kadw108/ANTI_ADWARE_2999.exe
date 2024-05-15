import GameMain from "./Game";

export default class Player extends Phaser.Physics.Arcade.Sprite
{
    scene: GameMain;

    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    spacebar: Phaser.Input.Keyboard.Key;
    physicsBody: Phaser.Physics.Arcade.Body;

    canShoot: boolean;

    constructor (scene: GameMain)
    {
        super(scene, 450, 550, "circle");
        this.scale = 0.4;

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.physicsBody = this.body as Phaser.Physics.Arcade.Body;
        this.setCollideWorldBounds(true, 0, 0);
        this.setImmovable(true);

        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.spacebar = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.canShoot = true;

        /*
        this.isAlive = true;
        this.isThrowing = false;

        this.sound = scene.sound;
        this.currentTrack = track;

        this.spacebar = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.up = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        this.play('idle');
        */
    }

    start ()
    {
        this.canShoot = true;
        /*
        this.isAlive = true;
        this.isThrowing = false;

        this.currentTrack = this.scene.tracks[0];
        this.y = this.currentTrack.y;
    
        this.on('animationcomplete-throwStart', this.releaseSnowball, this);
        this.on('animationcomplete-throwEnd', this.throwComplete, this);

        this.play('idle', true);
        */
    }

    moveHorizontal() {
        if (this.cursors.left.isDown) {
            this.physicsBody!.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.physicsBody!.setVelocityX(160);
        } else {
            this.physicsBody!.setVelocityX(0);
        }
    }

    moveVertical() {
        if (this.cursors.up.isDown) {
            this.physicsBody!.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.physicsBody.setVelocityY(160);
        } else {
            this.physicsBody.setVelocityY(0);
        }
    }

    fire() {
        // if (this.cursors.space.isDown && this.canShoot) {
         if (this.cursors.space.isDown && this.canShoot) {
            this.canShoot = false;

            this.scene.playerBulletGroup.fireBullet(this.x, this.y);

            this.scene.time.delayedCall(300, () => {
                this.canShoot = true;
              });
        }
    }

    update() {
        this.moveHorizontal();
        this.moveVertical();
        this.fire();
    }

}
