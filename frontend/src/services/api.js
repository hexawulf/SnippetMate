import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

export default {
  getSnippets(q, tag) {
    return api.get('/snippets', { params: { q, tag } }).then(res => res.data)
  },
  createSnippet(snippet) {
    return api.post('/snippets', snippet)
  },
  updateSnippet(id, snippet) {
    return api.put(`/snippets/${id}`, snippet)
  },
  deleteSnippet(id) {
    return api.delete(`/snippets/${id}`)
  },
  fetchTitle(url) {
    return api.post('/fetch-title', { url }).then(res => res.data.title)
  },
  getTags() {
    return api.get('/tags').then(res => res.data)
  }
}