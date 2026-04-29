<script setup>
import Swal from 'sweetalert2'

const props = defineProps(['snippet'])
const emit = defineEmits(['edit', 'delete'])

const borders = [
  'border-primary',
  'border-secondary',
  'border-success',
  'border-danger',
  'border-warning',
  'border-info'
]
// Pick a border colour based on the snippet id. The same id always gets the same colour, but different ids get different colours so snippets look varied.
const borderClass = borders[props.snippet.id % borders.length]

async function confirmDelete() {
  const result = await Swal.fire({
    title: 'Delete snippet?',
    text: 'This cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  })
  if (result.isConfirmed) emit('delete', props.snippet.id)
}
</script>
<template>
  <div class="card mb-3" :class="borderClass" style="border-width: 2px">
    <div
      class="card-header d-flex justify-content-between align-items-start gap-2"
    >
      <div class="overflow-hidden">
        <h6 class="card-title mb-0 fw-semibold">{{ snippet.title }}</h6>
        <a
          v-if="snippet.source_url"
          :href="snippet.source_url"
          target="_blank"
          class="text-muted d-block text-truncate"
          style="font-size: 11px"
        >
          {{ snippet.source_url }}
        </a>
      </div>
      <div class="d-flex gap-1 flex-shrink-0">
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="emit('edit', snippet)"
        >
          Edit
        </button>
        <button class="btn btn-sm btn-outline-danger" @click="confirmDelete">Delete</button>
      </div>
    </div>
    <div class="card-body">
      <p class="card-text small mb-2" style="white-space: pre-wrap">
        {{ snippet.content }}
      </p>
      <div class="d-flex flex-wrap gap-1 mb-2">
        <span
          v-for="tag in snippet.tags"
          :key="tag"
          class="badge rounded-pill sm-tag"
          >{{ tag }}</span
        >
      </div>
      <p class="text-muted mb-0" style="font-size: 11px">
        {{ snippet.created_at }}
      </p>
    </div>
  </div>
</template>
