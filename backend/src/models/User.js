export class User {
  constructor (id, name, email, passwordHash) {
    this.id = id
    this.name = name
    this._email = email
    this._passwordHash = passwordHash
    this.upvotes = new Set()
    this.downvotes = new Set()
    this.postIds = new Set()
  }

  getPasswordHash () {
    return this._passwordHash
  }

  getEmail () {
    return this._email
  }
}
