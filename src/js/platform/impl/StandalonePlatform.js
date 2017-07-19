import * as pl from "../PlatformBehaviours";

export const StandalonePlatformDetector = {
    isThisPlatform: () => true,
    createPlatform: () => StandalonePlatform()
}

const StandalonePlatform = () => {

    const state = {
        id: 'standalone',
        userName: 'DEADBEEF'
    }

    const self = {

    }

    Object.assign(self, pl.platformGetId(state))
    Object.assign(self, pl.platformGetUserName(state))

    return self
}