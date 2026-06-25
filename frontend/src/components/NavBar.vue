<script setup>
import { ref, nextTick } from 'vue'
import AboutModal from './AboutModal.vue'

defineProps({
  user: { type: Object, default: null },
})
const emit = defineEmits(['add', 'export-all', 'logout'])

const aboutModalRef = ref(null)
const infoBtnRef = ref(null)

function openAboutModal() {
  aboutModalRef.value?.open()
}

function handleAboutModalClosed() {
  // Return focus to the info button when modal closes
  nextTick(() => {
    infoBtnRef.value?.focus()
  })
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
        <i class="bi bi-info-circle"></i>
      </button>
    </div>

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
