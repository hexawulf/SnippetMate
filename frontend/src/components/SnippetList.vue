<script setup>
import SnippetCard from './SnippetCard.vue'
defineProps(['snippets'])
const emit = defineEmits(['edit', 'delete'])
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
      />
    </div>
    <p v-if="!snippets.length" class="text-muted text-center mt-4">No snippets yet.</p>
  </div>
</template>