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

const { user, authLoading, signIn, logout } = useAuth()

const searchQuery = ref('')
const modalRef = ref(null)
const snippets = ref([])
const tags = ref([])
const activeTag = ref('')

// Incremented on logout to discard any in-flight requests from the previous session.
let loadEpoch = 0

async function loadSnippets() {
  if (!user.value) return
  const epoch = loadEpoch
  const data = await api.getSnippets(searchQuery.value, activeTag.value)
  if (epoch === loadEpoch) snippets.value = data
}

async function loadTags() {
  if (!user.value) return
  const epoch = loadEpoch
  const data = await api.getTags()
  if (epoch === loadEpoch) tags.value = data
}

function clearAll() {
  loadEpoch++
  snippets.value = []
  tags.value = []
  searchQuery.value = ''
  activeTag.value = ''
}

function selectTag(name) {
  activeTag.value = activeTag.value === name ? '' : name
  loadSnippets()
}

async function handleSave(payload) {
  const { id, ...data } = payload
  if (id) await api.updateSnippet(id, data)
  else await api.createSnippet(data)
  await loadSnippets()
  await loadTags()
}

async function handleDelete(id) {
  await api.deleteSnippet(id)
  await loadSnippets()
}

function handleExportAll() {
  if (snippets.value.length === 0) return
  const mdContent = snippets.value.map(snippetToMarkdown).join('\n---\n\n')
  downloadFile(mdContent, 'snippets-export.md')
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
let timer
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

  <div v-else-if="!user" class="sm-signin-screen">
    <div class="sm-signin-card card shadow-sm p-4">
      <h1 class="sm-signin-title fw-bold mb-1">
        <i class="bi bi-code-square me-2 text-primary"></i>SnippetMate
      </h1>
      <p class="text-muted mb-4">Capture, tag, and search your snippets.</p>
      <button class="btn btn-primary w-100" @click="signIn">
        <i class="bi bi-google me-2"></i>Sign in with Google
      </button>
    </div>
  </div>

  <div v-else id="snippetmate-app">
    <NavBar :user="user" @add="modalRef.open()" @export-all="handleExportAll" @logout="logout" />
    <SearchBar v-model="searchQuery" />

    <div class="d-flex">
      <TagSidebar
        :tags="tags"
        :active="activeTag"
        :snippet-count="snippets.length"
        @select="selectTag"
      />
      <main class="flex-grow-1 bg-body p-3" style="min-height: 90vh; min-width: 0;">
        <SnippetList
          :snippets="snippets"
          @edit="modalRef.open($event)"
          @delete="handleDelete"
        />
      </main>
    </div>
    <SnippetFormModal ref="modalRef" @save="handleSave" />
  </div>
</template>

<style>
#snippetmate-app {
  overflow-x: hidden;
}

.sm-tag {
  background: #f0ddd5;
  color: #9e3a15;
  font-size: 12px;
  padding: 3px 10px;
  cursor: pointer;
  border: none;
}
.sm-tag:hover { background: #e8cfc3; color: #7a2e10; }

.sm-loading-screen,
.sm-signin-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sm-signin-card {
  width: 100%;
  max-width: 360px;
  text-align: center;
}

.sm-signin-title {
  font-size: 1.6rem;
}
</style>
