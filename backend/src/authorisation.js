import { allow, rule, shield } from 'graphql-shield'

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
  }
})

export default permissions
