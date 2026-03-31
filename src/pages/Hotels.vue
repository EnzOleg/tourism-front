<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getHotels } from "../api/api"

const hotels = ref<any[]>([])

onMounted(async () => {
  hotels.value = await getHotels()
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
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🏨</div>
        <p>Отели пока не добавлены</p>
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

/* Адаптивность */
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