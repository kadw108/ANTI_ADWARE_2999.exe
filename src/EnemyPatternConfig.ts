import { CONSTANTS } from "./CONSTANTS_FILE";
import { ReleaseEvent } from "./EnemyGroup";

const HOR_SPACING = 180;
const HOR_FONTSIZE = 80;

const BEAT = 324; // 185 bpm -> 60000/185 = 324
const HALF_MEASURE = BEAT * 2;
const MEASURE = BEAT * 4; // common time = 4/4

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

function generateDisco(startTime: number, stayTime: number): Array<ReleaseEvent> {
    const config = [];
    config.push({
        x: CONSTANTS.originX,
        y: -50,
        velocity: new Phaser.Math.Vector2(0, 350),
        time: startTime,
        type: "boomerang",
        boomerangConfig: { stayTime: stayTime, reverseTime: HALF_MEASURE * 15 },
    });
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
            if (j % 2 == 0) {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(100 - j * 10, 200),
                    time: startTime + stayTime + i * HALF_MEASURE + j * 76,
                    type: "circle",
                });
            } else {
                config.push({
                    x: CONSTANTS.originX,
                    y: 200,
                    velocity: new Phaser.Math.Vector2(-100 + j * 10, 200),
                    time: startTime + stayTime + i * HALF_MEASURE + j * 76,
                    type: "circle",
                });
            }
        }
    }
    return config;
}

