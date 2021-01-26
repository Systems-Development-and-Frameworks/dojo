<template>
  <div>
    <h2>{{ title }} ({{ votes }})</h2>
    <button
        :disabled="!isAuthenticated || userVote > 0"
        :title="isAuthenticated ? null : 'Login to upvote'"
        @click="$emit('upvote')"
    >
      Upvote
    </button>
    <button
        :disabled="!isAuthenticated || userVote < 0"
        :title="isAuthenticated ? null : 'Login to downvote'"
        @click="$emit('downvote')"
    >
      Downvote
    </button>
    <template v-if="isAuthenticated && userId === authorId">
      <button disabled title="Not implemented yet">Edit</button>
      <button @click="$emit('remove')">Remove</button>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  emits: ['upvote', 'downvote', 'remove'],
  props: {
    authorId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      required: true
    },
    userVote: {
      type: Number,
    }
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      userId: 'auth/userId'
    })
  }
}
</script>
