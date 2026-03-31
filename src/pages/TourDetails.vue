<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute } from "vue-router"
import { getTour, createBooking } from "../api/api"

const route = useRoute()

const tour = ref<any>(null)

// бронирование
const startDate = ref("")
const endDate = ref("")
const bookingLoading = ref(false)

// главная картинка
const mainImage = computed(() => {
  if (!tour.value?.images?.length) return null
  return (
    tour.value.images.find((i: any) => i.is_main)?.image ||
    tour.value.images[0].image
  )
})

async function confirmBooking() {
  try {
    bookingLoading.value = true

    await createBooking(
      tour.value.id,
      startDate.value,
      endDate.value
    )

    alert("Бронь создана")
    startDate.value = ""
    endDate.value = ""

  } catch (e) {
    alert("Ошибка бронирования")
  } finally {
    bookingLoading.value = false
  }
}

onMounted(async () => {
  tour.value = await getTour(Number(route.params.id))
})
</script>

<template>
  <div v-if="tour" class="tour-details">

    <!-- 🔥 Главная картинка -->
    <img
      v-if="mainImage"
      :src="mainImage"
      class="main-image"
    />

    <!-- 📸 Галерея -->
    <div class="gallery" v-if="tour.images?.length">
      <img
        v-for="img in tour.images"
        :key="img.id"
        :src="img.image"
        class="gallery-image"
      />
    </div>

    <!-- 📌 Информация -->
    <h1 class="title">{{ tour.title }}</h1>

    <div class="info">
      <p>📍 {{ tour.city }}, {{ tour.country }}</p>
      <p>⏱️ {{ tour.duration_days }} дней</p>
      <p class="price">₸{{ tour.price }}</p>
    </div>

    <!-- 📖 Описание -->
    <p class="description">
      {{ tour.description }}
    </p>

    <!-- 🧾 Бронирование -->
    <div class="booking-box">
      <h3>Забронировать</h3>

      <input
        type="date"
        v-model="startDate"
      />

      <input
        type="date"
        v-model="endDate"
      />

      <button
        class="btn-book"
        :disabled="!startDate || !endDate || bookingLoading"
        @click="confirmBooking"
      >
        {{ bookingLoading ? "Бронирование..." : "Забронировать" }}
      </button>
    </div>

  </div>

  <div v-else class="loading">
    Загрузка...
  </div>
</template>

<style scoped>
.tour-details {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
}

/* Главная картинка */
.main-image {
  width: 100%;
  height: 350px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 20px;
}

/* Галерея */
.gallery {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.gallery-image {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}

/* Текст */
.title {
  font-size: 28px;
  margin-bottom: 10px;
}

.info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  color: #555;
}

.price {
  font-size: 22px;
  font-weight: bold;
  color: #3b82f6;
}

.description {
  margin-top: 20px;
  line-height: 1.6;
}

/* Бронирование */
.booking-box {
  margin-top: 30px;
  padding: 20px;
  border-radius: 16px;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.booking-box input {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.btn-book {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-book:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  margin-top: 50px;
}
</style>