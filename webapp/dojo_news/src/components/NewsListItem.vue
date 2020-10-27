<template>
  <div>
    <h2>{{ title }} ({{ votes }})</h2>
    <button @click="$emit('upvote')">Upvote</button>
    <button @click="$emit('downvote')">Downvote</button>
    <button @click="$emit('remove')">Remove</button>
  </div>
</template>

<script>
export default {
  emits: ['upvote', 'downvote', 'remove'],
  props: {
    title: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>

</style>