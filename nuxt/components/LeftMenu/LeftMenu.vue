<template>
  <div class="left-menu">
    <SearchBox
      v-model="ftsString"
      class="search-box"
      @search="search()"
    />
    <div v-if="isLoading">
      isLoading
    </div>
    <div class="result-list">
      <NominatimPlace
        v-for="place of searchResult"
        :key="place.place_id"
        :place="place"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchResultJsonV2, BoundingBox } from './apiNominatim'
import apiNominatim from './apiNominatim'
import SearchBox from './SearchBox.vue'
import NominatimPlace from './NominatimPlace.vue'
import type MapFullpage from '@/components/MapFullpage/MapFullpage.vue'

const props = defineProps<{
  refMap: typeof MapFullpage|null
}>()

const ftsString = ref('')
const searchResult = ref<SearchResultJsonV2[]>([])

const visiblePolygon = ref<[string, string][]|null>(null)
const isLoading = ref(false)
function search () {
  let polygon = undefined as BoundingBox|undefined
  // Полигон не объязательно должен быть квадратным 😱
  if (visiblePolygon.value && visiblePolygon.value.length === 5) {
    polygon = [visiblePolygon.value[0][0], visiblePolygon.value[0][1], visiblePolygon.value[2][0], visiblePolygon.value[2][1]]
  }
  isLoading.value = true
  apiNominatim.search(ftsString.value, polygon)
    .then(result => {
      searchResult.value = result
      const entities = result.map(r => ({
        id: r.osm_id,
        geometry: {
          type: 'Point',
          coordinates: [r.lon, r.lat],
        },
        title: r.name,
      }))
      props.refMap?.updateEntities(entities)
    })
    .finally(() => {
      isLoading.value = false
    })
}

defineExpose({
  changePolygon (polygon: [string, string][]) {
    visiblePolygon.value = polygon
  }
})
</script>

<style scoped lang="scss">
@use "sass:color";
@import "@/assets/vars.scss";

.left-menu {
  /* background: #f00; */
  position: relative;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}
.search-box {
  pointer-events: all;
}
.result-list {
  /* padding-top: 61px; */
  overflow-y: auto;
  height: 100%;
  & > * {
    margin: 15px;
    &:first-child {
      margin-top: 0;
    }
    pointer-events: all;
  }
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: $color-primary;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: color.adjust($color-primary, $lightness: -10%);
  }
}
</style>
