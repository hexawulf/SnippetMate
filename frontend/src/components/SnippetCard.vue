<script setup>
import { computed } from 'vue'
import Swal from 'sweetalert2'
import { snippetToMarkdown, generateFilename, downloadFile } from '../utils/markdown.js'
import { isHttpUrl } from '../utils/safety.js'

const props = defineProps({
  snippet: { type: Object, required: true },
})
const emit = defineEmits(['edit', 'delete', 'select-tag'])

const borders = [
  'border-primary',
  'border-secondary',
  'border-success',
  'border-danger',
  'border-warning',
  'border-info'
]
const borderClass = computed(() => borders[props.snippet.id % borders.length])

const formattedDate = computed(() => {
  if (!props.snippet.created_at) return ''
  const d = new Date(props.snippet.created_at)
  return Number.isNaN(d.getTime()) ? props.snippet.created_at : d.toISOString().slice(0, 16).replace('T', ' ')
})

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

function downloadMd() {
  const md = snippetToMarkdown(props.snippet)
  const filename = generateFilename(props.snippet)
  downloadFile(md, filename)
}
</script>
<template>
  <div class="card mb-3" :class="borderClass" style="border-width: 2px">
    <div
      class="card-header d-flex justify-content-between align-items-start gap-2"
    >
      <div class="overflow-hidden">
        <h6 class="card-title mb-0 fw-semibold">{{ snippet.title || 'Untitled snippet' }}</h6>
        <!-- Only http(s) is linked: a javascript: URL would run when clicked. -->
        <a
          v-if="isHttpUrl(snippet.source_url)"
          :href="snippet.source_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted d-block text-truncate"
          style="font-size: 11px"
        >
          {{ snippet.source_url }}
        </a>
        <span
          v-else-if="snippet.source_url"
          class="text-muted d-block text-truncate"
          style="font-size: 11px"
        >
          {{ snippet.source_url }}
        </span>
      </div>
      <div class="d-flex gap-1 flex-shrink-0">
        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          @click="downloadMd"
        >
          MD
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="emit('edit', snippet)"
        >
          Edit
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger" @click="confirmDelete">Delete</button>
      </div>
    </div>
    <div class="card-body">
      <pre class="card-text sm-snippet-body small mb-2" tabindex="0">{{ snippet.content }}</pre>
      <div v-if="snippet.tags?.length" class="d-flex flex-wrap gap-1 mb-2">
        <button
          v-for="tag in snippet.tags"
          :key="tag"
          type="button"
          class="badge rounded-pill sm-tag"
          @click="emit('select-tag', tag)"
        >{{ tag }}</button>
      </div>
      <p class="text-muted mb-0" style="font-size: 11px">
        {{ formattedDate }}
      </p>
    </div>
  </div>
</template>
