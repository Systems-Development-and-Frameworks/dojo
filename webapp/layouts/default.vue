<template>
  <div class="flex flex-col justify-between min-h-screen">
    <NavBar/>
    <Nuxt class="flex-grow py-4"/>
    <div>
      <hr>
      <BasicFooter/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'default'
}
</script>
