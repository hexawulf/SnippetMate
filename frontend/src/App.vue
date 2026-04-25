<script setup>
import { ref, onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import SearchBar from './components/SearchBar.vue'
import TagSidebar from './components/TagSidebar.vue'
import SnippetList from './components/SnippetList.vue'
import SnippetFormModal from './components/SnippetFormModal.vue'
import api from './services/api.js'

const searchQuery = ref('')
const modalRef = ref(null)
const snippets = ref([])

async function loadSnippets() {
  snippets.value = await api.getSnippets()
}

async function handleSave(payload) {
  const { id, ...data } = payload
  if (id) await api.updateSnippet(id, data)
  else await api.createSnippet(data)
  await loadSnippets()
}

async function handleDelete(id) {
  await api.deleteSnippet(id)
  await loadSnippets()
}

onMounted(loadSnippets)
</script>

<template>
  <div id="snippetmate-app">
    <NavBar @add="modalRef.open()" />
    <SearchBar v-model="searchQuery" />

    <div class="d-flex">

      <TagSidebar />


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
/* SnippetMate (tags) design-specific styling (with sm-* prefix).
   Not scoped - because shared with both TagSidebar and SnippetCard. */

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
</style>

