<script setup lang="ts">
import { ref } from "vue"
import { createSupportRequest } from "../api/api"

const isOpen = ref(false)

const name = ref("")
const phone = ref("")
const error = ref("")
const success = ref("")
const loading = ref(false)

function toggleWidget() {
  isOpen.value = !isOpen.value
  error.value = ""
  success.value = ""
}

function closeWidget() {
  isOpen.value = false
}

async function submitRequest() {
  error.value = ""
  success.value = ""

  if (!name.value.trim()) {
    error.value = "Введите имя"
    return
  }

  if (name.value.trim().length < 2) {
    error.value = "Имя должно содержать минимум 2 символа"
    return
  }

  if (!phone.value.trim()) {
    error.value = "Введите телефон"
    return
  }

  if (phone.value.trim().length < 7) {
    error.value = "Введите корректный номер телефона"
    return
  }

  try {
    loading.value = true

    await createSupportRequest({
      name: name.value.trim(),
      phone: phone.value.trim(),
      message: "Заявка с главной страницы"
    })

    success.value = "Заявка отправлена! Менеджер скоро свяжется с вами."
    name.value = ""
    phone.value = ""
  } catch (err: any) {
    error.value = err.message || "Не удалось отправить заявку"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="manager-widget">
    <transition name="widget-popup">
      <div v-if="isOpen" class="manager-popup">
        <div class="popup-header">
          <div>
            <h3>Нужна помощь?</h3>
            <p>Оставьте заявку, и менеджер поможет вам</p>
          </div>

          <button class="close-btn" @click="closeWidget">
            ×
          </button>
        </div>

        <form class="manager-form" @submit.prevent="submitRequest">
          <input
            v-model="name"
            type="text"
            placeholder="Ваше имя"
            :disabled="loading"
          />

          <input
            v-model="phone"
            type="tel"
            placeholder="Телефон"
            :disabled="loading"
          />

          <div v-if="error" class="form-error">
            {{ error }}
          </div>

          <div v-if="success" class="form-success">
            {{ success }}
          </div>

          <button type="submit" :disabled="loading">
            {{ loading ? "Отправка..." : "Оставить заявку" }}
          </button>
        </form>

        <small>
          Менеджер свяжется с вами для уточнения деталей.
        </small>
      </div>
    </transition>

    <button
      class="manager-float-button"
      :class="{ active: isOpen }"
      @click="toggleWidget"
      aria-label="Связаться с менеджером"
    >
      <span v-if="!isOpen">💬</span>
      <span v-else>×</span>
    </button>
  </div>
</template>

<style scoped>
.manager-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1200;
}

.manager-float-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--blue), #2563eb);
  color: white;
  font-size: 1.7rem;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
}

.manager-float-button:hover {
  transform: translateY(-2px) scale(1.03);
}

.manager-float-button.active {
  background: var(--gray-900);
}

.manager-popup {
  position: absolute;
  right: 0;
  bottom: 82px;
  width: 340px;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.22);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.popup-header {
  background: linear-gradient(135deg, var(--blue), #2563eb);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.popup-header h3 {
  margin: 0 0 6px;
  font-size: 1.2rem;
}

.popup-header p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  opacity: 0.95;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: white;
  font-size: 1.4rem;
  cursor: pointer;
  flex-shrink: 0;
}

.manager-form {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.manager-form input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--gray-300);
  border-radius: 14px;
  padding: 13px 14px;
  font-size: 0.95rem;
}

.manager-form input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.manager-form button {
  border: none;
  border-radius: 14px;
  padding: 13px 16px;
  background: var(--blue);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.manager-form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-error {
  padding: 10px 12px;
  border-radius: 12px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.85rem;
  font-weight: 600;
}

.form-success {
  padding: 10px 12px;
  border-radius: 12px;
  background: #dcfce7;
  color: #047857;
  font-size: 0.85rem;
  font-weight: 600;
}

.manager-popup small {
  display: block;
  padding: 0 18px 18px;
  color: var(--gray-500);
  font-size: 0.78rem;
  line-height: 1.4;
}

.widget-popup-enter-active,
.widget-popup-leave-active {
  transition: 0.2s ease;
}

.widget-popup-enter-from,
.widget-popup-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

@media (max-width: 480px) {
  .manager-widget {
    right: 16px;
    bottom: 16px;
  }

  .manager-float-button {
    width: 58px;
    height: 58px;
    font-size: 1.5rem;
  }

  .manager-popup {
    position: fixed;
    left: 14px;
    right: 14px;
    bottom: 86px;
    width: auto;
    border-radius: 22px;
  }
}
</style>