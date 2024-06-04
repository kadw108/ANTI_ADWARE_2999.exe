import { CONSTANTS } from "./CONSTANTS_FILE";

export default class EndScreen extends Phaser.Scene {
    performanceScore: number;

    constructor() {
        super("EndScreen");

        // https://phaser.discourse.group/t/global-plugin-with-its-own-data-manager-and-event-emitter/6453
        // this.performanceScore = this.game.registry.get("performanceScore");

        // @ts-ignore
        // this.plugins.get("PassData").performanceScore = this.passData.performanceScore;
    }

    create(): void {
        // @ts-ignore
        this.performanceScore = window.idolPerformanceScore;

        const title = this.add.text(CONSTANTS.originX, CONSTANTS.originY, "END!", CONSTANTS.textConfig);
        title.setOrigin(0.5, 0.5);
        title.setFontSize(70);

        const subtitle = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 100, "TIMES HIT: " + -this.performanceScore, CONSTANTS.textConfig);
        subtitle.setOrigin(0.5, 0.5);

        const subtitle2 = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 150, "Click to play again!", CONSTANTS.textConfig);
        subtitle2.setOrigin(0.5, 0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("Menu");
        });
    }
}
