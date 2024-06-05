const WIDTH = 700;
const HEIGHT = 600;

type constants = {
    width: number;
    height: number;
    originX: number;
    originY: number;

    enemySpeed: number;
    bulletSpeed: number;

    playerHitPointLoss: number;
    playerFirePointLoss: number;
    playerHitEnemyPointGain: number;

    playerShootCooldown: number;
    playerHitCooldown: number;
    playerSpeed: number;
    maxHP: number;

    textConfig: Phaser.Types.GameObjects.Text.TextStyle;
};

export const CONSTANTS: constants = {
    width: WIDTH,
    height: HEIGHT,
    originX: WIDTH / 2,
    originY: HEIGHT / 2,

    enemySpeed: 200,
    bulletSpeed: 250,

    playerHitPointLoss: -1,
    playerFirePointLoss: -1,
    playerHitEnemyPointGain: 3,

    playerShootCooldown: 425,
    playerHitCooldown: 800,
    playerSpeed: 145,
    maxHP: 9999,

    textConfig: { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff", backgroundColor: "#00000044", stroke: "#203c5b", strokeThickness: 6, shadow: { offsetX: 2, offsetY: 2, color: "#66ccff", blur: 4, stroke: true, fill: false } },
};
