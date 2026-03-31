<script setup lang="ts">
import { isAuthenticated } from "../auth"
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Логотип -->
      <div class="logo">
        <router-link to="/" class="logo-link">TravelApp</router-link>
      </div>

      <!-- Навигация -->
      <nav class="nav">
        <router-link to="/" class="nav-link" active-class="active">Главная</router-link>
        <router-link to="/hotels" class="nav-link" active-class="active">Отели</router-link>

        <template v-if="isAuthenticated">
          <router-link to="/favorites" class="nav-link" active-class="active">Избранное</router-link>
          <router-link to="/profile" class="nav-link" active-class="active">Профиль</router-link>
        </template>

        <template v-else>
          <router-link to="/login" class="nav-link" active-class="active">Логин</router-link>
          <router-link to="/register" class="nav-link" active-class="active">Регистрация</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), 0 2px 6px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px); /* Лёгкое размытие при скролле */
  border-bottom: 1px solid rgba(0, 0, 0, 0.02);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Логотип */
.logo-link {
  font-size: 1.6rem;
  font-weight: 700;
  text-decoration: none;
  color: #3b82f6; /* синий */
  letter-spacing: -0.5px;
  transition: color 0.2s ease;
}

.logo-link:hover {
  color: #2563eb; /* темнее при наведении */
}

/* Навигация */
.nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: #4b5563; /* серый, нейтральный */
  font-weight: 500;
  font-size: 1rem;
  border-radius: 40px; /* скруглённые кнопки */
  transition: all 0.2s ease;
  background-color: transparent;
}

.nav-link:hover {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05); /* очень лёгкая синяя подложка */
}

.nav-link.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

/* Адаптивность для мобильных */
@media (max-width: 640px) {
  .header-container {
    padding: 0 16px;
    height: 60px;
  }

  .logo-link {
    font-size: 1.4rem;
  }

  .nav {
    gap: 4px;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>