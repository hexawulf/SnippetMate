<script setup>
const emit = defineEmits(['add', 'export-all'])
</script>

<template>
  <nav class="navbar bg-primary px-3 py-2">
    <span class="navbar-brand text-white fw-bold mb-0"><i class="bi bi-code-square me-2"></i>SnippetMate</span>
    <div class="d-flex gap-2 ms-auto">
      <button class="btn btn-light btn-sm" @click="emit('export-all')">Export all</button>
      <button class="btn btn-light btn-sm" @click="emit('add')">+ New snippet</button>
    </div>
  </nav>
</template>