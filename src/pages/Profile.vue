<template>
  <div class="profile-page">
    <div class="container">
      <h1 class="page-title">
        <span class="title-accent"></span>
        Мой профиль
      </h1>

      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загружаем профиль...</p>
      </div>

      <template v-else>
        <!-- Карточка профиля -->
        <div class="profile-card">
          <!-- Аватар с возможностью смены -->
          <div class="avatar-section">
            <div class="avatar-wrapper" @click="openFileInput" :class="{ 'has-hover': editing }">
              <img
                v-if="avatarPreview || user?.avatar"
                :src="avatarPreview || user?.avatar"
                alt="Аватар"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                {{ user?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div v-if="editing" class="avatar-overlay">
                <span>📷</span>
                <span>Изменить</span>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
            </div>
          </div>

          <!-- Информация о пользователе / форма редактирования -->
          <div class="info-section">
            <div v-if="!editing" class="info-view">
              <h2 class="username">{{ user?.username }}</h2>
              <p class="email">{{ user?.email }}</p>
              <p v-if="user?.date_joined" class="joined-date">
                🗓️ С нами с {{ formatDate(user.date_joined) }}
              </p>
              <div class="action-buttons">
                <button class="btn-outline" @click="startEditing">
                  <span>✏️</span> Редактировать профиль
                </button>
                <button class="btn-outline logout" @click="handleLogout">
                  <span>🚪</span> Выйти
                </button>
              </div>
            </div>

            <div v-else class="edit-form">
              <div class="form-group">
                <label>Имя пользователя</label>
                <input
                  v-model="editForm.username"
                  type="text"
                  placeholder="Ваше имя"
                />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  placeholder="example@mail.com"
                />
              </div>
              <div class="form-actions">
                <button class="btn-primary" @click="saveProfile" :disabled="saving">
                  {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
                </button>
                <button class="btn-cancel" @click="cancelEditing">Отмена</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Секция бронирований -->
        <div class="bookings-section">
          <h2 class="section-title">
            <span class="title-accent"></span>
            Мои путешествия
          </h2>

          <div v-if="bookings.length" class="bookings-grid">
            <div
              v-for="booking in bookings"
              :key="booking.id"
              class="booking-card"
            >
              <div class="card-image">
                <img
                  v-if="booking.tour?.preview_image"
                  :src="booking.tour.preview_image"
                  :alt="booking.tour.title"
                />
                <div v-else class="image-placeholder">🏝️</div>
                <div class="card-status" :class="`status-${booking.status}`">
                  {{ translateStatus(booking.status) }}
                </div>
              </div>
              <div class="card-content">
                <h3 class="tour-title">{{ booking.tour?.title || 'Тур' }}</h3>
                <p v-if="booking.tour?.city" class="tour-city">
                  📍 {{ booking.tour.city }}
                </p>
                <p class="booking-dates">
                  🗓️ {{ formatDate(booking.start_date) }} — {{ formatDate(booking.end_date) }}
                </p>
                <p class="tour-description" v-if="booking.tour?.description">
                  {{ truncate(booking.tour.description, 80) }}
                </p>
                <div class="card-footer">
                  <p class="price">₸{{ booking.total_price }}</p>
                  <div class="card-buttons">
                    <button
                      v-if="booking.status === 'pending'"
                      class="btn-pay"
                      @click="openPaymentModal(booking)"
                    >
                      Оплатить
                    </button>
                    <button
                      v-if="booking.status !== 'cancelled'"
                      class="btn-cancel-booking"
                      @click="handleCancel(booking.id)"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div v-else class="empty-state">
            <div class="empty-icon">✈️</div>
            <p>У вас пока нет забронированных туров</p>
            <router-link to="/" class="btn-primary">Найти тур</router-link>
          </div>
        </div>

          <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
            <div class="modal-content payment-modal">
              <h3>Оплата бронирования</h3>
              <div class="form-group">
                <label>Номер карты</label>
                <input v-model="paymentData.cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              <div class="form-row">
                <div class="form-group half">
                  <label>Срок (MM/YY)</label>
                  <input v-model="paymentData.expiry" placeholder="MM/YY" />
                </div>
                <div class="form-group half">
                  <label>CVV</label>
                  <input v-model="paymentData.cvv" placeholder="123" type="password" />
                </div>
              </div>
              <div v-if="paymentError" class="error-message">{{ paymentError }}</div>
              <div class="modal-actions">
                <button class="btn-primary" @click="processPayment" :disabled="paymentLoading">
                  {{ paymentLoading ? 'Оплата...' : 'Оплатить' }}
                </button>
                <button class="btn-secondary" @click="showPaymentModal = false">Отмена</button>
              </div>
            </div>
          </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMe, getBookings, updateMe, cancelBooking, updateMeAvatar, payBooking } from '../api/api'
import { logout } from '../auth'

const router = useRouter()

const user = ref<any>(null)
const bookings = ref<any[]>([])
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

const editForm = ref({
  username: '',
  email: '',
})

const showPaymentModal = ref(false)
const currentBookingId = ref<number | null>(null)
const paymentData = ref({
  cardNumber: '',
  expiry: '',
  cvv: ''
})
const paymentLoading = ref(false)
const paymentError = ref('')

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

const truncate = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

const translateStatus = (status: string) => {
  switch (status) {
    case 'pending': return 'В ожидании'
    case 'confirmed': return 'Подтверждён'
    case 'cancelled': return 'Отменён'
    default: return status
  }
}

const openFileInput = () => {
  if (editing.value && fileInput.value) {
    fileInput.value.click()
  }
}

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

const startEditing = () => {
  editForm.value.username = user.value.username
  editForm.value.email = user.value.email
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
  avatarFile.value = null
  avatarPreview.value = null
}

const saveProfile = async () => {
  saving.value = true
  try {
    // Сначала обновляем аватар, если он выбран
    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('avatar', avatarFile.value)
      const updatedUser = await updateMeAvatar(formData)
      user.value = updatedUser
    }

    // Затем обновляем данные профиля
    const updated = await updateMe({
      username: editForm.value.username,
      email: editForm.value.email
    })
    user.value = updated

    editing.value = false
    avatarFile.value = null
    avatarPreview.value = null
  } catch (e) {
    alert('Ошибка при сохранении профиля')
  } finally {
    saving.value = false
  }
}

const handleCancel = async (id: number) => {
  try {
    await cancelBooking(id)
    bookings.value = bookings.value.map(b =>
      b.id === id ? { ...b, status: 'cancelled' } : b
    )
  } catch (e) {
    alert('Не удалось отменить бронирование')
  }
}

function openPaymentModal(booking: any) {
  currentBookingId.value = booking.id
  paymentData.value = { cardNumber: '', expiry: '', cvv: '' }
  paymentError.value = ''
  showPaymentModal.value = true
}

async function processPayment() {
  if (!currentBookingId.value) return
  paymentLoading.value = true
  paymentError.value = ''
  try {
    const paymentPayload = {
      card_number: paymentData.value.cardNumber,
      expiry: paymentData.value.expiry,
      cvv: paymentData.value.cvv
    }
    await payBooking(currentBookingId.value, paymentPayload)
    bookings.value = bookings.value.map(b =>
      b.id === currentBookingId.value ? { ...b, status: 'confirmed' } : b
    )
    showPaymentModal.value = false
  } catch (err: any) {
    paymentError.value = err.message || 'Ошибка оплаты'
  } finally {
    paymentLoading.value = false
  }
}

const handleLogout = () => {
  logout()
  router.push('/')
}

onMounted(async () => {
  try {
    user.value = await getMe()
  } catch (error) {
    logout()
    router.push('/login')
    return
  }

  try {
    bookings.value = await getBookings()
  } catch (error) {
    console.error('Failed to load bookings', error)
  }

  loading.value = false
})
</script>

<style scoped>
/* Общий контейнер и фон */
.profile-page {
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
  min-height: 100vh;
  padding: 48px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== Заголовки ===== */
.page-title,
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: var(--gray-900);
}

.section-title {
  font-size: 1.75rem;
  margin-top: 48px;
  margin-bottom: 24px;
}

.title-accent {
  width: 8px;
  height: 40px;
  background: linear-gradient(135deg, var(--blue), #6366f1);
  border-radius: 4px;
}

/* ===== Загрузка ===== */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--gray-500);
}
.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--gray-300);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== Карточка профиля ===== */
.profile-card {
  background: var(--white);
  border-radius: 32px;
  padding: 32px;
  display: flex;
  gap: 40px;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  margin-bottom: 32px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: transform 0.2s ease;
}
.avatar-wrapper.has-hover:hover {
  transform: scale(1.02);
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--blue), #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
  color: white;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: white;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.avatar-wrapper.has-hover:hover .avatar-overlay {
  opacity: 1;
}

