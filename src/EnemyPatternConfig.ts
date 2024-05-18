import { CONSTANTS } from "./CONSTANTS_FILE";
import { ReleaseEvent } from "./EnemyGroup";

const HOR_SPACING = 180;
const HOR_FONTSIZE = 80;

/*
Function that turns ReleaseEvents, each for a single word/phrase, into 
individual letter enemies.

DOES NOT WORK WITH STRINGS CONTAINING UNICODE SPECIAL CHARACTERS DUE TO WIDTH (xadvance)
TODO - if you want it to work, must dynamically get FONTWIDTH
*/
function generateLetterText(releaseEvents: Array<ReleaseEvent>): undefined | Array<ReleaseEvent> {
    const results = [];

    for (const releaseEvent of releaseEvents) {
        if (releaseEvent.textConfig === undefined) {
            console.error("generateLetterText running on event with undefined textConfig");
            return undefined;
        }
        if (releaseEvent.type !== "word") {
            console.log('Advise: run generateLetterText only on events with "word" type enemies.');
        }

        const FONTWIDTH = 29; // 29 is obtained from the 'xadvance' property in the bitmap xml file

        // 29 is for a 72 height font; must adjust width for variable fontsizes
        const sizeAdjustedWidth = FONTWIDTH * (releaseEvent.textConfig.fontSize / 72);
        const real_starting_x = releaseEvent.x - (sizeAdjustedWidth * releaseEvent.textConfig.text.length) / 2 + sizeAdjustedWidth / 2; // add sizeAdjustedWidth/2 because the x is relative to origin

        for (let i = 0; i < releaseEvent.textConfig.text.length; i++) {
            let newRelease: ReleaseEvent = {
                x: real_starting_x + i * sizeAdjustedWidth,
                y: releaseEvent.y,
                velocity: releaseEvent.velocity,
                time: releaseEvent.time,
                type: "letter",
                textConfig: { text: releaseEvent.textConfig.text[i], fontSize: releaseEvent.textConfig.fontSize },
            };
            results.push(newRelease);
        }
    }

    return results;
}

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
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "word", textConfig: { text: "ARE*YOU*READY?", fontSize: 80 } },
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: "word", textConfig: { text: "GET*SET", fontSize: 80 } },
        { x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: "word", textConfig: { text: "GO!", fontSize: 120 } },
    ]);
    for (const i of letters!) {
        config.push(i);
    }

    // diagonal ups
    const diag1 = ["✦", "✧"];
    const diag2 = ["$", "€"];
    const START_DIAG = 5040;
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 20; j++) {
            if (i % 2 === 0) {
                config.push({ x: 0 + j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START_DIAG + 1440 * i + 36 * j, type: "letter", textConfig: { text: diag1[j % 2], fontSize: 40 } });
            } else {
                config.push({ x: CONSTANTS.width - j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START_DIAG + 1440 * i + 36 * j, type: "letter", textConfig: { text: diag2[j % 2], fontSize: 70 } });
            }
        }
    }

    // coming from left
    const diag3 = ["Y", "U", "B"];
    const START_HOR1 = 7920;
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 3; j++) {
            if (i % 2 === 0) {
                config.push({ x: -50, y: 475, velocity: new Phaser.Math.Vector2(200, 0), time: START_HOR1 + 1440 * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag2[j % 2], fontSize: HOR_FONTSIZE } });
            } else {
                config.push({ x: -50, y: 525, velocity: new Phaser.Math.Vector2(200, 0), time: START_HOR1 + 1440 * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag3[j % 3], fontSize: HOR_FONTSIZE } });
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

    const START1 = 46080;
    const SPACE1 = 720;
    config.push({
        x: CONSTANTS.originX,
        y: -50,
        velocity: new Phaser.Math.Vector2(0, 350),
        time: START1,
        type: "boomerang",
        boomerangConfig: { stayTime: SPACE1, reverseTime: 7920 },
    });
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 20; j++) {
            if (j % 2 == 0) {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(100 - j * 10, 200),
                    time: START1 + SPACE1 + i * 720 + j * 76,
                    type: "circle",
                });
            } else {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(-100 + j * 10, 200),
                    time: START1 + SPACE1 + i * 720 + j * 76,
                    type: "circle",
                });
            }
        }
    }

    const START2 = 56368;
    config.push({
        x: CONSTANTS.originX,
        y: -50,
        velocity: new Phaser.Math.Vector2(0, 350),
        time: START2,
        type: "boomerang",
        boomerangConfig: { stayTime: SPACE1, reverseTime: 7920 },
    });
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 20; j++) {
            if (j % 2 == 0) {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(100 - j * 10, 200),
                    time: START2 + SPACE1 + i * 720 + j * 76,
                    type: "circle",
                });
            } else {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(-100 + j * 10, 200),
                    time: START2 + SPACE1 + i * 720 + j * 76,
                    type: "circle",
                });
            }
        }
    }

    const START3 = 63360;
    for (let i = 0; i < 10; i++) {
        config.push({ x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START3 + 90 * i, type: "wavy" });
    }

    const START4 = 64170;
    config.push({
        x: CONSTANTS.originX,
        y: -50,
        velocity: new Phaser.Math.Vector2(0, 350),
        time: START4,
        type: "boomerang",
        enemyConfig: {hp: 1},
        boomerangConfig: { stayTime: SPACE1, reverseTime: 7920, fireMissile: 10 },
    });
    /*
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            config.push({
                x: CONSTANTS.originX,
                y: -50,
                velocity: new Phaser.Math.Vector2(0, 350),
                time: START4 + 720 * i + 720 * j,
                type: "boomerang",
                hp: 1,
                boomerangConfig: { stayTime: SPACE1, reverseTime: 7920, fireMissile: 5 },
            });
        }
    }
    */

    return config;
}
