import * as pl from "../PlatformTools";

export const StandalonePlatform = () => {

    const state = {
        id: 'standalone',
        userName: 'DEADBEEF'
    }

    const self = {

    }

    Object.assign(self, pl.platformTemplate(state))

    return self
}