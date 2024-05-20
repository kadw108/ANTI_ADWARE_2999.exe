import { CONSTANTS } from "./CONSTANTS_FILE";

export default class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    create(): void {
        const title = this.add.text(CONSTANTS.originX, CONSTANTS.originY - 30, "ANTI_ADWARE_2999.EXE", { fontFamily: "DisplayFont", fontSize: 70, color: "#ffffff" });
        title.setOrigin(0.5, 0.5);

        const byline = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 30, "By KADW", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff"});
        byline.setOrigin(0.5, 0.5);

        const tutorial = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 140, " INSTRUCTIONS ", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff", backgroundColor: "#2244ff" });
        tutorial.setOrigin(0.5, 0.5);
        tutorial.setInteractive();
        tutorial.on("pointerdown", () => {
            this.scene.start("Tutorial");
        });

        const subtitle = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 200, " BEGIN ", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff", backgroundColor: "#2244ff" });
        subtitle.setOrigin(0.5, 0.5);
        subtitle.setInteractive();
        subtitle.on("pointerdown", () => {
            this.scene.start("GameMain");
        });

        const credits = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 260, " CREDITS ", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff", backgroundColor: "#2244ff" });
        credits.setOrigin(0.5, 0.5);
        credits.setInteractive();
        credits.on("pointerdown", () => {
            this.scene.start("Credits");
        });

        /*
        this.input.once("pointerdown", () => {
            this.scene.start("GameMain");
        });
        */
    }
}