function generateLines(startTime: number, timeBetween: number, numLines: number, lineType: string, fromDirection: "up" | "left" | "right"): Array<ReleaseEvent> {
    const config = [];

    for (let i = 0; i < numLines; i++) {
        switch (fromDirection) {
            case "up":
                config.push({ x: CONSTANTS.originX, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: startTime + timeBetween * i, type: lineType });
                break;
            case "left":
                config.push({ x: -50, y: CONSTANTS.originY, velocity: new Phaser.Math.Vector2(200, 0), time: startTime + timeBetween * i, type: lineType, enemyConfig: { counterClockwise: 1 } });
                break;
            case "right":
                config.push({ x: CONSTANTS.width + 50, y: CONSTANTS.originY, velocity: new Phaser.Math.Vector2(-200, 0), time: startTime + timeBetween * i, type: lineType, enemyConfig: { counterClockwise: 1 } });
                break;
            default:
                console.error("generateLines has invalid fromDirection value", fromDirection);
                return [];
        }
    }

    return config;
}
export function generateConfig(): Array<ReleaseEvent> {
    let config: Array<ReleaseEvent> = [];

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
    const START0 = 5403; // hardcoded in, based on when the rhythm starts in cropped song
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 20; j++) {
            if (i % 2 === 0) {
                config.push({ x: 0 + j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START0 + MEASURE * i + 46 * j, type: "letter", textConfig: { text: diag1[j % 2], fontSize: 40 } });
            } else {
                config.push({ x: CONSTANTS.width - j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START0 + MEASURE * i + 46 * j, type: "letter", textConfig: { text: diag2[j % 2], fontSize: 70 } });
            }
        }
    }

    // coming from left
    const diag3 = ["Y", "U", "B"];
    const START_HOR1 = START0 + MEASURE * 8;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 3; j++) {
            if (i % 2 === 0) {
                config.push({ x: -50, y: 475, velocity: new Phaser.Math.Vector2(200, 0), time: START_HOR1 + MEASURE * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag2[j % 2], fontSize: HOR_FONTSIZE } });
            } else {
                config.push({ x: -50, y: 525, velocity: new Phaser.Math.Vector2(200, 0), time: START_HOR1 + MEASURE * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag3[j % 3], fontSize: HOR_FONTSIZE } });
            }
        }
    }

    const START_LINES1 = START0 + MEASURE * 16;
    for (const event of generateLines(START_LINES1, HALF_MEASURE, 26, "wavy", "up")) {
        config.push(event);
    }

    // coming from right
    const diag4 = ["B", "U", "Y"];
    const START_HOR2 = START0 + BEAT * 81;
    for (let i = 3; i < 10; i++) {
        for (let j = 0; j < 3; j++) {
            if (i % 2 !== 0) {
                config.push({ x: CONSTANTS.width + 50, y: 475, velocity: new Phaser.Math.Vector2(-200, 0), time: START_HOR2 + MEASURE * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag2[j % 2], fontSize: HOR_FONTSIZE } });
            } else {
                config.push({ x: CONSTANTS.width + 50, y: 525, velocity: new Phaser.Math.Vector2(-200, 0), time: START_HOR2 + MEASURE * i + HOR_SPACING * j, type: "letter", textConfig: { text: diag4[j % 3], fontSize: HOR_FONTSIZE } });
            }
        }
    }

    const START1 = START0 + BEAT * 126;
    const START2 = START1 + BEAT * 32;
    const SPACE1 = HALF_MEASURE;
    for (const event of generateDisco(START1, SPACE1)) {
        config.push(event);
    }
    for (const event of generateDisco(START2, SPACE1)) {
        config.push(event);
    }

    const START3 = START0 + MEASURE * 45;
    for (const event of generateLines(START3, 180, 5, "wavy", "up")) {
        config.push(event);
    }

    // boomerang introduction
    const START4 = START0 + BEAT * 186;
    const SPACE2 = MEASURE * 2;
    for (let i = 0; i < 2; i++) {
        config.push({
            x: CONSTANTS.originX + 60,
            y: -50,
            velocity: new Phaser.Math.Vector2(0, 200),
            time: START4 + i * MEASURE,
            type: "boomerang",
            enemyConfig: { height: 35, width: 35, hp: 1 },
            boomerangConfig: { stayTime: SPACE2, reverseTime: HALF_MEASURE, missileCount: 3 },
        });
        config.push({
            x: CONSTANTS.originX - 60,
            y: -50,
            velocity: new Phaser.Math.Vector2(0, 200),
            time: START4 + i * MEASURE,
            type: "boomerang",
            enemyConfig: { height: 35, width: 35, hp: 1 },
            boomerangConfig: { stayTime: SPACE2, reverseTime: HALF_MEASURE, missileCount: 3 },
        });
    }

    // firing boomerangs as horizontal line
    const START5 = START0 + BEAT * 194;
    const X_RANGE = 200;
    const NUM_PER_WAVE = 4;
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < NUM_PER_WAVE; j++) {
            config.push({
                x: CONSTANTS.originX - X_RANGE / 2 + j * (X_RANGE / NUM_PER_WAVE) + X_RANGE / NUM_PER_WAVE / 2,
                y: -50,
                velocity: new Phaser.Math.Vector2(0, 200),
                time: START5 + i * MEASURE,
                type: "boomerang",
                enemyConfig: { height: 35, width: 35, hp: 1 },
                boomerangConfig: { stayTime: SPACE2, reverseTime: HALF_MEASURE, missileCount: 3 },
            });
        }
    }

    // firing boomerangs in box shape
    const START6 = START5 + BEAT * 22;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let x_position;
            if (j < 2) {
                x_position = CONSTANTS.originX - X_RANGE / 2;
            } else {
                x_position = CONSTANTS.originX + X_RANGE / 2;
            }

            config.push({
                x: x_position,
                y: -50,
                velocity: new Phaser.Math.Vector2(0, 200),
                time: START6 + i * MEASURE + 200 * (j % 2),
                type: "boomerang",
                enemyConfig: { height: 35, width: 35, hp: 1 },
                boomerangConfig: { stayTime: BEAT * 7 + 200 * (2 - (j % 2)), reverseTime: HALF_MEASURE, missileCount: 3 },
            });
        }
    }

    // homing missiles during diagonal section
    const START7 = START0 + BEAT * 256;
    const X_RANGE2 = 200;
    const NUM_PER_WAVE2 = 6;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < NUM_PER_WAVE2; j++) {
            config.push({
                x: CONSTANTS.originX - X_RANGE2 / 2 + j * (X_RANGE2 / NUM_PER_WAVE2) + X_RANGE2 / NUM_PER_WAVE2 / 2,
                y: -50,
                velocity: new Phaser.Math.Vector2(0, 200),
                time: START7 + i * MEASURE,
                type: "boomerang",
                enemyConfig: { height: 35, width: 35, hp: 1 },
                boomerangConfig: { stayTime: HALF_MEASURE, reverseTime: HALF_MEASURE + j * 30, missileCount: 4 },
            });
        }
    }

    // diagonal circles (small; weave between)
    for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 24; j++) {
            if (i % 2 === 0) {
                config.push({
                    x: 0 + j * 33,
                    y: -50,
                    velocity: new Phaser.Math.Vector2(0, 200),
                    time: START7 + HALF_MEASURE * i + 35 * j,
                    type: "circle",
                });
            } else {
                config.push({
                    x: CONSTANTS.width - j * 33,
                    y: -50,
                    velocity: new Phaser.Math.Vector2(0, 200),
                    time: START7 + HALF_MEASURE * i + 35 * j,
                    type: "circle",
                });
            }
        }
    }

    const START8 = START0 + 288 * BEAT;
    for (const event of generateLines(START8, MEASURE * 2, 5, "blocky", "left")) {
        config.push(event);
    }

    const START9 = START0 + 317 * BEAT;
    for (const event of generateLines(START9, HALF_MEASURE, 24, "wavy", "up")) {
        config.push(event);
    }

    const START10 = START0 + 334 * BEAT;
    for (const event of generateDisco(START10, SPACE1)) {
        config.push(event);
    }

    const START11 = START0 + 378 * BEAT;
    // horizontal 'walls'
    const diag5 = ["$", "¥"];
    let skipWhichJ = 0;
    for (let i = 0; i < 31; i++) {
        for (let j = 0; j < 20; j++) {
            if (i % 2 !== 0) {
                // create moving gap every other line to direct player
                if (j < skipWhichJ + 7 || j > skipWhichJ + 7) {
                    config.push({ x: 0 + j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START11 + HALF_MEASURE * i - 50, type: "letter", textConfig: { text: diag5[j % 2], fontSize: 70 } });

                    // triple to stop player from shooting through
                    config.push({ x: 0 + j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START11 + HALF_MEASURE * i, type: "letter", textConfig: { text: diag5[j % 2], fontSize: 70 } });

                    config.push({ x: 0 + j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START11 + HALF_MEASURE * i + 50, type: "letter", textConfig: { text: diag5[j % 2], fontSize: 70 } });
                }
            } else {
                config.push({ x: 0 + j * 36, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: START11 + HALF_MEASURE * i, type: "letter", textConfig: { text: diag5[j % 2], fontSize: 60 } });
            }
        }

        // create gap that goes back and forth
        // skipWhichJ has values 0 1 2 3 4 5 6 5 4 3 2 1... repeating
        if (i % 2 !== 0) {
            skipWhichJ = ((i / 2) >> 0) % 10;
            if (skipWhichJ > 5) {
                skipWhichJ = 10 - skipWhichJ;
            }
        }
    }

    const START12 = START11 + MEASURE * 2;
    for (const event of generateLines(START12, MEASURE * 2, 6, "blocky", "left")) {
        config.push(event);
    }

    const START13 = START0 + 439 * BEAT;
    for (const event of generateLines(START13, 180, 5, "wavy", "up")) {
        config.push(event);
    }

    const START14 = START0 + 463 * BEAT;
    // blocks of letters - keep this one
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 12; j++) {
            if (i % 2 === 0) {
                config.push({
                    x: CONSTANTS.originX - 95 + (j % 4) * 30,
                    y: -50,
                    velocity: new Phaser.Math.Vector2(0, 200),
                    time: START14 + HALF_MEASURE * i + ((j / 4) >> 0) * 260, // >> 0 for integer division
                    type: "letter",
                    textConfig: { text: diag5[j % 2], fontSize: 58 },
                });
            } else {
                config.push({
                    x: CONSTANTS.originX + 30 + (j % 4) * 30,
                    y: -50,
                    velocity: new Phaser.Math.Vector2(0, 200),
                    time: START14 + HALF_MEASURE * i + ((j / 4) >> 0) * 260,
                    type: "letter",
                    textConfig: { text: diag5[j % 2], fontSize: 58 },
                });
            }
        }
    }

    // horizontal walls, moving slightly
    const START14b = START0 + 491 * BEAT;
    const diag6 = ["♡", "✪"];
    const MAX_X = 30;
    for (let i = 0; i < 11; i++) {
        // generates pattern 0 1 2 3 4 3 2 1... repeating
        let direction = i % 8;
        if (direction > 4) {
            direction = 8 - direction;
        }

        for (let j = 0; j < 30; j++) {
            config.push({ x: -190 + j * 36, y: -50, velocity: new Phaser.Math.Vector2(-MAX_X + (direction * MAX_X) / 2, 200), time: START14b + HALF_MEASURE * i, type: "letter", enemyConfig: { skipCollision: [true, false, true, true] }, textConfig: { text: diag6[j % diag6.length], fontSize: 40 } });
        }
    }

    // boomerang to screen bottom (use)
    const START15 = START0 + 520 * BEAT;
    const X_RANGE3 = 200;
    const NUM_PER_WAVE3 = 4;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < NUM_PER_WAVE3; j++) {
            if (i >= 2 || j % 2 === 0) {
                // start with only 2 the first few waves to ease player into it
                config.push({
                    x: CONSTANTS.originX - X_RANGE3 / 2 + j * (X_RANGE3 / NUM_PER_WAVE3) + X_RANGE3 / NUM_PER_WAVE3 / 2,
                    y: -50,
                    velocity: new Phaser.Math.Vector2(0, 225),
                    time: START15 + i * (HALF_MEASURE * 3),
                    type: "boomerang",
                    enemyConfig: { height: 35, width: 35, hp: 1 },
                    boomerangConfig: { stayTime: HALF_MEASURE * 4, reverseTime: HALF_MEASURE + j * 33, missileCount: 2 },
                });
            }
        }
    }

    return config;
}

