<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getFavorites, removeFavorite, createBooking } from "../api/api"

const favorites = ref<any[]>([])
const bookingError = ref('')
const bookingTour = ref<any>(null)
const startDate = ref("")
const endDate = ref("")
const bookingLoading = ref(false) // опционально, для индикации загрузки

function openBooking(tour: any) {
  bookingTour.value = tour
  bookingError.value = ''
  startDate.value = ''
  endDate.value = ''
}

async function confirmBooking() {
  if (!bookingTour.value) return
  bookingError.value = ''
  bookingLoading.value = true
  try {
    await createBooking(
      bookingTour.value.id,
      startDate.value,
      endDate.value
    )
    bookingTour.value = null
    alert('Бронирование успешно создано!')
  } catch (err: any) {
    bookingError.value = err.message || 'Ошибка при бронировании'
  } finally {
    bookingLoading.value = false
  }
}

async function remove(id: number) {
  try {
    await removeFavorite(id)
    favorites.value = favorites.value.filter(f => f.id !== id)
  } catch (e) {
    console.error('Ошибка удаления из избранного', e)
  }
}

onMounted(async () => {
  favorites.value = await getFavorites()
})
</script>

<template>
  <div class="favorites-page">
    <div class="container">
      <!-- Заголовок с акцентом -->
      <h1 class="page-title">
        <span class="title-accent"></span>
        Избранное
      </h1>

      <!-- Сетка избранных туров -->
      <div v-if="favorites.length" class="grid">
        <div
          v-for="fav in favorites"
          :key="fav.id"
          class="favorite-card"
        >
          <!-- Изображение (заглушка, если нет) -->
          <div class="card-image">
            <img
              v-if="fav.tour_data?.preview_image"
              :src="fav.tour_data.preview_image"
              alt="Tour image"
            />
            <div v-else class="image-placeholder">
              <span>🏝️</span>
            </div>
          </div>

          <!-- Контент -->
          <div class="card-content">
            <h3 class="tour-title">{{ fav.tour_data?.title || 'Без названия' }}</h3>

            <p class="tour-city">
              <span class="icon">📍</span> {{ fav.tour_data?.city || 'Не указан' }}
            </p>

            <p class="tour-duration" v-if="fav.tour_data?.duration_days">
              <span class="icon">⏱️</span> {{ fav.tour_data.duration_days }} {{ fav.tour_data.duration_days === 1 ? 'день' : 'дней' }}
            </p>

            <p class="tour-description">
              {{ fav.tour_data?.description || 'Описание отсутствует' }}
            </p>

            <!-- Рейтинг (звёзды) -->
            <div class="tour-rating" v-if="fav.tour_data?.rating">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ 'star-filled': star <= Math.round(fav.tour_data.rating) }"
              >★</span>
              <span class="rating-value">{{ fav.tour_data.rating }}/5</span>
            </div>

            <!-- Цена -->
            <p class="tour-price">
              ₸{{ fav.tour_data?.price || '0' }} <span class="price-unit">/ чел.</span>
            </p>
          </div>

          <div class="tour-actions">
            <button
              class="btn-primary"
              @click="openBooking(fav.tour_data)"
            >
              Забронировать
            </button>
            <button class="btn-remove" @click="remove(fav.id)">
              <span class="btn-icon">🗑️</span> Удалить
            </button>
          </div>
        </div>
      </div>

      <!-- Сообщение, если избранное пусто -->
      <div v-else class="empty-state">
        <p>У вас пока нет избранных туров.</p>
        <router-link to="/" class="btn-primary">Перейти к турам</router-link>
      </div>
    </div>

    <!-- Модальное окно бронирования (скопировано из home.vue) -->
    <div v-if="bookingTour" class="modal-overlay" @click.self="bookingTour = null">
      <div class="modal-content">
        <h2 class="modal-title">
          <span class="title-accent"></span>
          Бронирование: {{ bookingTour.title }}
        </h2>

        <label class="modal-label">Дата начала</label>
        <input
          type="date"
          v-model="startDate"
          class="modal-input"
        />

        <label class="modal-label">Дата окончания</label>
        <input
          type="date"
          v-model="endDate"
          class="modal-input"
        />

        <div v-if="bookingError" class="error-message">
          {{ bookingError }}
        </div>

        <div class="modal-actions">
          <button
            class="btn-primary"
            :disabled="!startDate || !endDate || bookingLoading"
            @click="confirmBooking"
          >
            {{ bookingLoading ? 'Бронирование...' : 'Подтвердить бронирование' }}
          </button>
          <button
            class="btn-secondary"
            @click="bookingTour = null"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
  min-height: 100vh;
  padding: 48px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Заголовок страницы */
