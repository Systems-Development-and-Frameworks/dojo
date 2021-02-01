<template>
  <div class="flex" :class="vertical ? 'justify-start flex-col' : 'justify-between flex-row'">
    <NuxtLinkButton @click="$emit('navigated')" to="/" color="gray" href="/">Posts</NuxtLinkButton>
    <NuxtLinkButton @click="$emit('navigated')" to="/about" color="gray" href="/about">About us</NuxtLinkButton>
    <NuxtLinkButton @click="$emit('navigated')" v-if="!isAuthenticated" :to="{name: 'login', params: {returnPath: '/'}}"
      color="green" href="/login" id="login-button">
      Login
    </NuxtLinkButton>
    <BasicButton v-else :color="'red'" @click.native="$emit('logout')" id="logout-button">Logout</BasicButton>
  </div>
</template>
<script>
export default {
  name: "NavMenu",
  props: {
    isAuthenticated: {
      type: Boolean,
    },
    vertical: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>

</style>