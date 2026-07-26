<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from 'kablui'

const page = ref(3)
</script>

<template>
  <Pagination v-model:page="page" :page-count="8" disabled />
</template>
