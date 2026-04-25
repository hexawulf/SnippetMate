import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

export default {
  getSnippets() {
    return api.get('/snippets').then(res => res.data)
  },
  createSnippet(snippet) {
    return api.post('/snippets', snippet)
  },
  updateSnippet(id, snippet) {
    return api.put(`/snippets/${id}`, snippet)
  },
  deleteSnippet(id) {
    return api.delete(`/snippets/${id}`)
  }
}