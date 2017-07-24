
let uniqueId = 0
export const nextUniqueId = () => ++uniqueId

export const INTERSECTION = {NONE: 'none', TOP: 'top', DOWN: 'down', LEFT: 'left', RIGHT: 'right'}

export const testBody = (a, b) => {
    const axisCollision = (bounds) => {
        bounds.sort((s1, s2) => {
            if (s1.bound > s2.bound) return 1
            if (s1.bound > s2.bound) return -1
            return 0
        })
        // console.log('bounds sort: ', bounds)
        if (bounds[0].body !== bounds[1].body) {// collision!
            return {
                test: true,
                firstBody: bounds[0].body,
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

    if (!xCollision.test && !yCollision.test) return false
    if (xCollision.penetration < yCollision.penetration) { // collision on X axis
        return {
            bodyA: xCollision.firstBody === a ? INTERSECTION.RIGHT : INTERSECTION.LEFT,
            bodyB: xCollision.firstBody === b ? INTERSECTION.RIGHT : INTERSECTION.LEFT
        }
    } else { // collision on Y axis
        return {
            bodyA: yCollision.firstBody === a ? INTERSECTION.DOWN : INTERSECTION.TOP,
            bodyB: yCollision.firstBody === b ? INTERSECTION.DOWN : INTERSECTION.TOP
        }
    }
}


export const GPoint = (x, y) => {
    return {
        get x() { return x },
        get y() { return y }
    }
}