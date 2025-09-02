<script setup>
import { ref } from 'vue'
import Calculator from './components/Calculator.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const isLightTheme = ref(false)

const onThemeChanged = (lightTheme) => {
  isLightTheme.value = lightTheme
  // You can add additional theme-related logic here if needed
}
</script>

<template>
  <header>
    <h1>Unsure Calculator</h1>
  </header>

  <main>
    <Calculator :is-light-theme="isLightTheme" />
  </main>

  <ThemeToggle @theme-changed="onThemeChanged" />
</template>

<style scoped>
.subtitle {
  font-style: italic;
  opacity: 0.8;
  margin-top: 0.5rem;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
