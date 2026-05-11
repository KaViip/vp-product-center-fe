import type { RouteRecordRaw } from 'vue-router';

// 如需恢复概览菜单，取消下方注释即可
// import { IFrameView } from '@vben/layouts';
// import { $t } from '#/locales';
// const { version } = __VBEN_ADMIN_METADATA__ || {};

const routes: RouteRecordRaw[] = [
  // {
  //   meta: {
  //     order: -1,
  //     title: $t('page.dashboard.title'),
  //   },
  //   name: 'Dashboard',
  //   path: '/dashboard',
  //   redirect: '/analytics',
  //   children: [
  //     {
  //       name: 'Analytics',
  //       path: '/analytics',
  //       component: () => import('#/views/dashboard/analytics/index.vue'),
  //       meta: {
  //         affixTab: true,
  //         title: $t('page.dashboard.analytics'),
  //       },
  //     },
  //     {
  //       name: 'Workspace',
  //       path: '/workspace',
  //       component: () => import('#/views/dashboard/workspace/index.vue'),
  //       meta: {
  //         title: $t('page.dashboard.workspace'),
  //       },
  //     },
  //   ],
  // },
];

export default routes;
