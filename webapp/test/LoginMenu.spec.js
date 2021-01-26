import '@testing-library/jest-dom'
import 'regenerator-runtime'

import { createLocalVue, shallowMount } from '@vue/test-utils'

import Vuex from 'vuex'

import LoginMenu from '@/components/LoginMenu'
import { actions, getters, mutations, state } from '@/store/auth'

import jwt_decode from 'jwt-decode'

jest.mock('jwt-decode')

describe('LoginMenu', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  let wrapper, store

  const createLoginMenu = async (appOptions) => {
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

    wrapper = shallowMount(LoginMenu, {
      localVue,
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
    store = null
  })

  describe('for a user that is not logged in', () => {
    it('should show only the login button', async () => {
      await createLoginMenu()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#login-button').exists()).toBe(true)
      expect(wrapper.find('#logout-button').exists()).toBe(false)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('for a user that is logged in', () => {
    jwt_decode.mockReturnValue({ userId: '1234' })

    it('should show only the logout button and the user id', async () => {
      await createLoginMenu()
      await wrapper.vm.$nextTick()

      await store.dispatch('auth/setToken', 'someToken')

      expect(wrapper.find('#login-button').exists()).toBe(false)
      expect(wrapper.find('#logout-button').exists()).toBe(true)
      expect(wrapper.html()).toMatchSnapshot()
    })

    describe('triggering the logout button', () => {
      let $nuxt, $apolloHelpers
      beforeEach(() => {
        $nuxt = {
          refresh: jest.fn()
        }
        $apolloHelpers = {
          onLogout: jest.fn()
        }
      })

      async function setTokenThenLogout () {
        await store.dispatch('auth/setToken', 'someToken')
        await wrapper.vm.$nextTick()

        await wrapper.find('#logout-button').trigger('click')
        await wrapper.vm.$nextTick()
      }

      it('should remove the token and userId from the state', async () => {
        await createLoginMenu({
          mocks: {
            $apolloHelpers,
            $nuxt
          },
        })

        await setTokenThenLogout()

        expect(store.getters['auth/isAuthenticated']).toBeFalsy()
        expect(store.getters['auth/userId']).toBe(null)
        expect(store.getters['auth/token']).toBe(null)
      })

      it('should call $apolloHelpers.onLogout', async () => {
        await createLoginMenu({
          mocks: {
            $apolloHelpers,
            $nuxt
          },
        })

        await setTokenThenLogout()

        expect($apolloHelpers.onLogout).toBeCalledTimes(1)
      })

      it('should call $nuxt.refresh', async () => {
        await createLoginMenu({
          mocks: {
            $apolloHelpers,
            $nuxt
          },
        })

        await setTokenThenLogout()

        expect($nuxt.refresh).toBeCalledTimes(1)
      })
    })
  })
})

