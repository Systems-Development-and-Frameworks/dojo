import { InMemoryNewsDS } from './db'
import NewsServer from './server'
import { createTestClient } from 'apollo-server-testing'
import { gql } from 'apollo-server-core'

let db = new InMemoryNewsDS()
beforeEach(() => {
  db = new InMemoryNewsDS()
})
const server = new NewsServer({ dataSources: () => ({ db }) })

const { query } = createTestClient(server)

describe('queries', () => {
  describe('posts', () => {
    const postsQuery = () => query({
      query: gql`
          query {
              posts {
                  id
                  title
                  votes
                  author {
                      name
                      posts {
                          id
                          author {
                              name
                          }
                      }
                  }
              }
          }
      `
    })

    it('calls getPosts', async () => {
      db.getPosts = jest.fn(() => [])
      await postsQuery()
      expect(db.getPosts).toHaveBeenCalledTimes(1)
    })

    it('returns empty array on empty DB', async () => {
      await expect(postsQuery())
        .resolves
        .toMatchObject({
          errors: undefined,
          data: { posts: [] }
        })
    })

    describe('given posts in the DB', () => {
      it('returns posts in the expected format', async () => {
        db.createUser('Jonas')
        db.createUser('Michelle')
        db.createPost('This is a post!', 42, 'Jonas')
        db.createPost('This is another post!', 1337, 'Jonas')
        db.createPost('This is yet another post!', 1234, 'Michelle')

        await expect(postsQuery())
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              posts: [
                {
                  id: '0',
                  title: 'This is a post!',
                  votes: 42,
                  author: {
                    name: 'Jonas',
                    posts: [
                      {
                        id: '0',
                        author: { name: 'Jonas' }
                      },
                      {
                        id: '1',
                        author: { name: 'Jonas' }
                      }
                    ]
                  }
                },
                {
                  id: '1',
                  title: 'This is another post!',
                  votes: 1337,
                  author: {
                    name: 'Jonas',
                    posts: [
                      {
                        id: '0',
                        author: { name: 'Jonas' }
                      },
                      {
                        id: '1',
                        author: { name: 'Jonas' }
                      }
                    ]
                  }
                },
                {
                  id: '2',
                  title: 'This is yet another post!',
                  votes: 1234,
                  author: {
                    name: 'Michelle',
                    posts: [
                      {
                        id: '2',
                        author: { name: 'Michelle' }
                      }
                    ]
                  }
                }
              ]
            }
          })
      })
    })
  })

  describe('users', () => {
    const usersQuery = () => query({
      query: gql`
          query {
              users {
                  name
                  posts {
                      id
                      author {
                          name
                      }
                  }
              }
          }
      `
    })

    it('calls getUsers', async () => {
      db.getUsers = jest.fn(() => [])
      await usersQuery()
      expect(db.getUsers).toHaveBeenCalledTimes(1)
    })

    it('returns empty array on empty DB', async () => {
      await expect(usersQuery())
        .resolves
        .toMatchObject({
          errors: undefined,
          data: { users: [] }
        })
    })

    describe('given users in the DB', () => {
      it('returns users in the expected format', async () => {
        db.createUser('Jonas')
        db.createUser('Michelle')
        db.createPost('This is a post!', 42, 'Jonas')
        db.createPost('This is another post!', 1337, 'Jonas')
        db.createPost('This is yet another post!', 1234, 'Michelle')

        await expect(usersQuery())
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              users: [
                {
                  name: 'Jonas',
                  posts: [
                    {
                      id: '0',
                      author: { name: 'Jonas' }
                    },
                    {
                      id: '1',
                      author: { name: 'Jonas' }
                    }
                  ]
                },
                {
                  name: 'Michelle',
                  posts: [
                    {
                      id: '2',
                      author: { name: 'Michelle' }
                    }
                  ]
                }
              ]
            }
          })
      })
    })
  })
})
