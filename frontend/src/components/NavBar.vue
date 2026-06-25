<script setup>
defineProps({
  user: { type: Object, default: null },
})
const emit = defineEmits(['add', 'export-all', 'logout'])
</script>

<template>
  <nav class="navbar bg-primary px-3 py-2">
    <span class="navbar-brand text-white fw-bold mb-0">
      <i class="bi bi-code-square me-2"></i>SnippetMate
    </span>
    <div class="d-flex align-items-center gap-2 ms-auto">
      <button class="btn btn-light btn-sm" @click="emit('export-all')">Export all</button>
      <button class="btn btn-light btn-sm" @click="emit('add')">+ New snippet</button>
      <template v-if="user">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || user.email"
          class="sm-avatar rounded-circle"
          referrerpolicy="no-referrer"
        />
        <span v-else class="text-white small">{{ user.displayName || user.email }}</span>
        <button class="btn btn-outline-light btn-sm" @click="emit('logout')">Sign out</button>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.sm-avatar {
  width: 28px;
  height: 28px;
  object-fit: cover;
}
</style>
