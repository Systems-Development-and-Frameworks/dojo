import '@testing-library/jest-dom'
import 'regenerator-runtime'

import { createLocalVue, shallowMount } from '@vue/test-utils'

import VueApollo from 'vue-apollo'
import { createMockClient } from 'mock-apollo-client'
import login from '@/apollo/mutations/login'

import Vuex from 'vuex'

import LoginForm from '@/components/LoginForm'
import { actions, getters, mutations, state } from '@/store/auth'
import { InMemoryCache } from '@apollo/client'

import jwt_decode from 'jwt-decode'

jest.mock('jwt-decode')

describe('LoginForm', () => {
  const localVue = createLocalVue()
  localVue.use(VueApollo)
  localVue.use(Vuex)

  let wrapper, mockClient, apolloProvider, store

  const createLoginForm = async (handlers, appOptions) => {
    mockClient = createMockClient({ cache: new InMemoryCache() })
    apolloProvider = new VueApollo({
      defaultClient: mockClient
    })

    const requestHandlers = {
      loginHandler: null,
      ...handlers
    }
    mockClient.setRequestHandler(
      login,
      requestHandlers.loginHandler
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

    wrapper = shallowMount(LoginForm, {
      localVue,
      apolloProvider,
      store,
      stubs: {
        NuxtLink: true,
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

  describe('when no user is logged in', () => {
    it('should show the login form', async () => {
      await createLoginForm()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#form-login').element).not.toBeEmptyDOMElement()
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should only enable the submit button if both email and password are provided', async () => {
      await createLoginForm()
      await wrapper.vm.$nextTick()

      const loginButton = wrapper.find('input[value="Login"]').element

      expect(loginButton).toBeDisabled()

      wrapper.find('#input-email').setValue('someEmail@addr.es')
      await wrapper.vm.$nextTick()

      expect(loginButton).toBeDisabled()

      wrapper.find('#input-password').setValue('someSecret')
      await wrapper.vm.$nextTick()

      expect(loginButton).toBeEnabled()

      wrapper.find('#input-password').setValue('')
      await wrapper.vm.$nextTick()

      expect(loginButton).toBeDisabled()
    })
  })

  describe('on login', () => {
    jwt_decode.mockReturnValue({ userId: '1234' })

    const loginHandler = jest.fn().mockResolvedValue({ data: { login: 'someToken' } })

    let $router, $route, $apolloHelpers
    beforeEach(() => {
      $router = {
        push () {
        }
      }
      $route = { params: { returnPath: undefined } }
      $apolloHelpers = {
        onLogin: jest.fn()
      }
    })

    const login = async () => {
      wrapper.find('#input-email').setValue('someEmail@addr.es')
      wrapper.find('#input-password').setValue('someSecret')
      await wrapper.vm.$nextTick()

      await wrapper.find('#form-login').trigger('submit')
      await wrapper.vm.$nextTick()
    }

    it('should call onSubmit', async () => {
      await createLoginForm({ loginHandler }, {
        mocks: {
          $apolloHelpers,
          $router,
          $route
        }
      })
      await wrapper.vm.$nextTick()

      const spy = jest.spyOn(wrapper.vm, 'onSubmit')

      await login()

      expect(spy).toBeCalledTimes(1)
    })

    it('should send a login mutation with the email and password', async () => {
      await createLoginForm({ loginHandler }, {
        mocks: {
          $apolloHelpers,
          $router,
          $route
        }
      })
      await wrapper.vm.$nextTick()

      await login()

      expect(loginHandler).toHaveBeenNthCalledWith(1, {
        email: 'someEmail@addr.es',
        password: 'someSecret'
      })
    })

    describe('that succeeds', () => {
      it('should set the token and user id in the state', async () => {
        await createLoginForm({ loginHandler }, {
          mocks: {
            $apolloHelpers,
            $router,
            $route
          }
        })
        await wrapper.vm.$nextTick()

        await wrapper.vm.onSubmit()

        expect(store.getters['auth/isAuthenticated']).toBeTruthy()
        expect(store.getters['auth/userId']).toBe('1234')
        expect(store.getters['auth/token']).toBe('someToken')
      })

      it('should call $apolloHelpers.onLogin', async () => {
        await createLoginForm({ loginHandler }, {
          mocks: {
            $apolloHelpers,
            $router,
            $route
          }
        })
        await wrapper.vm.$nextTick()

        await wrapper.vm.onSubmit()

        expect($apolloHelpers.onLogin).toHaveBeenNthCalledWith(1, 'someToken')
      })

      it('should not push a route without given a returnPath', async () => {
        const routerPush = jest.spyOn($router, 'push')
        await createLoginForm({ loginHandler }, {
          mocks: {
            $apolloHelpers,
            $router,
            $route
          }
        })
        await wrapper.vm.$nextTick()

        await wrapper.vm.onSubmit()

        expect(routerPush).toHaveBeenCalledTimes(0)
      })

      it('should push a route given a returnPath', async () => {
        $route.params.returnPath = 'abc'
        const routerPush = jest.spyOn($router, 'push')
        await createLoginForm({ loginHandler }, {
          mocks: {
            $apolloHelpers,
            $router,
            $route
          }
        })
        await wrapper.vm.$nextTick()

        await wrapper.vm.onSubmit()

        expect(routerPush).toHaveBeenNthCalledWith(1, {
          path: 'abc'
        })
      })
    })

    describe('that fails', () => {
      it('should display an error', async () => {
        await createLoginForm({
          loginHandler: jest.fn().mockResolvedValue({
            data: null,
            errors: ['Some error']
          })
        }, {
          mocks: {
            $apolloHelpers,
            $router,
            $route
          }
        })
        await wrapper.vm.$nextTick()

        await wrapper.vm.onSubmit()

        await wrapper.vm.$nextTick()

        expect(wrapper.find('#login-error-message').text()).toBe('Some error')
      })
    })
  })

  describe('when user is logged in', () => {
    it('should show only the logged in message', async () => {
      jwt_decode.mockReturnValue({ userId: '1234' })

      await createLoginForm()
      await wrapper.vm.$nextTick()

      await store.dispatch('auth/setToken', 'someToken')

      expect(wrapper.find('#form-login').exists()).toBeFalsy()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
