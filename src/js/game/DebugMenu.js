import {DOMUtils} from "./utils/DOMUtils";

export const DebugMenu = () => {

	let visible = false
	const params = {
		neoMode: false, 
		showRespawns: false
	}
	const view = DOMUtils.createElement('div', 'debugMenu', null)
	for (const k in params) {
		const item = DOMUtils.createElement('div', '', view, null)
		const checkbox = DOMUtils.createElement('input', '', item, null, 'debugMenuItem')
		checkbox.type = 'checkbox'

		checkbox.addEventListener('click', e => {
			// console.log('setting ', k, 'to ', )
			params[k] = !params[k]
		})
		const text = DOMUtils.createElement('p', '', item, null, 'debugMenuItem')
		text.innerHTML = k
	}

	return {
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
}