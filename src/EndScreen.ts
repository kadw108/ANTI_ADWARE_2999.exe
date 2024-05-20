import { CONSTANTS } from "./CONSTANTS_FILE";

export default class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    create(): void {
        const title = this.add.text(CONSTANTS.originX, CONSTANTS.originY, "ANTI-ADWARE IDOL\nOF THE YEAR 2999", CONSTANTS.textConfig);
        title.setOrigin(0.5, 0.5);
        title.setFontSize(70);

        const subtitle = this.add.text(CONSTANTS.originX, CONSTANTS.originY + 200, "CLICK TO BEGIN", CONSTANTS.textConfig);
        subtitle.setOrigin(0.5, 0.5);

        this.input.once(
            "pointerdown",
            () => {
                this.scene.start("GameMain");
            },
        );
    }
}


