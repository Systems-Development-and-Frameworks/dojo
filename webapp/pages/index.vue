<template>
  <main class="flex flex-col items-center">
    <h1 class="text-xl font-semibold">News</h1>
    <NewsListItemInput class="py-2.5" @create="createNewsListItem($event);" v-if="isAuthenticated"/>
    <BasicButton :color="'gray'" type="button" @click.native="toggleOrder"
                 href="#" :disabled="!posts.length" id="reverse-order-button">Reverse Order
    </BasicButton>
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
  </main>
</template>

<script>
import NewsListItem from '../components/NewsListItem.vue'
import NewsListItemInput from '../components/NewsListItemInput'

import posts from '../apollo/queries/posts.gql'
import upvotePost from '../apollo/mutations/upvotePost.gql'
import downvotePost from '../apollo/mutations/downvotePost.gql'
import deletePost from '../apollo/mutations/deletePost.gql'
import createPost from '../apollo/mutations/createPost.gql'
import {mapGetters} from 'vuex'

export default {
  apollo: {
    posts: {
      prefetch: true,
      query: posts,
      context() { // need to set token manually on SSR
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
  data() {
    return {
      //newsListItems: [...this.initialNewsListItems],
      descendingOrder: this.initialDescendingOrder,
      posts: []
    }
  },
  methods: {
    async createNewsListItem(title) {
      try {
        await this.$apollo.mutate({
          mutation: createPost,
          variables: {title},
          update(store, {data: {createPost}}) {
            const data = store.readQuery({query: posts})
            const newPosts = [...data.posts]
            newPosts.push(createPost)
            store.writeQuery({
              query: posts,
              data: {
                posts: newPosts
              }
            })
          }
        }).then(({data}) => data && data.createPost)
      } catch (e) {
        console.log(e)
      }
    },
    toggleOrder() {
      this.descendingOrder = !this.descendingOrder
    },
    async removeNewsListItem(id) {
      try {
        await this.$apollo.mutate({
          mutation: deletePost,
          variables: {id},
          update(store) {
            const data = store.readQuery({query: posts})
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
        }).then(({data}) => data && data.deletePost)
      } catch (e) {
        console.log(e)
      }
    },
    async upvotePost(id) {
      try {
        await this.$apollo.mutate({
          mutation: upvotePost,
          variables: {id},
        }).then(({data}) => data && data.upvotePost)
      } catch (e) {
        console.log(e)
      }
    },
    async downvotePost(id) {
      try {
        await this.$apollo.mutate({
          mutation: downvotePost,
          variables: {id},
        }).then(({data}) => data && data.downvotePost)
      } catch (e) {
        console.log(e)
      }
    }
  },
  computed: {
    sortedNewsListItems() {
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

