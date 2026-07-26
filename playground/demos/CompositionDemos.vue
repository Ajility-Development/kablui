<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Cluster,
  Pagination,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  useToast,
} from '../../src'

const singleOpen = ref<string | undefined>('billing')
const multipleOpen = ref<string[]>(['shipping'])
const tab = ref('account')
const lastAction = ref<string | null>(null)
const page = ref(1)
const pageCount = ref(5)
const disabledPage = ref(3)
const upgraded = ref(false)

const { toast } = useToast()

const pageSize = 4

const allItems = computed(() =>
  Array.from({ length: pageCount.value * pageSize }, (_, i) => `Row ${i + 1}`),
)

const pageItems = computed(() => {
  const start = (page.value - 1) * pageSize
  return allItems.value.slice(start, start + pageSize)
})

function setAction(action: string) {
  lastAction.value = action
}

function onCancel() {
  setAction('Cancel')
  toast({
    tone: 'neutral',
    title: 'Cancelled',
    description: 'No plan change.',
  })
}

function onUpgrade() {
  upgraded.value = true
  setAction('Upgrade')
  toast({
    tone: 'success',
    title: 'Upgraded',
    description: 'Team plan is now active.',
  })
}

function shrinkPages() {
  pageCount.value = Math.max(1, pageCount.value - 1)
}

function growPages() {
  pageCount.value = Math.min(12, pageCount.value + 1)
}
</script>

<template>
  <section id="composition" class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Patterns</Text>
      <Text tone="muted" size="sm">
        Card regions, Accordion, Tabs, and Pagination composition recipes.
      </Text>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Card</Text>
      <Card as="article" class="max-w-md">
        <CardHeader>
          <CardTitle>{{ upgraded ? 'Team plan (active)' : 'Team plan' }}</CardTitle>
          <CardDescription>
            {{
              upgraded
                ? 'Shared workspace unlocked for your team.'
                : 'Shared workspace for up to 10 people.'
            }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          Includes projects, comments, and role-based access.
        </CardContent>
        <CardFooter>
          <Button variant="ghost" @click="onCancel">Cancel</Button>
          <Button :disabled="upgraded" @click="onUpgrade">
            {{ upgraded ? 'Upgraded' : 'Upgrade' }}
          </Button>
        </CardFooter>
      </Card>
      <Text size="sm" tone="muted">Last action: {{ lastAction ?? 'none' }}</Text>
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
          <Text size="sm">
            Team settings panel — unreachable while the Team tab stays disabled.
          </Text>
        </TabPanel>
      </Tabs>
      <Text size="sm" tone="muted">
        Active tab: {{ tab }}. Disabled Team keeps its panel unreachable.
      </Text>
    </div>

    <div class="space-y-3">
      <Text as="h3" weight="semibold">Pagination</Text>
      <Stack gap="md">
        <div class="space-y-2">
          <Cluster gap="sm" class="items-center">
            <Text size="sm" tone="muted">
              Page {{ page }} of {{ pageCount }}
            </Text>
            <Button size="sm" variant="outline" @click="shrinkPages">− pages</Button>
            <Button size="sm" variant="outline" @click="growPages">+ pages</Button>
          </Cluster>
          <ul class="m-0 list-none space-y-1 rounded-kablui-md border border-kablui-border p-3">
            <li v-for="item in pageItems" :key="item">
              <Text size="sm">{{ item }}</Text>
            </li>
          </ul>
          <Pagination v-model:page="page" :page-count="pageCount" />
          <Text size="sm" tone="muted">
            Shrink pageCount while on a high page to see clamping.
          </Text>
        </div>
        <div class="space-y-2">
          <Text size="sm" tone="muted">Disabled</Text>
          <Pagination v-model:page="disabledPage" :page-count="8" disabled />
        </div>
      </Stack>
    </div>
  </section>
</template>
