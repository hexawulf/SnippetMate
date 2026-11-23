<script setup>
import { ref, watch } from 'vue'
import NavBar from './components/NavBar.vue'
import SearchBar from './components/SearchBar.vue'
import TagSidebar from './components/TagSidebar.vue'
import SnippetList from './components/SnippetList.vue'
import SnippetFormModal from './components/SnippetFormModal.vue'
import api from './services/api.js'
import { useAuth } from './composables/useAuth.js'
import { snippetToMarkdown, downloadFile } from './utils/markdown.js'
import { apiErrorMessage } from './utils/safety.js'
import { resolveInitialTheme, applyTheme } from './utils/theme.js'
import { fireDialog } from './utils/swal.js'
import pkg from '../package.json'

const { user, authLoading, signIn, logout } = useAuth()

const version = pkg.version
const theme = ref(resolveInitialTheme())
const searchQuery = ref('')
const modalRef = ref(null)
const snippets = ref([])
const tags = ref([])
const activeTag = ref('')
const loadError = ref('')

function toggleTheme() {
  theme.value = applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

// Incremented on logout to discard any in-flight requests from the previous session.
let loadEpoch = 0

// Each list request gets a number; only the newest one may update the list.
// Without it a slow response to an earlier search could overwrite the result
// of a later one.
let listRequest = 0
let timer

async function loadSnippets() {
  if (!user.value) return
  const epoch = loadEpoch
  const request = ++listRequest
  try {
    const data = await api.getSnippets(searchQuery.value, activeTag.value)
    if (epoch === loadEpoch && request === listRequest) {
      snippets.value = data
      loadError.value = ''
    }
  } catch (err) {
    console.error('Loading snippets failed:', err)
    if (epoch === loadEpoch && request === listRequest) {
      loadError.value = apiErrorMessage(err, 'Could not load your snippets.')
    }
  }
}

async function loadTags() {
  if (!user.value) return
  const epoch = loadEpoch
  try {
    const data = await api.getTags()
    if (epoch === loadEpoch) tags.value = data
  } catch (err) {
    console.error('Loading tags failed:', err)
  }
}

function clearAll() {
  clearTimeout(timer)
  loadEpoch++
  snippets.value = []
  tags.value = []
  searchQuery.value = ''
  activeTag.value = ''
  loadError.value = ''
}

function retryLoad() {
  loadSnippets()
  loadTags()
}

function selectTag(name) {
  activeTag.value = activeTag.value === name ? '' : name
  loadSnippets()
}

// Called by the form, which waits for it: a rejected promise keeps the form
// open with the error shown. The refresh afterwards is not part of the save.
async function handleSave(payload) {
  const { id, ...data } = payload
  if (id) await api.updateSnippet(id, data)
  else await api.createSnippet(data)
  loadSnippets()
  loadTags()
}

async function handleDelete(id) {
  try {
    await api.deleteSnippet(id)
  } catch (err) {
    fireDialog('Not deleted', apiErrorMessage(err, 'Could not delete the snippet.'), 'error')
    return
  }
  await loadSnippets()
  await loadTags()
}

function handleExportAll() {
  if (snippets.value.length === 0) return
  const mdContent = snippets.value.map(snippetToMarkdown).join('\n---\n\n')
  downloadFile(mdContent, 'snippets-export.md')
}

async function handleExportJson() {
  try {
    const data = await api.exportSnippetsJson()
    downloadFile(JSON.stringify(data, null, 2), 'snippetmate-export.json', 'application/json')
  } catch (err) {
    console.error('Export JSON failed:', err)
    fireDialog('Export failed', apiErrorMessage(err, 'Could not export your snippets.'), 'error')
  }
}

async function handleImported() {
  await loadSnippets()
  await loadTags()
}

watch(user, (u) => {
  if (u) {
    loadSnippets()
    loadTags()
  } else {
    clearAll()
  }
}, { immediate: true })

// Debounce search input.
watch(searchQuery, () => {
  clearTimeout(timer)
  timer = setTimeout(loadSnippets, 250)
})
</script>

<template>
  <!-- Auth loading: block render until Firebase resolves state to prevent flicker. -->
  <div v-if="authLoading" class="sm-loading-screen">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading…</span>
    </div>
  </div>

  <div v-else-if="!user" class="sm-signin-screen px-3 py-4">
    <button
      type="button"
      class="btn btn-outline-secondary btn-sm position-fixed top-0 end-0 m-3"
      :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
      :title="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
      @click="toggleTheme"
    >
      <i :class="theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'" aria-hidden="true"></i>
    </button>

    <main class="sm-signin-wrap">
      <div class="card shadow-sm p-4">
        <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
          <span class="sm-brand-tile d-inline-flex align-items-center justify-content-center rounded-3 text-white">
            <i class="bi bi-code-square fs-5" aria-hidden="true"></i>
          </span>
          <h1 class="h3 fw-bold mb-0">SnippetMate</h1>
        </div>
        <p class="text-muted text-center mb-3">Paste it. Tag it. Find it.</p>

        <ul class="list-unstyled small mb-4 text-start">
          <li class="mb-2 d-flex align-items-start gap-2">
            <i class="bi bi-tags text-primary mt-1" aria-hidden="true"></i>
            <span>Organize snippets with tags and search across titles and content.</span>
          </li>
          <li class="mb-2 d-flex align-items-start gap-2">
            <i class="bi bi-arrow-left-right text-primary mt-1" aria-hidden="true"></i>
            <span>Export to Markdown or round-trip backup and restore as JSON.</span>
          </li>
          <li class="d-flex align-items-start gap-2">
            <i class="bi bi-shield-lock text-primary mt-1" aria-hidden="true"></i>
            <span>Private per-user collection signed in with your Google account.</span>
          </li>
        </ul>

        <button type="button" class="btn btn-primary w-100 mb-2" @click="signIn">
          <i class="bi bi-google me-2" aria-hidden="true"></i>Sign in with Google
        </button>
        <a
          href="https://github.com/hexawulf/SnippetMate"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline-secondary btn-sm w-100"
        >
          <i class="bi bi-github me-2" aria-hidden="true"></i>View on GitHub
        </a>
      </div>

      <footer class="text-center text-muted small mt-3">
        SnippetMate v{{ version }} · MIT License · Built by
        <a href="https://0xwulf.dev" target="_blank" rel="noopener noreferrer">0xWulf</a>
      </footer>
    </main>
  </div>

  <div v-else id="snippetmate-app">
    <NavBar
      :user="user"
      :theme="theme"
      @add="modalRef.open()"
      @export-all="handleExportAll"
      @export-json="handleExportJson"
      @imported="handleImported"
      @logout="logout"
      @toggle-theme="toggleTheme"
    />
    <SearchBar v-model="searchQuery" />

    <div class="d-flex flex-column flex-md-row">
      <TagSidebar
        :tags="tags"
        :active="activeTag"
        :snippet-count="snippets.length"
        @select="selectTag"
      />
      <main class="flex-grow-1 p-3" style="min-height: 90vh; min-width: 0;">
        <div v-if="loadError" class="alert alert-danger d-flex align-items-center justify-content-between gap-2 mb-3" role="alert">
          <span>{{ loadError }}</span>
          <button type="button" class="btn btn-sm btn-outline-danger flex-shrink-0" @click="retryLoad">Retry</button>
        </div>
        <SnippetList
          v-if="!loadError || snippets.length"
          :snippets="snippets"
          :filtered="Boolean(searchQuery.trim() || activeTag)"
          @edit="modalRef.open($event)"
          @delete="handleDelete"
          @select-tag="selectTag"
        />
      </main>
    </div>
    <SnippetFormModal ref="modalRef" :save-snippet="handleSave" />
  </div>
</template>

<style>
#snippetmate-app {
  overflow-x: hidden;
}

