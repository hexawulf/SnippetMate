<script setup>
import SnippetCard from './SnippetCard.vue'
defineProps(['snippets'])
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div>
    <SnippetCard
      v-for="snippet in snippets"
      :key="snippet.id"
      :snippet="snippet"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
    <p v-if="!snippets.length" class="text-muted text-center mt-4">No snippets yet.</p>
  </div>
</template>