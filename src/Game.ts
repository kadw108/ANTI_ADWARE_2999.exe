import Player from "./Player";
import { EnemyI, EnemyGroup } from "./Enemy";
import { PlayerBullet, PlayerBulletGroup } from "./PlayerBullet";

import {CONSTANTS} from "./CONSTANTS_FILE";

export default class GameMain extends Phaser.Scene {
    // player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    player: Player;

    enemyGroup: EnemyGroup;
    playerBulletGroup: PlayerBulletGroup;

    rectangleLimit: [number, number, number, number];

    hpText: Phaser.GameObjects.Text;

    performanceScoreText: Phaser.GameObjects.Text;
    performanceDecreaseEvent: Phaser.Time.TimerEvent;
    performanceScore: number;

    gameOverGroup: Phaser.GameObjects.Group;

    constructor() {
        super("GameMain");

        // centerx, centery, width, height
        this.rectangleLimit = [CONSTANTS.originX, CONSTANTS.originY + 200, 200, 100];
    }

    preload() {
    }

    create(): void {
        this.player = new Player(this);

        // rectangle bounds player movement
        const rectangle = this.add.rectangle(...this.rectangleLimit);
        rectangle.isStroked = true;
        rectangle.strokeColor = 0xffffff;

        const boundsRect = new Phaser.Geom.Rectangle(...this.rectangleLimit);
        boundsRect.setPosition(this.rectangleLimit[0] - this.rectangleLimit[2] / 2, this.rectangleLimit[1] - this.rectangleLimit[3] / 2);
        this.player.dynamicBody.setBoundsRectangle(boundsRect);

        // groups
        this.enemyGroup = new EnemyGroup(this);
        this.playerBulletGroup = new PlayerBulletGroup(this);

        // collision
        // from https://github.com/phaserjs/examples/blob/master/public/src/physics/arcade/world%20bounds%20event%20custom.js
        this.physics.world.on("worldbounds", function (body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean, left: boolean, right: boolean) {
            // @ts-ignore
            if (body.onWorldBounds !== undefined) {
                // @ts-ignore
                body.gameObject.onWorldBounds(up, down, left, right);
            }
        });

        // @ts-ignore
        this.physics.add.overlap(this.player, this.enemyGroup, (player, enemy) => this.playerHitEnemy(player as Player, enemy as EnemyI));
        this.physics.add.overlap(this.playerBulletGroup, this.enemyGroup, (bullet, enemy) => {
            // @ts-ignore
            this.playerBulletHitEnemy(bullet as PlayerBullet, enemy as EnemyI);
        });

        this.hpText = this.add.text(10, 20, "", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff" });
        this.hpText.setOrigin(0, 0);
        this.hpText.setStroke("#203c5b", 6);
        this.hpText.setShadow(2, 2, "#66ccff", 4, true, false);
        this.hpText.text = "HP: " + this.player.currentHP + "/" + this.player.maxHP;

        this.performanceScore = 5000;
        this.performanceScoreText = this.add.text(CONSTANTS.width - 10, 20, "", { fontFamily: "DisplayFont", fontSize: 30, color: "#ffffff" });
        this.performanceScoreText.setOrigin(1, 0);
        this.performanceScoreText.setStroke("#203c5b", 6);
        this.performanceScoreText.setShadow(2, 2, "#66ccff", 4, true, false);
        this.updatePerformance();

        this.performanceDecreaseEvent = this.time.addEvent({ delay: 80, loop: true, callback: () => {
            this.performanceScore -= 1;
            this.updatePerformance();
        }});

        const gameOverRect = this.add.rectangle(CONSTANTS.originX, CONSTANTS.originY, CONSTANTS.width, CONSTANTS.height, 0x0000ff);
        gameOverRect.depth = 4;
        const gameOverText = this.add.text(CONSTANTS.originX, CONSTANTS.originY, "Game Over", {fontFamily: "DisplayFont", fontSize: 70, color: "#ffffff"});
        gameOverText.setOrigin(0.5, 0.5);
        gameOverText.depth = 5;
        const subtitle = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 60, "Click to Restart", {fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff"});
        subtitle.setOrigin(0.5, 0.5);
        this.gameOverGroup = this.add.group([gameOverRect, gameOverText, subtitle]);
        this.gameOverGroup.setVisible(false);

        const wearyWillow = this.sound.add('wearyWillow', { loop: true, delay: 10 });
        wearyWillow.play();

        this.start();
    }

    playerHitEnemy(player: Player, enemy: EnemyI) {
        if (enemy.active) {
            enemy.onHitPlayer(player);
        }
    }
    playerBulletHitEnemy(bullet: PlayerBullet, enemy: EnemyI) {
        if (bullet.active && enemy.active && enemy.canHit) {
            bullet.kill();
            enemy.hit();
        }
    }

    start(): void {
        this.player.start();
        this.enemyGroup.start();
    }

    updatePerformance(): void {
        this.performanceScoreText.text = "Employee Performance: "  + this.performanceScore;
    }

    update(): void {
        this.player.update();
       
        this.enemyGroup.updateAll();

        if (this.performanceScore <= 0) {
            this.gameOver();
        }
    }

    gameOver(): void {
        this.sound.stopAll();
        // this.sound.play("gameover");

        this.performanceDecreaseEvent.destroy();

        this.enemyGroup.stop();
        this.playerBulletGroup.stop();
        this.player.die();

        this.gameOverGroup.setVisible(true);

        this.input.once(
            "pointerdown",
            () => {
                this.scene.start("Menu");
            },
        );
    }
}
