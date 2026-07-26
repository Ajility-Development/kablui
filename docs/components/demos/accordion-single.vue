<script setup lang="ts">
import { ref } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'kablui'

const open = ref<string | undefined>('billing')
</script>

<template>
  <Accordion v-model="open" type="single" class="max-w-md">
    <AccordionItem value="billing">
      <AccordionTrigger>Billing</AccordionTrigger>
      <AccordionContent>
        Invoices, payment methods, and plan changes.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="security">
      <AccordionTrigger>Security</AccordionTrigger>
      <AccordionContent>
        Password, two-factor authentication, and sessions.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="disabled" disabled>
      <AccordionTrigger>Disabled</AccordionTrigger>
      <AccordionContent>You should not see this.</AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
