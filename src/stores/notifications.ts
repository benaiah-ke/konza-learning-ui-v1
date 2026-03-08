import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notifications as notifData } from '@/data/notifications'
import type { Notification } from '@/types'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([...notifData])

  const unreadCount = computed(() =>
    notifications.value.filter((n) => !n.read).length,
  )

  const sortedNotifications = computed(() =>
    [...notifications.value].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
  )

  function markAsRead(id: string) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllRead() {
    for (const notification of notifications.value) {
      notification.read = true
    }
  }

  return {
    notifications,
    unreadCount,
    sortedNotifications,
    markAsRead,
    markAllRead,
  }
})
