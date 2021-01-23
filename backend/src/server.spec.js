import NewsServer from './server'
import { createTestClient } from 'apollo-server-testing'
import { gql } from 'apollo-server-core'
import bcrypt from 'bcrypt'
import { NotAuthorisedError } from './authorisation'
import { DeletionOfOtherUsersPostForbiddenError, InvalidPasswordError, TooShortPasswordError } from './resolvers'
import { EmailAlreadyExistsError, PostIdNotFoundError, UserEmailNotFoundError } from './dsErrors'
import { NeodeDS } from './NeodeDS'
import neo4jDriver from './neo4j-driver'

function hashPassword (password) {
  return bcrypt.hashSync(password, 1)
}

let db = null
let context = null

async function cleanDB () {
  if (db) await db.neode.close()
  db = new NeodeDS() // to revert mocks
  await db.neode.writeCypher('MATCH(n) DETACH DELETE n')
}

beforeAll(cleanDB)
beforeEach(async () => {
  context = {
    getUserAuthenticationToken: null,
    userId: null
  }
  await cleanDB()
})
afterAll(async () => {
  await cleanDB()
  await db.neode.close()
  await neo4jDriver.close()
})

async function getPostCount () {
  const { records: [countRecord] } = await db.neode.cypher('MATCH (p:Post) RETURN COUNT(p) AS count')
  return countRecord.get('count').toNumber()
}

