<template>
  <div>
    <div
        v-for="item in newsListItems"
        :key="item">
      <NewsListItem
          :heading="item.heading"
          :score="item.score"
          @upvote="item.score++;"
          @downvote="item.score--;"
          @remove-newslistitem="newsListItems.splice(newsListItems.indexOf(item), 1);"
      />
    </div>
  </div>
</template>

<script>
import NewsListItem from './components/NewsListItem.vue';

export default {
  name: 'App',
  components: {
    NewsListItem
  },
  data() {
    return {
      newsListItems: [
        {heading: "Hallo", score: 45},
        {heading: "Tschüss", score: 40}
      ]
    }
  },
  methods: {
    sortItems() {
      this.newsListItems.sort(a=>a.score);
    }
  }
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
</style>
