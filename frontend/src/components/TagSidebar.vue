<script setup>
defineProps(['tags', 'active', 'snippetCount'])
defineEmits(['select'])
</script>

<template>
  <aside class="bg-white border-end p-3 flex-shrink-0 d-none d-md-block"
         style="width: 240px; font-size: 13px;">
    <p class="text-uppercase small text-muted fw-medium mb-2">Filter by tag</p>
    <div class="d-flex flex-wrap gap-1 mb-3">
      <span
        v-for="tag in tags"
        :key="tag"
        class="badge rounded-pill sm-tag"
        :class="active === tag ? 'bg-primary text-white' : ''"
        @click="$emit('select', tag)"
      >{{ tag }}</span>
    </div>

    <p class="text-uppercase small text-muted fw-medium mb-2">Stats</p>
    <div class="text-muted small" style="line-height: 1.8;">
      <div>{{ snippetCount }} snippets</div>
      <div>{{ tags.length }} tags</div>
    </div>

    <div class="border-top mt-3 pt-3">
      <p class="text-uppercase small text-muted fw-medium mb-2">Export</p>
      <button class="btn btn-outline-primary btn-sm w-100 mb-1" style="font-size: 12px;">Export as JSON</button>
      <button class="btn btn-outline-secondary btn-sm w-100" style="font-size: 12px;">Export as CSV</button>
    </div>
  </aside>
</template>