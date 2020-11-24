export class User {
  constructor (name) {
    this.name = name
    this.upvotes = new Set()
    this.downvotes = new Set()
    this.posts = new Set()
  }
}
