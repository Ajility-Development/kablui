<script setup lang="ts">
import { ref } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'kablui'

const open = ref<string[]>(['shipping'])
</script>

<template>
  <Accordion v-model="open" type="multiple" class="max-w-md">
    <AccordionItem value="shipping">
      <AccordionTrigger>Shipping</AccordionTrigger>
      <AccordionContent>Addresses and delivery preferences.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="notifications">
      <AccordionTrigger heading="h2">Notifications</AccordionTrigger>
      <AccordionContent>Email and in-app alert settings.</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
