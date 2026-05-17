<script setup lang="ts">
import { ref } from "vue"
import { isAuthenticated } from "../auth"

const isMenuOpen = ref(false)

function closeMenu() {
  isMenuOpen.value = false
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Логотип -->
      <div class="logo">
        <router-link to="/" class="logo-link" @click="closeMenu">
          TravelApp
        </router-link>
      </div>

      <!-- Кнопка мобильного меню -->
      <button
        class="burger-btn"
        type="button"
        @click="toggleMenu"
        :aria-expanded="isMenuOpen"
        aria-label="Открыть меню"
      >
        <span :class="{ active: isMenuOpen }"></span>
        <span :class="{ active: isMenuOpen }"></span>
        <span :class="{ active: isMenuOpen }"></span>
      </button>

      <!-- Навигация -->
      <nav class="nav" :class="{ open: isMenuOpen }">
        <router-link
          to="/"
          class="nav-link"
          active-class="active"
          @click="closeMenu"
        >
          Главная
        </router-link>

        <router-link
          to="/hotels"
          class="nav-link"
          active-class="active"
          @click="closeMenu"
        >
          Отели
        </router-link>

        <template v-if="isAuthenticated">
          <router-link
            to="/favorites"
            class="nav-link"
            active-class="active"
            @click="closeMenu"
          >
            Избранное
          </router-link>

          <router-link
            to="/profile"
            class="nav-link"
            active-class="active"
            @click="closeMenu"
          >
            Профиль
          </router-link>
        </template>

        <template v-else>
          <router-link
            to="/login"
            class="nav-link"
            active-class="active"
            @click="closeMenu"
          >
            Логин
          </router-link>

          <router-link
            to="/register"
            class="nav-link"
            active-class="active"
            @click="closeMenu"
          >
            Регистрация
          </router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: rgba(255, 255, 255, 0.96);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), 0 2px 6px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
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
  position: relative;
}

/* Логотип */
.logo {
  flex-shrink: 0;
}

.logo-link {
  font-size: 1.6rem;
  font-weight: 700;
  text-decoration: none;
  color: #3b82f6;
  letter-spacing: -0.5px;
  transition: color 0.2s ease;
}

.logo-link:hover {
  color: #2563eb;
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
  color: #4b5563;
  font-weight: 500;
  font-size: 1rem;
  border-radius: 40px;
  transition: all 0.2s ease;
  background-color: transparent;
  white-space: nowrap;
}

.nav-link:hover {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

.nav-link.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

/* Бургер */
.burger-btn {
  display: none;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.08);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  padding: 0;
}

.burger-btn span {
  width: 20px;
  height: 2px;
  border-radius: 999px;
  background: #3b82f6;
  transition: 0.2s ease;
}

.burger-btn span:nth-child(1).active {
  transform: translateY(7px) rotate(45deg);
}

.burger-btn span:nth-child(2).active {
  opacity: 0;
}

.burger-btn span:nth-child(3).active {
  transform: translateY(-7px) rotate(-45deg);
}

/* Планшеты */
@media (max-width: 768px) {
  .header-container {
    padding: 0 18px;
    height: 64px;
  }

  .logo-link {
    font-size: 1.45rem;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 0.95rem;
  }
}

/* Телефоны */
@media (max-width: 640px) {
  .header-container {
    height: 60px;
    padding: 0 16px;
  }

  .logo-link {
    font-size: 1.35rem;
  }

  .burger-btn {
    display: flex;
  }

  .nav {
    position: absolute;
    top: calc(100% + 8px);
    left: 12px;
    right: 12px;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    padding: 12px;
    border-radius: 20px;
    background: white;
    box-shadow: 0 18px 35px rgba(15, 23, 42, 0.14);
    border: 1px solid rgba(0, 0, 0, 0.04);

    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    pointer-events: none;
    transition: 0.2s ease;
  }

  .nav.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  .nav-link {
    width: 100%;
    padding: 12px 14px;
    border-radius: 14px;
    font-size: 0.95rem;
    box-sizing: border-box;
  }
}

/* Очень маленькие экраны */
@media (max-width: 380px) {
  .header-container {
    padding: 0 12px;
  }

  .logo-link {
    font-size: 1.2rem;
  }

  .burger-btn {
    width: 38px;
    height: 38px;
  }

  .nav {
    left: 8px;
    right: 8px;
  }
}
</style>