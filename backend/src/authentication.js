import jwt from 'jsonwebtoken'
import { createPublicKey } from 'crypto'

class Authentication {
  constructor (privateKey) {
    this.privateKey = privateKey
    this.publicKey = createPublicKey(this.privateKey)
  }

  getUserAuthenticationToken (userId) {
    return jwt.sign({ userId }, this.privateKey, { algorithm: 'ES256' })
  }

  checkUserAuthentication (req) {
    const authorization = req.headers.authorization
    if (authorization === undefined) {
      return null
    }

    return jwt.verify(authorization, this.publicKey, { algorithms: ['ES256'] }).userId
  }
}

export default Authentication
