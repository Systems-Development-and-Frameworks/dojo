<template>
  <a
      :href="href"
      class="inline-flex m-1.5 px-2.5 py-2 rounded-lg shadow-md text-white text-center
      cursor-pointer justify-center items-center"
      :class="(!disabled ? `bg-${color}-500 hover:bg-${color}-600` : `bg-gray-500`) + (bold ? ' font-semibold' : '')">
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: 'BasicButton',
  props: {
    color: {
      type: String,
      default: 'blue'
    },
    bold: {
      type: Boolean,
      default: false
    },
    href: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>

</style>