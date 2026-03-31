<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { getTours, addFavorite, removeFavorite, getFavorites, createBooking } from "../api/api"

const tours = ref<any[]>([])

const loadingFavorite = ref<number | null>(null)

const favorites = ref<number[]>([])

const bookingError = ref('')
const bookingTour = ref<any>(null)
const startDate = ref("")
const endDate = ref("")
const search = ref("")
const maxPrice = ref<number | null>(null)
const minPrice = ref<number | null>(null)

const filteredTours = computed(() => {
  return tours.value.filter(t => {
    const matchSearch =
      t.title.toLowerCase().includes(search.value.toLowerCase()) ||
      t.city.toLowerCase().includes(search.value.toLowerCase())

    const matchPrice = 
      (!minPrice.value || t.price >= minPrice.value) && 
      (!maxPrice.value || t.price <= maxPrice.value)

    return matchSearch && matchPrice
  })
})

async function handleFavorite(tourId: number) {
  if (isFavorite(tourId)) {
    const favs = await getFavorites()
    if (!Array.isArray(favs)) {
      console.error('Favorites is not an array:', favs)
      return
    }
    const fav = favs.find((f: any) => f.tour === tourId)
    if (fav) {
      await removeFavorite(fav.id)
      favorites.value = favorites.value.filter(id => id !== tourId)
    }
  } else {
    await addFavorite(tourId)
    favorites.value.push(tourId)
  }
}

function isFavorite(tourId: number) {
  return favorites.value.includes(tourId)
}

function openBooking(tour: any) {
  bookingTour.value = tour
  bookingError.value = ''
  startDate.value = ''
  endDate.value = ''
}

async function confirmBooking() {
  bookingError.value = ''
  try {
    await createBooking(
      bookingTour.value.id,
      startDate.value,
      endDate.value
    )
    bookingTour.value = null
    alert('Бронирование успешно создано!')
  } catch (err: any) {
    bookingError.value = err.message 
  }
}

onMounted(async () => {
  tours.value = await getTours()

  const favs = await getFavorites()
    if (Array.isArray(favs)) {
      favorites.value = favs.map((f: any) => f.tour)
    } else {
      favorites.value = []
      console.error('Favorites response is not an array:', favs)
    }

  favorites.value = favs.map((f: any) => f.tour)
})
</script>
<template>
  <div class="tours-catalog">
    <!-- Hero секция с фоновым изображением и градиентом -->
    <section class="hero">
      <div class="hero-overlay">
        <h1 class="hero-title">Найдите своё идеальное путешествие</h1>
        <p class="hero-subtitle">
          Бронируйте туры по всему миру быстро и удобно.
          Откройте новые города и получите незабываемые впечатления.
        </p>
      </div>
    </section>

    <!-- Заголовок каталога с боковой полосой -->
    <h2 class="section-title">
      <span class="title-accent"></span>
      Доступные туры
    </h2>

    <div class="filters">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input v-model="search" placeholder="Поиск по названию или городу" class="search-input" />
      </div>
      <div class="price-filters">
        <div class="price-input">
          <span class="currency">₸</span>
          <input v-model.number="minPrice" type="number" placeholder="От" class="price-input-field" />
        </div>
        <div class="price-input">
          <span class="currency">₸</span>
          <input v-model.number="maxPrice" type="number" placeholder="До" class="price-input-field" />
        </div>
      </div>
    </div>

    <!-- Сетка туров -->
    <div class="grid">
      <div
        v-for="tour in filteredTours"
        :key="tour.id"
        class="tour-card"
      >

        <div class="tour-image">
          <img
            v-if="tour.preview_image"
            :src="tour.preview_image"
            :alt="tour.title"
          />
          <div v-else class="image-placeholder">🏞️</div>
        </div>

        <h3 class="tour-name">{{ tour.title }}</h3>

        <p class="tour-city">
          <span class="city-icon">📍</span> {{ tour.city }}
        </p>

        <p class="tour-duration">
          <span class="duration-icon">⏱️</span> {{ tour.duration_days }} {{ tour.duration_days === 1 ? 'день' : 'дней' }}
        </p>

        <p class="tour-description">
          {{ tour.description }}
        </p>

        <p class="tour-price">
          ₸{{ tour.price }} <span class="price-unit">/ чел.</span>
        </p>

        <div class="tour-actions">
          <button
            class="btn-primary"
            @click="openBooking(tour)"
          >
            Забронировать
          </button>
          <button
            class="btn-secondary"
            :class="{ 'btn-favorite': isFavorite(tour.id) }"
            @click="handleFavorite(tour.id)"
          >
            {{ isFavorite(tour.id) ? 'В избранном ❤️' : 'В избранное' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно бронирования -->
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
            :disabled="!startDate || !endDate"
            @click="confirmBooking"
          >
            Подтвердить бронирование
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
.tours-catalog {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: var(--white);
  color: var(--gray-900);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* ===== Hero секция с фоновым изображением ===== */
.hero {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 60px;
  background-image: url('https://thumbs.dreamstime.com/b/%D1%81%D0%B0%D0%BC%D0%BE%D0%BB%D0%B5%D1%82-%D0%BB%D0%B5%D1%82%D0%B0%D1%82%D1%8C-%D0%BD%D0%B0%D0%B4-%D0%BA%D1%80%D0%B0%D1%81%D0%B8%D0%B2%D0%BE%D0%B9-%D0%BF%D1%80%D0%B8%D1%80%D0%BE%D0%B4%D0%BE%D0%B9-%D0%BF%D0%B5%D0%B9%D0%B7%D0%B0%D0%B6-%D0%BE%D1%81%D1%82%D1%80%D0%BE%D0%B2-%D1%82%D1%83%D1%80%D0%B8%D0%B7%D0%BC-%D1%84%D0%BE%D0%BD-%D0%B4%D0%BB%D1%8F-337535201.jpg');
  background-size: cover;
  background-position: center;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.85), rgba(99, 102, 241, 0.85));
  color: white;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.25rem;
  max-width: 600px;
  opacity: 0.95;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ===== Заголовок секции с боковым акцентом ===== */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 32px;
  color: var(--gray-900);
}

.title-accent {
  width: 8px;
  height: 40px;
  background-color: var(--blue);
  border-radius: 4px;
}

/* ===== Сетка карточек ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* Карточка тура */
.tour-card {
  background: var(--white);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.tour-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.08);
}

