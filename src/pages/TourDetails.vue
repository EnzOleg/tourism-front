<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getTour, createBooking } from "../api/api"

const route = useRoute()
const router = useRouter()

const tour = ref<any>(null)
const loading = ref(true)
const error = ref("")

const bookingError = ref("")
const bookingLoading = ref(false)

const selectedHotelId = ref<number | null>(null)
const startDate = ref("")
const endDate = ref("")
const peopleCount = ref(1)

const selectedHotel = computed(() => {
  if (!tour.value || !selectedHotelId.value) return null
  return tour.value.hotels?.find((hotel: any) => hotel.id === selectedHotelId.value)
})

const daysCount = computed(() => {
  if (!startDate.value || !endDate.value) return 0

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  const diff = end.getTime() - start.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  return days > 0 ? days : 0
})

const estimatedPrice = computed(() => {
  if (!tour.value || !selectedHotel.value || !daysCount.value || !peopleCount.value) {
    return null
  }

  const tourPrice = Number(tour.value.price)
  const hotelPrice = Number(selectedHotel.value.price_per_night)

  return (tourPrice + hotelPrice * daysCount.value) * peopleCount.value
})

function formatPrice(value: any) {
  if (value === null || value === undefined) return "0"

  return Number(value).toLocaleString("ru-RU")
}

async function loadTour() {
  loading.value = true
  error.value = ""

  try {
    const id = Number(route.params.id)
    tour.value = await getTour(id)
  } catch (e) {
    error.value = "Не удалось загрузить информацию о туре"
  } finally {
    loading.value = false
  }
}

async function confirmBooking() {
  bookingError.value = ""

  if (!tour.value) {
    bookingError.value = "Тур не найден"
    return
  }

  if (!selectedHotelId.value) {
    bookingError.value = "Выберите отель"
    return
  }

  if (!startDate.value || !endDate.value) {
    bookingError.value = "Выберите даты поездки"
    return
  }

  if (!peopleCount.value || peopleCount.value <= 0) {
    bookingError.value = "Укажите количество людей"
    return
  }

  if (daysCount.value <= 0) {
    bookingError.value = "Дата окончания должна быть позже даты начала"
    return
  }

  try {
    bookingLoading.value = true

    await createBooking(
      tour.value.id,
      selectedHotelId.value,
      startDate.value,
      endDate.value,
      peopleCount.value
    )

    alert("Бронирование успешно создано!")
    router.push("/profile")
  } catch (err: any) {
    bookingError.value = err.message || "Ошибка при бронировании"
  } finally {
    bookingLoading.value = false
  }
}

onMounted(async () => {
  await loadTour();
  window.scrollTo(0, 0);
});
</script>

