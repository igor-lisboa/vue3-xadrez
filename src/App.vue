<script setup lang="ts">
import LanguageSelect from '@/components/layout/LanguageSelect.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { env } from '@/config/env'
import { useLocale } from '@/composables/useLocale'
import { isLocale } from '@/i18n/locales'

const { locale, messages, setLocale, options } = useLocale()

function onLanguageChange(value: string): void {
  if (isLocale(value)) {
    setLocale(value)
  }
}
</script>

<template>
  <div class="d-flex h-100 text-center text-white bg-dark">
    <div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
      <header class="mb-auto d-flex justify-content-between align-items-start">
        <router-link :to="{ name: 'home' }">
          <h3 class="mb-0 text-white">{{ env.appTitle }}</h3>
        </router-link>
        <LanguageSelect
          :model-value="locale"
          :options="options"
          :label="messages.common.languageSelect"
          @update:model-value="onLanguageChange"
        />
      </header>

      <main class="px-3 mt-3">
        <router-view />
      </main>

      <AppFooter
        :developed-by="messages.footer.developedBy"
        :using-api="messages.footer.usingApi"
      />
    </div>
  </div>
</template>
