<template>
  <form @submit.prevent="$emit('create', title); title = ''">
    <input type="text" v-model.trim="title" placeholder="Enter some new news title.."/>
    <input type="submit" value="Add" :disabled="!title.length"/>
  </form>
</template>

<script>

export default {
  emits: ["create"],
  data() {
    return {
      title: ""
    }
  }
};
</script>

<style scoped>
form {
  padding: 2rem 0;
}
</style>