<template>
  <div class="tour-details-page">
    <div class="container">
      <button class="back-button" @click="router.back()">
        ← Назад
      </button>

      <div v-if="loading" class="loading-state">
        Загрузка тура...
      </div>

      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>

      <template v-else-if="tour">
        <section class="hero-card">
          <div class="hero-image">
            <img
              v-if="tour.preview_image"
              :src="tour.preview_image"
              :alt="tour.title"
            />
            <div v-else class="image-placeholder">
              🏝️
            </div>
          </div>

          <div class="hero-info">
            <div class="tour-location">
              📍 {{ tour.country }}, {{ tour.city }}
            </div>

            <h1 class="tour-title">
              {{ tour.title }}
            </h1>

            <p class="tour-description">
              {{ tour.description }}
            </p>

            <div class="tour-meta">
              <div class="meta-item">
                <span class="meta-label">Цена тура</span>
                <strong>₸{{ formatPrice(tour.price) }}</strong>
                <small>/ чел.</small>
              </div>

              <div class="meta-item">
                <span class="meta-label">Базовая длительность</span>
                <strong>{{ tour.duration_days }}</strong>
                <small>дней</small>
              </div>

              <div class="meta-item">
                <span class="meta-label">Отелей доступно</span>
                <strong>{{ tour.hotels?.length || 0 }}</strong>
                <small>вариантов</small>
              </div>
            </div>
          </div>
        </section>

        <section class="content-grid">
          <div class="main-content">
            <div class="info-card">
              <h2>
                <span class="title-accent"></span>
                Описание тура
              </h2>

              <p>
                {{ tour.description }}
              </p>
            </div>

            <div class="info-card">
              <h2>
                <span class="title-accent"></span>
                Доступные отели
              </h2>

              <div v-if="tour.hotels?.length" class="hotels-list">
                <label
                  v-for="hotel in tour.hotels"
                  :key="hotel.id"
                  class="hotel-option"
                  :class="{ active: selectedHotelId === hotel.id }"
                >
                  <input
                    v-model.number="selectedHotelId"
                    type="radio"
                    :value="hotel.id"
                  />

                  <div class="hotel-image-small">
                    <img
                      v-if="hotel.image_url"
                      :src="hotel.image_url"
                      :alt="hotel.name"
                    />
                    <div v-else class="hotel-placeholder">
                      🏨
                    </div>
                  </div>

                  <div class="hotel-info">
                    <h3>{{ hotel.name }}</h3>

                    <p v-if="hotel.address">
                      📍 {{ hotel.address }}
                    </p>

                    <p v-if="hotel.rating">
                      ⭐ {{ hotel.rating }}/5
                    </p>

                    <strong>
                      ₸{{ formatPrice(hotel.price_per_night) }} / ночь
                    </strong>
                  </div>
                </label>
              </div>

              <div v-else class="empty-message">
                Для этого тура пока не добавлены отели
              </div>
            </div>
          </div>

          <aside class="side-content">
            <div class="booking-card">
              <h2>Забронировать тур</h2>

              <div class="form-group">
                <label>Дата начала</label>
                <input
                  v-model="startDate"
                  type="date"
                />
              </div>

              <div class="form-group">
                <label>Дата окончания</label>
                <input
                  v-model="endDate"
                  type="date"
                />
              </div>

              <div class="form-group">
                <label>Количество людей</label>
                <input
                  v-model.number="peopleCount"
                  type="number"
                  min="1"
                />
              </div>

              <div class="price-box">
                <span>Предварительная стоимость</span>

                <strong v-if="estimatedPrice">
                  ₸{{ formatPrice(estimatedPrice) }}
                </strong>

                <strong v-else>
                  —
                </strong>
              </div>

              <div v-if="bookingError" class="error-message">
                {{ bookingError }}
              </div>

              <button
                class="btn-primary"
                :disabled="bookingLoading || !selectedHotelId || !startDate || !endDate || !peopleCount"
                @click="confirmBooking"
              >
                {{ bookingLoading ? "Бронирование..." : "Забронировать" }}
              </button>
            </div>
          </aside>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Подключаем нормальный шрифт */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --blue: #3b82f6;
  --blue-dark: #2563eb;
  --white: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.tour-details-page {
  --radius-lg: 24px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --spacing-md: 14px;
  --spacing-lg: 24px;

  min-height: 100vh;
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
  padding: 36px 0 56px;
}

.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.back-button {
  margin-bottom: 20px;
  border: none;
  background: var(--white);
  color: var(--gray-700);
  border-radius: 999px;
  padding: 10px 18px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  font-weight: 600;
  transition: color 0.2s, transform 0.2s;
}
.back-button:hover {
  color: var(--blue);
}
.back-button:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}

.loading-state,
.error-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--gray-500);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 28px;
  background: var(--white);
  border-radius: 28px;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  margin-bottom: 32px;
}

.hero-image {
  width: 100%;
  min-height: 320px;
  aspect-ratio: 4 / 3;
  border-radius: 22px;
  overflow: hidden;
  background: var(--gray-100);
}
.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 4rem;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}

.hero-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tour-location {
  color: var(--blue);
  font-weight: 600;
  margin-bottom: 12px;
}

.tour-title {
  font-size: 2.4rem;
  line-height: 1.15;
  margin: 0 0 16px;
  color: var(--gray-900);
  font-weight: 800;
}

.tour-description {
  color: var(--gray-600);
  line-height: 1.7;
  margin: 0 0 24px;
}

