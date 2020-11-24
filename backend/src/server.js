import { ApolloServer } from 'apollo-server'

import { loadTypedefsSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'

import { InMemoryNewsDS } from './db'
import resolvers from './resolvers'

const db = new InMemoryNewsDS()
// db.createUser('Jonas')
// db.createUser('Michelle')
// db.createPost('This is a post!', 42, 'Jonas')
// db.createPost('This is a another post!', 1337, 'Jonas')
// db.createPost('This is a yet another post!', 1234, 'Michelle')

export default class NewsServer {
  constructor (opts) {
    const defaults = {
      typeDefs: loadTypedefsSync('src/typeDefs.graphql', {
        loaders: [
          new GraphQLFileLoader()
        ]
      }).map(source => source.document),
      resolvers,
      dataSources: () => ({ db })
    }
    return new ApolloServer({ ...defaults, ...opts })
  }
};
