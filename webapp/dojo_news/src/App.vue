<template>
  <div id="app">
    <h1>News</h1>
    <div
        v-for="item in sortedNewsListItems"
        :key="item.id">
      <NewsListItem
          :title="item.title"
          :votes="item.votes"
          @upvote="item.votes++"
          @downvote="item.votes--"
          @remove="removeNewsListItem(item)"
      />
    </div>
    <NewsListItemInput @create="createNewsListItem($event);"/>
  </div>
</template>

<script>
import NewsListItem from './components/NewsListItem.vue';
import NewsListItemInput from "./components/NewsListItemInput";

export default {
  components: {
    NewsListItem,
    NewsListItemInput
  },
  data() {
    return {
      newsListItems: [
        {id: 0, title: "macOS", votes: 0},
        {id: 1, title: "Linux", votes: 0},
        {id: 2, title: "Windows", votes: 0}
      ],
    }
  },
  methods: {
    removeNewsListItem(itemToRemove) {
      this.newsListItems = this.newsListItems.filter(item => item !== itemToRemove);
    },
    createNewsListItem(title) {
      var id = Math.max(...this.newsListItems.map(i => i.id)) + 1;
      this.newsListItems.push({id, title, votes: 0});
    }
  },
  computed: {
    sortedNewsListItems() {
      return [...this.newsListItems].sort((a, b) => b.votes - a.votes);
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
</style>
