<script setup>
import { ref, nextTick } from 'vue'
import Swal from 'sweetalert2'
import api from '../services/api.js'
import AboutModal from './AboutModal.vue'

defineProps({
  user: { type: Object, default: null },
})
const emit = defineEmits(['add', 'export-all', 'export-json', 'imported', 'logout'])

const aboutModalRef = ref(null)
const infoBtnRef = ref(null)
const fileInputRef = ref(null)

function openAboutModal() {
  aboutModalRef.value?.open()
}

function handleAboutModalClosed() {
  // Return focus to the info button when modal closes
  nextTick(() => {
    infoBtnRef.value?.focus()
  })
}

async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    
    const result = await api.importSnippets(parsed)
    let msg = `Imported ${result.imported}, skipped ${result.skipped}`
    if (result.errors && result.errors.length) {
      msg += `\n(${result.errors.length} errors encountered)`
    }
    
    await Swal.fire({
      title: 'Import Complete',
      text: msg,
      icon: result.errors?.length ? 'warning' : 'success'
    })
    
    emit('imported')
  } catch (err) {
    Swal.fire('Error', 'Invalid JSON file', 'error')
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}
</script>

<template>
  <nav class="navbar bg-primary px-3 py-2">
    <div class="d-flex align-items-center">
      <span class="navbar-brand text-white fw-bold mb-0">
        <i class="bi bi-code-square me-2"></i>SnippetMate
      </span>
      <button
        ref="infoBtnRef"
        class="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center ms-2"
        style="width: 28px; height: 28px; padding: 0;"
        aria-label="About SnippetMate"
        @click="openAboutModal"
      >
        <i class="bi bi-info" style="font-size: 20px; line-height: 1;"></i>
      </button>
    </div>

    <div class="d-flex align-items-center gap-2 ms-auto">
      <input type="file" accept="application/json" class="d-none" ref="fileInputRef" id="importFileInput" @change="handleFileSelect" />
      <label for="importFileInput" class="btn btn-light btn-sm mb-0">Import</label>
      <button class="btn btn-light btn-sm" @click="emit('export-all')">Export all</button>
      <button class="btn btn-light btn-sm" @click="emit('export-json')">Export JSON</button>
      <button class="btn btn-light btn-sm" @click="emit('add')">+ New snippet</button>
      <template v-if="user">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || user.email"
          class="sm-avatar rounded-circle"
          referrerpolicy="no-referrer"
        />
        <span class="text-white small">{{ user.displayName || user.email }}</span>
        <button class="btn btn-outline-light btn-sm" @click="emit('logout')">Sign out</button>
      </template>
    </div>
  </nav>

  <AboutModal ref="aboutModalRef" @closed="handleAboutModalClosed" />
</template>

<style scoped>
.sm-avatar {
  width: 28px;
  height: 28px;
  object-fit: cover;
}
</style>
