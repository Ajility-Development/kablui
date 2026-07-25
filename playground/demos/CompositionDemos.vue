<script setup lang="ts">
import { ref } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Cluster,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Pagination,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from '../../src'

const singleOpen = ref<string | undefined>('billing')
const multipleOpen = ref<string[]>(['shipping'])
const tab = ref('account')
const lastAction = ref<string | null>(null)
const page = ref(1)
const disabledPage = ref(3)

function setAction(action: string) {
  lastAction.value = action
}
</script>

<template>
  <section class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Composition</Text>
      <Text tone="muted" size="sm">
        Card regions, Accordion, Tabs, Menu, and Pagination built from Phase 5 patterns.
      </Text>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Card</Text>
      <Card as="article" class="max-w-md">
        <CardHeader>
          <CardTitle>Team plan</CardTitle>
          <CardDescription>Shared workspace for up to 10 people.</CardDescription>
        </CardHeader>
        <CardBody>
          Includes projects, comments, and role-based access.
        </CardBody>
        <CardFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Upgrade</Button>
        </CardFooter>
      </Card>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Accordion</Text>
      <Stack gap="md">
        <div class="space-y-2">
          <Text size="sm" tone="muted">Single (collapsible)</Text>
          <Accordion v-model="singleOpen" type="single" class="max-w-md">
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
        </div>
        <div class="space-y-2">
          <Text size="sm" tone="muted">Multiple</Text>
          <Accordion v-model="multipleOpen" type="multiple" class="max-w-md">
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping</AccordionTrigger>
              <AccordionContent>Addresses and delivery preferences.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="notifications">
              <AccordionTrigger>Notifications</AccordionTrigger>
              <AccordionContent>Email and in-app alert settings.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Stack>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Tabs</Text>
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
          <Text size="sm">Invite teammates (disabled tab).</Text>
        </TabPanel>
      </Tabs>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Menu</Text>
      <Cluster gap="sm" class="items-center">
        <Menu>
          <MenuTrigger>Actions</MenuTrigger>
          <MenuContent>
            <MenuItem @select="setAction('Edit')">Edit</MenuItem>
            <MenuItem @select="setAction('Duplicate')">Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem disabled @select="setAction('Archive')">Archive</MenuItem>
            <MenuItem @select="setAction('Delete')">Delete</MenuItem>
          </MenuContent>
        </Menu>
        <Text size="sm" tone="muted">
          Last action: {{ lastAction ?? 'none' }}
        </Text>
      </Cluster>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Pagination</Text>
      <Stack gap="md">
        <div class="space-y-2">
          <Text size="sm" tone="muted">Page {{ page }} of 12</Text>
          <Pagination v-model:page="page" :page-count="12" />
        </div>
        <div class="space-y-2">
          <Text size="sm" tone="muted">Disabled</Text>
          <Pagination v-model:page="disabledPage" :page-count="8" disabled />
        </div>
      </Stack>
    </div>
  </section>
</template>
