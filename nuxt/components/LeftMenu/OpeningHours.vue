<template>
  <div>
    {{ props.value }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: string
}>()

// const data = 'Mo-Fr 08:00-12:00,13:00-17:30; Sa 08:00-12:00; PH 09:00-12:00'
// const days = computed(() => {
//   const asd = data.split(';')
//   console.log(asd)
//   return asd
// })
</script>
