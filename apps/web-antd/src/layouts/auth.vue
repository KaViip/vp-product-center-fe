<script lang="ts" setup>
import { computed } from 'vue';

import { AuthPageLayout } from '@vben/layouts';
import { preferences } from '@vben/preferences';

import { $t } from '#/locales';

const appName = computed(() => preferences.app.name);
const logo = computed(() => preferences.logo.source);
const logoDark = computed(() => preferences.logo.sourceDark);
</script>

<template>
  <AuthPageLayout
    :app-name="appName"
    :logo="logo"
    :logo-dark="logoDark"
    slogan-image="/logo_full.png"
    :page-description="$t('authentication.pageDesc')"
    :page-title="$t('authentication.pageTitle')"
  >
    <!-- 自定义工具栏 -->
    <!-- <template #toolbar></template> -->
  </AuthPageLayout>
</template>

<style scoped>
:deep(img[alt][class*='animate-float']) {
  width: 25%;
  height: auto;
  object-fit: contain;
}

:deep(.text-1xl) {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 1.5rem;
}

:deep(.text-1xl + .mt-2) {
  font-size: 1rem;
}
</style>
