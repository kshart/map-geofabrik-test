<template>
  <div class="place-buttons">
    <template
      v-for="(btn, key) of props.buttons"
    >
      <a
        v-if="btn.href"
        :key="'a' + key"
        class="place-button"
        :href="btn.href"
        :target="btn.target"
      >
        {{ btn.title }}
      </a>
      <div
        v-else
        :key="'div' + key"
        class="place-button"
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

<style scoped lang="scss">
@import "@/assets/vars.scss";

.place-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
}
.place-button {
  display: inline-block;
  background: #999;
  color: #fff;
  padding: 5px 10px;
  border: 1px solid #777;
  border-radius: 5px;
  cursor: pointer;
  transition: $hover-transition-duration background ease-out;
  &:hover {
    background: #888;
    transition: $hover-transition-duration background ease-out;
  }
}
</style>
