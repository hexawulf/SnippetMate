<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Modal } from 'bootstrap'
import pkg from '../../package.json'

const emit = defineEmits(['closed'])

const modalEl = ref(null)
let modal = null

const version = pkg.version

onMounted(() => {
  modal = new Modal(modalEl.value)
  modalEl.value.addEventListener('hidden.bs.modal', onHidden)
})

onBeforeUnmount(() => {
  if (modalEl.value) {
    modalEl.value.removeEventListener('hidden.bs.modal', onHidden)
  }
})

function onHidden() {
  emit('closed')
}

function open() {
  modal.show()
}

defineExpose({ open })
</script>

<template>
  <div ref="modalEl" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">About SnippetMate</h5>
          <button class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p class="lead mb-1">Paste it. Tag it. Find it.</p>
          <p v-if="version" class="text-muted small mb-3">SnippetMate v{{ version }}</p>

          <p>
            SnippetMate is a single-page web app for capturing short text and code snippets
            from the web — including AI prompts and responses. Tag them, then find them again
            by title, tag, or full-text search.
          </p>

          <h6>Key Features</h6>
          <ul>
            <li>Capture text &amp; code snippets</li>
            <li>Organize with tags</li>
            <li>Full-text and tag-based search</li>
            <li>Server-side URL title fetching</li>
            <li>Google sign-in</li>
          </ul>

          <h6>Tech Stack</h6>
          <p>Vue 3 · Vite · Bootstrap 5 · Express · MySQL 8 · Firebase Auth</p>

          <h6>Contact</h6>
          <ul class="list-unstyled mb-0">
            <li>AUTHOR: 0xWulf</li>
            <li>EMAIL: <a href="mailto:dev@0xwulf.dev">dev@0xwulf.dev</a></li>
            <li>GITHUB: <a href="https://github.com/hexawulf/SnippetMate" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
