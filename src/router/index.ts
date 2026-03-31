import { createRouter, createWebHistory } from "vue-router"

import Home from "@/pages/Home.vue"
import Login from "@/pages/Login.vue"
import Hotels from "@/pages/Hotels.vue"
import Profile from "@/pages/Profile.vue"
import Register from "@/pages/Register.vue"
import Favorites from "@/pages/Favorites.vue"
import { isAuthenticated } from "../auth"
import TourDetails from "@/pages/TourDetails.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/hotels", component: Hotels },
    { path: "/login", component: Login },
    { path: "/profile", component: Profile },
    { path: "/favorites", component: Favorites },
    { path: "/register", component: Register},
    { path: "/tours/:id", component: TourDetails }
  ]
})

router.beforeEach((to, from, next) => {

  if (
    (to.path === "/profile" || to.path === "/favorites")
    && !isAuthenticated.value
  ) {
    next("/login")
    return
  }

  next()
})

export default router