export const GyroInput = () => {
    const gn = new GyroNorm()
    let supported = false
    let xOrient = 0
    gn.init({
        frequency: 20,
        gravityNormalized: true,
        orientationBase: GyroNorm.GAME,
        decimalCount: 1,
        logger: null,
        screenAdjusted: false
    })
    .then(() => {
        supported = true
        gn.start(data => {
            // console.log(data.dm)
            xOrient = data.dm.gx
        })
    })
    .catch(() => {
        throw 'gn not supported'
    })

    return {
        get supported() { return supported },
        get pullValue() { return xOrient }
    }
}