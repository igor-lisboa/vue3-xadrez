<script setup lang="ts">
type ActionButtonVariant = 'light' | 'danger' | 'dark'

withDefaults(defineProps<{ variant?: ActionButtonVariant }>(), { variant: 'light' })

const variantClasses: Record<ActionButtonVariant, string> = {
  light: 'btn-light border-white',
  danger: 'btn-danger',
  dark: 'btn-dark',
}
</script>

<template>
  <button type="button" class="btn btn-lg fw-bold" :class="variantClasses[variant]">
    <slot />
  </button>
</template>
