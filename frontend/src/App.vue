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

{ id: 2, title: 'China shock 2.0 should Europe welcome Chinese investment', content: 'Impelled by furious competition, hefty subsidies and sheer scale, the country’s companies are cutting a swath through the world’s most advanced industries', source_url: 'https://www.ft.com/content/7d51a630-a3de-4cc7-9f5f-0f3e7f0d305a?syn-25a6b1a6=1', tags: ['China', 'Europe', 'investment'], created_at: '2026-04-18' },

{ id: 3, title: 'Anthropic, Amazon Tighten Bond in $5 Billion Investment and Computing Deal', content: 'Amazon will invest as much as $25 billion in the AI company, which will secure up to 5 gigawatts in badly needed computing power in the pact', source_url: 'https://www.wsj.com/tech/ai/anthropic-amazon-tighten-bond-in-5-billion-investment-and-computing-deal-b9d8e513?mod=tech_lead_story', tags: ['AI', 'Data centre', 'Anthropic', 'Amazon'], created_at: '2026-04-21' },

{ id: 4, title: 'You’re About to See a Lot of Critical Software Updates. Don’t Ignore Them', content: 'Anthropic’s newest, as-yet-unreleased AI model is a hacker’s dream, so here’s the cybersecurity advice you need to start taking seriously right now', source_url: 'https://www.wsj.com/tech/personal-tech/anthropic-mythos-security-software-updates-573cc9b3', tags: ['Anthropic', 'cybersecurity'], created_at: '2026-04-20' }
])
</script>

<template>
  <div id="snippetmate-app">
    <NavBar />
    <SearchBar v-model="searchQuery" />

    <div class="d-flex">

      <TagSidebar />


      <main class="flex-grow-1 bg-body p-3" style="min-height: 90vh; min-width: 0;">
        <SnippetList :snippets="snippets" />
      </main>
    </div>
    <SnippetFormModal ref="modalRef" />
  </div>
</template>
<style>
/* SnippetMate (tags) design-specific styling (sm-* prefix).
   Not scoped - because shared with both TagSidebar and SnippetCard. */

   #snippetmate-app {
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

