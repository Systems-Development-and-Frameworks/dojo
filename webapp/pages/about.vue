<template>
  <main
      class="grid grid-cols-1 gap-0 auto-rows-max lg:grid-cols-3 lg:gap-4
       justify-items-center items-center content-around"
  >
    <div v-for="(card, index) in cards" :key="index" class="flex flex-row lg:flex-col" style="flex-basis: 33%">
      <div class="inline-flex items-center justify-center bg-red-200 h-14 w-14 self-auto
                  rounded-full lg:self-center">
        {{ card.imagePlaceHolder }}
      </div>
      <div class="px-1 py-2">
        <h1 class="font-bold text-lg text-gray-800 text-center">{{ card.title }}</h1>
        <p class="py-1 px-0.5 text-gray-600">{{ card.subtext }}</p>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: "about",
  layout: "default",
  data() {
    return {
      cards: [
        {imagePlaceHolder: "ABC", title: "Some super", subtext: "Lorum ipsum dolor sit amet"},
        {imagePlaceHolder: "DEF", title: "interesting info", subtext: "Lorum ipsum dolor sit amet"},
        {imagePlaceHolder: "GHI", title: "about us", subtext: "Lorum ipsum dolor sit amet"}
      ]
    }
  }
}
</script>
