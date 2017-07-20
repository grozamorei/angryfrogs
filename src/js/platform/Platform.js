import {TelegramPlatformDetector} from "./impl/TelegramPlatform";
import {StandalonePlatformDetector} from "./impl/StandalonePlatform";

export const Platform = () => {

    let current = null
    const detectors = [TelegramPlatformDetector, StandalonePlatformDetector]

    let dCurrent = 0
    while (current === null && dCurrent < detectors.length) {
        if (detectors[dCurrent].isThisPlatform()) {
            current = detectors[dCurrent].createPlatform()
            break
        }
        dCurrent += 1
    }

    if (current === null) {
        throw 'Could not detect any platform, lalka'
    }

    console.log('initialized with platform ' + current.id)

    return {
        get current() { return current.id },
        get userName() { return current.userName },
        get userData() { return current.userData }
    }
}