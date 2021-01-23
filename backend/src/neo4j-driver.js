import neo4j from 'neo4j-driver'
import { NEO4J_ENCRYPTED, NEO4J_HOST, NEO4J_PASSWORD, NEO4J_PORT, NEO4J_PROTOCOL, NEO4J_USERNAME } from './config'

export default neo4j.driver(
  `${NEO4J_PROTOCOL}://${NEO4J_HOST}:${NEO4J_PORT}`,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
  {
    encrypted: NEO4J_ENCRYPTED
  }
)
