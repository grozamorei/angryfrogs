
export const RespawnController = () => {
	
	const respawns = []
	let current = null

	return {
		get current() { return current },
		updateCurrent: (respawnBodyId) => {
			respawns.forEach(r => {
				if (r.body.id !== respawnBodyId) return
				current = r
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