.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 40px;
  color: var(--gray-900);
}

.title-accent {
  width: 8px;
  height: 40px;
  background: linear-gradient(135deg, var(--blue), #6366f1);
  border-radius: 4px;
}

/* Сетка карточек */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
  margin-top: 24px;
}

/* Карточка избранного */
.favorite-card {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.favorite-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.08);
}

/* Изображение */
.card-image {
  height: 180px;
  background-color: var(--gray-100);
  overflow: hidden;
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.favorite-card:hover .card-image img {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  font-size: 3rem;
}

/* Контент карточки */
.card-content {
  padding: 20px;
  flex: 1;
}

.tour-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--gray-900);
}

.tour-city,
.tour-duration {
  font-size: 0.9rem;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 4px 0;
}

.icon {
  font-size: 1rem;
}

.tour-description {
  font-size: 0.9rem;
  color: var(--gray-700);
  line-height: 1.5;
  margin: 10px 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Рейтинг */
.tour-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0 4px;
}

.star {
  color: var(--gray-300);
  font-size: 1rem;
}

.star-filled {
  color: #fbbf24;
}

.rating-value {
  font-size: 0.85rem;
  color: var(--gray-500);
  margin-left: 4px;
}

/* Цена */
.tour-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--blue);
  margin: 12px 0 4px;
}

.price-unit {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--gray-500);
}

/* Кнопки действий */
.tour-actions {
  padding: 0 20px 20px 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 40px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  flex: 1 1 auto;
}

.btn-primary:hover:not(:disabled) {
  background: var(--blue-dark);
  transform: scale(1.02);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background: var(--gray-300);
  box-shadow: none;
  cursor: not-allowed;
  color: var(--gray-500);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: 40px;
  padding: 10px 18px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1 1 auto;
}

.btn-secondary:hover {
  background: var(--gray-300);
  border-color: var(--gray-500);
}

/* Кнопка удаления */
.btn-remove {
  background: var(--red);
  color: white;
  border: none;
  border-radius: 40px;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1 1 auto;
}

.btn-remove:hover {
  background: var(--red-dark);
  transform: scale(1.02);
}

.btn-remove:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--gray-100);
  border-radius: 24px;
  color: var(--gray-500);
}

.empty-state p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.empty-state .btn-primary {
  display: inline-block;
  text-decoration: none;
}

/* ===== Модальное окно (скопировано из home.vue) ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background-color: white;
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 25px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.3s ease;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--gray-900);
}

.modal-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: -8px;
}

.modal-input {
  padding: 12px 16px;
  border-radius: 40px;
  border: 1px solid var(--gray-300);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: var(--white);
}

.modal-input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.modal-actions .btn-primary,
.modal-actions .btn-secondary {
  flex: 1;
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  padding: 8px 12px;
  background-color: #fee2e2;
  border-radius: 12px;
  text-align: center;
  margin-top: 8px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 640px) {
  .page-title {
    font-size: 1.5rem;
  }
  .title-accent {
    height: 32px;
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .modal-content {
    padding: 24px;
  }
}
</style>s