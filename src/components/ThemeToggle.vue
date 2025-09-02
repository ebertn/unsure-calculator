<template>
  <div class="theme-toggle">
    <button @click="toggleTheme" :title="isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
      {{ isDarkTheme ? '☀️' : '🌙' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'ThemeToggle',
  data() {
    return {
      // Select default theme
      isDarkTheme: true
    }
  },
  mounted() {
    // Initially set theme based on default (from isDarkTheme)
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  },
  methods: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      document.body.classList.toggle('dark-theme', this.isDarkTheme);
      // Emit event for parent components that might need to know about theme changes
      this.$emit('theme-changed', this.isDarkTheme);
    }
  }
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

.theme-toggle button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.theme-toggle button:hover {
  background-color: var(--color-text);
  color: var(--color-background);
}
</style>
