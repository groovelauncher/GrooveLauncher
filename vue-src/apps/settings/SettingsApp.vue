<template>
  <div class="settings-app">
    <SettingsHeader title="Groove Settings">
      <template #actions>
        <!-- Add any header actions here -->
      </template>
    </SettingsHeader>
    
    <div class="settings-content">
      <SettingsItem
        v-for="(setting, key) in settingsStore.currentSettings"
        :key="key"
        :title="setting.title || key"
        :description="setting.description"
      >
        <!-- Dynamic control based on setting type -->
        <template v-if="setting.type === 'boolean'">
          <input
            type="checkbox"
            :checked="setting.value"
            @change="e => updateSetting(key, e.target.checked)"
          >
        </template>
        <template v-else-if="setting.type === 'string'">
          <input
            type="text"
            :value="setting.value"
            @input="e => updateSetting(key, e.target.value)"
          >
        </template>
      </SettingsItem>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from './stores/settings'
import SettingsHeader from './components/SettingsHeader.vue'
import SettingsItem from './components/SettingsItem.vue'

const settingsStore = useSettingsStore()

const updateSetting = async (key, value) => {
  await settingsStore.updateSetting(key, value)
}

onMounted(async () => {
  await settingsStore.loadSettings()
})
</script>

<style scoped>
.settings-app {
  height: 100%;
  overflow-y: auto;
}

.settings-content {
  padding: 1rem;
}
</style>