.sm-header-bar {
  background-color: var(--sm-header-bg);
  color: var(--sm-header-fg);
}

.sm-brand-tile {
  width: 36px;
  height: 36px;
  background-color: var(--sm-brand);
}

.sm-brand-tile-sm {
  width: 28px;
  height: 28px;
  background-color: var(--sm-brand);
  border: 1px solid var(--sm-header-border);
}

.sm-nav-btn {
  color: var(--sm-header-fg);
  border-color: var(--sm-header-border);
  background-color: transparent;
}
.sm-nav-btn:hover,
.sm-nav-btn:focus-visible {
  color: var(--sm-header-fg);
  border-color: var(--sm-header-fg);
  background-color: rgba(255, 255, 255, 0.14);
}

.sm-nav-cta {
  background-color: var(--sm-cta-bg);
  color: var(--sm-cta-fg);
  border-color: var(--sm-cta-bg);
  font-weight: 600;
}
.sm-nav-cta:hover,
.sm-nav-cta:focus-visible {
  background-color: var(--sm-cta-bg);
  color: var(--sm-cta-fg);
  opacity: 0.92;
}

.sm-tag {
  background-color: var(--sm-tag-bg);
  color: var(--sm-tag-fg);
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  border: none;
}
.sm-tag:hover {
  background-color: var(--sm-tag-hover-bg);
  color: var(--sm-tag-fg);
}
.sm-tag.sm-tag-active {
  background-color: var(--bs-primary);
  color: var(--bs-white);
}
.sm-tag.sm-tag-active:hover {
  background-color: var(--sm-accent-hover);
  color: var(--bs-white);
}

.sm-snippet-body {
  white-space: pre-wrap;
  overflow-wrap: normal;
  overflow-x: auto;
  font-family: inherit;
}

.sm-loading-screen,
.sm-signin-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sm-signin-wrap {
  width: 100%;
  max-width: 440px;
}
</style>
