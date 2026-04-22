import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    children: [
      {
        component: () => import('#/views/fund/product-team/index.vue'),
        meta: {
          title: 'Product Team',
        },
        name: 'FundProductTeam',
        path: '/fund/product-team',
      },
      {
        component: () => import('#/views/fund/operational-team/index.vue'),
        meta: {
          title: 'Operational Team',
        },
        name: 'FundOperationalTeam',
        path: '/fund/operational-team',
      },
      {
        component: () => import('#/views/fund/documents/index.vue'),
        meta: {
          title: 'Documents',
        },
        name: 'FundDocuments',
        path: '/fund/documents',
      },
    ],
    meta: {
      icon: 'lucide:landmark',
      title: 'Fund',
    },
    name: 'Fund',
    path: '/fund',
  },
];

export default routes;
