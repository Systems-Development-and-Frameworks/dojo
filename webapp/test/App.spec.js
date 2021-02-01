import '@testing-library/jest-dom'
import 'regenerator-runtime'

import { createLocalVue, shallowMount } from '@vue/test-utils'

import VueApollo from 'vue-apollo'
import { createMockClient } from 'mock-apollo-client'
import posts from '../apollo/queries/posts'
import deletePost from '../apollo/mutations/deletePost'
import createPost from '../apollo/mutations/createPost'

import Vuex from 'vuex'

import App from '../pages'
import { actions, getters, mutations, state } from '@/store/auth'
import { InMemoryCache } from '@apollo/client'

describe('News List', () => {
  const localVue = createLocalVue()
  localVue.use(VueApollo)
  localVue.use(Vuex)

  let wrapper, mockClient, apolloProvider, store

  const typePolicies = {
    Query: {
      fields: {
        posts: {
          merge (existing, incoming) {
            return incoming
          }
        }
      }
    }
  }

  const createApp = async (handlers, appOptions) => {
    mockClient = createMockClient({ cache: new InMemoryCache({ typePolicies }) })
    apolloProvider = new VueApollo({
      defaultClient: mockClient
    })

    const requestHandlers = {
      postsQueryHandler: jest.fn().mockResolvedValue({ data: { posts: [] } }),
      deletePostMutationHandler: null,
      createPostMutationHandler: null,
      ...handlers
    }
    mockClient.setRequestHandler(
      posts,
      requestHandlers.postsQueryHandler
    )
    mockClient.setRequestHandler(
      deletePost,
      requestHandlers.deletePostMutationHandler
    )
    mockClient.setRequestHandler(
      createPost,
      requestHandlers.createPostMutationHandler
    )

    store = new Vuex.Store({
      modules: {
        auth: {
          namespaced: true,
          state,
          getters,
          actions,
          mutations
        }
      }
    })

    wrapper = shallowMount(App, {
      localVue,
      apolloProvider,
      store,
      stubs: {
        BasicButton: true,
      },
      ...appOptions
    })
    await wrapper.vm.$nextTick()
  }

  afterEach(() => {
    wrapper.destroy()
    mockClient = null
    apolloProvider = null
    store = null
  })

  it('sets up apollo posts query', async () => {
    await createApp()
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.$apollo.queries.posts).toBeTruthy()
  })

  it('doesn\'t render items, given an empty initial list of items', async () => {
    await createApp()
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('#newslist').element).toBeEmptyDOMElement()
  })

  it('renders items, given initially set items', async () => {
    const posts = {
      data: {
        posts: [
          {
            id: '0',
            title: 'macOS',
            votes: 0,
            author: {
              id: '0'
            }
          },
          {
            id: '1',
            title: 'Linux',
            votes: 0,
            author: {
              id: '0'
            }
          },
          {
            id: '2',
            title: 'Windows',
            votes: 0,
            author: {
              id: '0'
            }
          }
        ]
      }
    }

    await createApp({ postsQueryHandler: jest.fn().mockResolvedValue(posts) })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.newslistitem')).toHaveLength(3)
  })

  it('renders items correctly upon removing a NewsItem', async () => {
    const posts = {
      data: {
        posts: [
          {
            id: '0',
            title: 'macOS',
            votes: 0,
            userVote: null,
            __typename: 'Post',
            author: {
              id: '0',
              __typename: 'User'
            }
          },
          {
            id: '1',
            title: 'Linux',
            votes: 1,
            userVote: null,
            __typename: 'Post',
            author: {
              id: '1',
              __typename: 'User'
            }
          }
        ]
      }
    }
    const deletePost = {
      data: {
        deletePost: {
          __typename: 'Post',
          id: '1'
        }
      }
    }

    await createApp({
      postsQueryHandler: jest.fn().mockResolvedValue(posts),
      deletePostMutationHandler: jest.fn().mockResolvedValue(deletePost)
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.newslistitem')).toHaveLength(2)

    await wrapper.vm.removeNewsListItem('1')

    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.newslistitem')).toHaveLength(1)
  })

  it('renders items correctly upon adding a NewsItem', async () => {
    const posts = {
      data: {
        posts: [
          {
            id: '0',
            title: 'macOS',
            votes: 0,
            userVote: null,
            __typename: 'Post',
            author: {
              id: '0',
              __typename: 'User'
            }
          }
        ]
      }
    }

    const createPost = {
      data: {
        createPost: {
          id: '1',
          title: 'Linux',
          votes: 1,
          userVote: null,
          __typename: 'Post',
          author: {
            id: '1',
            __typename: 'User'
          }
        }
      }
    }

    await createApp({
      postsQueryHandler: jest.fn().mockResolvedValue(posts),
      createPostMutationHandler: jest.fn().mockResolvedValue(createPost)
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.newslistitem')).toHaveLength(1)

    await wrapper.vm.createNewsListItem('Linux')

    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.newslistitem')).toHaveLength(2)
  })

  describe('List Empty Message', () => {
    it('appears on an initially empty list of NewsItems', async () => {
      await createApp()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('The list is empty :(')
    })

    it('doesn\'t appear on an initially non-empty list of NewsItems', async () => {
      const posts = {
        data: {
          posts: [
            {
              id: '0',
              title: 'macOS',
              votes: 0,
              author: {
                id: '0'
              }
            }
          ]
        }
      }

      await createApp({ postsQueryHandler: jest.fn().mockResolvedValue(posts) })
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('The list is empty :(')
    })

    it('is hidden upon non-empty list of NewsItems', async () => {
      const posts = {
        data: {
          posts: [
            {
              id: '0',
              title: 'macOS',
              votes: 0,
              userVote: null,
              __typename: 'Post',
              author: {
                id: '0',
                __typename: 'User',
              }
            }
          ]
        }
      }

      const createPost = {
        data: {
          createPost: {
            id: '1',
            title: 'Linux',
            votes: 1,
            userVote: null,
            __typename: 'Post',
            author: {
              id: '1',
              __typename: 'User'
            }
          }
        }
      }
      await createApp({
        postsQueryHandler: jest.fn().mockResolvedValue(posts),
        createPostMutationHandler: jest.fn().mockResolvedValue(createPost)
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('The list is empty :(')

      await wrapper.vm.createNewsListItem('Linux')

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('The list is empty :(')
    })

    it('is shown upon empty list of NewsItems', async () => {
      const posts = {
        data: {
          posts: [
            {
              id: '0',
              title: 'macOS',
              votes: 0,
              userVote: null,
              __typename: 'Post',
              author: {
                id: '0',
                __typename: 'User'
              }
            }
          ]
        }
      }

      const deletePost = {
        data: {
          deletePost: {
            __typename: 'Post',
            id: '0'
          }
        }
      }

      await createApp({
        postsQueryHandler: jest.fn().mockResolvedValue(posts),
        deletePostMutationHandler: jest.fn().mockResolvedValue(deletePost)
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('The list is empty :(')

      await wrapper.vm.removeNewsListItem('0')

      await wrapper.vm.$nextTick()

      expect(wrapper.html()).toContain('The list is empty :(')
    })
  })

  describe('Reverse Order Button', () => {
    function getActualNewsListItems (wrapper) {
      return wrapper.findAll('.newslistitem').wrappers
        .map(w => (
          {
            title: w.attributes('title'),
            votes: w.attributes('votes')
          }
        ))
    }

    it('reverses list order upon click from initial state _descending_', async () => {
      const posts = {
        data: {
          posts: [
            {
              id: '0',
              title: 'macOS',
              votes: 2,
              author: {
                id: '0'
              }
            },
            {
              id: '1',
              title: 'Linux',
              votes: 1,
              author: {
                id: '0'
              }
            },
            {
              id: '2',
              title: 'Windows',
              votes: 0,
              author: {
                id: '0'
              }
            }
          ]
        }
      }
      await createApp({ postsQueryHandler: jest.fn().mockResolvedValue(posts) })
      await wrapper.vm.$nextTick()

      let expectedNewslistItems = [
        {
          title: 'macOS',
          votes: '2'
        },
        {
          title: 'Linux',
          votes: '1'
        },
        {
          title: 'Windows',
          votes: '0'
        }
      ]

      let actualNewsListItems = wrapper.findAll('.newslistitem').wrappers
        .map(w => (
          {
            title: w.attributes('title'),
            votes: w.attributes('votes')
          }
        ))

      expect(actualNewsListItems).toEqual(expectedNewslistItems)

      await wrapper.find('#reverse-order-button').trigger('click')

      expectedNewslistItems = [
        {
          title: 'Windows',
          votes: '0'
        },
        {
          title: 'Linux',
          votes: '1'
        },
        {
          title: 'macOS',
          votes: '2'
        }
      ]
      actualNewsListItems = getActualNewsListItems(wrapper)

      expect(actualNewsListItems).toEqual(expectedNewslistItems)
    })

    it('reverses list order upon click from initial state _ascending_', async () => {
      const posts = {
        data: {
          posts: [
            {
              id: '0',
              title: 'macOS',
              votes: 2,
              author: {
                id: '0'
              }
            },
            {
              id: '1',
              title: 'Linux',
              votes: 1,
              author: {
                id: '0'
              }
            },
            {
              id: '2',
              title: 'Windows',
              votes: 0,
              author: {
                id: '0'
              }
            }
          ]
        }
      }
      await createApp(
        { postsQueryHandler: jest.fn().mockResolvedValue(posts) },
        {
          propsData: {
            initialDescendingOrder: false
          }
        }
      )
      await wrapper.vm.$nextTick()

      let expectedNewslistItems = [
        {
          title: 'Windows',
          votes: '0'
        },
        {
          title: 'Linux',
          votes: '1'
        },
        {
          title: 'macOS',
          votes: '2'
        }
      ]

      let actualNewsListItems = wrapper.findAll('.newslistitem').wrappers
        .map(w => (
          {
            title: w.attributes('title'),
            votes: w.attributes('votes')
          }
        ))

      expect(actualNewsListItems).toEqual(expectedNewslistItems)

      await wrapper.find('#reverse-order-button').trigger('click')

      expectedNewslistItems = [
        {
          title: 'macOS',
          votes: '2'
        },
        {
          title: 'Linux',
          votes: '1'
        },
        {
          title: 'Windows',
          votes: '0'
        }
      ]
      actualNewsListItems = getActualNewsListItems(wrapper)

      expect(actualNewsListItems).toEqual(expectedNewslistItems)

    })

    it('is not disabled on an initially non-empty list of NewsItems', async () => {
      const posts = {
        data: {
          posts: [
            {
              id: '0',
              title: 'macOS',
              votes: 0,
              author: {
                id: '0'
              }
            }
          ]
        }
      }

      await createApp({ postsQueryHandler: jest.fn().mockResolvedValue(posts) })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#reverse-order-button').element.hasAttribute('disabled')).toBeFalsy()
    })

    it('is disabled on an initially empty list of NewsItems', async () => {
      const posts = { data: { posts: [] } }

      await createApp({ postsQueryHandler: jest.fn().mockResolvedValue(posts) })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#reverse-order-button').element.hasAttribute('disabled')).toBeTruthy()
      expect(wrapper.find('#reverse-order-button').attributes('disabled')).toEqual('true')
    })

    it('is disabled upon empty list', async () => {
      const posts = {
        data: {
          posts: [
            {
              id: '0',
              title: 'macOS',
              votes: 0,
              userVote: null,
              __typename: 'Post',
              author: {
                id: '0',
                __typename: 'User',
              }
            }
          ]
        }
      }

      const deletePost = {
        data: {
          deletePost: {
            id: '0',
            __typename: 'Post',
          }
        }
      }

      await createApp({
        postsQueryHandler: jest.fn().mockResolvedValue(posts),
        deletePostMutationHandler: jest.fn().mockResolvedValue(deletePost)
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#reverse-order-button').element.hasAttribute('disabled')).not.toBeTruthy()
      expect(wrapper.find('#reverse-order-button').element.getAttribute('disabled')).not.toEqual('disabled')

      await wrapper.vm.removeNewsListItem('0')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#reverse-order-button').element.hasAttribute('disabled')).toBeTruthy()
      expect(wrapper.find('#reverse-order-button').element.getAttribute('disabled')).toEqual('true')
    })

    it('shows up again upon non-empty list', async () => {
      const posts = { data: { posts: [] } }

      const createPost = {
        data: {
          createPost: {
            id: '1',
            title: 'Linux',
            votes: 1,
            userVote: null,
            __typename: 'Post',
            author: {
              id: '1',
              __typename: 'User'
            }
          }
        }
      }
      await createApp({
        postsQueryHandler: jest.fn().mockResolvedValue(posts),
        createPostMutationHandler: jest.fn().mockResolvedValue(createPost)
      })

      expect(wrapper.find('#reverse-order-button').element.hasAttribute('disabled')).toBeTruthy()
      expect(wrapper.find('#reverse-order-button').element.getAttribute('disabled')).toEqual('true')

      await wrapper.vm.createNewsListItem('Linux')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#reverse-order-button').element.hasAttribute('disabled')).not.toBeTruthy()
      expect(wrapper.find('#reverse-order-button').element.getAttribute('disabled')).not.toEqual('true')
    })
  })
})
