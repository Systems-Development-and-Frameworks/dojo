<template>
  <div class="border-gray-100 rounded-md border py-2 px-3 my-2 w-full md:w-96">
    <div class="flex justify-between items-baseline">
      <h2 class="text-lg font-semibold pt-2 pb-1">{{ title }}</h2>
      <span>
        <BasicButton
            class="w-6 h-6 font-bold text-sm"
            :color="userVote > 0 ? 'green' : 'gray'"
            :title="isAuthenticated ? null : 'Login to upvote'"
            @click.native="isAuthenticated && userVote <= 0 && $emit('upvote')"
        >＋
        </BasicButton>
        <h2 class="inline-block text-lg pt-2 pb-1 w-5 text-center">{{ votes }}</h2>
        <BasicButton
            class="w-6 h-6 font-bold text-sm"
            :color="userVote < 0 ? 'red' : 'gray'"
            :title="isAuthenticated ? null : 'Login to downvote'"
            @click.native="isAuthenticated && userVote >= 0 && $emit('downvote')"
        >−
        </BasicButton>
      </span>
    </div>
    <div class="flex flex-wrap justify-end" v-if="isAuthenticated && userId === authorId">
      <BasicButton
          class="text-xs"
          :color="'gray'"
          disabled title="Not implemented yet">Edit
      </BasicButton>
      <BasicButton
          class="text-xs"
          :color="'gray'"
          @click.native="$emit('remove')">Remove
      </BasicButton>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

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
