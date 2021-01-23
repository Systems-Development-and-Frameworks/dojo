import { ApolloServer } from 'apollo-server'

import { loadTypedefsSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'

import { makeAugmentedSchema } from 'neo4j-graphql-js'
import neo4jDriver from './neo4j-driver'

import { applyMiddleware } from 'graphql-middleware'

import Resolvers from './resolvers'
import permissions from './authorisation'
import * as path from 'path'
import { NeodeDS } from './NeodeDS'
import { stitchSchemas } from '@graphql-tools/stitch'
import * as fs from 'fs'

const db = new NeodeDS()

export default class NewsServer {
  constructor (opts) {
    const dbSchema = makeAugmentedSchema({
      typeDefs: fs.readFileSync(path.join(__dirname, 'nodes.graphql'), 'utf-8')
    })

    const typeDefs = loadTypedefsSync(path.join(__dirname, 'api.graphql'), {
      loaders: [
        new GraphQLFileLoader()
      ]
    }).map(source => source.document)

    const resolvers = Resolvers({ subschema: dbSchema })

    const defaults = {
      schema:
        applyMiddleware(
          stitchSchemas({
            subschemas: [dbSchema],
            typeDefs,
            resolvers
          }),
          permissions
        ),
      dataSources: () => ({ db }),
      context: ({ req }) => ({
        getUserAuthenticationToken: (userId) => opts.authentication.getUserAuthenticationToken(userId),
        userId: opts.authentication.checkUserAuthentication(req),
        driver: neo4jDriver
      })
    }
    return new ApolloServer({ ...defaults, ...opts })
  }
};
