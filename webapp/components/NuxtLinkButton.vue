<template>
  <nuxt-link @click.native="$emit('click')" :to="this.to" tag="div" class="flex">
    <BasicButton :color="this.color" class="flex-grow" :href="this.href">
      <slot></slot>
    </BasicButton>
  </nuxt-link>
</template>

<script>
import Vue from 'vue'

export default Vue.component("NuxtLinkButton", {
  props: {
    to: {
      required: true
    },
    color: {
      type: String,
      default: 'blue'
    },
    href: {
      type: String,
    }
  }
})
</script>

<style scoped>

</style>