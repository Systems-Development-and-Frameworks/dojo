import { EmailAlreadyExistsError, InMemoryNewsDS, PostIdNotFoundError, UserEmailNotFoundError } from './db'
import NewsServer from './server'
import { createTestClient } from 'apollo-server-testing'
import { gql } from 'apollo-server-core'
import bcrypt from 'bcrypt'
import { NotAuthorisedError } from './authorisation'
import { DeletionOfOtherUsersPostForbiddenError, InvalidPasswordError, TooShortPasswordError } from './resolvers'

function hashPassword (password) {
  return bcrypt.hashSync(password, 1)
}

let db = null
beforeEach(() => {
  db = new InMemoryNewsDS()
})

const context = {
  getUserAuthenticationToken: null,
  userId: 0
}

const server = new NewsServer({
  dataSources: () => ({ db }),
  context: ({ _ }) => ({
    getUserAuthenticationToken: () => context.getUserAuthenticationToken,
    userId: context.userId
  })
})

const {
  query,
  mutate
} = createTestClient(server)

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
        const jonasId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        const michellesId = db.createUser('Michelle', 'm@m.de', hashPassword('MichellesPassword'))

        db.createPost('This is a post!', 42, jonasId)
        db.createPost('This is another post!', 1337, jonasId)
        db.createPost('This is yet another post!', 1234, michellesId)

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
                  id
                  name
                  email
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

    describe('for unauthenticated users', () => {
      it('does not call getUsers', async () => {
        db.getUsers = jest.fn(() => [])
        await usersQuery()
        expect(db.getUsers).toHaveBeenCalledTimes(0)
      })

      it('returns an error', async () => {
        const {
          data,
          errors: [error]
        } = await usersQuery()

        expect(data).toBeNull()
        expect(error.message).toEqual(new NotAuthorisedError().message)
      })
    })

    describe('for authenticated users', () => {
      it('calls getUsers', async () => {
        context.userId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        db.getUsers = jest.fn(() => [])
        await usersQuery()
        expect(db.getUsers).toHaveBeenCalledTimes(1)
      })

      describe('given users in the DB', () => {
        it('returns users in the expected format', async () => {
          const jonasId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
          const michellesId = db.createUser('Michelle', 'm@m.de', hashPassword('MichellesPassword'))

          db.createPost('This is a post!', 42, jonasId)
          db.createPost('This is another post!', 1337, jonasId)
          db.createPost('This is yet another post!', 1234, michellesId)

          context.userId = jonasId

          await expect(usersQuery())
            .resolves
            .toMatchObject({
              errors: undefined,
              data: {
                users: [
                  {
                    id: '0',
                    name: 'Jonas',
                    email: 'j@j.de',
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
                    id: '1',
                    name: 'Michelle',
                    email: '',
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
})

describe('mutations', () => {
  describe('createPost', () => {
    const createPostMutation = (title) => mutate({
      mutation: gql`
          mutation {
              createPost(post: {
                  title: "${title}"
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
    describe('for unauthenticated users', () => {
      it('does not call createPost', async () => {
        db.createPost = jest.fn(() => {
        })
        await createPostMutation('A nice test title')
        expect(db.createPost).toHaveBeenCalledTimes(0)
      })

      it('returns an error', async () => {
        const {
          data,
          errors: [error]
        } = await createPostMutation('A nice test title')

        expect(data).toBeNull()
        expect(error.message).toEqual(new NotAuthorisedError().message)
      })
    })

    describe('for authenticated users', () => {
      it('calls createPost and derives the userId from the context', async () => {
        context.userId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        db.createPost = jest.fn(() => {
        })
        await createPostMutation('A nice test title', context.userId)
        expect(db.createPost).toHaveBeenNthCalledWith(1, 'A nice test title', 0, context.userId)
      })

      it('created posts in the DB with author inferred from the context', async () => {
        context.userId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        expect(db.posts.size).toBe(0)
        await createPostMutation('Some news')
        expect(db.posts.size).toBe(1)
        await createPostMutation('Some other news')
        expect(db.posts.size).toBe(2)
      })

      it('returns created posts with valid authors inferred from the context', async () => {
        const jonasId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        const michelleId = db.createUser('Michelle', 'm@m.de', hashPassword('someOtherPassword'))

        context.userId = jonasId
        await expect(createPostMutation('A nice test title'))
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

        context.userId = michelleId
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

    describe('for unauthenticated users', () => {
      it('does not call deletePost', async () => {
        db.deletePost = jest.fn(() => [])
        await deletePostMutation(0)
        expect(db.deletePost).toHaveBeenCalledTimes(0)
      })

      it('returns an error', async () => {
        const {
          data,
          errors: [error]
        } = await deletePostMutation(0)

        expect(data).toEqual(null)
        expect(error.message).toEqual(new NotAuthorisedError().message)
      })
    })

    describe('for authenticated users', () => {
      it('returns an error if there\'s no post with the given ID', async () => {
        context.userId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        const {
          data,
          errors: [error]
        } = await deletePostMutation(0)
        expect(data).toBeNull()
        expect(error.message).toEqual(new PostIdNotFoundError(0).message)
      })

      describe('if the inferred userId is not the author of the post to delete', () => {
        it('returns an error', async () => {
          const jonasId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
          const michellesId = db.createUser('Michelle', 'm@m.de', hashPassword('MichellesPassword'))

          db.createPost('Some news', 123, michellesId)

          context.userId = jonasId

          const {
            data,
            errors: [error]
          } = await deletePostMutation(0)
          expect(data).toBeNull()
          expect(error.message).toEqual(new DeletionOfOtherUsersPostForbiddenError().message)
        })
      })

      describe('if the inferred userId is the author of the post to delete', () => {
        it('calls deletePost', async () => {
          const jonasId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
          db.createPost('Some news', 123, jonasId)
          context.userId = jonasId

          db.deletePost = jest.fn(() => {
          })
          await deletePostMutation(0)
          expect(db.deletePost).toHaveBeenNthCalledWith(1, '0')
        })

        it('deletes posts in the DB', async () => {
          const jonasId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
          db.createPost('Some news', 123, jonasId)
          context.userId = jonasId

          const { errors } = await deletePostMutation(0)
          expect(errors).toBeUndefined()
          expect(db.getPosts()).toHaveLength(0)
          expect([...db.getUsers()[0].posts.values()]).toHaveLength(0)
        })

        it('returns properly deleted posts', async () => {
          const jonasId = db.createUser('TestUser', 't@t.de', hashPassword('somePassword'))
          db.createPost('Hot news', 99, jonasId)

          context.userId = jonasId

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
          expect(data).toBeNull()
          expect(error.message).toEqual('No post found for ID 0!')
        })
      })
    })
  })

  describe('upvotePost', () => {
    const upvotePostMutation = (id) => mutate({
      mutation: gql`
          mutation {
              upvotePost(
                  id: "${id}"
              ) {
                  id,
                  title,
                  votes
              }
          }`
    })

    describe('for unauthenticated users', () => {
      it('does not call upvotePost', async () => {
        db.upvotePost = jest.fn(() => {
        })
        await upvotePostMutation(0)
        expect(db.upvotePost).toHaveBeenCalledTimes(0)
      })

      it('returns an error', async () => {
        const {
          data,
          errors: [error]
        } = await upvotePostMutation(0)

        expect(data).toBeNull()
        expect(error.message).toEqual(new NotAuthorisedError().message)
      })
    })

    describe('for authenticated users', () => {
      it('calls upvotePost', async () => {
        context.userId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        db.upvotePost = jest.fn(() => {
        })
        await upvotePostMutation(1234)
        expect(db.upvotePost).toHaveBeenNthCalledWith(1, '1234', context.userId)
      })

      it('returns an error if there\'s no post with the given ID', async () => {
        context.userId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))

        const {
          data,
          errors: [error]
        } = await upvotePostMutation(0)
        expect(data).toBeNull()
        expect(error.message).toEqual(new PostIdNotFoundError(0).message)
      })

      it('returns proper vote counts for upvoted posts', async () => {
        const testId = db.createUser('TestUser', 't@t.de', hashPassword('somePassword'))
        const michellesId = db.createUser('Michelle', 'm@m.de', hashPassword('someOtherPassword'))

        db.createPost('Hot news', -99, testId)
        db.createPost('Hot new news', 99, testId)
        db.downvotePost('1', michellesId) // 99 -> 98 votes

        context.userId = michellesId
        await expect(upvotePostMutation(0))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              upvotePost: {
                id: '0',
                title: 'Hot news',
                votes: -98
              }
            }
          })

        // double upvote doesn't add a vote
        await expect(upvotePostMutation(0))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              upvotePost: {
                id: '0',
                title: 'Hot news',
                votes: -98
              }
            }
          })

        context.userId = testId
        await expect(upvotePostMutation(0))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              upvotePost: {
                id: '0',
                title: 'Hot news',
                votes: -97
              }
            }
          })

        context.userId = michellesId
        // downvote to upvote: +2 votes
        await expect(upvotePostMutation(1))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              upvotePost: {
                id: '1',
                title: 'Hot new news',
                votes: 100
              }
            }
          })
      })
    })
  })

  describe('downvotePost', () => {
    const downvotePostMutation = (id) => mutate({
      mutation: gql`
          mutation {
              downvotePost(
                  id: "${id}"
              ) {
                  id,
                  title,
                  votes
              }
          }`
    })

    describe('for unauthenticated users', () => {
      it('does not call downvotePost', async () => {
        db.downvotePost = jest.fn(() => {
        })
        await downvotePostMutation(0)
        expect(db.downvotePost).toHaveBeenCalledTimes(0)
      })

      it('returns an error', async () => {
        const {
          data,
          errors: [error]
        } = await downvotePostMutation(0)

        expect(data).toBeNull()
        expect(error.message).toEqual(new NotAuthorisedError().message)
      })
    })

    describe('for authenticated users', () => {
      it('calls downvotePost', async () => {
        context.userId = db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        db.downvotePost = jest.fn(() => {
        })
        await downvotePostMutation(1234)
        expect(db.downvotePost).toHaveBeenNthCalledWith(1, '1234', context.userId)
      })

      it('returns an error if there\'s no post with the given ID', async () => {
        db.createUser('Jonas')

        const {
          data,
          errors: [error]
        } = await downvotePostMutation(0)
        expect(data).toBeNull()
        expect(error.message).toEqual(new PostIdNotFoundError(0).message)
      })

      it('returns proper vote counts for upvoted posts', async () => {
        const testId = db.createUser('TestUser', 't@t.de', hashPassword('somePassword'))
        const michellesId = db.createUser('Michelle', 'm@m.de', hashPassword('someOtherPassword'))

        db.createPost('Hot news', -99, testId)
        db.createPost('Hot new news', 99, testId)
        db.upvotePost('1', michellesId) // 99 -> 100 votes

        context.userId = michellesId
        await expect(downvotePostMutation(0))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              downvotePost: {
                id: '0',
                title: 'Hot news',
                votes: -100
              }
            }
          })

        // double downvote doesn't remove a vote
        await expect(downvotePostMutation(0))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              downvotePost: {
                id: '0',
                title: 'Hot news',
                votes: -100
              }
            }
          })

        context.userId = testId
        await expect(downvotePostMutation(0))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              downvotePost: {
                id: '0',
                title: 'Hot news',
                votes: -101
              }
            }
          })

        // downvote to upvote: -2 votes
        await expect(downvotePostMutation(1))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              downvotePost: {
                id: '1',
                title: 'Hot new news',
                votes: 99
              }
            }
          })
      })
    })
  })

  describe('signup', () => {
    const signupMutation = (name, email, password) => mutate({
      mutation: gql`
          mutation {
              signup(
                  name: "${name}"
                  email: "${email}"
                  password: "${password}"
              )
          }`
    })

    it('disallows password of length under 8 characters', async () => {
      for (const password of ['s', 'om', 'e u', 'nacc', 'eptab', 'le pas', 'swords!']) {
        const {
          data,
          errors: [error]
        } = await signupMutation('TestUser', 't@t.de', password)

        expect(data).toBeNull()
        expect(error.message).toBe(new TooShortPasswordError().message)
      }
    })

    it('calls createUser', async () => {
      db.createUser = jest.fn(() => [])
      await (signupMutation('TestUser', 't@t.de', 'someLongEnoughPassword'))
      expect(db.createUser).toHaveBeenNthCalledWith(1, 'TestUser', 't@t.de', expect.stringMatching(/.+/))
    })

    it('does not store the password as-is in the DB', async () => {
      await (signupMutation('TestUser', 't@t.de', 'someLongEnoughPassword'))
      expect(db.getUsers()[0].password).not.toBe('someLongEnoughPassword')
    })

    it('returns a token on successful signup', async () => {
      context.getUserAuthenticationToken = 'someToken'

      await expect(signupMutation('TestUser', 't@t.de', 'someLongEnoughPassword'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            signup: 'someToken'
          }
        })
    })

    it('disallows signing up with an already signed-up email', async () => {
      context.getUserAuthenticationToken = 'someToken'

      await expect(signupMutation('TestUser', 't@t.de', 'someLongEnoughPassword'))
        .resolves
        .toMatchObject({
          errors: undefined
        })

      const {
        data,
        errors: [error]
      } = await signupMutation('TestUser', 't@t.de', 'someLongEnoughPassword')
      expect(data).toBeNull()
      expect(error.message).toBe(new EmailAlreadyExistsError().message)
    })
  })

  describe('login', () => {
    const loginMutation = (email, password) => mutate({
      mutation: gql`
          mutation {
              login(
                  email: "${email}"
                  password: "${password}"
              )
          }`
    })
    it('returns an error if no user with the provided email exists', async () => {
      const {
        data,
        errors: [error]
      } = await loginMutation('t@t.de', 'someLongEnoughPassword')
      expect(data).toBeNull()
      expect(error.message).toBe(new UserEmailNotFoundError('t@t.de').message)
    })

    it('returns an error if an invalid password was provided', async () => {
      db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))

      const {
        data,
        errors: [error]
      } = await loginMutation('j@j.de', 'someWrongPassword')
      expect(data).toBeNull()
      expect(error.message).toBe(new InvalidPasswordError().message)
    })

    it('returns a token on successful login', async () => {
      db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
      context.getUserAuthenticationToken = 'someToken'

      await expect(loginMutation('j@j.de', 'somePassword'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            login: 'someToken'
          }
        })
    })
  })
})
