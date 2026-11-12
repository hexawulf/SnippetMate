<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
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

function open(snippet) {
  if (snippet) {
    editing.value = true
    editId.value = snippet.id
    form.value = {
      title: snippet.title,
      content: snippet.content,
      source_url: snippet.source_url || '',
      // Tags are an array in the database, but a comma-separated string in the input field, so we join them here.
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

// Ask the backend to fetch the page title for the given URL. This will then be filled into the title field.
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

// Expose open() so the parent can call modalRef.value.open(snippet), and then the modal will be shown.
defineExpose({ open })
</script>

<template>
  <div ref="modalEl" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ editing ? 'Edit Snippet' : 'Add Snippet' }}</h5>
          <button class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <input
            v-model="form.title"
            class="form-control mb-2"
            placeholder="Title"
            style="font-size: 13px;"
          />
          <textarea
            v-model="form.content"
            class="form-control font-monospace mb-2"
            rows="4"
            placeholder="Paste your snippet here..."
            style="font-size: 13px; resize: vertical;"
          ></textarea>
          
          <div class="input-group mb-2">
            <input
              v-model="form.source_url"
              type="url"
              class="form-control"
              placeholder="Source URL (optional)"
              style="font-size: 13px;"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              :disabled="!form.source_url || fetching"
              @click="fetchTitle"
              style="font-size: 13px;"
            >
              {{ fetching ? 'Fetching…' : 'Fetch title' }}
            </button>
          </div>

          <input
            v-model="form.tags"
            class="form-control"
            placeholder="Tags (comma-separated)"
            style="font-size: 13px;"
          />
          <div v-if="errorMessage" class="alert alert-danger py-2 px-3 mt-2 mb-0" role="alert" style="font-size: 13px;">
            {{ errorMessage }}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary btn-sm" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : 'Save snippet' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>