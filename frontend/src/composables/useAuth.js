import { ref } from 'vue'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase.js'

// Module-scope refs — shared across all callers without Pinia.
const user = ref(null)
const authLoading = ref(true)

onAuthStateChanged(auth, (u) => {
  user.value = u
  authLoading.value = false
})

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
