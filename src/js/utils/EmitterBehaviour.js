
export const emitterTemplate = (dict) => {
    return {
        on: (e, callback) => {
            if (e in dict) {
                dict[e].push(callback)
            } else {
                dict[e] = [callback]
            }
        },
        clear: (e) => {
            if (e in dict) {
                delete dict[e]
            }
        },
        emit: (e, ...args) => {
            if (e in dict) {
                dict[e].forEach(cb => cb.apply(null, args))
            }
        }
    }
}