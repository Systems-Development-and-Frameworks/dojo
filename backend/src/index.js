import NewsServer from './server'
import { readFileSync } from 'fs'
import { createPrivateKey } from 'crypto'
import Authentication from './authentication'

const playground = {
  settings: {
    'schema.polling.enable': false
  }
}

const server = new NewsServer({
  playground,
  authentication: new Authentication(createPrivateKey(readFileSync('private.pem')))
})

server.listen().then(({ url }) => {
  console.log(`NewsServer ready at ${url}`)
})
