// From https://old.reddit.com/r/phaser/comments/z9753e/applying_a_postprocessing_shader_to_the_whole/

const fragShader = `
    precision mediump float;
    uniform sampler2D uMainSampler;
    varying vec2 outTexCoord;
    void main(void) {
        vec4 color = texture2D(uMainSampler, outTexCoord);
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(vec3(gray), 1.0);
    }
`;

export default class GameShader extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game: Phaser.Game) {
        super({
            game,
            renderTarget: true,
            fragShader: fragShader,
        });
    }
}
