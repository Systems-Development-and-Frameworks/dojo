import { DataSource } from 'apollo-datasource'
import { Post } from './models/Post'
import { User } from './models/User'

export class InMemoryNewsDS extends DataSource {
  constructor () {
    super()
    this.nextPostId = 0
    this.posts = new Map()
    this.users = new Map()
  }

  createUser (name) {
    if (this.users.has(name)) throw new Error(`User with name ${name} already exists!`)
    this.users.set(name, new User(name))
  }

  createPost (title, votes, authorName) {
    const author = this.users.get(authorName)
    if (author === undefined) throw new Error(`User with name ${authorName} does not exist!`)
    const post = new Post(String(this.nextPostId++), title, votes, author)
    this.posts.set(post.id, post)
    this.users.get(authorName).posts.add(post)
    return post
  }

  deletePost (id) {
    const post = this.posts.get(id)
    if (post === undefined) throw new Error(`No post found for ID ${id}!`)
    this.posts.delete(id)
    this.users.get(post.author.name).posts.delete(post)
    return post
  }

  upvotePost (id, userName) {
    const post = this.posts.get(id)
    if (post === undefined) throw new Error(`No post found for ID ${id}!`)

    const user = this.users.get(userName)
    if (user === undefined) throw new Error(`No user found with name ${userName}!`)

    if (!user.upvotes.has(post.id)) {
      user.upvotes.add(post.id)
      post.votes++
      if (user.downvotes.has(post.id)) {
        user.downvotes.delete(post.id)
        post.votes++
      }
    }
    return post.votes
  }

  downvotePost (id, userName) {
    const post = this.posts.get(id)
    if (post === undefined) throw new Error(`No post found for ID ${id}!`)

    const user = this.users.get(userName)
    if (user === undefined) throw new Error(`No user found with name ${userName}!`)

    if (!user.downvotes.has(post.id)) {
      user.downvotes.add(post.id)
      post.votes--
      if (user.upvotes.has(post.id)) {
        user.upvotes.delete(post.id)
        post.votes--
      }
    }
    return post.votes
  }

  getPosts () {
    return [...this.posts.values()]
  }

  getUsers () {
    return [...this.users.values()]
  }
}
