require('dotenv').config()

export const {
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
  NEO4J_PROTOCOL = 'neo4j',
  NEO4J_HOST = 'localhost',
  NEO4J_PORT = '7687',
  NEO4J_DATABASE = 'neo4j',
  NEO4J_ENCRYPTED = 'ENCRYPTION_OFF',
  JWT_PRIVATE_KEY_LOCATION = 'private.pem'
} = process.env
if (!(NEO4J_USERNAME && NEO4J_PASSWORD)) {
  throw new Error(`
  
Missing one of the required configuration settings:
- NEO4J_USERNAME
- NEO4J_PASSWORD
  
Please create a .env file and configure environment variables there.
`)
}

export default {
  NEO4J_PROTOCOL,
  NEO4J_HOST,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
  NEO4J_PORT,
  NEO4J_DATABASE,
  NEO4J_ENCRYPTED
}
