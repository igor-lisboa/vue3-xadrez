<script setup lang="ts">
defineProps<{ developedBy: string; usingApi: string }>()
</script>

<template>
  <footer class="mt-auto text-white-50">
    <p class="mt-3">
      {{ developedBy }}
      <a
        href="https://github.com/igor-lisboa"
        target="_blank"
        rel="noopener noreferrer"
        class="text-white"
        >Igor Lisbôa</a
      >, {{ usingApi }}
      <a
        class="text-white"
        href="https://github.com/igor-lisboa/tcc00339-gpms-xadrez-backend"
        target="_blank"
        rel="noopener noreferrer"
        >tcc00339-gpms-xadrez-backend</a
      >.
    </p>
  </footer>
</template>
