<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { getHotels, getTours, createBooking } from "../api/api"

const hotels = ref<any[]>([])
const tours = ref<any[]>([])

const bookingHotel = ref<any>(null)
const selectedTourId = ref<number | null>(null)
const startDate = ref("")
const endDate = ref("")
const bookingError = ref("")
const bookingLoading = ref(false)
const peopleCount = ref(1)

const availableToursForHotel = computed(() => {
  if (!bookingHotel.value) return []

  return tours.value.filter((tour: any) => {
    if (!Array.isArray(tour.hotels)) return false

    return tour.hotels.some((hotel: any) => hotel.id === bookingHotel.value.id)
  })
})

function openBooking(hotel: any) {
  bookingHotel.value = hotel
  selectedTourId.value = null
  startDate.value = ""
  endDate.value = ""
  peopleCount.value = 1
  bookingError.value = ""
}

function closeBooking() {
  bookingHotel.value = null
  selectedTourId.value = null
  startDate.value = ""
  endDate.value = ""
  peopleCount.value = 1
  bookingError.value = ""
}

async function confirmBooking() {
  bookingError.value = ""

  if (!bookingHotel.value) {
    bookingError.value = "Отель не выбран"
    return
  }

  if (!selectedTourId.value) {
    bookingError.value = "Выберите тур"
    return
  }

  if (!startDate.value || !endDate.value) {
    bookingError.value = "Выберите даты"
    return
  }

  if (!peopleCount.value || peopleCount.value <= 0) {
    bookingError.value = "Укажите количество людей"
    return
  }

  try {
    bookingLoading.value = true

    await createBooking(
      selectedTourId.value,
      bookingHotel.value.id,
      startDate.value,
      endDate.value,
      peopleCount.value
    )

    closeBooking()
    alert("Бронирование успешно создано!")
  } catch (err: any) {
    bookingError.value = err.message || "Ошибка при бронировании"
  } finally {
    bookingLoading.value = false
  }
}

onMounted(async () => {
  hotels.value = await getHotels()
  tours.value = await getTours()
})
</script>

<template>
  <div class="hotels-page">
    <div class="container">
      <h1 class="page-title">
        <span class="title-accent"></span>
        Отели для вашего путешествия
      </h1>

      <div v-if="hotels.length" class="hotels-grid">
        <div
          v-for="hotel in hotels"
          :key="hotel.id"
          class="hotel-card"
        >
          <div class="hotel-image">
            <img
              v-if="hotel.image_url"
              :src="hotel.image_url"
              :alt="hotel.name"
            />
            <div v-else class="image-placeholder">🏨</div>
          </div>

          <div class="hotel-content">
            <h3 class="hotel-name">{{ hotel.name }}</h3>

            <div class="hotel-meta">
              <span class="hotel-city">
                <span class="icon">📍</span> {{ hotel.city }}
              </span>
              <span class="hotel-rating" v-if="hotel.rating">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="star"
                  :class="{ 'star-filled': star <= Math.round(hotel.rating) }"
                >★</span>
                <span class="rating-value">{{ hotel.rating }}/5</span>
              </span>
            </div>

            <p class="hotel-description">{{ hotel.description }}</p>

            <div class="hotel-footer">
              <div class="hotel-price">
                {{ hotel.price_per_night }} ₸ <span class="price-unit">/ ночь</span>
              </div>

              <div class="hotel-address" v-if="hotel.address">
                📍 {{ hotel.address }}
              </div>

              <button
                class="btn-book-hotel"
                @click="openBooking(hotel)"
              >
                Забронировать
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🏨</div>
        <p>Отели пока не добавлены</p>
      </div>

      <div
        v-if="bookingHotel"
        class="modal-overlay"
        @click.self="closeBooking"
      >
        <div class="modal-content">
          <h2 class="modal-title">
            Бронирование отеля: {{ bookingHotel.name }}
          </h2>

          <p class="modal-subtitle">
            Выберите тур, в рамках которого хотите забронировать этот отель.
          </p>

          <div v-if="availableToursForHotel.length" class="form-group">
            <label>Тур</label>

            <select v-model.number="selectedTourId" class="modal-input">
              <option :value="null" disabled>
                Выберите тур
              </option>

              <option
                v-for="tour in availableToursForHotel"
                :key="tour.id"
                :value="tour.id"
              >
                {{ tour.title }} — {{ tour.city }} — {{ tour.duration_days }} дней
              </option>
            </select>
          </div>

          <div v-else class="error-message">
            Для этого отеля пока нет доступных туров
          </div>

          <div class="form-group">
            <label>Дата начала</label>
            <input
              type="date"
              v-model="startDate"
              class="modal-input"
            />
          </div>

          <div class="form-group">
            <label>Дата окончания</label>
            <input
              type="date"
              v-model="endDate"
              class="modal-input"
            />
          </div>

          <div class="form-group">
            <label>Количество людей</label>
            <input
              type="number"
              min="1"
              v-model.number="peopleCount"
              class="modal-input"
            />
          </div>

          <div v-if="bookingError" class="error-message">
            {{ bookingError }}
          </div>

          <div class="modal-actions">
          <button
            class="btn-primary"
            :disabled="bookingLoading || !selectedTourId || !startDate || !endDate || !peopleCount || peopleCount <= 0 || !availableToursForHotel.length"
            @click="confirmBooking"
          >
            {{ bookingLoading ? "Бронирование..." : "Подтвердить" }}
          </button>

            <button
              class="btn-secondary"
              @click="closeBooking"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Глобальные переменные должны быть в :root, но здесь они подхватятся из глобальных */
