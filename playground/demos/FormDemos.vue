<script setup lang="ts">
import { ref } from 'vue'
import {
  Checkbox,
  Field,
  FieldError,
  FieldHint,
  Input,
  Label,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Switch,
  Text,
  Textarea,
} from '../../src'

const name = ref('')
const bio = ref('')
const subscribe = ref(false)
const plan = ref('pro')
const notifications = ref(true)
const country = ref('')
const fruit = ref('apple')
const showInvalid = ref(false)
</script>

<template>
  <section class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Forms</Text>
      <Text tone="muted" size="sm">
        Field-owned labeling, v-model controls, and custom Select listbox. Toggle invalid to
        exercise danger borders and FieldError.
      </Text>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <label class="inline-flex items-center gap-2 text-kablui-sm text-kablui-fg">
        <Checkbox v-model="showInvalid" />
        Demo invalid state
      </label>
    </div>

    <div class="space-y-4">
      <Field :invalid="showInvalid && !name">
        <Label required>Name</Label>
        <Input v-model="name" name="name" placeholder="Ada Lovelace" />
        <FieldHint>Used on invoices and receipts.</FieldHint>
        <FieldError>Name is required.</FieldError>
      </Field>

      <Field>
        <Label>Bio</Label>
        <Textarea v-model="bio" name="bio" :rows="3" placeholder="Short introduction" />
        <FieldHint>Plain text, a few sentences.</FieldHint>
      </Field>

      <Field>
        <div class="flex items-center gap-2">
          <Checkbox v-model="subscribe" name="subscribe" />
          <Label>Subscribe to product updates</Label>
        </div>
      </Field>

      <Field :invalid="showInvalid && !plan">
        <Label>Plan</Label>
        <RadioGroup v-model="plan" name="plan" orientation="horizontal">
          <label class="inline-flex items-center gap-2 text-kablui-sm">
            <Radio value="free" /> Free
          </label>
          <label class="inline-flex items-center gap-2 text-kablui-sm">
            <Radio value="pro" /> Pro
          </label>
          <label class="inline-flex items-center gap-2 text-kablui-sm">
            <Radio value="enterprise" disabled /> Enterprise
          </label>
        </RadioGroup>
        <FieldError>Choose a plan.</FieldError>
      </Field>

      <Field>
        <div class="flex items-center gap-2">
          <Switch v-model="notifications" name="notifications" />
          <Label>Email notifications</Label>
        </div>
        <FieldHint>Space or click toggles the switch.</FieldHint>
      </Field>

      <Field :invalid="showInvalid && !country">
        <Label>Country</Label>
        <Select
          v-model="country"
          name="country"
          placeholder="Select a country"
          :options="[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'de', label: 'Germany', disabled: true },
          ]"
        />
        <FieldHint>Options prop API — Arrow keys, typeahead, Escape.</FieldHint>
        <FieldError>Country is required.</FieldError>
      </Field>

      <Field>
        <Label>Favorite fruit</Label>
        <Select v-model="fruit" name="fruit" placeholder="Pick one">
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry" disabled>Cherry</SelectItem>
          <SelectItem value="mango">Mango</SelectItem>
        </Select>
        <FieldHint>SelectItem children API.</FieldHint>
      </Field>
    </div>

    <div
      class="space-y-1 rounded-kablui-md border border-kablui-border bg-kablui-muted/40 px-3 py-2"
    >
      <Text as="h3" weight="semibold" size="sm">Model snapshot</Text>
      <pre class="whitespace-pre-wrap text-kablui-sm text-kablui-muted-fg">{{
        JSON.stringify({ name, bio, subscribe, plan, notifications, country, fruit }, null, 2)
      }}</pre>
    </div>
  </section>
</template>
