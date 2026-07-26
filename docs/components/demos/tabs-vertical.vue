<script setup lang="ts">
import { ref } from 'vue'
import { Tab, TabList, TabPanel, Tabs, Text } from 'kablui'

const tab = ref('a')
</script>

<template>
  <Tabs v-model="tab" orientation="vertical" class="max-w-md">
    <TabList>
      <Tab value="a">Account</Tab>
      <Tab value="b">Billing</Tab>
    </TabList>
    <TabPanel value="a">
      <Text size="sm">Panel A — profile and email.</Text>
    </TabPanel>
    <TabPanel value="b">
      <Text size="sm">Panel B — invoices and plan.</Text>
    </TabPanel>
  </Tabs>
</template>
