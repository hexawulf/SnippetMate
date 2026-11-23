<script setup>
defineProps({
  modelValue: { type: String, required: true },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="bg-primary px-3 py-3 pb-4">
    <div class="position-relative mx-auto" style="max-width: 600px;">
      <input
        type="search"
        class="form-control ps-5 border-0 rounded"
        aria-label="Search snippets"
        placeholder="Search snippets by title or content"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 opacity-50"
         aria-hidden="true"
         style="font-size: 1rem; color: #333;"></i>
    </div>
  </div>
</template>