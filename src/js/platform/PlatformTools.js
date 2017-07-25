
export const platformTemplate = (state) => ({
    get id() { return state.id },
    get userName() { return state.userName },
    get userData() { return state.userData }
})

export const parseUrlVars = (searchQuery) => {
    const queryParts = searchQuery.substring(1).split('&')
    const resultObj = {}
    queryParts.forEach(qp => {
        const objParts = qp.split('=')
        resultObj[objParts[0]] = decodeURIComponent(objParts[1])
    })
    return resultObj
}