<script setup lang="ts">
import { ref } from 'vue'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'kablui'

const upgraded = ref(false)
</script>

<template>
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
      <Button variant="ghost" @click="upgraded = false">Cancel</Button>
      <Button :disabled="upgraded" @click="upgraded = true">
        {{ upgraded ? 'Upgraded' : 'Upgrade' }}
      </Button>
    </CardFooter>
  </Card>
</template>
