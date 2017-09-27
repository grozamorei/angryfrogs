import * as pl from "../PlatformTools";
import {Util} from "../../game/utils/Util";

export const TelegramPlatform = () => {

    const platformArgs = pl.parseUrlVars(window.location.search)

    const state = {
        id: 'telegram',
        userName: platformArgs.userName,
        userData: platformArgs
    }

    const self = {}
    Object.assign(self, pl.platformTemplate(state))

    self.sendScore = (value) => {
        let data = Object.assign({score: value}, state.userData)
        // console.log('sending score: ', data.score)
        Util.postRequest(window.location.protocol + '//' + window.location.hostname + ':8443/setScore', JSON.stringify(data)).then(
            () => { console.log ('URL REQUEST: SUCCESS') },
            () => {console.log('URL REQUEST: FAILED')}
        )
    }

    return self
}