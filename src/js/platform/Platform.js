import {TelegramPlatform} from "./impl/TelegramPlatform";
import {StandalonePlatform} from "./impl/StandalonePlatform";

const TelegramPlatformDetector = {
    isThisPlatform: () => {
        if ('TelegramGameProxy' in window) {
            return 'tgShareScoreUrl' in window.TelegramGameProxy.initParams
        }
        return false
    },
    createPlatform: () => TelegramPlatform()
}

const StandalonePlatformDetector = {
    isThisPlatform: () => true,
    createPlatform: () => StandalonePlatform()
}

export const CreateDetectedPlatform = () => {
    let platform = null
    const detectors = [TelegramPlatformDetector, StandalonePlatformDetector]

    let dCurrent = 0
    while (platform === null && dCurrent < detectors.length) {
        if (detectors[dCurrent].isThisPlatform()) {
            platform = detectors[dCurrent].createPlatform()
            break
        }
        dCurrent += 1
    }

    if (platform === null) {
        throw 'Could not detect any platform, lalka'
    }

    console.log('initialized with platform ' + platform.id)

    return platform
}