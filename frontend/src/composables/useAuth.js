import { ref } from 'vue'
import { onAuthStateChanged, signInWithPopup, signOut } from '@firebase/auth'
import { auth, googleProvider } from '../services/firebase.js'

// Module-scope refs — shared across all callers without Pinia.
const user = ref(null)
const authLoading = ref(true)

if (import.meta.env.MODE === 'e2e') {
  const mode = new URLSearchParams(location.search).get('e2eAuth') || 'user1'
  if (mode === 'signed-out') {
    authLoading.value = false
  } else if (mode !== 'loading') {
    const second = mode === 'user2'
    user.value = {
      uid: second ? 'seed-demo-2' : 'seed-demo',
      displayName: second ? 'Seed Demo 2' : 'Seed Demo',
      email: second ? 'seed-demo-2@snippetmate.local' : 'demo@snippetmate.local',
    }
    authLoading.value = false
  }
} else {
  onAuthStateChanged(auth, (u) => {
    user.value = u
    authLoading.value = false
  })
}

export function useAuth() {
  async function signIn() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      // Ignore user-dismissed popups; rethrow anything unexpected.
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        throw err
      }
    }
  }

  return { user, authLoading, signIn, logout: () => signOut(auth) }
}