.tour-image {
  height: 180px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 12px;
  background: var(--gray-100);
}
.tour-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.tour-card:hover .tour-image img {
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

.tour-name {
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
  line-height: 1.3;
}

.tour-city,
.tour-duration {
  font-size: 0.95rem;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 0;
}

.city-icon,
.duration-icon {
  font-size: 1.1rem;
}

.tour-description {
  font-size: 0.95rem;
  color: var(--gray-700);
  line-height: 1.5;
  margin: 8px 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tour-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--blue);
  margin: 8px 0 4px;
}

.price-unit {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--gray-500);
}

/* Кнопки */
.tour-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 40px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  flex: 1 1 auto;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  transform: scale(1.02);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: var(--gray-300);
  box-shadow: none;
  cursor: not-allowed;
  color: var(--gray-500);
}

.btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: 40px;
  padding: 10px 18px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  flex: 1 1 auto;
}

.btn-secondary:hover {
  background-color: var(--gray-300);
  border-color: var(--gray-500);
}

.btn-favorite {
  background-color: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

.btn-favorite:hover {
  background-color: #fecaca;
}

/* ===== Модальное окно ===== */
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

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
  background: var(--gray-100);
  padding: 12px 20px;
  border-radius: 60px;
  backdrop-filter: blur(4px);
}

.search-wrapper {
  flex: 2;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 40px;
  padding: 4px 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

.search-icon {
  margin-right: 8px;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  border: none;
  padding: 12px 0;
  font-size: 1rem;
  background: transparent;
  outline: none;
}

.price-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 40px;
  padding: 4px 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

.price-input {
  display: flex;
  align-items: center;
  gap: 4px;
}

.currency {
  font-weight: 600;
  color: var(--blue);
}

.price-input-field {
  width: 80px;
  border: none;
  padding: 12px 0;
  font-size: 1rem;
  background: transparent;
  outline: none;
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

@media (max-width: 640px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
    border-radius: 24px;
    padding: 16px;
  }
  .price-filters {
    justify-content: space-between;
  }
}

/* Chrome, Safari */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
/* Анимации */
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
  .hero-title {
    font-size: 2rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
  .section-title {
    font-size: 1.5rem;
  }
  .tour-actions {
    flex-direction: column;
  }
  .modal-content {
    padding: 24px;
  }
}
</style>