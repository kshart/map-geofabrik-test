<template>
  <div class="btn-group">
    <template
      v-for="(btn, key) of props.buttons"
    >
      <a
        v-if="btn.href"
        :key="'a' + key"
        class="btn"
        :href="btn.href"
        :target="btn.target"
      >
        {{ btn.title }}
      </a>
      <div
        v-else
        :key="'div' + key"
        class="btn"
        @click="btn.onClick ? btn.onClick() : null"
      >
        {{ btn.title }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface PlaceButton {
  title: string
  href?: string
  target?: string
  onClick?: () => void
}
const props = defineProps<{
  buttons: PlaceButton[]
}>()
</script>
