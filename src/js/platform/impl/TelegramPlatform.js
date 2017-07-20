import * as pl from "../PlatformBehaviours";
import {Util} from "../../utils/Util";

export const TelegramPlatformDetector = {
    isThisPlatform: () => {
        if ('TelegramGameProxy' in window) {
            return 'tgShareScoreUrl' in window.TelegramGameProxy.initParams
        }
        return false
    },
    createPlatform: () => TelegramPlatform()
}

const TelegramPlatform = () => {

    const platformArgs = Util.parseUrlVars(window.location.search)

    const state = {
        id: 'telegram',
        userName: platformArgs.userName,
        userData: platformArgs
    }

    const self = {

    }

    Object.assign(self, pl.platformGetId(state))
    Object.assign(self, pl.platformGetUserName(state))
    Object.assign(self, pl.platformGetUserData(state))

    return self
}