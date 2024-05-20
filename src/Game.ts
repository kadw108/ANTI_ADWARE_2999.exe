import Player from "./Player";
import { EnemyAbstract } from "./Enemy";
import { EnemyGroupManager } from "./EnemyGroup";
import { PlayerBullet, PlayerBulletGroup } from "./PlayerBullet";

import { CONSTANTS } from "./CONSTANTS_FILE";

export default class GameMain extends Phaser.Scene {
    // player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    player: Player;

    enemyGroupManager: EnemyGroupManager;
    playerBulletGroup: PlayerBulletGroup;

    rectangleLimit: [number, number, number, number];

    performanceScoreText: Phaser.GameObjects.Text;
    performanceScore: number;
    performanceScoreChangeText: Phaser.GameObjects.Text;
    performanceScoreChangeNumber: number; // change queue, like an enemy's hitNum

    gameOverGroup: Phaser.GameObjects.Group;

    wearyWillow: Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;

    constructor() {
        super("GameMain");

        // centerx, centery, width, height
        this.rectangleLimit = [CONSTANTS.originX, CONSTANTS.originY + 200, 200, 100];
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
        this.enemyGroupManager = new EnemyGroupManager(this);
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
        this.physics.add.overlap(this.player, this.enemyGroupManager, (player, enemy) => this.playerHitEnemy(player as Player, enemy as EnemyAbstract));
        this.physics.add.overlap(this.playerBulletGroup, this.enemyGroupManager, (bullet, enemy) => {
            // @ts-ignore
            this.playerBulletHitEnemy(bullet as PlayerBullet, enemy as EnemyAbstract);
        });

        this.createText();

        this.wearyWillow = this.sound.add("wearyWillow", { loop: false, delay: 10 });
        // this.sound.pauseOnBlur = false;

        /*
        var postFxPlugin = this.plugins.get('rexfisheyepipelineplugin');
        var postFxPipeline = (postFxPlugin as Phaser.Plugins.BasePlugin).add(this.cameras.main, {
            radius: 300,
            mode:'asin'
        });
        let cam = this.cameras.main;
        cam.setPostPipeline(FishEyePostFx);
        */

        this.start();
    }

    createText() {
        this.performanceScore = 0;
        this.performanceScoreText = this.add.text(CONSTANTS.width - 10, 20, "", CONSTANTS.textConfig);
        this.performanceScoreText.setOrigin(1, 0);
        this.performanceScoreText.depth = 3;
        this.updatePerformance();

        this.performanceScoreChangeText = this.add.text(CONSTANTS.width - 10, 65, "", { fontFamily: "DisplayFont", fontSize: 30, color: "#ffffff", backgroundColor: "#00000044", shadow: { offsetX: 1, offsetY: 1, color: "#66ccff", blur: 4, stroke: true, fill: false } });
        this.performanceScoreChangeText.setOrigin(1, 0);
        this.performanceScoreChangeText.depth = 3;
        this.performanceScoreChangeNumber = 0;

        const gameOverRect = this.add.rectangle(CONSTANTS.originX, CONSTANTS.originY, CONSTANTS.width, CONSTANTS.height, 0x0000ff);
        gameOverRect.depth = 4;
        const gameOverText = this.add.text(CONSTANTS.originX, CONSTANTS.originY, "Game Over", { fontFamily: "DisplayFont", fontSize: 70, color: "#ffffff" });
        gameOverText.setOrigin(0.5, 0.5);
        gameOverText.depth = 5;
        const subtitle = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 60, "Click to Restart", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff" });
        subtitle.setOrigin(0.5, 0.5);
        this.gameOverGroup = this.add.group([gameOverRect, gameOverText, subtitle]);
        this.gameOverGroup.setVisible(false);
    }

    playerHitEnemy(player: Player, enemy: EnemyAbstract) {
        if (enemy.active) {
            enemy.onHitPlayer(player);
        }
    }
    playerBulletHitEnemy(bullet: PlayerBullet, enemy: EnemyAbstract) {
        if (bullet.active && enemy.active && enemy.canHit) {
            bullet.kill();
            enemy.hit();
            this.changePerformanceEvent("Hit Enemy", CONSTANTS.playerHitEnemyPointGain);
        }
    }

    start(): void {
        this.wearyWillow.play();
        this.time.addEvent({
            delay: 195000,
            callback: () => {
                // this.data.set('performanceScore', this.performanceScore);
                // this.scene.start("EndScreen", {finalScore: this.performanceScore});

                // from https://phaser.discourse.group/t/global-plugin-with-its-own-data-manager-and-event-emitter/6453
                // this.game.registry.set('performanceScore', this.performanceScore);

                // @ts-ignore
                /// this.plugins.get("PassData").performanceScore = this.performanceScore;

                window.idolPerformanceScore = this.performanceScore;

                this.endAll();
                this.scene.start("EndScreen");
            },
        });

        this.player.start();
        this.enemyGroupManager.start();
    }

    updatePerformance(): void {
        this.performanceScoreText.text = "Performance: " + this.performanceScore;
    }

    changePerformanceEvent(text: string, pointChange: number): void {
        let changeModifier: string = "";
        if (pointChange > 0) {
            changeModifier = "+";
            this.performanceScoreChangeText.setColor("#22ff22");
        } else if (pointChange < 0) {
            this.performanceScoreChangeText.setColor("#ff2222");
        }

        const newText = text.toUpperCase() + ": " + changeModifier + pointChange;
        if (this.performanceScoreChangeText.text !== newText) {
            this.performanceScoreChangeText.text = newText;
        }
        this.performanceScore += pointChange;
        this.updatePerformance();
        this.performanceScoreChangeNumber++;

        this.time.delayedCall(1000, () => {
            this.performanceScoreChangeNumber--;
            if (this.performanceScoreChangeNumber === 0) {
                this.performanceScoreChangeText.text = "";

                // this.performanceScoreChangeText.setColor("#ffffff");
                // not using since every event should be a positive or negative one
            }
        });
    }

    update(): void {
        this.player.update();
        this.enemyGroupManager.updateAll();
    }

    endAll(): void {
        this.sound.stopAll();
        this.enemyGroupManager.stop();
        this.playerBulletGroup.stop();
        this.player.die();
    }

    gameOver(): void {
        this.endAll();

        // this.sound.play("gameover");
        this.gameOverGroup.setVisible(true);
        this.input.once("pointerdown", () => {
            this.scene.start("Menu");
        });
    }
}
