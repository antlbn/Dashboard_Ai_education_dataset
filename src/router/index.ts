import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../components/OverviewView.vue'),
    },
    {
      path: '/distributions',
      component: () => import('../components/DistributionsView.vue'),
    },
    {
      path: '/table',
      component: () => import('../components/DataTableView.vue'),
    },
  ],
})

export default router
