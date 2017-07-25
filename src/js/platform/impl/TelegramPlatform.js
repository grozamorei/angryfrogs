import * as pl from "../PlatformTools";

export const TelegramPlatform = () => {

    const platformArgs = pl.parseUrlVars(window.location.search)

    const state = {
        id: 'telegram',
        userName: platformArgs.userName,
        userData: platformArgs
    }

    const self = {

    }

    Object.assign(self, pl.platformTemplate(state))

    return self
}