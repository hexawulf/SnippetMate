<script setup>
import SnippetCard from './SnippetCard.vue'

defineProps({
  snippets: { type: Array, required: true },
  filtered: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'delete', 'select-tag'])
</script>

<template>
  <div class="row gx-3">
    <div
      v-for="snippet in snippets"
      :key="snippet.id"
      class="col-12 col-lg-6"
    >
      <SnippetCard
        :snippet="snippet"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @select-tag="emit('select-tag', $event)"
      />
    </div>
    <p v-if="!snippets.length" class="text-muted text-center mt-4">
      {{ filtered ? 'No snippets match your search or tag filter.' : 'No snippets yet.' }}
    </p>
  </div>
</template>