<template>
  <div id="app">
    <h1>News</h1>
    <div class="news-list-empty-message" v-if="!posts.length">
      <span id="list-empty-message">{{ listEmptyMessage }}</span>
    </div>
    <div id="newslist">
      <div
          v-for="item in sortedNewsListItems"
          :key="item.id">
        <NewsListItem
            class="newslistitem"
            :title="item.title"
            :votes="item.votes"
            :user-vote="item.userVote === null ? 0 : item.userVote"
            :author-id="item.author.id"
            @upvote="upvotePost(item.id)"
            @downvote="downvotePost(item.id)"
            @remove="removeNewsListItem(item.id)"
        />
      </div>
    </div>
    <NewsListItemInput @create="createNewsListItem($event);" v-if="isAuthenticated"/>
    <button type="button" @click="toggleOrder" :disabled="!posts.length" id="reverse-order-button">Reverse Order
    </button>
  </div>
</template>

<script>
import NewsListItem from '../components/NewsListItem.vue'
import NewsListItemInput from '../components/NewsListItemInput'

import posts from '../apollo/queries/posts'
import upvotePost from '../apollo/mutations/upvotePost'
import downvotePost from '../apollo/mutations/downvotePost'
import deletePost from '../apollo/mutations/deletePost'
import createPost from '../apollo/mutations/createPost'
import { mapGetters } from 'vuex'

export default {
  apollo: {
    posts: {
      prefetch: true,
      query: posts,
      context () {
        const token = this.$store.getters['auth/token']
        return token
            ? {
              headers: {
                'Authorization': token
              }
            }
            : {}
      }
    }
  },
  components: {
    NewsListItem,
    NewsListItemInput,
  },
  props: {
    listEmptyMessage: {
      type: String,
      default: 'The list is empty :(',
    },
    initialDescendingOrder: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      //newsListItems: [...this.initialNewsListItems],
      descendingOrder: this.initialDescendingOrder,
      posts: []
    }
  },
  methods: {
    async createNewsListItem (title) {
      try {
        await this.$apollo.mutate({
          mutation: createPost,
          variables: { title },
          update (store, { data: { createPost } }) {
            const data = store.readQuery({ query: posts })
            const newPosts = [...data.posts]
            newPosts.push(createPost)
            store.writeQuery({
              query: posts,
              data: {
                posts: newPosts
              }
            })
          }
        }).then(({ data }) => data && data.createPost)
      } catch (e) {
        console.log(e)
      }
    },
    toggleOrder () {
      this.descendingOrder = !this.descendingOrder
    },
    async removeNewsListItem (id) {
      try {
        await this.$apollo.mutate({
          mutation: deletePost,
          variables: { id },
          update (store) {
            const data = store.readQuery({ query: posts })
            const index = data.posts.findIndex(p => p.id === id)
            if (index !== -1) {
              const newPosts = [...data.posts]
              newPosts.splice(index, 1)
              store.writeQuery({
                query: posts,
                data: {
                  posts: newPosts
                }
              })
            }
          }
        }).then(({ data }) => data && data.deletePost)
      } catch (e) {
        console.log(e)
      }
    },
    async upvotePost (id) {
      try {
        await this.$apollo.mutate({
          mutation: upvotePost,
          variables: { id },
        }).then(({ data }) => data && data.upvotePost)
      } catch (e) {
        console.log(e)
      }
    },
    async downvotePost (id) {
      try {
        await this.$apollo.mutate({
          mutation: downvotePost,
          variables: { id },
        }).then(({ data }) => data && data.downvotePost)
      } catch (e) {
        console.log(e)
      }
    }
  },
  computed: {
    sortedNewsListItems () {
      const compareFn = this.descendingOrder
          ? (a, b) => b.votes - a.votes
          : (a, b) => a.votes - b.votes
      return [...this.posts].sort(compareFn)
    },
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated'
    })
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

div.news-list-empty-message {
  padding: 2rem 0;
}

#newslist {
  padding: 2rem 0;
}
</style>
