<script setup lang="ts">
import { ref } from "vue"
import { register } from "../api/api"
import { useRouter } from "vue-router"

const username = ref("")
const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

const router = useRouter()

async function handleRegister() {
  // Простая валидация
  if (!username.value || !email.value || !password.value) {
    error.value = "Заполните все поля"
    return
  }
  // Можно добавить проверку email

  loading.value = true
  error.value = ""

  try {
    await register(username.value, email.value, password.value)
    router.push("/login")
  } catch (err) {
    error.value = "Ошибка при регистрации. Возможно, пользователь уже существует."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="container">
      <h1 class="page-title">
        <span class="title-accent"></span>
        Регистрация
      </h1>

      <div class="register-card">
        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username">Имя пользователя</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              :disabled="loading"
            />
          </div>

          <p v-if="error" class="error-message">{{ error }}</p>

          <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-small"></span>
            {{ loading ? "Регистрация..." : "Зарегистрироваться" }}
          </button>
        </form>

        <p class="login-link">
          Уже есть аккаунт?
          <router-link to="/login" class="link">Войти</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Переопределяем глобальный .container только для этой страницы */
.register-page .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 150px 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 100vh;
}

.register-page {
  background-color: #ffffff;
  max-height: 100vh;
  display: flex;
  align-items: center;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  padding-left: 480px;
  font-weight: 600;
  margin-bottom: 40px;
  color: #111827;
}

.title-accent {
  width: 8px;
  height: 40px;
  background-color: #3b82f6;
  border-radius: 4px;
}

.register-card {
  max-width: 420px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 12px 16px;
  border-radius: 40px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 40px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  transform: scale(1.02);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  margin: -8px 0 0;
  text-align: center;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 0.95rem;
  color: #6b7280;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.link:hover {
  text-decoration: underline;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  .register-card {
    padding: 24px;
  }
}
</style>