/* --- TEMPORARY AND ABANDONED PATTERNS --- */

/*
    config = [
        { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 1000, type: "0" },
        { x: 400, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 2000, type: "0" },
        { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 3000, type: "0" },
        { x: 500, y: -50, velocity: new Phaser.Math.Vector2(0, 200), time: 4000, type: "0" },
    ];
*/

/*
const START7b = START7 + 360 * 20;
for (let i = 0; i < 20; i++) {
    if (i % 2 === 0) {
        config.push({
            x: CONSTANTS.originX - 200,
            y: -100,
            velocity: new Phaser.Math.Vector2(0, 200),
            time: START7b + 1440 * i,
            type: "bigBlock",
        });
    }
    else {
        config.push({
            x: CONSTANTS.originX + 200,
            y: -100,
            velocity: new Phaser.Math.Vector2(0, 200),
            time: START7b + 1440 * i,
            type: "bigBlock",
        });
    }
}
*/

/*
    // diagonal ups intertwined - unused version
    for (let i = 0; i < 40; i += 2) {
        for (let j = 0; j < 20; j += 2) {
            if (j % 4 === 0) {
                config.push({
                    x: 0 + j * 35,
                    y: -50,
                    velocity: new Phaser.Math.Vector2(0, 200),
                    time: START7 + 360 * i + 36 * j,
                    type: "letter",
                    textConfig: { text: diag3[j % 2], fontSize: 40 },
                });
            } else {
                config.push({
                    x: CONSTANTS.width - j * 35,
                    y: -50,
                    velocity: new Phaser.Math.Vector2(0, 200),
                    time: START7 + 360 * i + 36 * j,
                    type: "letter",
                    textConfig: { text: diag4[j % 2], fontSize: 70 },
                });
            }
        }
    }
*/
