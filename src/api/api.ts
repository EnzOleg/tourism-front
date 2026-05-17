const API_URL = "https://rev-busy-downloading-decision.trycloudflare.com/api";

function getToken() {
  const token = localStorage.getItem("token")

  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("token")
    return null
  }

  return token
}

export async function getTours() {
  const res = await fetch(`${API_URL}/tours/`)
  return await res.json()
}

export async function getHotels() {
  const res = await fetch(`${API_URL}/hotels/`)
  return await res.json()
}

export async function createSupportRequest(data: {
  name: string
  phone: string
  message?: string
}) {
  const res = await fetch(`${API_URL}/support-requests/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  const responseData = await res.json()

  if (!res.ok) {
    let message = "Не удалось отправить заявку"

    if (responseData.name) {
      message = Array.isArray(responseData.name)
        ? responseData.name[0]
        : responseData.name
    } else if (responseData.phone) {
      message = Array.isArray(responseData.phone)
        ? responseData.phone[0]
        : responseData.phone
    } else if (responseData.detail) {
      message = responseData.detail
    }

    throw new Error(message)
  }

  return responseData
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

  if (!res.ok) {
    localStorage.removeItem("token")
    throw new Error(data.error || "Login failed")
  }

  if (!data.token) {
    localStorage.removeItem("token")
    throw new Error("Token not received")
  }

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

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Register failed")
  }

  return data
}

export async function getMe() {
  const token = getToken()

  if (!token) {
    throw new Error("No token")
  }

  const res = await fetch(`${API_URL}/me/`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })

  const data = await res.json()

  if (!res.ok) {
    localStorage.removeItem("token")
    throw new Error(data.detail || "Unauthorized")
  }

  return data
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
  hotelId: number,
  startDate: string,
  endDate: string,
  peopleCount: number
) {
  const token = getToken()

  if (!token) {
    throw new Error("Вы не авторизованы")
  }

  const res = await fetch(`${API_URL}/bookings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`
    },
    body: JSON.stringify({
      tour_id: tourId,
      hotel_id: hotelId,
      start_date: startDate,
      end_date: endDate,
      people_count: peopleCount
    })
  })

  const data = await res.json()

  if (!res.ok) {
    let errorMessage = ""

    if (data.non_field_errors && data.non_field_errors.length) {
      errorMessage = data.non_field_errors[0]
    } else if (data.detail) {
      errorMessage = data.detail
    } else if (typeof data === "string") {
      errorMessage = data
    } else {
      errorMessage = JSON.stringify(data)
    }

    throw new Error(errorMessage)
  }

  return data
}

export async function deleteBooking(id: number) {
  const token = getToken()

  if (!token) {
    throw new Error("Вы не авторизованы")
  }

  const res = await fetch(`${API_URL}/bookings/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`
    }
  })

  if (!res.ok) {
    throw new Error("Не удалось удалить бронирование")
  }
}

export async function getBookings() {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/bookings/`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Bookings API error:", text)
    throw new Error("Failed to load bookings")
  }

  return await res.json()
}

export async function cancelBooking(id: number) {
  const token = getToken()

  if (!token) {
    throw new Error("Вы не авторизованы")
  }

  const res = await fetch(`${API_URL}/bookings/${id}/cancel/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`
    }
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Ошибка отмены")
  }

  return data
}

export async function createReview(data: any) {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    },
    body: JSON.stringify(data)
  })

  const text = await res.text()

  if (!res.ok) {
    console.log("REVIEW ERROR:", text)
    throw new Error(text)
  }

  return JSON.parse(text)
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