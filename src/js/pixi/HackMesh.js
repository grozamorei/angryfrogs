
export class HackMesh extends PIXI.mesh.Mesh {
    constructor(texture) {
        super(texture);
        if (texture.textureCacheIds[0] !== 'pixel') {
            this.pluginName = 'hackMesh'
            this.uploadUvTransform = true
        }
    }
}