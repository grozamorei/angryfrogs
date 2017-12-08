import {Util} from "../utils/Util";

export const Camera = (frog, renderer) => {

    let freeze = false
    let tween = PIXI.tweenManager.createTween(renderer.scroll)

    return {
        update: (dt) => {
            if (freeze) return
            const diff = renderer.scroll.y - Math.abs(frog.visual.y)
            if (diff < 500) { // camera position will be changed
                renderer.scroll.y = Math.floor(Util.lerp(renderer.scroll.y, renderer.scroll.y + 500 - diff, 0.11))
                // console.log(renderer.scroll.y)
                return true
            }
            return false
        },
        scrollTo: (yPos, onDone) => {
            freeze = true

            tween.stop().clear()
            tween.to({y: yPos})
            tween.time = 300
            tween.loop = false
            tween.easing = PIXI.tween.Easing.inSine()
            tween.once('end', () => {
                freeze = false
                onDone()
            })
            tween.start()
        },
        snapTo: (pos) => {
            renderer.scroll.y = pos
        }
    }
}