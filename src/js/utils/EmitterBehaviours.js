
export const emitterAdd = (dict) => ({
    on: (e, callback) => {
        if (e in dict) {
            dict[e].push(callback)
        } else {
            dict[e] = [callback]
        }
    }
})

export const emitterClear = (dict) => ({
    clear: (e) => {
        if (e in dict) {
            delete dict[e]
        }
    }
})

export const emitterEmit = (dict) => ({
    emit: (e, ...args) => {
        if (e in dict) {
            dict[e].forEach(cb => cb.apply(null, args))
        }
    }
})