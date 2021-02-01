import '@testing-library/jest-dom'
import 'regenerator-runtime'

import { createLocalVue, shallowMount } from '@vue/test-utils'

import NavMenu from '@/components/NavMenu'

describe('NavMenu', () => {
    const localVue = createLocalVue()

    let wrapper

    const createLoginMenu = async (appOptions) => {
        wrapper = shallowMount(NavMenu, {
            localVue,
            stubs: {
                BasicButton: true,
                NuxtLinkButton: true,
            },
            ...appOptions
        })
        await wrapper.vm.$nextTick()
    }

    afterEach(() => {
        wrapper.destroy()
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

        it('should show only the logout button and the user id', async () => {
            await createLoginMenu({ propsData: { isAuthenticated: true }})
            await wrapper.vm.$nextTick()

            expect(wrapper.find('#login-button').exists()).toBe(false)
            expect(wrapper.find('#logout-button').exists()).toBe(true)
            expect(wrapper.html()).toMatchSnapshot()
        })

    })
})

