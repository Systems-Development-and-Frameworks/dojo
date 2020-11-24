import NewsServer from './server'

const playground = {
  settings: {
    'schema.polling.enable': false
  }
}

const server = new NewsServer({ playground })

server.listen().then(({ url }) => {
  console.log(`NewsServer ready at ${url}`)
})
