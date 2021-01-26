import cookie from 'cookie'

export const actions = {
  async nuxtServerInit (store, context) {
    const { req } = context.ssrContext
    if (!req || typeof req.headers.cookie != 'string') return // static site generation
    const parsedCookies = cookie.parse(req.headers.cookie)
    const token = parsedCookies['apollo-token']
    if (!token) return
    req.headers.authorization = token
    return await store.dispatch('auth/setToken', token)
  },
}
