import NewsServer from './server'
import { readFileSync } from 'fs'
import { createPrivateKey } from 'crypto'
import Authentication from './authentication'
import { JWT_PRIVATE_KEY_LOCATION } from './config'

const playground = {
  settings: {
    'schema.polling.enable': false
  }
}

const server = new NewsServer({
  playground,
  authentication: new Authentication(createPrivateKey(readFileSync(JWT_PRIVATE_KEY_LOCATION)))
})

server.listen().then(({ url }) => {
  console.log(`NewsServer ready at ${url}`)
})
