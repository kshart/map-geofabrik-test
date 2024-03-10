<template>
  <div class="nominatim-place">
    <div class="nominatim-place__title">{{ props.place.name }}</div>
    <div class="nominatim-place__subtitle">{{ props.place.display_name }}</div>
    <div class="nominatim-place__id">{{ props.place.place_id }}</div>
    <div>category: {{ props.place.category }}</div>
    <div>type: {{ props.place.type }}</div>
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
    <PlaceButtons
      :buttons="buttons"
    />
  </div>
</template>

<script setup lang="ts">
import type { SearchResultJsonV2 } from './apiNominatim'
import PlaceButtons from './PlaceButtons.vue'

const props = defineProps<{
  place: SearchResultJsonV2
}>()

const attributes = {
  site: computed(():string|undefined => {
    return props.place?.extratags?.['contact:website']
  })
}
const buttons = computed(() => {
  const result = [
    {
      title: 'Osm',
      href: `https://www.openstreetmap.org/node/${props.place.osm_id}`,
      target: '_blank',
    }, {
      title: '🏳️',
      onClick () {
        console.log('hello dudes')
      }
    }
  ]
  if (attributes.site.value) {
    result.unshift({
      title: 'Сайт',
      href: attributes.site.value,
      target: '_blank',
    })
  }

  return result
})

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
  color: #333;
}
.nominatim-place__subtitle {
  font-size: 0.85em;
  color: #555;
}
.nominatim-place__id {
  font-size: 0.85em;
  color: #ccc;
}
</style>
