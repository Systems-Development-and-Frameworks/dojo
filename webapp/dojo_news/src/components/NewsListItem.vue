<template>
  <div>
    <h1>{{title}} ({{votes}})</h1>
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
    title: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      required: true
    }
  }
});
</script>

<style scoped>

</style>