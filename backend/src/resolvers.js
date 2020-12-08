import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import bcrypt from 'bcrypt'
import { PostIdNotFoundError } from './db'

const bcryptSaltRounds = 10

export class DeletionOfOtherUsersPostForbiddenError extends ForbiddenError {
  constructor () {
    super('May not delete a post of another user!')
  }
}

export class TooShortPasswordError extends UserInputError {
  constructor () {
    super('Password must be at least 8 characters long!')
  }
}

export class InvalidPasswordError extends UserInputError {
  constructor () {
    super('Invalid password provided!')
  }
}

const resolvers = {
  Query: {
    posts: (_, __, { dataSources }) => dataSources.db.getPosts(),
    users: (_, __, { dataSources }) => dataSources.db.getUsers()
  },
  Mutation: {
    createPost: (_, { post }, { dataSources, userId }) => dataSources.db.createPost(post.title, 0, userId),
    deletePost: (_, { id }, { dataSources, userId }) => {
      let post = null
      try {
        post = dataSources.db.getPost(id)
      } catch (error) {
        if (error instanceof PostIdNotFoundError) return error
        throw error
      }
      if (post.author.id !== userId) return new DeletionOfOtherUsersPostForbiddenError()
      return dataSources.db.deletePost(id)
    },
    upvotePost: (_, { id }, { dataSources, userId }) => {
      try {
        return dataSources.db.upvotePost(id, userId)
      } catch (error) {
        if (error instanceof PostIdNotFoundError) return error
        throw error
      }
    },
    downvotePost: (_, { id }, { dataSources, userId }) => {
      try {
        return dataSources.db.downvotePost(id, userId)
      } catch (error) {
        if (error instanceof PostIdNotFoundError) return error
        throw error
      }
    },
    signup: (_, { name, email, password }, { dataSources, getUserAuthenticationToken }) => {
      if (password.length < 8) return new TooShortPasswordError()
      return bcrypt.hash(password, bcryptSaltRounds)
        .then((passwordHash) => getUserAuthenticationToken(dataSources.db.createUser(name, email, passwordHash)))
    },
    login: (_, { email, password }, { dataSources, getUserAuthenticationToken }) => {
      const user = dataSources.db.getUserByEmail(email)
      return bcrypt.compare(password, user.passwordHash)
        .then((isEqual) => isEqual
          ? getUserAuthenticationToken(user.id)
          : new InvalidPasswordError())
    }
  }
}

export default resolvers
