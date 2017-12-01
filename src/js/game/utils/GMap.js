export class GMap {
    constructor() {
        this._keys = []
        this._values = []
    }

    set(k, v) {
        this._keys.push(k)
        this._values.push(v)
    }

    get(k) {
        const idx = this._keys.indexOf(k)
        if (idx === -1) console.error('GMap.get: Unknown key ' + k)
        return this._values[idx]
    }

    has(k) {
        return this._keys.indexOf(k) > -1
    }

    remove(k) {
        const idx = this._keys.indexOf(k)
        if (idx === -1) console.error('GMap.delete: Unknown value ' + v)
        this._keys.splice(idx, 1)
        this._values.splice(idx, 1)
    }

    get size() {
        return this._keys.length
    }

    getSetAt(idx) {
        return {k: this._keys[idx], v: this._values[idx]}
    }

    forEach(f) {
        for (let i = 0; i < this._keys.length; i++) {
            f(this._values[i], this._keys[i])
        }
    }
}