.info-section {
  flex: 1;
}

.info-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.username {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}
.email {
  font-size: 1rem;
  color: var(--gray-500);
  margin: 0;
}
.joined-date {
  font-size: 0.9rem;
  color: var(--gray-500);
  margin: 8px 0 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
/* Кнопки выхода и редактирования – в стиле "вторичных" */
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--gray-300);
  background: transparent;
  color: var(--gray-700);
}
.btn-outline:hover {
  background: var(--gray-100);
  transform: translateY(-2px);
}
.btn-outline:active {
  transform: translateY(0);
}
.btn-outline.logout:hover {
  background: var(--red);
  border-color: var(--red);
  color: white;
}

/* ===== Форма редактирования ===== */
.edit-form {
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
  color: var(--gray-700);
}
.form-group input {
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 40px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

/* ===== Универсальные кнопки ===== */
.btn-primary {
  background: var(--blue);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.btn-primary:hover:not(:disabled) {
  background: var(--blue-dark);
  transform: translateY(-2px);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  padding: 12px 24px;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-secondary:hover {
  background: var(--gray-300);
  transform: translateY(-2px);
}
.btn-secondary:active {
  transform: translateY(0);
}

/* ===== Бронирования ===== */
.bookings-section {
  margin-top: 32px;
}

.bookings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
  margin-top: 24px;
}

.booking-card {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
}
.booking-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.08);
}

