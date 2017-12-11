
export const RespawnController = () => {
	
	const respawns = []
	let current = null
	let lastYAnchor = 0

	return {
		get current() { return current },
        get lockObjectsAnchor() { return lastYAnchor - 100 },
		updateCurrent: (respawnBodyId) => {
			let previousRespawn = null
			respawns.forEach(respawn => {
				if (respawn.active) previousRespawn = respawn
				if (respawn.body.id !== respawnBodyId) return
				if (respawn.y > lastYAnchor) return
				current = respawn
				respawn.setActive(true)
				lastYAnchor = respawn.y
			})
			if (previousRespawn && previousRespawn !== current) {
				previousRespawn.setActive(false)
			}
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