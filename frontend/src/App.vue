<script setup>
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import SearchBar from './components/SearchBar.vue'
import TagSidebar from './components/TagSidebar.vue'
import SnippetList from './components/SnippetList.vue'
import SnippetFormModal from './components/SnippetFormModal.vue'

const searchQuery = ref('')
const modalRef = ref(null)
const snippets = ref([
  { id: 1, title: 'Data centre delays threaten to choke AI expansion', content: 'Almost 40% of such builds in US risk hold-ups, including projects tied to Microsoft and OpenAI', source_url: 'https://www.ft.com/content/f2bae708-f5c3-49b0-99c0-e4a11552427b?syn-25a6b1a6=1', tags: ['AI', 'Data centre'], created_at: '2026-04-18' },
  { id: 2, title: 'China shock 2.0 should Europe welcome Chinese investment', content: 'Impelled by furious competition, hefty subsidies and sheer scale, the country’s companies are cutting a swath through the world’s most advanced industries', created_at: '2026-04-18', source_url: 'https://www.ft.com/content/7d51a630-a3de-4cc7-9f5f-0f3e7f0d305a?syn-25a6b1a6=1' }
])
</script>

<template>
  <div id="app">
    <NavBar />
    <SearchBar v-model="searchQuery" />

    <div class="d-flex">

      <TagSidebar />


      <main class="flex-grow-1 bg-body p-3" style="min-height: 90vh;">
        <SnippetList :snippets="snippets" />
      </main>
    </div>
    <SnippetFormModal ref="modalRef" />
  </div>
</template>
<style>
/* SnippetMate (tags) design-specific styling (sm-* prefix).
   Not scoped - because shared with both TagSidebar and SnippetCard. */

   #app {
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