.hotels-page {
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
  min-height: 100vh;
  padding: 48px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

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

.hotels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
}

.hotel-card {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.hotel-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.08);
}

.hotel-image {
  height: 180px;
  overflow: hidden;
  background: var(--gray-100);
  position: relative;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hotel-card:hover .hotel-image img {
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

.hotel-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hotel-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

.hotel-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.hotel-city {
  font-size: 0.9rem;
  color: var(--gray-500);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hotel-rating {
  display: flex;
  align-items: center;
  gap: 2px;
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

.hotel-description {
  font-size: 0.9rem;
  color: var(--gray-700);
  line-height: 1.5;
  margin: 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hotel-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--gray-100);
}

.hotel-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--blue);
  margin-bottom: 6px;
}

.price-unit {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--gray-500);
}

.hotel-address {
  font-size: 0.85rem;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--gray-50);
  border-radius: 32px;
  margin-top: 24px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-state p {
  font-size: 1.2rem;
  color: var(--gray-500);
  margin-bottom: 24px;
}

.btn-book-hotel {
  width: 100%;
  margin-top: 14px;
  padding: 12px 18px;
  border: none;
  border-radius: 14px;
  background: var(--blue);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-book-hotel:hover {
  background: var(--blue-dark);
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 460px;
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 25px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 8px;
}

.modal-subtitle {
  font-size: 0.95rem;
  color: var(--gray-500);
  line-height: 1.5;
  margin: 0 0 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-700);
}

.modal-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gray-300);
  border-radius: 14px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.error-message {
  padding: 10px 12px;
  margin-bottom: 14px;
  border-radius: 12px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 18px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--blue);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

@media (max-width: 640px) {
  .hotels-page {
    padding: 32px 0;
  }

  .container {
    padding: 0 16px;
  }

  .page-title {
    font-size: 1.4rem;
    margin-bottom: 28px;
  }

  .hotels-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .hotel-card:hover {
    transform: none;
  }

  .modal-content {
    padding: 22px 18px;
    border-radius: 20px;
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 1.5rem;
  }
  .title-accent {
    height: 32px;
  }
  .hotels-grid {
    grid-template-columns: 1fr;
  }
}
</style>