const server = new NewsServer({
  dataSources: () => ({ db }),
  context: ({ _ }) => ({
    getUserAuthenticationToken: () => context.getUserAuthenticationToken,
    userId: context.userId,
    driver: neo4jDriver
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
        const jonasId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        const michellesId = await db.createUser('Michelle', 'm@m.de', hashPassword('MichellesPassword'))

        const { id: firstId } = await db.createPost('This is a post!', jonasId)
        const { id: secondId } = await db.createPost('This is another post!', jonasId)
        const { id: thirdId } = await db.createPost('This is yet another post!', michellesId)

        await expect(postsQuery())
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              posts: expect.arrayContaining([
                {
                  id: firstId,
                  title: 'This is a post!',
                  votes: 0,
                  author: {
                    name: 'Jonas',
                    posts: expect.arrayContaining([
                      {
                        id: firstId,
                        author: { name: 'Jonas' }
                      },
                      {
                        id: secondId,
                        author: { name: 'Jonas' }
                      }
                    ])
                  }
                },
                {
                  id: secondId,
                  title: 'This is another post!',
                  votes: 0,
                  author: {
                    name: 'Jonas',
                    posts: expect.arrayContaining([
                      {
                        id: firstId,
                        author: { name: 'Jonas' }
                      },
                      {
                        id: secondId,
                        author: { name: 'Jonas' }
                      }
                    ])
                  }
                },
                {
                  id: thirdId,
                  title: 'This is yet another post!',
                  votes: 0,
                  author: {
                    name: 'Michelle',
                    posts: [
                      {
                        id: thirdId,
                        author: { name: 'Michelle' }
                      }
                    ]
                  }
                }
              ])
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
      describe('given users in the DB', () => {
        it('returns users in the expected format', async () => {
          const jonasId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
          const michellesId = await db.createUser('Michelle', 'm@m.de', hashPassword('MichellesPassword'))

          const { id: firstId } = await db.createPost('This is a post!', jonasId)
          const { id: secondId } = await db.createPost('This is another post!', jonasId)
          const { id: thirdId } = await db.createPost('This is yet another post!', michellesId)

          context.userId = jonasId

          await expect(usersQuery())
            .resolves
            .toMatchObject({
              errors: undefined,
              data: {
                users: expect.arrayContaining([
                  {
                    id: jonasId,
                    name: 'Jonas',
                    email: 'j@j.de',
                    posts: expect.arrayContaining([
                      {
                        id: firstId,
                        author: { name: 'Jonas' }
                      },
                      {
                        id: secondId,
                        author: { name: 'Jonas' }
                      }
                    ])
                  },
                  {
                    id: michellesId,
                    name: 'Michelle',
                    email: null,
                    posts: expect.arrayContaining([
                      {
                        id: thirdId,
                        author: { name: 'Michelle' }
                      }
                    ])
                  }
                ])
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
        context.userId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        db.createPost = jest.fn(() => {
        })
        await createPostMutation('A nice test title', context.userId)
        expect(db.createPost).toHaveBeenNthCalledWith(1, 'A nice test title', context.userId)
      })

      it('created posts in the DB with author inferred from the context', async () => {
        context.userId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        expect(await getPostCount()).toBe(0)
        await createPostMutation('Some news')
        expect(await getPostCount()).toBe(1)
        await createPostMutation('Some other news')
        expect(await getPostCount()).toBe(2)
      })

      it('returns created posts with valid authors inferred from the context', async () => {
        const jonasId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        const michelleId = await db.createUser('Michelle', 'm@m.de', hashPassword('someOtherPassword'))

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
        context.userId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        const {
          data,
          errors: [error]
        } = await deletePostMutation(0)
        expect(data).toBeNull()
        expect(error.message).toEqual(new PostIdNotFoundError(0).message)
      })

      describe('if the inferred userId is not the author of the post to delete', () => {
        it('returns an error', async () => {
          const jonasId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
          const michellesId = await db.createUser('Michelle', 'm@m.de', hashPassword('MichellesPassword'))

          const { id } = await db.createPost('Some news', michellesId)

          context.userId = jonasId

          const {
            data,
            errors: [error]
          } = await deletePostMutation(id)
          expect(data).toBeNull()
          expect(error.message).toEqual(new DeletionOfOtherUsersPostForbiddenError().message)
        })
      })

      describe('if the inferred userId is the author of the post to delete', () => {
        it('calls deletePost', async () => {
          const jonasId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
          const { id } = await db.createPost('Some news', jonasId)
          context.userId = jonasId

          db.deletePost = jest.fn(() => {
          })
          await deletePostMutation(id)
          expect(db.deletePost).toHaveBeenNthCalledWith(1, id)
        })

        it('deletes posts in the DB', async () => {
          const jonasId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
          const { id } = await db.createPost('Some news', jonasId)
          context.userId = jonasId

          const { errors } = await deletePostMutation(id)
          expect(errors).toBeUndefined()
          expect(await getPostCount()).toBe(0)
        })

        it('returns properly deleted posts', async () => {
          const jonasId = await db.createUser('TestUser', 't@t.de', hashPassword('somePassword'))
          const { id } = await db.createPost('Hot news', jonasId)

          context.userId = jonasId

          await expect(deletePostMutation(id))
            .resolves
            .toMatchObject({
              errors: undefined,
              data: {
                deletePost: {
                  title: 'Hot news',
                  votes: 0,
                  author: {
                    name: 'TestUser',
                    posts: [
                      {
                        title: 'Hot news', // TODO: Should this show up?
                        votes: 0
                      }
                    ]
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
        context.userId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        db.upvotePost = jest.fn(() => {
        })
        await upvotePostMutation(1234)
        expect(db.upvotePost).toHaveBeenNthCalledWith(1, '1234', context.userId)
      })

      it('returns an error if there\'s no post with the given ID', async () => {
        context.userId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))

        const {
          data,
          errors: [error]
        } = await upvotePostMutation(0)
        expect(data).toBeNull()
        expect(error.message).toEqual(new PostIdNotFoundError(0).message)
      })

      it('returns proper vote counts for upvoted posts', async () => {
        const testId = await db.createUser('TestUser', 't@t.de', hashPassword('somePassword'))
        const michellesId = await db.createUser('Michelle', 'm@m.de', hashPassword('someOtherPassword'))

        const { id: firstId } = await db.createPost('Hot news', testId)
        const { id: secondId } = await db.createPost('Hot new news', testId)
        await db.downvotePost(secondId, michellesId) // 0 -> -1 votes

        context.userId = michellesId
        await expect(upvotePostMutation(firstId))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              upvotePost: {
                id: firstId,
                title: 'Hot news',
                votes: 1
              }
            }
          })

        // double upvote doesn't add a vote
        await expect(upvotePostMutation(firstId))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              upvotePost: {
                id: firstId,
                title: 'Hot news',
                votes: 1
              }
            }
          })

        context.userId = testId
        await expect(upvotePostMutation(firstId))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              upvotePost: {
                id: firstId,
                title: 'Hot news',
                votes: 2
              }
            }
          })

        context.userId = michellesId
        // downvote to upvote: +2 votes
        await expect(upvotePostMutation(secondId))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              upvotePost: {
                id: secondId,
                title: 'Hot new news',
                votes: 1
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
        context.userId = await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
        db.downvotePost = jest.fn(() => {
        })
        await downvotePostMutation(1234)
        expect(db.downvotePost).toHaveBeenNthCalledWith(1, '1234', context.userId)
      })

      it('returns an error if there\'s no post with the given ID', async () => {
        context.userId = await db.createUser('Jonas', 't@t.de', hashPassword('somePassword'))

        const {
          data,
          errors: [error]
        } = await downvotePostMutation(0)
        expect(data).toBeNull()
        expect(error.message).toEqual(new PostIdNotFoundError(0).message)
      })

      it('returns proper vote counts for upvoted posts', async () => {
        const testId = await db.createUser('TestUser', 't@t.de', hashPassword('somePassword'))
        const michellesId = await db.createUser('Michelle', 'm@m.de', hashPassword('someOtherPassword'))

        const { id: firstId } = await db.createPost('Hot news', testId)
        const { id: secondId } = await db.createPost('Hot new news', testId)
        await db.upvotePost(secondId, testId) // 0 -> 1 votes

        context.userId = michellesId
        await expect(downvotePostMutation(firstId))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              downvotePost: {
                id: firstId,
                title: 'Hot news',
                votes: -1
              }
            }
          })

        // double downvote doesn't remove a vote
        await expect(downvotePostMutation(firstId))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              downvotePost: {
                id: firstId,
                title: 'Hot news',
                votes: -1
              }
            }
          })

        context.userId = testId
        await expect(downvotePostMutation(firstId))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              downvotePost: {
                id: firstId,
                title: 'Hot news',
                votes: -2
              }
            }
          })

        // upvote to downvote: -2 votes
        await expect(downvotePostMutation(secondId))
          .resolves
          .toMatchObject({
            errors: undefined,
            data: {
              downvotePost: {
                id: secondId,
                title: 'Hot new news',
                votes: -1
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
      context.getUserAuthenticationToken = 'someToken'
      db.createUser = jest.fn(() => [])

      await expect(signupMutation('TestUser', 't@t.de', 'someLongEnoughPassword'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            signup: 'someToken'
          }
        })
      expect(db.createUser).toHaveBeenNthCalledWith(1, 'TestUser', 't@t.de', expect.stringMatching(/.+/))
    })

    it('does not store the password as-is in the DB', async () => {
      context.getUserAuthenticationToken = 'someToken'

      await expect(signupMutation('TestUser', 't@t.de', 'someLongEnoughPassword'))
        .resolves
        .toMatchObject({
          errors: undefined,
          data: {
            signup: 'someToken'
          }
        })
      const { records: [userRecord] } = await db.neode.cypher('MATCH (u:User) RETURN u')
      const properties = userRecord.get('u').properties
      expect(properties.name).toBe('TestUser')
      expect(Object.values(properties)).not.toContain('someLongEnoughPassword')
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
      expect(error.message).toBe(new EmailAlreadyExistsError('t@t.de').message)
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
      await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))

      const {
        data,
        errors: [error]
      } = await loginMutation('j@j.de', 'someWrongPassword')
      expect(data).toBeNull()
      expect(error.message).toBe(new InvalidPasswordError().message)
    })

    it('returns a token on successful login', async () => {
      await db.createUser('Jonas', 'j@j.de', hashPassword('somePassword'))
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
