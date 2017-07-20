
export const platformGetId = (state) => ({
    get id() { return state.id }
})

export const platformGetUserName = (state) => ({
    get userName() { return state.userName }
})

export const platformGetUserData = (state) => ({
    get userData() { return state.userData }
})