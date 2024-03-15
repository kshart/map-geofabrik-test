<template>
  <div class="search-box">
    <input
      v-model="model"
      placeholder="fts"
    >
    <button class="btn" @click="emit('search', model)">Search</button>
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

<style scoped lang="scss">
.search-box {
  padding: 15px;
  display: flex;
  input {
    width: 100%;
    padding: 7px 15px;
    border: 1px solid #aaa;
    border-right: none;
    border-radius: 5px 0 0 5px;
  }
  button {
    border-radius: 0 5px 5px 0;
  }
}
</style>
