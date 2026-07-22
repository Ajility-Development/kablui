<script setup lang="ts">
import { version } from '../src'
</script>

<template>
  <main class="playground">
    <h1>kablui</h1>
    <p>Playground for developing Vue components. Version {{ version }}.</p>
  </main>
</template>

<style scoped>
.playground {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 4rem auto;
  padding: 0 1.5rem;
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

p {
  margin: 0;
  color: #555;
}
</style>
