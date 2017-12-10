
export const RespawnController = () => {
	
	const respawns = []
	let current = null

	return {
		get current() { return current },
		updateCurrent: (respawnBodyId) => {
			respawns.forEach(r => {
				r.setActive(false)
				if (r.body.id !== respawnBodyId) return
				current = r
				r.setActive(true)
			})
		},
		add: (v) => {
			if (respawns.length === 0) current = v
			respawns.push(v)
		},
		remove: (v) => {
			const idx = respawns.indexOf(v)
			if (idx > -1) {
				respawns.splice(idx, 1)
			}
		}
	}
}