<script setup>
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import SearchBar from './components/SearchBar.vue'
import TagSidebar from './components/TagSidebar.vue'
const searchQuery = ref('')
</script>

<template>
  <div id="app">
    <NavBar />
    <SearchBar v-model="searchQuery" />

    <div class="d-flex">

      <TagSidebar />


      <main class="flex-grow-1 bg-body p-3" style="min-height: 90vh;">
        {{ searchQuery }}
      </main>
    </div>
  </div>
</template>
<style>
/* SnippetMate (tags) design-specific styling (sm-* prefix).
   Not scoped on purpose because these are shared with both TagSidebar and SnippetCard. */
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

