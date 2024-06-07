import { CONSTANTS } from "./CONSTANTS_FILE";

export default class Tutorial extends Phaser.Scene {
    constructor() {
        super("Tutorial");
    }

    create(): void {
        const lines = this.add.text(CONSTANTS.originX, 10, "MALEVOLENT INTERNET ENTITIES are trying\nto damage your cyberware.\nDon't get hit!\n\nBrainlink interface instructions:\n* Arrow keys to move.\n* Space to shoot.\n* Minimize damage.", { fontFamily: "DisplayFont", fontSize: 30, color: "#ffffff" });
        lines.setOrigin(0.5, 0);

        const wavy = this.add.sprite(CONSTANTS.originX, CONSTANTS.originY - 20, "atlas", "wavy1.png");
        wavy.play("wavy");

        const lines2 = this.add.text(CONSTANTS.originX, CONSTANTS.originY - 5, "Wavy lines hurt only if you are NOT moving.", { fontFamily: "DisplayFont", fontSize: 30, color: "#ffffff" });
        lines2.setOrigin(0.5, 0);

        const blocky = this.add.sprite(CONSTANTS.originX, CONSTANTS.originY + 90, "atlas", "blocky1.png");
        blocky.play("blocky");

        const lines3 = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 105, "Blocky lines hurt only if you ARE moving.", { fontFamily: "DisplayFont", fontSize: 30, color: "#ffffff" });
        lines3.setOrigin(0.5, 0);

        const lines4 = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 170, "Please keep this tab in focus while playing,\nor the music may go out of sync.", { fontFamily: "DisplayFont", fontSize: 30, color: "#ffffff" });
        lines4.setOrigin(0.5, 0);

        const subtitle = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 265, "CLICK ANYWHERE TO RETURN", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff" });
        subtitle.setOrigin(0.5, 0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("Menu");
        });
    }
}

