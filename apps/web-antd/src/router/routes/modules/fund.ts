import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    children: [
      {
        component: () => import('#/views/productcenter/productCenterMasterdata/index.vue'),
        meta: { icon: 'lucide:building-2', title: 'Product Team' },
        name: 'FundProductTeam',
        path: '/fund/product-team',
      },
      {
        component: () => import('#/views/productcenter/productCenterData/index.vue'),
        meta: { icon: 'lucide:settings-2', title: 'Operational Team' },
        name: 'FundOperationalTeam',
        path: '/fund/operational-team',
      },
    ],
    meta: { icon: 'lucide:landmark', title: 'Fund' },
    name: 'Fund',
    path: '/fund',
  },
];

export default routes;
