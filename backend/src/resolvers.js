import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { EmailAlreadyExistsError, PostIdNotFoundError, UserEmailNotFoundError } from './dsErrors'

import bcrypt from 'bcrypt'
import { delegateToSchema } from '@graphql-tools/delegate'

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

export default ({ subschema }) => {
  async function delegateQueryPost (id, context, info) {
    const [post] = await delegateToSchema({
      schema: subschema,
      operation: 'query',
      fieldName: 'Post',
      args: {
        id
      },
      context,
      info
    })
    return post
  }

  return {
    Query: {
      post: async (_, { id }, context, info) => await delegateQueryPost(id, context, info),
      posts: async (_, __, context, info) => await delegateToSchema({
        schema: subschema,
        operation: 'query',
        fieldName: 'Post',
        context,
        info
      }),
      users: async (_, __, context, info) => await delegateToSchema({
        schema: subschema,
        operation: 'query',
        fieldName: 'User',
        context,
        info
      })
    },
    Mutation: {
      createPost: async (_, { post }, context, info) => {
        const { id } = await context.dataSources.db.createPost(post.title, context.userId)
        return await delegateQueryPost(id, context, info)
      },
      deletePost: async (_, { id }, context, info) => {
        try {
          const { authorId } = await context.dataSources.db.getPost(id)
          if (authorId !== context.userId) return new DeletionOfOtherUsersPostForbiddenError()
        } catch (error) {
          if (error instanceof PostIdNotFoundError) return error
          throw error
        }

        const post = await delegateQueryPost(id, context, info)
        await context.dataSources.db.deletePost(id)
        return post
      },
      upvotePost: async (_, { id }, context, info) => {
        try {
          await context.dataSources.db.upvotePost(id, context.userId)

          return await delegateQueryPost(id, context, info)
        } catch (error) {
          if (error instanceof PostIdNotFoundError) return error
          throw error
        }
      },
      downvotePost: async (_, { id }, context, info) => {
        try {
          await context.dataSources.db.downvotePost(id, context.userId)

          return await delegateQueryPost(id, context, info)
        } catch (error) {
          if (error instanceof PostIdNotFoundError) return error
          throw error
        }
      },
      signup: async (_, {
        name,
        email,
        password
      }, {
        dataSources,
        getUserAuthenticationToken
      }) => {
        if (password.length < 8) return new TooShortPasswordError()
        const hasUserWithEmail = await dataSources.db.hasUserWithEmail(email)
        if (hasUserWithEmail) return new EmailAlreadyExistsError(email)
        const passwordHash = await bcrypt.hash(password, bcryptSaltRounds)
        try {
          const userId = await dataSources.db.createUser(name, email, passwordHash)
          return getUserAuthenticationToken(userId)
        } catch (error) {
          if (error instanceof EmailAlreadyExistsError) return error
          throw error
        }
      },
      login: async (_, {
        email,
        password
      }, {
        dataSources,
        getUserAuthenticationToken
      }) => {
        let user = null
        try {
          user = await dataSources.db.getUserByEmail(email)
        } catch (error) {
          if (error instanceof UserEmailNotFoundError) return error
          throw error
        }
        return await bcrypt.compare(password, user.passwordHash)
          ? getUserAuthenticationToken(user.id)
          : new InvalidPasswordError()
      }
    },
    Post: {
      votes: {
        selectionSet: '{ id }',
        resolve: async (obj, _, { dataSources }) => {
          const [upvotes, downvotes] = await dataSources.db.getVotesForPost(obj.id)
          return upvotes - downvotes
        }
      }
    },
    User: {
      email: (obj, _, { userId }) => userId === obj.id ? obj.email : null
    }
  }
}
