<template>
  <div>
    <input
      v-model="model"
      placeholder="fts"
    >
    <button @click="emit('search', model)">Search</button>
  </div>
</template>

<script setup lang="ts">
const model = defineModel({
  default: '',
  type: String,
  required: true,
})
const emit = defineEmits<{(e: 'search', q: string): void}>()
</script>

<style scoped>
</style>
