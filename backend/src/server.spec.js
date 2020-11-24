import { InMemoryNewsDS } from './db'
import NewsServer from './server'
import { createTestClient } from 'apollo-server-testing'
import { gql } from 'apollo-server-core'

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
      const {
        data,
        errors: [error]
      } = await createPostMutation('Some title', 'Some author')

      expect(data).toMatchObject({ createPost: null })
      expect(error.message).toEqual('User with name Some author does not exist!')
    })

    it('created posts in the DB with valid authors given', async () => {
      db.createUser('Jonas')
      expect(db.posts.size).toBe(0)
      await createPostMutation('Some news', 'Jonas')
      expect(db.posts.size).toBe(1)
      await createPostMutation('Some other news', 'Jonas')
      expect(db.posts.size).toBe(2)
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
      const {
        data,
        errors: [error]
      } = await deletePostMutation(0)
      expect(data).toMatchObject({ deletePost: null })
      expect(error.message).toEqual('No post found for ID 0!')
    })

    it('deletes posts in the DB with valid authors given', async () => {
      db.createUser('Jonas')
      db.createPost('Some news', 123, 'Jonas')
      db.createPost('Some SAD FAKE news', 456, 'Jonas')
      expect(db.posts.size).toBe(2)
      await deletePostMutation(0)
      expect(db.posts.size).toBe(1)
      await deletePostMutation(1)
      expect(db.posts.size).toBe(0)
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

      const {
        data,
        errors: [error]
      } = await deletePostMutation(0)
      expect(data).toMatchObject({ deletePost: null })
      expect(error.message).toEqual('No post found for ID 0!')
    })
  })

  describe('upvotePost', () => {
    const upvotePostMutation = (id, voterName) => mutate({
      mutation: gql`
          mutation {
              upvotePost(
                  id: "${id}"
                  voter: {
                      name: "${voterName}"
                  }
              )
          }`
    })

    it('calls upvotePost', async () => {
      db.upvotePost = jest.fn(() => {
      })
      await upvotePostMutation(1234, 'Jonas')
      expect(db.upvotePost).toHaveBeenNthCalledWith(1, '1234', 'Jonas')
    })

    it('returns an error if there\'s no post with the given ID', async () => {
      db.createUser('Jonas')

      const {
        data,
        errors: [error]
      } = await upvotePostMutation(0, 'Jonas')
      expect(data).toBeNull()
      expect(error.message).toEqual('No post found for ID 0!')
    })

    it('returns an error if there\'s no user with the given name', async () => {
      db.createUser('TestUser')
      db.createPost('Hot news', 99, 'TestUser')

      const {
        data,
        errors: [error]
      } = await upvotePostMutation(0, 'Jonas')
      expect(data).toBeNull()
      expect(error.message).toEqual('No user found with name Jonas!')
    })

    it('returns proper vote counts for upvoted posts', async () => {
      db.createUser('TestUser')
      db.createUser('Michelle')
      db.createPost('Hot news', -99, 'TestUser')
      db.createPost('Hot new news', 99, 'TestUser')
      db.downvotePost('1', 'Michelle') // 99 -> 98 votes

      await expect(upvotePostMutation(0, 'Michelle'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            upvotePost: -98
          }
        })

      // double upvote doesn't add a vote
      await expect(upvotePostMutation(0, 'Michelle'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            upvotePost: -98
          }
        })

      await expect(upvotePostMutation(0, 'TestUser'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            upvotePost: -97
          }
        })

      // downvote to upvote: +2 votes
      await expect(upvotePostMutation(1, 'Michelle'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            upvotePost: 100
          }
        })
    })
  })

  describe('downvotePost', () => {
    const downvotePostMutation = (id, voterName) => mutate({
      mutation: gql`
          mutation {
              downvotePost(
                  id: "${id}"
                  voter: {
                      name: "${voterName}"
                  }
              )
          }`
    })

    it('calls downvotePost', async () => {
      db.downvotePost = jest.fn(() => {
      })
      await downvotePostMutation(1234, 'Jonas')
      expect(db.downvotePost).toHaveBeenNthCalledWith(1, '1234', 'Jonas')
    })

    it('returns an error if there\'s no post with the given ID', async () => {
      db.createUser('Jonas')

      const {
        data,
        errors: [error]
      } = await downvotePostMutation(0, 'Jonas')
      expect(data).toBeNull()
      expect(error.message).toEqual('No post found for ID 0!')
    })

    it('returns an error if there\'s no user with the given name', async () => {
      db.createUser('TestUser')
      db.createPost('Hot news', 99, 'TestUser')

      const {
        data,
        errors: [error]
      } = await downvotePostMutation(0, 'Jonas')
      expect(data).toBeNull()
      expect(error.message).toEqual('No user found with name Jonas!')
    })

    it('returns proper vote counts for upvoted posts', async () => {
      db.createUser('TestUser')
      db.createUser('Michelle')
      db.createPost('Hot news', -99, 'TestUser')
      db.createPost('Hot new news', 99, 'TestUser')
      db.upvotePost('1', 'Michelle') // 99 -> 100 votes

      await expect(downvotePostMutation(0, 'Michelle'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            downvotePost: -100
          }
        })

      // double downvote doesn't remove a vote
      await expect(downvotePostMutation(0, 'Michelle'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            downvotePost: -100
          }
        })

      await expect(downvotePostMutation(0, 'TestUser'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            downvotePost: -101
          }
        })

      // downvote to upvote: -2 votes
      await expect(downvotePostMutation(1, 'Michelle'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            downvotePost: 98
          }
        })
    })
  })
})
