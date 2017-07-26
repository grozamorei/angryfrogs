
export const Util = {
    hexColorToRgbInt: (hex) => {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return parseInt(result[1], 16) << 16 | parseInt(result[2], 16) << 8 | parseInt(result[3], 16)
    },

    getRandomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    lerp: (v1, v2, t) => {
        t = t < 0 ? 0 : t;
        t = t > 1 ? 1 : t;
        return v1 + (v2 - v1) * t;
    },

    postRequest: (url, strData) => {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest()
            req.addEventListener('error', reject)
            req.open('POST', url, true)

            req.send(strData)
        })
    }
}