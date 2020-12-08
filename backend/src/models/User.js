export class User {
  constructor (id, name, email, passwordHash) {
    this.id = id
    this.name = name
    this.email = email
    this.passwordHash = passwordHash
    this.upvotes = new Set()
    this.downvotes = new Set()
    this.posts = new Set()
  }
}
