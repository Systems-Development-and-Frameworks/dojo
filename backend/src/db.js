import { DataSource } from 'apollo-datasource'
import { Post } from './models/Post'
import { User } from './models/User'

export class InMemoryNewsDS extends DataSource {
  constructor () {
    super()
    this.nextPostId = 0
    this.nextUserId = 0
    this.posts = new Map()
    this.users = new Map()
  }

  createUser (name, email, passwordHash) {
    if (this.hasUserWithEmail(email)) {
      throw new Error(`User with email ${email} already exists!`)
    }
    const userId = String(this.nextUserId++)
    this.users.set(userId, new User(userId, name, email, passwordHash))
    return userId
  }

  hasUser (id) {
    return this.users.has(id)
  }

  getUser (id) {
    const user = this.users.get(id)
    if (user === undefined) throw new Error(`No user found for ID ${id}!`)
    return user
  }

  hasUserWithEmail (email) {
    return [...this.users.values()].find(user => user.email === email) !== undefined
  }

  getUserByEmail (email) {
    const user = [...this.users.values()].find(user => user.email === email)
    if (user === undefined) throw new Error(`No user with email ${email} found!`)
    return user
  }

  createPost (title, votes, authorId) {
    const author = this.users.get(authorId)
    if (author === undefined) throw new Error(`User with ID ${authorId} does not exist!`)
    const post = new Post(String(this.nextPostId++), title, votes, author)
    this.posts.set(post.id, post)
    this.users.get(authorId).posts.add(post)
    return post
  }

  getPost (id) {
    const post = this.posts.get(id)
    if (post === undefined) throw new Error(`No post found for ID ${id}!`)
    return post
  }

  deletePost (id) {
    const post = this.getPost(id)
    this.posts.delete(id)
    this.users.get(post.author.id).posts.delete(post)
    return post
  }

  upvotePost (id, userId) {
    const post = this.getPost(id)
    const user = this.getUser(userId)

    if (!user.upvotes.has(post.id)) {
      user.upvotes.add(post.id)
      post.votes++
      if (user.downvotes.has(post.id)) {
        user.downvotes.delete(post.id)
        post.votes++
      }
    }
    return post
  }

  downvotePost (id, userId) {
    const post = this.getPost(id)
    const user = this.getUser(userId)

    if (!user.downvotes.has(post.id)) {
      user.downvotes.add(post.id)
      post.votes--
      if (user.upvotes.has(post.id)) {
        user.upvotes.delete(post.id)
        post.votes--
      }
    }
    return post
  }

  getPosts () {
    return [...this.posts.values()]
  }

  getUsers () {
    return [...this.users.values()]
  }
}