.tour-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.meta-item {
  background: var(--gray-50);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.meta-label {
  display: block;
  font-size: 0.78rem;
  color: var(--gray-500);
  margin-bottom: 6px;
}

.meta-item strong {
  display: block;
  color: var(--gray-900);
  font-size: 1.2rem;
}

.meta-item small {
  color: var(--gray-500);
}

/* Самое важное: теперь side-content липнет целиком */
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 28px;
  align-items: start;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.side-content {
  position: sticky;
  top: 96px;              /* отступ от верха экрана */
  align-self: start;      /* чтобы не растягивался по высоте */
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-card,
.booking-card,
.manager-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.info-card h2,
.booking-card h2,
.manager-card h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 18px;
  font-size: 1.35rem;
  color: var(--gray-900);
  font-weight: 700;
}

.title-accent {
  width: 6px;
  height: 30px;
  background: linear-gradient(135deg, var(--blue), #6366f1);
  border-radius: 999px;
  flex-shrink: 0;
}

.info-card p {
  line-height: 1.7;
  color: var(--gray-700);
}

.hotels-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.hotel-option {
  display: grid;
  grid-template-columns: auto 110px minmax(0, 1fr);
  gap: var(--spacing-md);
  align-items: center;
  padding: var(--spacing-md);
  border: 2px solid var(--gray-200);
  border-radius: 18px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
}
.hotel-option:hover {
  border-color: var(--blue);
  background: rgba(59, 130, 246, 0.04);
}
.hotel-option.active {
  border-color: var(--blue);
  background: rgba(59, 130, 246, 0.06);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.hotel-option input {
  width: 18px;
  height: 18px;
  accent-color: var(--blue);
  cursor: pointer;
}

.hotel-image-small {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  background: var(--gray-100);
}
.hotel-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hotel-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: #e0e7ff;
  font-size: 2rem;
}

.hotel-info h3 {
  margin: 0 0 6px;
  color: var(--gray-900);
  font-weight: 700;
}
.hotel-info p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: var(--gray-500);
}
.hotel-info strong {
  display: block;
  margin-top: 6px;
  color: var(--blue);
  font-weight: 700;
}

.empty-message {
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--gray-50);
  color: var(--gray-500);
}

/* Карточка брони теперь обычная, не sticky */
.booking-card {
  /* position убрали, теперь липнет вся колонка */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--spacing-md);
}
.form-group label {
  color: var(--gray-700);
  font-weight: 600;
  font-size: 0.9rem;
}
.form-group input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--gray-300);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.price-box {
  background: var(--gray-50);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin: 16px 0;
}
.price-box span {
  display: block;
  font-size: 0.85rem;
  color: var(--gray-500);
  margin-bottom: 6px;
}
.price-box strong {
  font-size: 1.4rem;
  color: var(--blue);
  font-weight: 800;
}

.error-message {
  background: #fee2e2;
  color: #b91c1c;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  margin-bottom: 12px;
  font-weight: 500;
}

.btn-primary {
  width: 100%;
  border: none;
  border-radius: 14px;
  background: var(--blue);
  color: white;
  padding: 13px 18px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}
.btn-primary:hover:not(:disabled) {
  background: var(--blue-dark);
  transform: translateY(-1px);
}
.btn-primary:focus-visible {
  outline: 2px solid var(--blue-dark);
  outline-offset: 2px;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.manager-card {
  background: linear-gradient(135deg, var(--blue), #2563eb);
  color: white;
}
.manager-card h2,
.manager-card p {
  color: white;
}
.manager-card > p {
  line-height: 1.6;
  opacity: 0.95;
  font-weight: 400;
}
.manager-info {
  margin: 14px 0;
  padding: 14px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.12);
}
.manager-info p {
  margin: 8px 0;
  font-weight: 500;
}

.help-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}
.help-form input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-radius: 14px;
  padding: 13px 14px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: box-shadow 0.2s;
}
.help-form input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
}
.help-form button {
  border: none;
  border-radius: 14px;
  padding: 13px 18px;
  font-weight: 700;
  color: var(--blue);
  background: white;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}
.help-form button:hover {
  background: #f0f0ff;
}
.help-form button:focus-visible {
  outline: 3px solid white;
  outline-offset: 2px;
}

.manager-card small {
  display: block;
  margin-top: 12px;
  opacity: 0.85;
  line-height: 1.5;
  font-weight: 400;
}

@media (max-width: 960px) {
  .hero-card,
  .content-grid {
    grid-template-columns: 1fr;
  }

  /* На мобильных устройствах липкая панель не нужна, возвращаем обычное поведение */
  .side-content {
    position: static;
  }

  .hero-image {
    min-height: 240px;
    aspect-ratio: 16 / 9;
  }
}

@media (max-width: 640px) {
  .tour-details-page {
    padding: 24px 0 40px;
  }

  .container {
    padding: 0 14px;
  }

  .hero-card {
    padding: 14px;
    border-radius: 22px;
    gap: 18px;
  }

  .hero-image {
    min-height: 200px;
    aspect-ratio: 4 / 3;
    border-radius: 18px;
  }

  .tour-title {
    font-size: 1.65rem;
  }

  .tour-meta {
    grid-template-columns: 1fr;
  }

  .info-card,
  .booking-card,
  .manager-card {
    padding: 18px;
    border-radius: 20px;
  }

  .hotel-option {
    grid-template-columns: auto 1fr;
  }
  .hotel-image-small {
    display: none;
  }
}

@media (max-width: 380px) {
  .tour-title {
    font-size: 1.45rem;
  }

  .info-card h2,
  .booking-card h2,
  .manager-card h2 {
    font-size: 1.15rem;
  }
}
</style>