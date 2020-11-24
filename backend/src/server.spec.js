import { InMemoryNewsDS } from './db'
import NewsServer from './server'
import { createTestClient } from 'apollo-server-testing'
import { gql } from 'apollo-server-core'
import { GraphQLError } from 'graphql'

let db = new InMemoryNewsDS()
beforeEach(() => {
  db = new InMemoryNewsDS()
})
const server = new NewsServer({ dataSources: () => ({ db }) })

const { query, mutate } = createTestClient(server)

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

describe('mutations', () => {
  describe('createPost', () => {
    const createPostMutation = (title, author) => mutate({
      mutation: gql`
          mutation {
              createPost(post: {
                  title: "${title}"
                  author: {
                      name: "${author}"
                  }
              }) {
                  title
                  votes
                  author {
                      name
                  }
              }
          }
      `
    })

    it('calls createPost', async () => {
      db.createPost = jest.fn(() => {
      })
      await createPostMutation('A nice test title', 'Jonas')
      expect(db.createPost).toHaveBeenNthCalledWith(1, 'A nice test title', 0, 'Jonas')
    })

    it('returns an error if there\'s no author with the given name', async () => {
      await expect(createPostMutation('Some title', 'Some author'))
        .resolves
        .toMatchObject({
          // TODO: Get rid of hardcoded error message
          errors: [new GraphQLError('User with name Some author does not exist!')],
          data: {
            createPost: null
          }
        })
    })

    it('returns created posts with valid authors given', async () => {
      db.createUser('Jonas')
      db.createUser('Michelle')

      await expect(createPostMutation('A nice test title', 'Jonas'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            createPost: {
              title: 'A nice test title',
              votes: 0,
              author: {
                name: 'Jonas'
              }
            }
          }
        })

      await expect(createPostMutation('New news', 'Michelle'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            createPost: {
              title: 'New news',
              votes: 0,
              author: {
                name: 'Michelle'
              }
            }
          }
        })
    })
  })

  describe('deletePost', () => {
    const deletePostMutation = (id) => mutate({
      mutation: gql`
          mutation {
              deletePost(id: "${id}") {
                  title
                  votes
                  author {
                      name
                      posts {
                          title
                          votes
                      }
                  }
              }
          }`
    })

    it('calls deletePost', async () => {
      db.deletePost = jest.fn(() => {
      })
      await deletePostMutation(1234)
      expect(db.deletePost).toHaveBeenNthCalledWith(1, '1234')
    })

    it('returns an error if there\'s no post with the given ID', async () => {
      await (expect(deletePostMutation(0)))
        .resolves
        .toMatchObject({
          errors: [new GraphQLError('No post found for ID 0!')],
          data: {
            deletePost: null
          }
        })
    })

    it('returns properly deleted posts', async () => {
      db.createUser('TestUser')
      db.createPost('Hot news', 99, 'TestUser')

      await expect(deletePostMutation(0))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            deletePost: {
              title: 'Hot news',
              votes: 99,
              author: {
                name: 'TestUser',
                posts: []
              }
            }
          }
        })

      await (expect(deletePostMutation(0)))
        .resolves
        .toMatchObject({
          errors: [new GraphQLError('No post found for ID 0!')],
          data: {
            deletePost: null
          }
        })
    })
  })
})
