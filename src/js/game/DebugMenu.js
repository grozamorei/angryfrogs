import {DOMUtils} from "./utils/DOMUtils";
import {emitterTemplate} from "./utils/EmitterBehaviour";
export const DebugMenu = () => {

    let params = {
        neoMode: false, 
        showInvisibleStuff: false
    }

    const savedParams = window.localStorage.debug
    if (savedParams) {
        const newParams = JSON.parse(savedParams)
        for (const k in newParams) {
            if (params[k] === undefined) continue
            params[k] = newParams[k]
        }
    }

    let visible = false
    
    const view = DOMUtils.createElement('div', 'debugMenu', null)
    for (const k in params) {
        const item = DOMUtils.createElement('div', '', view, null)
        const checkbox = DOMUtils.createElement('input', '', item, null, 'debugMenuItem')
        checkbox.type = 'checkbox'
        checkbox.checked = params[k]

        checkbox.addEventListener('click', _ => {
            params[k] = !params[k]
            self.emit('paramChange', k, params[k])
            window.localStorage.debug = JSON.stringify(params)
        })
        const text = DOMUtils.createElement('p', '', item, null, 'debugMenuItem')
        text.innerHTML = k
    }

    const self = {
        get params() { return params },
        toggle: () => {
            visible = !visible
            if (visible) {
                view.style.display = 'block'
            } else {
                view.style.display = 'none'
            }
        }
    }
    Object.assign(self, emitterTemplate({}))
    return self
}