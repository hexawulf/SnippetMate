<script setup>
defineProps({
  tags: { type: Array, required: true },
  active: { type: String, required: true },
  snippetCount: { type: Number, required: true },
})
defineEmits(['select'])
</script>

<template>
  <!-- The d-none d-md-block class will hide the sidebar on small screens (mobile/tablet portrait). -->
  <aside class="bg-white border-end p-3 flex-shrink-0 d-none d-md-block"
         style="width: 240px; font-size: 13px;">
    <p class="text-uppercase small text-muted fw-medium mb-2">Filter by tag</p>
    <div class="d-flex flex-wrap gap-1 mb-3">
      <button
        v-for="tag in tags"
        :key="tag"
        type="button"
        class="badge rounded-pill sm-tag"
        :class="active === tag ? 'bg-primary text-white' : ''"
        :aria-pressed="active === tag"
        @click="$emit('select', tag)"
      >{{ tag }}</button>
    </div>

    <p class="text-uppercase small text-muted fw-medium mb-2">Stats</p>
    <div class="text-muted small" style="line-height: 1.8;">
      <div>{{ snippetCount }} snippets</div>
      <div>{{ tags.length }} tags</div>
    </div>

    <div class="border-top mt-3 pt-3 text-center">
      <a href="https://github.com/hexawulf/SnippetMate"
         target="_blank"
         rel="noopener noreferrer"
         class="text-muted"
         aria-label="View SnippetMate on GitHub"
         title="View on GitHub">
        <i class="bi bi-github fs-4" aria-hidden="true"></i>
      </a>
    </div>
  </aside>
</template>