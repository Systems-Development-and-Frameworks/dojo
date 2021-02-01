<template>
  <form
      class="flex flex-wrap justify-center items-center"
      @submit.prevent="$emit('create', title); title = ''">
    <label for="input-title" class="py-1 px-2">Add news title:</label>
    <input id="input-title"
           class="border-2 border-gray-100 rounded px-2 py-1"
           type="text" v-model.trim="title" placeholder="Enter some new news.."/>
    <input
        class="line mx-1.5 px-3.5 pt-1 pb-1.5 rounded-lg shadow text-white text-center
bg-blue-500 hover:bg-blue-600"
        type="submit"
        value="Add"
        :disabled="!title.length"
        :title="!title.length ? 'Please enter a title' : null"
    />
  </form>
</template>

<script>

export default {
  emits: ['create'],
  data() {
    return {
      title: ''
    }
  }
}
</script>
