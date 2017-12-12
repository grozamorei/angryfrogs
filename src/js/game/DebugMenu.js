import {DOMUtils} from "./utils/DOMUtils";
import {emitterTemplate} from "./utils/EmitterBehaviour";
export const DebugMenu = () => {

    let params = {
        fpsCounter: false,
        neoMode: false, 
        invisibleStuff_group: false,
        invisibleStuff: {
            triggers: false,
            colliders: false,
            sprites: false
        }
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

    const checkBoxField = (obj, key, offset = 0, onChange = null) => {
        const item = DOMUtils.createElement('div', '', view, null)
        DOMUtils.createElement('div', '', item, {width: 20*offset + 'px'}, 'debugMenuItem')
        const checkbox = DOMUtils.createElement('input', '', item, null, 'debugMenuItem')
        checkbox.type = 'checkbox'
        checkbox.checked = obj[key]

        checkbox.addEventListener('click', _ => {
            obj[key] = !obj[key]
            self.emit('paramChange', key, obj[key])
            window.localStorage.debug = JSON.stringify(params)
            onChange && onChange()
        })
        const text = DOMUtils.createElement('p', '', item, null, 'debugMenuItem')
        text.innerHTML = key
        return item
    }

    const arrayPanel = (children, obj, key) => {
        if (obj[key+'_group']) {
            // obj[key].forEach(subObj => {
            for (const oneKey in obj[key])
                children.push(checkBoxField(obj[key], oneKey, 1))
            // })
        }
    }
    
    for (const k in params) {
        if (k.indexOf('_group') > -1) continue
        if (typeof params[k] === 'object') {
            const children = []
            checkBoxField(params, k+'_group', 0, () => {
                children.forEach(child => view.removeChild(child))
                children.splice(0, children.length)
                arrayPanel(children, params, k)
            })
            arrayPanel(children, params, k)
        } else {
            checkBoxField(params, k)
        }
    }

    const self = {
        get params() { return params },
        get visible() { return visible },
        toggle: () => {
            visible = !visible
            self.emit('visibility', visible)
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