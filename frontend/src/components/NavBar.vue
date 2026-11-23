<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import api from '../services/api.js'
import AboutModal from './AboutModal.vue'
import { apiErrorMessage } from '../utils/safety.js'
import { fireDialog } from '../utils/swal.js'

defineProps({
  user: { type: Object, default: null },
  theme: { type: String, required: true },
})
const emit = defineEmits(['add', 'export-all', 'export-json', 'imported', 'logout', 'toggle-theme'])

const aboutModalRef = ref(null)
const infoBtnRef = ref(null)
const fileInputRef = ref(null)
const menuRef = ref(null)
const menuOpen = ref(false)

function openAboutModal() {
  menuOpen.value = false
  aboutModalRef.value?.open()
}

function handleAboutModalClosed() {
  nextTick(() => {
    infoBtnRef.value?.focus()
  })
}

function runMenuAction(action) {
  menuOpen.value = false
  if (action === 'import') fileInputRef.value?.click()
  else emit(action)
}

function onDocumentClick(event) {
  if (menuOpen.value && menuRef.value && !menuRef.value.contains(event.target)) {
    menuOpen.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && menuOpen.value) menuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  let parsed
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    fireDialog('Error', 'That file is not valid JSON.', 'error')
    if (fileInputRef.value) fileInputRef.value.value = ''
    return
  }

  try {
    const result = await api.importSnippets(parsed)
    let msg = `Imported ${result.imported}, skipped ${result.skipped}`
    if (result.errors && result.errors.length) {
      msg += `\n(${result.errors.length} errors encountered)`
    }

    await fireDialog({
      title: 'Import Complete',
      text: msg,
      icon: result.errors?.length ? 'warning' : 'success'
    })

    emit('imported')
  } catch (err) {
    fireDialog('Import failed', apiErrorMessage(err, 'The server could not import this file.'), 'error')
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}
</script>

<template>
  <nav class="navbar sm-header-bar px-3 py-2 gap-2">
    <div class="d-flex align-items-center gap-2">
      <span class="navbar-brand d-flex align-items-center gap-2 fw-bold mb-0 p-0" style="color: var(--sm-header-fg);">
        <span class="sm-brand-tile-sm d-inline-flex align-items-center justify-content-center rounded-2 text-white">
          <i class="bi bi-code-square" style="font-size: 0.9rem;" aria-hidden="true"></i>
        </span>
        <span>SnippetMate</span>
      </span>
      <button
        ref="infoBtnRef"
        type="button"
        class="btn btn-sm sm-nav-btn rounded-circle d-inline-flex align-items-center justify-content-center"
        style="width: 28px; height: 28px; padding: 0;"
        aria-label="About SnippetMate"
        title="About SnippetMate"
        @click="openAboutModal"
      >
        <i class="bi bi-info" style="font-size: 18px; line-height: 1;" aria-hidden="true"></i>
      </button>
    </div>

    <div class="d-flex align-items-center flex-wrap gap-2 ms-auto">
      <input type="file" accept="application/json" class="d-none" ref="fileInputRef" id="importFileInput" @change="handleFileSelect" />

      <button type="button" class="btn btn-sm sm-nav-cta text-nowrap" @click="emit('add')">
        <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>New<span class="d-none d-sm-inline"> snippet</span>
      </button>

      <div ref="menuRef" class="position-relative">
        <button
          type="button"
          class="btn btn-sm sm-nav-btn text-nowrap"
          aria-label="Data: export or import snippets"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <i class="bi bi-arrow-down-up me-1" aria-hidden="true"></i>Data
        </button>
        <div v-if="menuOpen" class="dropdown-menu dropdown-menu-end show shadow-sm mt-1" role="menu" style="right: 0; left: auto;">
          <button type="button" class="dropdown-item small" role="menuitem" @click="runMenuAction('export-all')">
            <i class="bi bi-markdown me-2" aria-hidden="true"></i>Export Markdown
          </button>
          <button type="button" class="dropdown-item small" role="menuitem" @click="runMenuAction('export-json')">
            <i class="bi bi-filetype-json me-2" aria-hidden="true"></i>Export JSON
          </button>
          <hr class="dropdown-divider my-1" />
          <button type="button" class="dropdown-item small" role="menuitem" @click="runMenuAction('import')">
            <i class="bi bi-upload me-2" aria-hidden="true"></i>Import JSON…
          </button>
        </div>
      </div>

      <button
        type="button"
        class="btn btn-sm sm-nav-btn"
        :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        :title="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="emit('toggle-theme')"
      >
        <i :class="theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'" aria-hidden="true"></i>
      </button>

      <template v-if="user">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || user.email"
          class="sm-avatar rounded-circle"
          referrerpolicy="no-referrer"
        />
        <span class="small d-none d-lg-inline" style="color: var(--sm-header-fg);">{{ user.displayName || user.email }}</span>
        <button type="button" class="btn btn-sm sm-nav-btn text-nowrap" @click="emit('logout')">Sign out</button>
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
