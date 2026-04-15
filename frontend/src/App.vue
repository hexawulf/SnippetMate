<script setup>
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import SearchBar from './components/SearchBar.vue'

const searchQuery = ref('')
</script>

<template>
  <div id="app">
    <NavBar />
    <SearchBar v-model="searchQuery" />

    <div class="d-flex">

      <aside
        class="d-none d-md-block bg-light border-end p-3"
        style="width: 240px; min-height: 90vh;"
      >
        Sidebar placeholder
      </aside>


      <main class="flex-grow-1 bg-body p-3" style="min-height: 90vh;">
        {{ searchQuery }}
      </main>
    </div>
  </div>
</template>