
export const Resources = () => {

    const self = {
        add: (alias, path) => {
            PIXI.loader.add(alias, path)
            return self
        },
        load: (onComplete) => {
            PIXI.loader.load(onComplete)
            return self
        },
        getTexture: (alias) => PIXI.loader.resources[alias] ? PIXI.loader.resources[alias].texture : PIXI.loader.resources.pixel.texture,
        getJSON: (alias) => PIXI.loader.resources[alias].data
    }
    return self
}