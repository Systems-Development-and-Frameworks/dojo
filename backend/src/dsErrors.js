export class EmailAlreadyExistsError extends Error {
  constructor (email) {
    super(`User with email ${email} already exists!`)
  }
}

export class UserIdNotFoundError extends Error {
  constructor (id) {
    super(`No user found for ID ${id}!`)
  }
}

export class UserEmailNotFoundError extends Error {
  constructor (email) {
    super(`No user with email ${email} found!`)
  }
}

export class PostIdNotFoundError extends Error {
  constructor (id) {
    super(`No post found for ID ${id}!`)
  }
}
