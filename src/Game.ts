import Player from "./Player";
import { Enemy, EnemyGroup } from "./Enemy";
import { PlayerBullet, PlayerBulletGroup } from "./PlayerBullet";

export default class GameMain extends Phaser.Scene {
    // player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    player: Player;

    enemyGroup: EnemyGroup;
    playerBulletGroup: PlayerBulletGroup;

    rectangleLimit: [number, number, number, number];

    constructor() {
        super("GameMain");

        // centerx, centery, width, height
        this.rectangleLimit = [450, 500, 200, 100];
    }

    preload() {
        this.load.image("circle", "assets/circle.png");
        this.load.image("square", "assets/square.png");
        this.load.image("squareSmall", "assets/squareSmall.png");

        this.load.audio('popupBlocked', [ 'assets/popup_blocked.wav', 'assets/popup_blocked.mp3']);
    }

    create(): void {
        this.player = new Player(this);

        // rectangle bounds player movement
        const rectangle = this.add.rectangle(...this.rectangleLimit);
        rectangle.isStroked = true;
        rectangle.strokeColor = 0xffffff;

        const boundsRect = new Phaser.Geom.Rectangle(...this.rectangleLimit);
        boundsRect.setPosition(this.rectangleLimit[0] - this.rectangleLimit[2] / 2, this.rectangleLimit[1] - this.rectangleLimit[3] / 2);
        this.player.physicsBody.setBoundsRectangle(boundsRect);

        // groups
        this.enemyGroup = new EnemyGroup(this);
        this.playerBulletGroup = new PlayerBulletGroup(this);

        // collision
        // from https://github.com/phaserjs/examples/blob/master/public/src/physics/arcade/world%20bounds%20event%20custom.js
        this.physics.world.on("worldbounds", function (body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) {
            // @ts-ignore
            if (body.gameObject.onWorldBounds !== undefined) {
                // @ts-ignore
                body.gameObject.onWorldBounds(up, down, left, right);
            }
        });

        // this.physics.add.overlap(this.player, this.enemyGroup, (player, enemy) => this.playerHitEnemy(player, enemy));
        this.physics.add.overlap(
            this.playerBulletGroup,
            this.enemyGroup,
            (bullet, enemy) => {
                this.playerBulletHitEnemy(bullet as PlayerBullet, enemy as Enemy);
            }
        );

        this.input.once("pointerdown", () => {
            this.start();
        });
    }

    playerHitEnemy(player: Player, enemy: Enemy) {}
    playerBulletHitEnemy(bullet: PlayerBullet, enemy: Enemy) {
        if (bullet.active && enemy.active) {
            bullet.kill();
            enemy.hit();
        }
    }

    start(): void {
        this.player.start();
        this.enemyGroup.start();
    }

    update(): void {
        this.player.update();
    }
}
