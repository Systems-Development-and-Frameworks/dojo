<template>
  <div>
    <template v-if="isAuthenticated">
      <span>You're logged in!</span>
      <nuxt-link to="/">Return to home page</nuxt-link>
      or
      <a href="#" @click.prevent="$router.go(-1)">return to the previously browsed page</a>
    </template>
    <form v-else @submit.prevent="onSubmit" id="form-login">
      <table>
        <tbody>
        <tr>
          <td>
            <label for="input-email"> E-Mail </label>
          </td>
          <td>
            <input id="input-email" type="text" v-model.trim="email" placeholder="Enter your e-mail address.."
                   required/>
          </td>
        </tr>
        <tr>
          <td>
            <label for="input-password"> Password </label>
          </td>
          <td>
            <input id="input-password" type="password" v-model="password" placeholder="Enter your password.."
                   required/>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <input type="submit" value="Login" :disabled="!(email.length && password.length)"/>
          </td>
        </tr>
        <tr v-if="submitting">
          <td colspan="2">
            Logging in...
          </td>
        </tr>
        <tr v-if="error">
          <td colspan="2">
            <span id="login-error-message">{{ error }}</span>
          </td>
        </tr>
        </tbody>
      </table>
    </form>
  </div>
</template>

<script>
import login from '../apollo/mutations/login'
import { mapActions, mapGetters } from 'vuex'
import { ApolloError } from '@apollo/client'

export default {
  data () {
    return {
      submitting: false,
      error: null,
      email: '',
      password: '',
    }
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated'
    })
  },
  methods: {
    ...mapActions({
      setToken: 'auth/setToken'
    }),
    async onSubmit () {
      this.error = null
      this.submitting = true
      try {
        const res = await this.$apollo.mutate({
          mutation: login,
          variables: {
            email: this.email,
            password: this.password
          }
        }).then(({ data }) => data && data.login)
        await this.setToken(res)
        await this.$apolloHelpers.onLogin(res)
        if (this.$route.params.returnPath) {
          await this.$router.push({
            path: this.$route.params.returnPath
          })
        }
      } catch (e) {
        if (e instanceof ApolloError) {
          this.error = e.graphQLErrors.join(",\n")
        } else {
          this.error = e
        }
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style>
form#form-login > table {
  margin: 0 auto;
}
</style>

