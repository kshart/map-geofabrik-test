<template>
  <div class="left-menu">
    <SearchBox
      v-model="ftsString"
      @search="search()"
    />
    <div>
      <NominatimPlace
        v-for="place of searchResult"
        :key="place.place_id"
        :place="place"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import apiNominatim from './apiNominatim'
import type { SearchResultJsonV2, BoundingBox } from './apiNominatim'
import SearchBox from './SearchBox.vue'
import NominatimPlace from './NominatimPlace.vue'

const props = defineProps<{
  visiblePolygon?: [string, string][]
}>()

const ftsString = ref('')
const searchResult = ref<SearchResultJsonV2[]>([])

function search () {
  let polygon = undefined as BoundingBox|undefined
  // Полигон не объязательно должен быть квадратным 😱
  if (props.visiblePolygon && props.visiblePolygon.length === 5) {
    polygon = [props.visiblePolygon[0][0], props.visiblePolygon[0][1], props.visiblePolygon[2][0], props.visiblePolygon[2][1]]
  }
  apiNominatim.search(ftsString.value, polygon)
    .then(result => {
      searchResult.value = result
    })
}

</script>

<style scoped>
.left-menu {
  /* background: #f00; */
  overflow-y: auto;
}
</style>
