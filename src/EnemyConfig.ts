import { CONSTANTS } from "./CONSTANTS_FILE";
import { generateLetterText, ReleaseEvent } from "./EnemyGroup";

const HOR_SPACING = 180;
const HOR_FONTSIZE = 80;

export function generateConfig(): Array<ReleaseEvent> {
    let config: Array<ReleaseEvent> = [];

    /*
    config = [
        { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "0" },
        { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 2000, type: "0" },
        { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: "0" },
        { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: "0" },
    ];
    */

    const letters = generateLetterText([
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "word", textConfig: { text: "ARE*YOU*READY?", fontSize: 72 } },
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: "word", textConfig: { text: "GET*SET", fontSize: 72 } },
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: "word", textConfig: { text: "GO!", fontSize: 72 } },
    ]);
    for (const i of letters!) {
        config.push(i);
    }

    // diagonal ups
    const diag1 = ["✦", "✧"];
    const diag2 = ["$", "€"];
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 20; j++) {
            if (i % 2 === 0) {
                config.push({ x: 0 + j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 5000 + 1440 * i + 26 * j, type: "letter", textConfig: { text: diag1[j % 2], fontSize: 35 } });
            } else {
                config.push({ x: CONSTANTS.width - j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 5000 + 1440 * i + 26 * j, type: "letter", textConfig: { text: diag2[j % 2], fontSize: 60 } });
            }
        }
    }

    // coming from left
    const diag3 = ["Y", "U", "B"];
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 3; j++) {
            if (i % 2 === 0) {
                config.push({ x: -50, y: 475, velocity: new Phaser.Math.Vector2(200, 0), time: 7880 + 1440 * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag2[j % 2], fontSize: HOR_FONTSIZE } });
            } else {
                config.push({ x: -50, y: 525, velocity: new Phaser.Math.Vector2(200, 0), time: 7880 + 1440 * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag3[j % 3], fontSize: HOR_FONTSIZE } });
            }
        }
    }

    for (let i = 0; i < 28; i++) {
        config.push({ x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 23720 + 720 * i, type: "wavy" });
    }

    // coming from right
    const diag4 = ["B", "U", "Y"];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            if (i % 2 === 0) {
                config.push({ x: CONSTANTS.width + 50, y: 475, velocity: new Phaser.Math.Vector2(-200, 0), time: 35960 + 1440 * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag2[j % 2], fontSize: HOR_FONTSIZE } });
            } else {
                config.push({ x: CONSTANTS.width + 50, y: 525, velocity: new Phaser.Math.Vector2(-200, 0), time: 35960 + 1440 * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag4[j % 3], fontSize: HOR_FONTSIZE } });
            }
        }
    }

    const START1 = 44440;
    // const SPACE1 = 2760;
    const SPACE1 = 1000;
    config.push({
        x: CONSTANTS.originX,
        y: -50,
        velocity: new Phaser.Math.Vector2(0, 200),
        time: START1,
        type: "boomerang",
        boomerangConfig: { stayTime: 1000, reverseTime: 9000 },
    });
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 20; j++) {
            if (j % 2 == 0) {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(100 - j * 10, 200),
                    time: START1 + SPACE1 + i * 720 + j * 72,
                    type: "circle",
                });
            } else {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(-100 + j * 10, 200),
                    time: START1 + SPACE1 + i * 720 + j * 72,
                    type: "circle",
                });
            }
        }
    }

    const START2 = 53608;
    config.push({
        x: CONSTANTS.originX,
        y: -50,
        velocity: new Phaser.Math.Vector2(0, 200),
        time: START2,
        type: "boomerang",
        boomerangConfig: { stayTime: 1000, reverseTime: 9000 },
    });
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 20; j++) {
            if (j % 2 == 0) {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(100 - j * 10, 200),
                    time: START2 + SPACE1 + 2760 + i * 720 + j * 72,
                    type: "circle",
                });
            } else {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(-100 + j * 10, 200),
                    time: START2 + SPACE1 + 2760 + i * 720 + j * 72,
                    type: "circle",
                });
            }
        }
    }

    return config;
}
