const API_URL = "http://127.0.0.1:8000/api"

function getToken() {
  return localStorage.getItem("token")
}

export async function getTours() {
  const res = await fetch(`${API_URL}/tours/`)
  return await res.json()
}

export async function getHotels() {
  const res = await fetch(`${API_URL}/hotels/`)
  return await res.json()
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })

  const data = await res.json()

  localStorage.setItem("token", data.token)

  return data
}

export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      email,
      password
    })
  })

  return await res.json()
}

export async function getMe() {
  const token = getToken()

  const res = await fetch(`${API_URL}/me/`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })

  if (res.status === 401) {
    localStorage.removeItem("token")
    throw new Error("Unauthorized")
  }

  return await res.json()
}

export async function addFavorite(tourId: number) {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/favorites/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`
    },
    body: JSON.stringify({
      tour: tourId
    })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || "Error adding favorite")
  }

  return data
}

export async function getFavorites() {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/favorites/`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })

  return await res.json()
}

export async function removeFavorite(id: number) {
  const token = localStorage.getItem("token")

  await fetch(`${API_URL}/favorites/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`
    }
  })
}

export async function createBooking(
  tourId: number,
  startDate: string,
  endDate: string
) {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/bookings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`
    },
    body: JSON.stringify({
      tour_id: tourId,          // обязательно tour_id
      start_date: startDate,
      end_date: endDate,
    })
  })

  const data = await res.json()
  if (!res.ok) {
    // Обработка ошибки, как раньше
    let errorMessage = ''
    if (data.non_field_errors && data.non_field_errors.length) {
      errorMessage = data.non_field_errors[0]
    } else if (data.detail) {
      errorMessage = data.detail
    } else if (typeof data === 'string') {
      errorMessage = data
    } else {
      errorMessage = JSON.stringify(data)
    }
    throw new Error(errorMessage)
  }
  return data
}

export async function getBookings() {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/bookings/`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })

  return await res.json()
}

export async function cancelBooking(id: number) {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/bookings/${id}/cancel/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`
    }
  })

  if (!res.ok) {
    throw new Error("Ошибка отмены")
  }
}

export async function updateMe(data: any) {
  const token = getToken()

  const res = await fetch(`${API_URL}/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`
    },
    body: JSON.stringify(data)
  })

  return await res.json()
}

export async function getTour(id: number) {
  const res = await fetch(`${API_URL}/tours/${id}/`)
  return await res.json()
}

export async function updateMeAvatar(formData: FormData) {
  const token = getToken()
  const res = await fetch(`${API_URL}/me/avatar/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`
    },
    body: formData
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Ошибка загрузки аватарки")
  }
  return await res.json()
}

export async function payBooking(bookingId: number, paymentData: any) {
  const token = getToken()
  const res = await fetch(`${API_URL}/bookings/${bookingId}/pay/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`
    },
    body: JSON.stringify(paymentData)
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Ошибка оплаты')
  }
  return data
}