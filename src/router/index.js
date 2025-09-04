import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/create-discount',
      name: 'create-discount',
      component: () => import('../views/CreateDiscount.vue'),
    },
  ],
})

export default router
