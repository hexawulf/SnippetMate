<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'

const emit = defineEmits(['save'])

const modalEl = ref(null)
let modal = null
const form = ref({ title: '', content: '', source_url: '', tags: '' })
const editing = ref(false)
const editId = ref(null)

onMounted(() => { modal = new Modal(modalEl.value) })

function open(snippet) {
  if (snippet) {
    editing.value = true
    editId.value = snippet.id
    form.value = {
      title: snippet.title,
      content: snippet.content,
      source_url: snippet.source_url || '',
      tags: (snippet.tags || []).join(', ')
    }
  } else {
    editing.value = false
    editId.value = null
    form.value = { title: '', content: '', source_url: '', tags: '' }
  }
  modal.show()
}

function save() {
  emit('save', { ...form.value, id: editId.value })
  modal.hide()
}

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
          <input
            v-model="form.source_url"
            type="url"
            class="form-control mb-2"
            placeholder="Source URL (optional)"
            style="font-size: 13px;"
          />
          <input
            v-model="form.tags"
            class="form-control"
            placeholder="Tags (comma-separated)"
            style="font-size: 13px;"
          />
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary btn-sm" @click="save">Save snippet</button>
        </div>
      </div>
    </div>
  </div>
</template>