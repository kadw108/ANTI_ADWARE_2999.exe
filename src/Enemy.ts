import GameMain from "./Game";

type ReleaseEvent = {
    x: number;
    y: number;
    velocity: Phaser.Math.Vector2;
    time: number;
    type: number;
};

type EnemyType = {
    width: number;
    height: number;
    hp: number;
};

export class EnemyGroup extends Phaser.Physics.Arcade.Group {
    config: Array<ReleaseEvent>;
    typeList: Array<EnemyType>;

    constructor(scene: GameMain) {
        super(scene.physics.world, scene);

        this.config = [
            { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: 0 },
            { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 2000, type: 0 },
            { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: 0 },
            { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: 0 },
        ];
        this.typeList = [{ width: 200, height: 75, hp: 2 }];
    }

    start() {
        for (const releaseEvent of this.config) {
            this.scene.time.addEvent({
                delay: releaseEvent.time,
                callback: () => {
                    this.release(releaseEvent.x, releaseEvent.y, releaseEvent.velocity, this.typeList[releaseEvent.type]);
                },
            });
        }
    }

    release(x: number, y: number, velocity: Phaser.Math.Vector2, enemyType: EnemyType) {
        let newEnemy: Enemy;
        this.getChildren().forEach((child) => {
            if (!child.active && (child as Enemy).enemyType === enemyType) {
                //  We found a dead matching germ, so resurrect it
                newEnemy = child as Enemy;
            }
        });

        // @ts-ignore
        if (newEnemy === undefined) {
            newEnemy = new Enemy(this.scene as GameMain, enemyType);
            this.add(newEnemy, true);
        }
        newEnemy.start(x, y, velocity);
    }

    stop() {
        // this.timedEvent.remove();

        this.getChildren().forEach((child) => {
            (child as Enemy).kill();
        });
    }
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    scene: GameMain;

    dynamicBody: Phaser.Physics.Arcade.Body;
    onWorldBounds: Function;

    currentHp: number;
    enemyType: EnemyType;

    hitNum: number;

    constructor(scene: GameMain, type: EnemyType) {
        super(scene, 0, 0, "squareSmall");
        this.scene = scene;

        this.scaleX = type.width;
        this.scaleY = type.height;
        this.currentHp = type.hp;
        this.enemyType = type;

        scene.physics.add.existing(this);
        this.dynamicBody = this.body as Phaser.Physics.Arcade.Body;

        this.setCollideWorldBounds(true);
        this.dynamicBody.onWorldBounds = true;
        this.onWorldBounds = function (up: boolean, down: boolean, left: boolean, right: boolean) {
            if (up === false) {
                this.kill(); // they spawn from up so don't kill there
            }
        };

        scene.add.existing(this);

        this.hitNum = 0;
    }

    start(x: number, y: number, velocity: Phaser.Math.Vector2) {
        this.dynamicBody.reset(x, y);
        this.dynamicBody.setVelocity(velocity.x, velocity.y);

        this.setActive(true);
        this.setVisible(true);
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
    }

    hit() {
        this.scene.sound.play("popupBlocked");
        this.currentHp -= 1;

        this.setTintFill(0xff0000);
        this.hitNum++;
        this.scene.time.delayedCall(300, () => {
            this.hitNum--;
            if (this.hitNum === 0) 
            {
                this.clearTint();
            }
        });

        if (this.currentHp <= 0) {
            this.kill();
        }
    }
}