.card-image {
  position: relative;
  height: 180px;
  background: var(--gray-100);
  overflow: hidden;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.booking-card:hover .card-image img {
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
.card-status {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  z-index: 1;
}
.status-pending { background: #f59e0b; }
.status-confirmed { background: #10b981; }
.status-cancelled { background: #ef4444; }

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tour-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}
.tour-city,
.booking-dates {
  font-size: 0.9rem;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}
.tour-description {
  font-size: 0.9rem;
  color: var(--gray-700);
  line-height: 1.4;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--gray-100);
}
.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--blue);
  margin: 0;
}
.card-buttons {
  display: flex;
  gap: 8px;
}
.btn-pay {
  background: var(--green);
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 40px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-pay:hover {
  background: #059669;
  transform: scale(1.02);
}
.btn-cancel-booking {
  background: var(--red);
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 40px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-cancel-booking:hover {
  background: var(--red-dark);
  transform: scale(1.02);
}
.btn-cancel-booking:active,
.btn-pay:active {
  transform: scale(0.98);
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
  background: white;
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
.payment-modal {
  max-width: 400px;
}
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.modal-actions .btn-primary,
.modal-actions .btn-secondary {
  flex: 1;
}
.form-row {
  display: flex;
  gap: 12px;
}
.half {
  flex: 1;
}
.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  padding: 8px 12px;
  background-color: #fee2e2;
  border-radius: 12px;
  text-align: center;
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

/* ===== Пустое состояние ===== */
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
.empty-state .btn-primary {
  display: inline-block;
  text-decoration: none;
}

/* ===== Адаптивность ===== */
@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  .avatar-section {
    margin-bottom: 16px;
  }
  .info-view {
    align-items: center;
  }
  .action-buttons {
    justify-content: center;
  }
  .bookings-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .page-title,
  .section-title {
    font-size: 1.5rem;
  }
  .section-title {
    font-size: 1.25rem;
  }
  .title-accent {
    height: 32px;
  }
  .modal-content {
    padding: 24px;
  }
}
</style>