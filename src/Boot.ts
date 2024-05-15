export default class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    create ()
    {
        // this.registry.set('highscore', 0);

        const rectangle = this.add.rectangle(450, 350, 200, 200);
        rectangle.isStroked = true;
        rectangle.strokeColor = 0xff0000;

        this.scene.start('Preloader');
    }
}
