<template>
  <div class="settings-item">
    <div class="settings-item-content">
      <div class="settings-item-title">{{ title }}</div>
      <div class="settings-item-description" v-if="description">{{ description }}</div>
    </div>
    <div class="settings-item-control">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #eee);
}

.settings-item-content {
  flex: 1;
}

.settings-item-title {
  font-weight: 500;
}

.settings-item-description {
  font-size: 0.9em;
  color: var(--text-secondary, #666);
  margin-top: 0.25rem;
}

.settings-item-control {
  margin-left: 1rem;
}
</style>
