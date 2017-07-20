
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

    parseUrlVars: (searchQuery) => {
        const queryParts = searchQuery.substring(1).split('&')
        const resultObj = {}
        queryParts.forEach(qp => {
            const objParts = qp.split('=')
            resultObj[objParts[0]] = decodeURIComponent(objParts[1])
        })
        return resultObj
    },

    postRequest: (url, strData) => {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest()
            req.addEventListener('error', reject)
            // req.addEventListener('abort', reject)
            req.open('POST', url, true)

            // req.onreadystatechange = () => {
            //     if (req.readyState === 4 && req.status === 200) {
            //         const jsonData = JSON.parse(req.responseText)
            //         if (jsonData.status === 'OK') {
            //             resolve(jsonData)
            //         } else {
            //             reject('http.getRequest failed: ' + req.responseText)
            //         }
            //     }
            // }
            req.send(strData)
        })
    }
}