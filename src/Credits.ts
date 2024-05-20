import { CONSTANTS } from "./CONSTANTS_FILE";

export default class Credits extends Phaser.Scene {
    constructor() {
        super("Credits");
    }

    create(): void {
        const lines = this.add.text(CONSTANTS.originX, 10, "The combat song is WEARY WILLOW by EM ESSEX.\nIt is the property of HALLEY LABS and does not\nbelong to me (KADW).\n\nMost of the other art assets were created by me\n(including the main menu music)\nand all of the other art assets are \nin the public domain.\nDo whatever you want with them.\n\nAll text uses the VT323 font by Peter Hull,\nwhich is under the Open Font License.", { fontFamily: "DisplayFont", fontSize: 30, color: "#ffffff" });
        lines.setOrigin(0.5, 0);

        const subtitle = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 265, "CLICK ANYWHERE TO RETURN", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff" });
        subtitle.setOrigin(0.5, 0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("Menu");
        });
    }
}

