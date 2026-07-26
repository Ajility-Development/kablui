<script setup lang="ts">
import { ref } from 'vue'
import {
  Alert,
  Button,
  Checkbox,
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Switch,
  Text,
  Textarea,
  useToast,
} from '../../src'

const name = ref('')
const bio = ref('')
const subscribe = ref(false)
const plan = ref('')
const notifications = ref(true)
const country = ref('')
const fruit = ref('apple')
const showInvalid = ref(false)
const submittedOk = ref(false)

const { toast } = useToast()

function onSubmit() {
  const invalid =
    !name.value.trim() || !plan.value || !country.value
  showInvalid.value = invalid
  submittedOk.value = !invalid

  if (invalid) {
    toast({
      tone: 'danger',
      title: 'Fix the form',
      description: 'Required fields are missing or incomplete.',
    })
    return
  }

  toast({
    tone: 'success',
    title: 'Submitted',
    description: 'Form values look good.',
  })
}
</script>

<template>
  <section id="forms" class="space-y-8">
    <div class="space-y-2">
      <Text as="h2" size="lg" weight="semibold">Forms</Text>
      <Text tone="muted" size="sm">
        Field-owned labeling, v-model controls, and custom Select listbox. Submit validates
        required fields and surfaces FieldError only when invalid.
      </Text>
    </div>

    <Alert v-if="submittedOk" tone="success" title="Ready">
      Last submit succeeded. Edit fields and submit again to re-validate.
    </Alert>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <Field :invalid="showInvalid && !name.trim()">
        <FieldLabel required>Name</FieldLabel>
        <Input v-model="name" name="name" placeholder="Ada Lovelace" />
        <FieldHint>Used on invoices and receipts.</FieldHint>
        <FieldError v-if="showInvalid && !name.trim()">Name is required.</FieldError>
      </Field>

      <Field>
        <FieldLabel>Bio</FieldLabel>
        <Textarea v-model="bio" name="bio" :rows="3" placeholder="Short introduction" />
        <FieldHint>Plain text, a few sentences.</FieldHint>
      </Field>

      <Field>
        <div class="flex items-center gap-2">
          <Checkbox v-model="subscribe" name="subscribe" />
          <FieldLabel>Subscribe to product updates</FieldLabel>
        </div>
      </Field>

      <Field :invalid="showInvalid && !plan">
        <FieldLabel>Plan</FieldLabel>
        <RadioGroup v-model="plan" name="plan" orientation="horizontal">
          <div class="inline-flex items-center gap-2">
            <Radio value="free" id="plan-free" />
            <FieldLabel for="plan-free">Free</FieldLabel>
          </div>
          <div class="inline-flex items-center gap-2">
            <Radio value="pro" id="plan-pro" />
            <FieldLabel for="plan-pro">Pro</FieldLabel>
          </div>
          <div class="inline-flex items-center gap-2">
            <Radio value="enterprise" id="plan-enterprise" disabled />
            <FieldLabel for="plan-enterprise">Enterprise</FieldLabel>
          </div>
        </RadioGroup>
        <FieldError v-if="showInvalid && !plan">Choose a plan.</FieldError>
      </Field>

      <Field>
        <div class="flex items-center gap-2">
          <Switch v-model="notifications" name="notifications" />
          <FieldLabel>Email notifications</FieldLabel>
        </div>
        <FieldHint>Space or click toggles the switch.</FieldHint>
      </Field>

      <Field :invalid="showInvalid && !country">
        <FieldLabel>Country</FieldLabel>
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
        <FieldError v-if="showInvalid && !country">Country is required.</FieldError>
      </Field>

      <Field>
        <FieldLabel>Favorite fruit</FieldLabel>
        <Select v-model="fruit" name="fruit" placeholder="Pick one">
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry" disabled>Cherry</SelectItem>
          <SelectItem value="mango">Mango</SelectItem>
        </Select>
        <FieldHint>SelectItem children API.</FieldHint>
      </Field>

      <div class="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="solid">Submit</Button>
        <Text size="sm" tone="muted">
          Validates name, plan, and country. Plan defaults empty so the invalid path is reachable.
        </Text>
      </div>
    </form>

    <div
      class="space-y-1 rounded-kablui-md border border-kablui-border bg-kablui-muted/40 px-3 py-2"
    >
      <Text as="h3" weight="semibold" size="sm">Model snapshot</Text>
      <pre class="whitespace-pre-wrap text-kablui-sm text-kablui-muted-fg">{{
        JSON.stringify(
          { name, bio, subscribe, plan, notifications, country, fruit, showInvalid },
          null,
          2,
        )
      }}</pre>
    </div>
  </section>
</template>
