<template>
  <header class="settings-header">
    <h1>{{ title }}</h1>
    <div class="settings-actions">
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Settings'
  }
})
</script>

<style scoped>
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}
</style>
