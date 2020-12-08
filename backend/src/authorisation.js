import { allow, deny, rule, shield } from 'graphql-shield'

export class NotAuthorisedError extends Error {
  constructor () {
    super('Not authorised!')
  }
}

const isAuthenticated = rule({ cache: 'contextual' })(
  async (_, __, {
    userId,
    dataSources
  }) => {
    return userId !== null && dataSources.db.hasUser(userId)
  }
)

const permissions = shield({
  Query: {
    '*': deny,
    posts: allow,
    users: isAuthenticated
  },
  Mutation: {
    '*': deny,
    createPost: isAuthenticated,
    deletePost: isAuthenticated,
    upvotePost: isAuthenticated,
    downvotePost: isAuthenticated,
    login: allow,
    signup: allow
  }
}, {
  fallbackError: new NotAuthorisedError()
})

export default permissions
