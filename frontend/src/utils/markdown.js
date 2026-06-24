export function snippetToMarkdown(snippet) {
  let md = ''

  const title = snippet.title ? snippet.title : 'Untitled snippet'
  md += `# ${title}\n\n`

  if (snippet.source_url) {
    md += `> Source: ${snippet.source_url}\n\n`
  }

  if (snippet.tags && snippet.tags.length > 0) {
    md += `Tags: ${snippet.tags.map(t => '#' + t).join(' ')}\n\n`
  }

  md += '```\n'
  md += `${snippet.content}\n`
  md += '```\n\n'

  md += '_Exported from SnippetMate_\n'

  return md
}

export function generateFilename(snippet) {
  if (snippet.title) {
    // lowercase, non-alphanumeric runs collapsed to single hyphens, trimmed
    let slug = snippet.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (slug) {
      return `${slug}.md`
    }
  }
  return `snippet-${snippet.id}.md`
}

export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
