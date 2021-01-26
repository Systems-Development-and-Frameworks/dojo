import jwt_decode from "jwt-decode"

export const state = () => ({
  token: null,
  userId: null,
})

export const getters = {
  isAuthenticated (state) {
    return !!state.token
  },
  userId (state) {
    return state.userId
  },
  token (state) {
    return state.token
  }
}

export const mutations = {
  _setToken (state, token) {
    state.token = token
  },
  _setUserId (state, userId) {
    state.userId = userId
  },
  unsetToken (state) {
    state.userId = null
    state.token = null
  }
}

export const actions = {
  async setToken (context, token) {
    const { userId } = jwt_decode(token)
    context.commit('_setToken', token)
    context.commit('_setUserId', userId)
  }
}
