<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Modal from 'bootstrap/js/dist/modal'
import api from '../services/api.js'
import { parseTagInput, apiErrorMessage } from '../utils/safety.js'

// The parent passes the save function instead of listening for an event, so
// the form can wait for the result: it closes only after a successful save
// and keeps what was typed (with the error shown) when the save fails.
const props = defineProps({
  saveSnippet: { type: Function, required: true },
})

const modalEl = ref(null)
let modal = null
const form = ref({ title: '', content: '', source_url: '', tags: '' })
const editing = ref(false)
const editId = ref(null)
const fetching = ref(false)
const saving = ref(false)
const errorMessage = ref('')

onMounted(() => { modal = new Modal(modalEl.value) })
onBeforeUnmount(() => { modal?.dispose() })

function open(snippet) {
  if (snippet) {
    editing.value = true
    editId.value = snippet.id
    form.value = {
      title: snippet.title || '',
      content: snippet.content,
      source_url: snippet.source_url || '',
      tags: (snippet.tags || []).join(', ')
    }
  } else {
    editing.value = false
    editId.value = null
    form.value = { title: '', content: '', source_url: '', tags: '' }
  }
  errorMessage.value = ''
  modal.show()
}

async function fetchTitle() {
  if (!form.value.source_url) return
  fetching.value = true
  errorMessage.value = ''
  try {
    const title = await api.fetchTitle(form.value.source_url)
    if (title) form.value.title = title
  } catch (err) {
    errorMessage.value = apiErrorMessage(err, 'Could not fetch the page title.')
  } finally {
    fetching.value = false
  }
}

async function save() {
  if (saving.value) return
  if (!form.value.content.trim()) {
    errorMessage.value = 'The snippet is empty.'
    return
  }
  saving.value = true
  errorMessage.value = ''
  try {
    await props.saveSnippet({ ...form.value, tags: parseTagInput(form.value.tags), id: editId.value })
    modal.hide()
  } catch (err) {
    errorMessage.value = apiErrorMessage(err, 'Could not save the snippet. Nothing was lost; please try again.')
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <div ref="modalEl" class="modal fade" tabindex="-1" aria-labelledby="snippetModalTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="snippetModalTitle" class="modal-title">{{ editing ? 'Edit Snippet' : 'Add Snippet' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-2">
            <label for="snippetTitle" class="form-label small mb-1">Title</label>
            <input
              id="snippetTitle"
              v-model="form.title"
              class="form-control form-control-sm"
              placeholder="Title (optional)"
            />
          </div>
          <div class="mb-2">
            <label for="snippetContent" class="form-label small mb-1">Snippet</label>
            <textarea
              id="snippetContent"
              v-model="form.content"
              class="form-control form-control-sm font-monospace"
              rows="5"
              placeholder="Paste your snippet here..."
              style="resize: vertical;"
            ></textarea>
          </div>
          <div class="mb-2">
            <label for="snippetSourceUrl" class="form-label small mb-1">Source URL</label>
            <div class="input-group input-group-sm">
              <input
                id="snippetSourceUrl"
                v-model="form.source_url"
                type="url"
                class="form-control"
                placeholder="https://example.com (optional)"
              />
              <button
                class="btn btn-outline-secondary"
                type="button"
                :disabled="!form.source_url || fetching"
                @click="fetchTitle"
              >
                {{ fetching ? 'Fetching…' : 'Fetch title' }}
              </button>
            </div>
          </div>
          <div>
            <label for="snippetTags" class="form-label small mb-1">Tags</label>
            <input
              id="snippetTags"
              v-model="form.tags"
              class="form-control form-control-sm"
              placeholder="Comma-separated, e.g. vue, security"
            />
          </div>
          <div v-if="errorMessage" class="alert alert-danger py-2 px-3 mt-2 mb-0 small" role="alert">
            {{ errorMessage }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : 'Save snippet' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>