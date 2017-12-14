import {DOMUtils} from "./utils/DOMUtils";
import {emitterTemplate} from "./utils/EmitterBehaviour";
export const DebugMenu = () => {

    let params = {
        showMenu: false,
        fpsCounter: false,
        neoMode: false, 
        invisibleStuff_group: false,
        invisibleStuff: {
            display: 'list',
            triggers: false,
            colliders: false,
            sprites: false
        },
        levelConstructor_group: false,
        levelConstructor: {
            display: 'levelConstructor',
            current: -1,
            presets: []
        }
    }
    // window.localStorage.debug = JSON.stringify(params)
    const savedParams = window.localStorage.debug
    if (savedParams) {
        const newParams = JSON.parse(savedParams)
        for (const k in newParams) {
            if (params[k] === undefined) continue
            params[k] = newParams[k]
        }
    }

    const availablePatterns = window.resources.getJSON('digest.patterns').map(v => v.alias)
    let visible = false
    const view = DOMUtils.createElement('div', 'debugMenu', null)

    const checkBoxField = (parent, obj, key, offset = 0, onChange = null) => {
        const item = DOMUtils.createElement('div', '', parent, null)
        DOMUtils.createElement('div', '', item, {width: 20*offset + 'px'}, 'debugMenuItem')
        const checkbox = DOMUtils.createElement('input', '', item, null, 'debugMenuItem')
        checkbox.type = 'checkbox'
        checkbox.checked = obj[key]

        checkbox.addEventListener('click', _ => {
            obj[key] = !obj[key]
            self.emit('paramChange', key, obj[key])
            window.localStorage.debug = JSON.stringify(params)
            onChange && onChange(obj[key])
        })
        const text = DOMUtils.createElement('p', '', item, null, 'debugMenuItem')
        text.innerHTML = key
        return item
    }

    const arrayPanel = (parent, children, obj, key) => {
        if (obj[key+'_group']) {
            for (const oneKey in obj[key]) {
                if (oneKey === 'display') continue
                children.push(checkBoxField(parent, obj[key], oneKey, 1))
            }
        }
    }

    const levelConstructor = () => {
        console.log(availablePatterns)
        const p = params.levelConstructor
        const drawCurrent = (div) => {
            while (div.hasChildNodes()) {
                div.removeChild(div.lastChild)
            }

            if (p.current === -1) {
                const str = DOMUtils.createElement('p', '', div)
                str.innerHTML = 'use regular random generation'

                DOMUtils.createButton(DOMUtils.createElement('div', '', div, {'text-align': 'center', 'margin-top': '20px'}), 50, 'apply', null)
            } else {

                const presetName = DOMUtils.createElement('input', '', null)
                presetName.type = 'text'; presetName.value = 'some preset'

                DOMUtils.makeLine(div, 5, [DOMUtils.makeLabel('name', true, null), presetName])

                const column = DOMUtils.createElement('div', '', div, {'text-align': 'center', 'margin-top': '10px'})

                //
                // addition

                DOMUtils.makeLine(div, 5, [DOMUtils.makeLabel('add piece', true, null), DOMUtils.makeDropdown(availablePatterns)])

                //
                // existing
            }
        }
        const panel = DOMUtils.createElement('div', 'levelConstructor')

        const switcher = DOMUtils.createElement('div', '', panel, {display: 'block', 'text-align': 'center'})
        DOMUtils.createButton(switcher, 30, '<', () => {
            if (p.current === -1) return
            p.current = p.current-1
            if (p.current === -1) {
                currentTab.innerHTML = 'default'
            } else {
                currentTab.innerHTML = p.presets[p.current].name
            }
            drawCurrent(workingDiv)
        })
        const currentTab = DOMUtils.createButton(switcher, 100, p.current, null)
        DOMUtils.createButton(switcher, 30, '>', () => {
            if (p.current === p.presets.length) return
            p.current = p.current+1
            if (p.current >= p.presets.length) {
                currentTab.innerHTML = 'create preset'
            } else {
                currentTab.innerHTML = p.presets[p.current].name
            }
            drawCurrent(workingDiv)
        })

        const workingDiv = DOMUtils.createElement('div', 'currentTab', panel)
        drawCurrent(workingDiv)


        return panel
    }
    
    for (const k in params) {
        if (k === 'showMenu') continue
        if (k.indexOf('_group') > -1) continue
        if (typeof params[k] === 'object') {
            if (params[k].display === 'list') {
                const children = []
                checkBoxField(view, params, k+'_group', 0, () => {
                    children.forEach(child => root.removeChild(child))
                    children.splice(0, children.length)
                    arrayPanel(root, children, params, k)
                })
                const root = DOMUtils.createElement('div', 'fuck', view)
                arrayPanel(root, children, params, k)
            }
            if (params[k].display === 'levelConstructor') {
                const panel = levelConstructor()
                checkBoxField(view, params, k+'_group', 0, (checked) => {
                    if (checked) {
                        panel.style.display = 'block'
                    } else {
                        panel.style.display = 'none'
                    }
                })
                view.appendChild(panel)
                if (params[k + '_group']) {
                    panel.style.display = 'block'
                } else {
                    panel.style.display = 'none'
                }
            }
        } else {
            checkBoxField(view, params, k)
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
            params.showMenu = visible
            window.localStorage.debug = JSON.stringify(params)
        }
    }
    Object.assign(self, emitterTemplate({}))

    if (params.showMenu) {
        self.toggle()
    }
    return self
}