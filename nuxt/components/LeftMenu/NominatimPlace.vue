<template>
  <div class="nominatim-place">
    <div class="nominatim-place__title">{{ props.place.name }}</div>
    <div class="nominatim-place__subtitle">{{ props.place.display_name }}</div>
    <div class="nominatim-place__id">{{ props.place.place_id }}</div>
    <div class="nominatim-place__">{{ props.place.category }}</div>
    <div class="nominatim-place__">{{ props.place.type }}</div>
    <a :href="`https://www.openstreetmap.org/node/${props.place.osm_id}`" target="blank">Osm</a>
    <!-- <pre>{{ props.place }}</pre> -->
    <div>
      <div v-for="(value, key) in props.place.extratags" :key="key">
        <div>
          {{ key }}
        </div>
        <div>
          {{ value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchResultJsonV2 } from './apiNominatim'

const props = defineProps<{
  place: SearchResultJsonV2
}>()

</script>

<style scoped>
.nominatim-place {
  background: #eee;
  border: 1px solid #ddd;
  margin: 15px;
  padding: 10px;
  font-size: 16px;
  border-radius: 10px;
}
.nominatim-place__title {
  font-size: 1.3em;
}
.nominatim-place__subtitle {
  font-size: 0.85em;
}
.nominatim-place__id {
}
</style>
