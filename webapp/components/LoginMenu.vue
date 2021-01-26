<template>
  <div>
    <nuxt-link v-if="!isAuthenticated" :to="{name: 'login', params: {returnPath: '/'}}">
      <button id="login-button">Login</button>
    </nuxt-link>
    <template v-else>
      <button @click="logout" id="logout-button">Logout</button>
      <span>userId: {{ userId }}</span>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      userId: 'auth/userId'
    })
  },
  methods: {
    async logout () {
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
