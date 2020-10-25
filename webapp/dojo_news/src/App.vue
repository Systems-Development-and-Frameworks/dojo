<template>
  <div>
    <div
        v-for="item in sortedNewsListItems"
        :key="item">
      <NewsListItem
          :title="item.title"
          :votes="item.votes"
          @upvote="item.votes++;"
          @downvote="item.votes--;"
          @remove-newslistitem="newsListItems.splice(newsListItems.indexOf(item), 1);"
      />
    </div>
  </div>
</template>
/*
- alle Daten doppelt -> einmal hier in Data, einmal in der NewsListItem Component
- wir behandeln die Events beim Erstellen der NewsListItems -> ist das denn das übergeordnete Element im Sinne der Aufgabenstellung?
  ("The item should not remove itself from the DOM but tell its parent component to do so.")
- dojo_news/* -> webapp?
- .gitignore -> node_modules ist excluded aber nicht im .gitignore
*/
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
        {title: "macOS", votes: 0},
        {title: "Linux", votes: 2},
        {title: "Windows", votes: 1}
      ]
    }
  },
  computed: {
    sortedNewsListItems: function(){
      return [...this.newsListItems].sort((a,b) => a.votes-b.votes);
    }
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
</style>
