<template>
  <form onsubmit="return false;">
    <input type="text" v-model="title"/>
    <input type="submit" value="Add" @click="$emit('create', title)"/>
  </form>
</template>

<script>
export default {
  name: "NewsListItemInput",
  emits: ["create"],
  data() {
    return {
      title: ""
    }
  }
}
</script>

<style scoped>
form {
  padding: 2rem 0;
}
</style>