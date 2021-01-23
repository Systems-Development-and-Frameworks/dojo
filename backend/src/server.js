import { ApolloServer } from 'apollo-server'

import { makeExecutableSchema } from '@graphql-tools/schema'
import { loadTypedefsSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'

import { applyMiddleware } from 'graphql-middleware'

import { InMemoryNewsDS } from './db'
import resolvers from './resolvers'
import permissions from './authorisation'

const db = new InMemoryNewsDS()
// db.createUser('Jonas')
// db.createUser('Michelle')
// db.createPost('This is a post!', 42, 'Jonas')
// db.createPost('This is a another post!', 1337, 'Jonas')
// db.createPost('This is a yet another post!', 1234, 'Michelle')

export default class NewsServer {
  constructor (opts) {
    const defaults = {
      schema:
        applyMiddleware(
          makeExecutableSchema({
            typeDefs: loadTypedefsSync('src/typeDefs.graphql', {
              loaders: [
                new GraphQLFileLoader()
              ]
            }).map(source => source.document),
            resolvers
          }),
          permissions
        ),
      dataSources: () => ({ db }),
      context: ({ req }) => ({
        getUserAuthenticationToken: (userId) => opts.authentication.getUserAuthenticationToken(userId),
        userId: opts.authentication.checkUserAuthentication(req)
      })
    }
    return new ApolloServer({ ...defaults, ...opts })
  }
};
