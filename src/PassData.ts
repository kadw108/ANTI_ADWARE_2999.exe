// see https://stackoverflow.com/a/63222134

export class PassData extends Phaser.Plugins.BasePlugin {

    performanceScore: number;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager); 

        this.performanceScore = 0;
    }
}