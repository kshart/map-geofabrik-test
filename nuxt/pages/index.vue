<template>
  <div class="page-index">
    <LeftMenu
      ref="refMenu"
      class="menu-component"
      :refMap="refMap"
    />
    <MapFullpage
      ref="refMap"
      class="map-component"
      :refMenu="refMenu"
    />
    <NominatimPlace />
  </div>
</template>

<script setup lang="ts">
import type LeftMenu from '@/components/LeftMenu/LeftMenu.vue'
import type MapFullpage from '@/components/MapFullpage/MapFullpage.vue'
useHead({
  title: 'Map 🙀'
})

const refMap = ref<typeof MapFullpage|null>(null)
const refMenu = ref<typeof LeftMenu|null>(null)
</script>

<style scoped>
.page-index {
  position: relative;
}
.menu-component {
  position: absolute;
  top: 0;
  height: 100vh;
  right: 0;
  z-index: 2;
  width: 400px;
}
.map-component {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 1;
}
</style>
