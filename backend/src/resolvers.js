import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import bcrypt from 'bcrypt'

const bcryptSaltRounds = 10

const resolvers = {
  Query: {
    posts: (_, __, { dataSources }) => dataSources.db.getPosts(),
    users: (_, __, { dataSources }) => dataSources.db.getUsers()
  },
  Mutation: {
    createPost: (_, { post }, { dataSources, userId }) => dataSources.db.createPost(post.title, 0, userId),
    deletePost: (_, { id }, { dataSources, userId }) => {
      const post = dataSources.db.getPost(id)
      if (post.author.id !== userId) throw new ForbiddenError('May not delete a post of another user!')
      return dataSources.db.deletePost(id)
    },
    upvotePost: (_, { id }, { dataSources, userId }) => dataSources.db.upvotePost(id, userId),
    downvotePost: (_, { id }, { dataSources, userId }) => dataSources.db.downvotePost(id, userId),
    signup: (_, { name, email, password }, { dataSources, getUserAuthenticationToken }) => {
      if (password.length < 8) return new UserInputError('Password must be at least 8 characters long!')
      return bcrypt.hash(password, bcryptSaltRounds)
        .then((passwordHash) => getUserAuthenticationToken(dataSources.db.createUser(name, email, passwordHash)))
    },
    login: (_, { email, password }, { dataSources, getUserAuthenticationToken }) => {
      const user = dataSources.db.getUserByEmail(email)
      return bcrypt.compare(password, user.passwordHash)
        .then((isEqual) => isEqual
          ? getUserAuthenticationToken(user.id)
          : new UserInputError('Invalid password provided!'))
    }
  }
}

export default resolvers
