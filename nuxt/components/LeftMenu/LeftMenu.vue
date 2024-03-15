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
import type { MapEntity } from '../MapFullpage/MapEntity'
import type { SearchResultJsonV2, BoundingBox } from './apiNominatim'
import apiNominatim from './apiNominatim'
import SearchBox from './SearchBox.vue'
import NominatimPlace from './NominatimPlace.vue'

const props = defineProps<{
  visiblePolygon?: [string, string][]
}>()
const emit = defineEmits<{(e: 'fetch-entities', entities: MapEntity[]): void}>()

const ftsString = ref('')
const searchResult = ref<SearchResultJsonV2[]>([])

const isLoading = ref(false)
function search () {
  let polygon = undefined as BoundingBox|undefined
  // Полигон не объязательно должен быть квадратным 😱
  if (props.visiblePolygon && props.visiblePolygon.length === 5) {
    polygon = [props.visiblePolygon[0][0], props.visiblePolygon[0][1], props.visiblePolygon[2][0], props.visiblePolygon[2][1]]
  }
  isLoading.value = true
  apiNominatim.search(ftsString.value, polygon)
    .then(result => {
      searchResult.value = result
      const entities = result.map(r => ({
        geometry: {
          type: 'Point',
          coordinates: [r.lon, r.lat],
        },
        title: r.name,
      }))
      emit('fetch-entities', entities)
    })
    .finally(() => {
      isLoading.value = false
    })
}

</script>

<style scoped lang="scss">
@use "sass:color";
@import "@/assets/vars.scss";

.left-menu {
  /* background: #f00; */
  position: relative;
  display: flex;
  flex-direction: column;
}
.search-box {

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
