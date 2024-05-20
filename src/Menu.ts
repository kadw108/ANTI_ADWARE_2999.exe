import { CONSTANTS } from "./CONSTANTS_FILE";

export default class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    create(): void {
        const title = this.add.text(CONSTANTS.originX, CONSTANTS.originY, "ANTI_ADWARE_2999.EXE", { fontFamily: "DisplayFont", fontSize: 70, color: "#ffffff" });
        title.setOrigin(0.5, 0.5);
        const subtitle = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 200, "CLICK TO BEGIN", { fontFamily: "DisplayFont", fontSize: 40, color: "#ffffff" });
        subtitle.setOrigin(0.5, 0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("GameMain");
        });
    }
}
