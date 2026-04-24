import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

export default {
  getSnippets() {
    return api.get('/snippets').then(res => res.data)
  }
}