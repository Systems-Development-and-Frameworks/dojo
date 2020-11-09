<template>
  <div id="app">
    <h1>News</h1>
    <div class="news-list-empty-message" v-if="!newsListItems.length">
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
            @upvote="item.votes++"
            @downvote="item.votes--"
            @remove="removeNewsListItem(item.id)"
        />
      </div>
    </div>
    <NewsListItemInput @create="createNewsListItem($event);"/>
    <button type="button" @click="toggleOrder()" v-if="newsListItems.length" id="reverse-order-button">Reverse Order
    </button>
  </div>
</template>

<script>
import NewsListItem from './components/NewsListItem.vue';
import NewsListItemInput from "./components/NewsListItemInput";

export default {
  components: {
    NewsListItem,
    NewsListItemInput,
  },
  props: {
    listEmptyMessage: {
      type: String,
      default: "The list is empty :(",
    },
    initialNewsListItems: {
      type: Array,
      default: () => {
        return [
          {id: 0, title: "macOS", votes: 0},
          {id: 1, title: "Linux", votes: 0},
          {id: 2, title: "Windows", votes: 0}
        ]
      }
    },
    initialDescendingOrder: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      newsListItems: [...this.initialNewsListItems],
      descendingOrder: this.initialDescendingOrder
    }
  },
  methods: {
    removeNewsListItem(id) {
      this.newsListItems = this.newsListItems.filter(item => item.id !== id);
    },
    createNewsListItem(title) {
      var id = this.newsListItems.length
          ? Math.max(...this.newsListItems.map(i => i.id)) + 1
          : 0;
      this.newsListItems.push({id, title, votes: 0});
    },
    toggleOrder() {
      this.descendingOrder = !this.descendingOrder;
    }
  },
  computed: {
    sortedNewsListItems() {
      const compareFn = this.descendingOrder
          ? (a, b) => b.votes - a.votes
          : (a, b) => a.votes - b.votes
      return [...this.newsListItems].sort(compareFn);
    }
  },
};
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
</style>
