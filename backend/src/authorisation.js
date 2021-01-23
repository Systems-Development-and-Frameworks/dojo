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
    posts: allow,
    users: isAuthenticated
  },
  Mutation: {
    createPost: isAuthenticated,
    deletePost: isAuthenticated,
    upvotePost: isAuthenticated,
    downvotePost: isAuthenticated,
    login: allow,
    signup: allow
  },
  Post: allow,
  User: allow
}, {
  fallbackError: new NotAuthorisedError(),
  fallbackRule: deny
})

export default permissions
