<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue'
import { env } from '@/config/env'
</script>

<template>
  <div class="d-flex h-100 text-center text-white bg-dark">
    <div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
      <header class="mb-auto row">
        <router-link :to="{ name: 'home' }">
          <h3 class="float-md-start mb-0 text-white">{{ env.appTitle }}</h3>
        </router-link>
      </header>

      <main class="px-3 mt-3">
        <router-view />
      </main>

      <AppFooter />
    </div>
  </div>
</template>
