<template>
  <div class="page-index">
    <LeftMenu
      class="menu-component"
      :visiblePolygon="visiblePolygon"
      @fetch-entities="entities = $event"
    />
    <MapFullpage
      class="map-component"
      :entities="entities"
      @change-polygon="visiblePolygon = $event"
    />
    <NominatimPlace />
  </div>
</template>

<script setup lang="ts">
import type { MapEntity } from '@/components/MapFullpage/MapEntity'
useHead({
  title: 'Map 🙀'
})

const visiblePolygon = ref<[string, string][]|undefined>()
const entities = ref<MapEntity[]>([])
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
