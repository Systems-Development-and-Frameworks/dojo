import { DataSource } from 'apollo-datasource'
import * as path from 'path'
import Neode from 'neode'
import { User } from './models/User'
import { v4 as uuid4 } from 'uuid'
import { EmailAlreadyExistsError, PostIdNotFoundError, UserEmailNotFoundError, UserIdNotFoundError } from './dsErrors'
import { Post } from './models/Post'
import {
  NEO4J_DATABASE,
  NEO4J_ENCRYPTED,
  NEO4J_HOST,
  NEO4J_PASSWORD,
  NEO4J_PORT,
  NEO4J_PROTOCOL,
  NEO4J_USERNAME
} from './config'

const MODELS_DIR = path.join(__dirname, 'neodeModels')

export class NeodeDS extends DataSource {
  constructor () {
    super()

    this.neode = new Neode(
      `${NEO4J_PROTOCOL}://${NEO4J_HOST}:${NEO4J_PORT}`,
      NEO4J_USERNAME,
      NEO4J_PASSWORD,
      false,
      NEO4J_DATABASE,
      {
        NEO4J_ENCRYPTED
      }
    ).withDirectory(MODELS_DIR)
  }

  async createUser (name, email, passwordHash) {
    const newUser = new User(uuid4(), name, email, passwordHash)
    return await this.neode.create('User', newUser)
      .catch(error => {
        if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
          // TODO: Any other possible reason?
          throw new EmailAlreadyExistsError(email)
        }
        throw error
      })
      .then(node => {
        return newUser.id
      })
  }

  async hasUser (id) {
    // TODO: Worth it?
    const { records: [record] } = await this.neode.cypher(
      'MATCH (user :User { id: $id }) WITH COUNT(user) <> 0 AS has_user RETURN has_user',
      { id })
    return !!record.get('has_user')
  }

  async getUser (id) {
    const node = await this.neode.first('User', { id })
    if (!node) throw new UserIdNotFoundError(id)
    const {
      name,
      email,
      passwordHash
    } = node.properties()
    const user = new User(id, name, email, passwordHash)
    user.node = node
    return user
  }

  async hasUserWithEmail (email) {
    // TODO: Worth it?
    const { records: [record] } = await this.neode.cypher(
      'MATCH (user :User { email: $email }) WITH COUNT(user) = 1 AS has_user RETURN has_user',
      { email })
    return record.get('has_user')
  }

  async getUserByEmail (email) {
    const node = await this.neode.first('User', { email })
    if (!node) throw new UserEmailNotFoundError(email)
    const {
      id,
      name,
      passwordHash
    } = node.properties()
    const user = new User(id, name, email, passwordHash)
    user.node = node
    return user
  }

  async createPost (title, authorId) {
    const newPost = new Post(uuid4(), title, 0, authorId)
    const node = await this.neode.create('Post', newPost)
    newPost.node = node
    const author = await this.getUser(authorId)
    await node.relateTo(author.node, 'authored')
    return newPost
  }

  async getVotesForPost (id) {
    // utilize fast count store
    const { records: [upvotesRecord, downvotesRecord] } = await this.neode.cypher(`
      MATCH (:Post { id: $id })<-[upvote:UPVOTED]-()
      RETURN COUNT(upvote) AS count
      UNION ALL
      MATCH (:Post { id: $id })<-[downvote:DOWNVOTED]-()
      RETURN COUNT(downvote) AS count
    `, { id })
    return [upvotesRecord.get('count'), downvotesRecord.get('count')]
      // TODO: Not safe if we ever get an amount of votes outside of JS int range..
      .map(neo4jInt => neo4jInt.toNumber())
  }

  async getVoteForPost (postId, userId) {
    return await Promise
      .all([
        this.getPost(postId),
        this.getUser(userId)
      ])
      .then(async ([{ id: postId }, { id: userId }]) => {
        const { records: [record] } = await this.neode.cypher(`
        MATCH (u:User{ id: $userId }), (p:Post{ id: $postId })
        RETURN EXISTS((u)-[:DOWNVOTED]->(p)) AS has_downvote, EXISTS((u)-[:UPVOTED]->(p)) AS has_upvote
        `, {
          postId,
          userId
        })
        return record.get('has_downvote') ? -1 : (record.get('has_upvote') ? +1 : 0)
      })
  }

  async getPost (id) {
    const node = await this.neode.first('Post', { id })
    if (!node) throw new PostIdNotFoundError(id)
    const { title } = node.properties()
    const author = node.get('authored').startNode().properties()
    const [upvotes, downvotes] = await this.getVotesForPost(id)
    const post = new Post(id, title, upvotes - downvotes, author.id)
    post.node = node
    return post
  }

  async deletePost (id) {
    const post = await this.getPost(id)
    await this.neode.delete(post.node)
  }

  async upvotePost (id, userId) {
    return await Promise
      .all([
        this.getPost(id),
        this.getUser(userId)
      ])
      .then(async ([post, { id: userId }]) => {
        await this.neode.batch([
          {
            query: 'MATCH (:Post { id: $id })<-[downvote:DOWNVOTED]-(:User { id: $userId }) DELETE downvote',
            params: {
              id: post.id,
              userId
            }
          },
          {
            query: 'MATCH (p:Post { id: $id }), (u:User { id: $userId }) MERGE (p)<-[:UPVOTED]-(u)',
            params: {
              id: post.id,
              userId
            }
          }
        ])
      })
  }

  async downvotePost (id, userId) {
    await Promise
      .all([
        this.getPost(id),
        this.getUser(userId)
      ])
      .then(async ([post, { id: userId }]) => {
        await this.neode.batch([
          {
            query: 'MATCH (:Post { id: $id })<-[upvote:UPVOTED]-(:User { id: $userId }) DELETE upvote',
            params: {
              id: post.id,
              userId
            }
          },
          {
            query: 'MATCH (p:Post { id: $id }), (u:User { id: $userId }) MERGE (p)<-[:DOWNVOTED]-(u)',
            params: {
              id: post.id,
              userId
            }
          }
        ])
      })
  }
}
