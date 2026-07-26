<script setup lang="ts">
import { ref } from 'vue'
import { Tab, TabList, TabPanel, Tabs, Text } from 'kablui'

const tab = ref('account')
</script>

<template>
  <Tabs v-model="tab" class="max-w-md">
    <TabList>
      <Tab value="account">Account</Tab>
      <Tab value="password">Password</Tab>
      <Tab value="team" disabled>Team</Tab>
    </TabList>
    <TabPanel value="account">
      <Text size="sm">Update your profile name and email.</Text>
    </TabPanel>
    <TabPanel value="password">
      <Text size="sm">Change password and review active sessions.</Text>
    </TabPanel>
    <TabPanel value="team">
      <Text size="sm">
        Team settings panel — unreachable while the Team tab stays disabled.
      </Text>
    </TabPanel>
  </Tabs>
</template>
