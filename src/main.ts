import 'phaser';
 
class GameMain extends Phaser.Scene {

    // player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    player: Phaser.GameObjects.Ellipse;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    rectangleLimit: [number, number, number, number];

    constructor() {
        super("PlayGame");

        // centerx, centery, width, height
        this.rectangleLimit = [450, 500, 400, 200];
    }

    preload(): void {
        this.load.image('logo', 'assets/phaser3-logo.png');    
    }
    create(): void {
        this.cursors = this.input.keyboard!.createCursorKeys();

        /*
        const graphics = new Phaser.GameObjects.Graphics(this);
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(400, 300, 9);
        graphics.generateTexture("circle1");
        */

        // funct
        const rectangle = this.add.rectangle(...this.rectangleLimit);
        rectangle.isStroked = true;
        rectangle.strokeColor = 0xffffff;

        this.player = this.add.ellipse(450, 550, 18, 18, 0xffffff);
        this.physics.add.existing(this.player);
        // this.player.body.setImmovable();
    }

    update(): void {
        if (this.cursors.left.isDown && this.player.x > this.rectangleLimit[0] - this.rectangleLimit[2]/2) {
            (this.player.body as Phaser.Physics.Arcade.Body)!.setVelocityX(-160);
        } else if (this.cursors.right.isDown && this.player.x < this.rectangleLimit[0] + this.rectangleLimit[2]/2) {
            (this.player.body as Phaser.Physics.Arcade.Body)!.setVelocityX(160);
        } else {
            (this.player.body as Phaser.Physics.Arcade.Body)!.setVelocityX(0);
        }
        if (this.cursors.up.isDown && this.player.y > this.rectangleLimit[1] - this.rectangleLimit[3]/2) {
            (this.player.body as Phaser.Physics.Arcade.Body)!.setVelocityY(-160);
        } else if (this.cursors.down.isDown && this.player.y < this.rectangleLimit[1] + this.rectangleLimit[3]/2) {
            (this.player.body as Phaser.Physics.Arcade.Body)!.setVelocityY(160);
        } else {
            (this.player.body as Phaser.Physics.Arcade.Body)!.setVelocityY(0);
        }
    }
}
 
let configObject: Phaser.Types.Core.GameConfig = {
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'thegame',
        width: 900,
        height: 700
    },
    scene: GameMain,
    physics: {
        default: "arcade"
    }
};
 
new Phaser.Game(configObject);