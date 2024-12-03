import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    currentSettings: {},
    isLoading: false,
  }),
  
  actions: {
    async updateSetting(key, value) {
      try {
        this.isLoading = true
        // Bridge to old settings system
        if (window.Groove && window.Groove.setSettings) {
          await window.Groove.setSettings(key, value)
        }
        this.currentSettings[key] = value
      } finally {
        this.isLoading = false
      }
    },
    
    async loadSettings() {
      try {
        this.isLoading = true
        // Bridge to old settings system
        if (window.Groove && window.Groove.getSettings) {
          const settings = await window.Groove.getSettings()
          this.currentSettings = settings
        }
      } finally {
        this.isLoading = false
      }
    }
  }
})
