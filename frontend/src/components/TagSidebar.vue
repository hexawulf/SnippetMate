<script setup>
</script>

<template>
  <aside class="bg-white border-end p-3 flex-shrink-0 d-none d-md-block"
         style="width: 240px; font-size: 13px;">
    <p class="text-uppercase small text-muted fw-medium mb-2">Filter by tag</p>
    <div class="d-flex flex-wrap gap-1 mb-3">
      <span class="badge rounded-pill sm-tag bg-primary text-white">NYT</span>
      <span class="badge rounded-pill sm-tag bg-primary text-white">WSJ</span>
      <span class="badge rounded-pill sm-tag bg-primary text-white">Financial Times</span>
      <span class="badge rounded-pill sm-tag bg-primary text-white">Reddit</span>
      <span class="badge rounded-pill sm-tag bg-primary text-white">X.com</span>
      <span class="badge rounded-pill sm-tag">Artificial Intelligence</span>
      <span class="badge rounded-pill sm-tag">Computer Science</span>
      <span class="badge rounded-pill sm-tag">Programming</span>
      <span class="badge rounded-pill sm-tag">Web Development</span>
      <span class="badge rounded-pill sm-tag">Database</span>
      <span class="badge rounded-pill sm-tag">Security</span>
      <span class="badge rounded-pill sm-tag">Networking</span>
      <span class="badge rounded-pill sm-tag">Operating Systems</span>
      <span class="badge rounded-pill sm-tag">Hardware</span>
    </div>

    <p class="text-uppercase small text-muted fw-medium mb-2">Stats</p>
    <div class="text-muted small" style="line-height: 1.8;">
      <div>120 snippets</div>
      <div>14 tags</div>
    </div>

    <div class="border-top mt-3 pt-3">
      <p class="text-uppercase small text-muted fw-medium mb-2">Export</p>
      <button class="btn btn-outline-primary btn-sm w-100 mb-1" style="font-size: 12px;">Export as JSON</button>
      <button class="btn btn-outline-secondary btn-sm w-100" style="font-size: 12px;">Export as CSV</button>
    </div>
  </aside>
</template>