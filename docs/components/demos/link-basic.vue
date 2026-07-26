<script setup lang="ts">
import { Link } from 'kablui'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <Link href="#link">In-page link</Link>
    <Link href="https://example.com" external>External</Link>
    <Link href="#props" disabled>Disabled</Link>
  </div>
</template>
