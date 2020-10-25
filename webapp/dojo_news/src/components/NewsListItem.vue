<template>
  <div>
    <h1>{{heading}} ({{score}})</h1>
    <button @click="$emit('upvote')">Upvote</button>
    <button @click="$emit('downvote')">Downvote</button>
    <button @click="$emit('remove-newslistitem')">Remove</button>
  </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
  name: "NewsListItem",
  emits: ['upvote', 'downvote','remove-newslistitem'],
  props: {
    heading: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: 0
    }
  }
});
</script>

<style scoped>

</style>