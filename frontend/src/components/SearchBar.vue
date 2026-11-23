<script setup>
defineProps({
  modelValue: { type: String, required: true },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="sm-header-bar border-bottom px-3 py-2 pb-3" style="border-color: var(--sm-header-border) !important;">
    <div class="position-relative mx-auto" style="max-width: 600px;">
      <input
        type="search"
        class="form-control ps-5 rounded"
        aria-label="Search snippets"
        placeholder="Search snippets by title or content"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
         aria-hidden="true"></i>
    </div>
  </div>
</template>