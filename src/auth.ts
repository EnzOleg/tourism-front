import { ref } from "vue"

export const isAuthenticated = ref(!!localStorage.getItem("token"))

export function logout() {
  localStorage.removeItem("token")
  isAuthenticated.value = false
}