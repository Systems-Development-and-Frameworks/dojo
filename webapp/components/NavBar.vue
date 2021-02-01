<template>
  <div class="h-12">
    <nav
        class="flex fixed w-full items-center justify-between lg:justify-around px-3 bg-blue-50 shadow-lg z-10"
    >
      <section>
        <BasicButton class="lg:hidden" :bold="true" :color="'gray'" @click.native="sidebarOpen = true">≡ Menu
        </BasicButton>
        DojoNews
      </section>
      <section class="hidden lg:block lg:flex lg:justify-between lg:bg-transparent">
        <NavMenu :is-authenticated="isAuthenticated" @logout="logout()"></NavMenu>
      </section>
    </nav>
    <div
        class="absolute z-20 w-full h-full bg-gray-50 opacity-50"
        :class="sidebarOpen ? '' : 'hidden'"
        @click="sidebarOpen = false"
    >
    </div>
    <aside
        class="fixed z-30 w-1/2 sm:w-1/3 px-3 h-full bg-white shadow-xl transition-all duration-500 flex flex-col"
        :class="sidebarOpen ? 'left-0' : '-left-1/2 md:-left-1/3'"
    >
      <button class="self-end" @click="sidebarOpen = false">[x]</button>
      <NavMenu :vertical="true" :is-authenticated="isAuthenticated" @logout="logout(); sidebarOpen = false"
               @navigated="sidebarOpen = false"></NavMenu>
    </aside>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'

export default {
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      userId: 'auth/userId'
    })
  },
  data() {
    return {
      sidebarOpen: false
    }
  },
  methods: {
    async logout() {
      this.unsetToken()
      await this.$apolloHelpers.onLogout()
      await this.$nuxt.refresh()
    },
    ...mapMutations({
      unsetToken: 'auth/unsetToken'
    })
  }
}
</script>
