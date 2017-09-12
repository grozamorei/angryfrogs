import {Util} from "../utils/Util";
let uniqueId = 0
export const nextUniqueId = () => ++uniqueId

export const INTERSECTION = {NONE: 0, TOP: 1, DOWN: 2, LEFT: 4, RIGHT: 8}

export const testBody = (a, b) => {
    const axisCollision = (bounds) => {
        bounds.sort((s1, s2) => {
            if (s1.bound > s2.bound) return 1
            if (s1.bound > s2.bound) return -1
            return 0
        })

        // console.log(bounds, bounds[0].body === bounds[1].body)
        // console.log(bounds[1].bound, bounds[2].bound, approximately(bounds[1].bound, bounds[2].bound))
        if (bounds[0].body !== bounds[1].body || // offset collision
            Util.approximately(bounds[1].bound, bounds[2].bound)) { // almost perfect collision
            return {
                test: true,
                firstBody: bounds[0].body.id,
                secondBody: bounds[3].body.id,
                penetration: bounds[2].bound - bounds[1].bound
            }
        }
        return {test: false}
    }

    const xCollision = axisCollision([
        {body: a, bound: a.left}, {body: a, bound: a.right},
        {body: b, bound: b.left}, {body: b, bound: b.right}
    ])
    const yCollision = axisCollision([
        {body: a, bound: a.top}, {body: a, bound: a.bottom},
        {body: b, bound: b.top}, {body: b, bound: b.bottom}
    ])
    // console.log('x collision: ', xCollision)
    // console.log('y collision: ', yCollision)

    if (!xCollision.test || !yCollision.test) return false
    if (xCollision.penetration < yCollision.penetration) { // collision on X axis
        return {
            bodyA: xCollision.firstBody === a.id ? INTERSECTION.RIGHT : INTERSECTION.LEFT,
            bodyAid: xCollision.firstBody,
            bodyB: xCollision.firstBody === b.id ? INTERSECTION.RIGHT : INTERSECTION.LEFT,
            bodyBid: xCollision.secondBody,
            penetration: xCollision.penetration,
            overlap: yCollision.penetration,
            overlapBodyA: yCollision.firstBody
        }
    } else { // collision on Y axis
        return {
            bodyA: yCollision.firstBody === a.id ? INTERSECTION.DOWN : INTERSECTION.TOP,
            bodyAid: yCollision.firstBody,
            bodyB: yCollision.firstBody === b.id ? INTERSECTION.DOWN : INTERSECTION.TOP,
            bodyBid: yCollision.secondBody,
            penetration: yCollision.penetration
        }
    }
}


export const GPoint = (x, y) => {
    let xPos = x; let yPos = y
    return {
        get x() { return xPos },
        set x(value) { xPos = value },
        get y() { return yPos },
        set y(value) { yPos = value },
        toString() { return 'x: ' + xPos + '; y: ' + yPos }
    }
}

export const detectSlippingState = (body, collision) => {
    if (!('overlap' in collision.wallslip)) return
    if (collision.wallslip.overlapFirstBody === body.id) {  // slipping from top
        // console.log(body)
        // console.log('from top: ', collision.wallslip.overlap, body.radius.y)
        if (collision.wallslip.overlap > body.radius.y*2) {   // slipping
            if (collision.wallslip.slipping) return
            collision.wallslip.needEmit = true
            collision.wallslip.slipping = true
        } else {
            if (!collision.wallslip.slipping) return
            collision.wallslip.needEmit = true
            collision.wallslip.slipping = false
        }
    } else {                                                // slipping from bottom
        if (collision.wallslip.overlap > body.radius.y) {   // slipping
            if (collision.wallslip.slipping) return
            collision.wallslip.needEmit = true
            collision.wallslip.slipping = true
        } else {
            if (!collision.wallslip.slipping) return
            collision.wallslip.needEmit = true
            collision.wallslip.slipping = false
        }
    }
}