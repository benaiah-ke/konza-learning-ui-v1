<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { Send, Paperclip, Circle } from 'lucide-vue-next'
import type { Message } from '@/types'

const parentId = 'par-001'
const parentName = 'Grace Wanjiku'
const teacherName = 'Teacher Anne Njeri'
const teacherClass = 'Butterfly Class'

// Seed with existing messages plus extras for a richer conversation
const chatMessages = ref<Message[]>([
  {
    id: 'msg-100',
    senderId: 'stf-001',
    senderName: 'Teacher Anne Njeri',
    senderRole: 'teacher',
    recipientId: 'par-001',
    content: 'Good morning Grace! Just a reminder that tomorrow is our Colour Day celebration. Amani should wear something yellow.',
    timestamp: '2026-03-06T08:15:00',
    read: true,
  },
  {
    id: 'msg-101',
    senderId: 'par-001',
    senderName: 'Grace Wanjiku',
    senderRole: 'parent',
    recipientId: 'stf-001',
    content: 'Good morning Teacher Anne! Thank you for the reminder. She has a lovely yellow dress she can wear. Will there be any special activities?',
    timestamp: '2026-03-06T08:45:00',
    read: true,
  },
  {
    id: 'msg-102',
    senderId: 'stf-001',
    senderName: 'Teacher Anne Njeri',
    senderRole: 'teacher',
    recipientId: 'par-001',
    content: 'Yes! We will have a colour sorting game, painting with yellow, and a special snack - banana and mango smoothie. The children love it!',
    timestamp: '2026-03-06T09:10:00',
    read: true,
  },
  {
    id: 'msg-001',
    senderId: 'stf-001',
    senderName: 'Teacher Anne Njeri',
    senderRole: 'teacher',
    recipientId: 'par-001',
    content: 'Good afternoon! Amani had a wonderful day today. She shared her toys during free play, which was lovely to see. She also enjoyed our colour sorting activity.',
    timestamp: '2026-03-07T15:30:00',
    read: true,
  },
  {
    id: 'msg-002',
    senderId: 'par-001',
    senderName: 'Grace Wanjiku',
    senderRole: 'parent',
    recipientId: 'stf-001',
    content: 'Thank you Teacher Anne! We have been practising colours at home too. She loves pointing out colours everywhere we go now.',
    timestamp: '2026-03-07T18:15:00',
    read: true,
  },
])

const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  scrollToBottom()
})

function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return

  const msg: Message = {
    id: `msg-local-${Date.now()}`,
    senderId: parentId,
    senderName: parentName,
    senderRole: 'parent',
    recipientId: 'stf-001',
    content: text,
    timestamp: new Date().toISOString(),
    read: false,
  }

  chatMessages.value.push(msg)
  newMessage.value = ''
  scrollToBottom()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function isFromParent(msg: Message): boolean {
  return msg.senderRole === 'parent'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMessageDate(timestamp: string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

// Group messages by date
const groupedMessages = computed(() => {
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  for (const msg of chatMessages.value) {
    const msgDate = new Date(msg.timestamp).toDateString()
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groups.push({ date: msg.timestamp, messages: [msg] })
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }

  return groups
})
</script>

<template>
  <div class="-m-4 flex h-[calc(100vh-7.5rem)] flex-col">
    <!-- Chat Header -->
    <div class="flex items-center gap-3 border-b bg-white px-4 py-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
        AN
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-gray-900">{{ teacherName }}</p>
        <p class="text-xs text-gray-500">{{ teacherClass }}</p>
      </div>
      <div class="flex items-center gap-1.5">
        <Circle class="h-2.5 w-2.5 fill-green-500 text-green-500" />
        <span class="text-xs text-gray-500">Online</span>
      </div>
    </div>

    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto bg-gray-50 px-4 py-3"
    >
      <div
        v-for="group in groupedMessages"
        :key="group.date"
      >
        <!-- Date Divider -->
        <div class="my-3 flex items-center justify-center">
          <span class="rounded-full bg-gray-200 px-3 py-0.5 text-[11px] font-medium text-gray-500">
            {{ formatMessageDate(group.date) }}
          </span>
        </div>

        <!-- Messages -->
        <div
          v-for="msg in group.messages"
          :key="msg.id"
          class="mb-2 flex"
          :class="isFromParent(msg) ? 'justify-end' : 'justify-start'"
        >
          <div
            class="flex max-w-[80%] gap-2"
            :class="isFromParent(msg) ? 'flex-row-reverse' : 'flex-row'"
          >
            <!-- Avatar -->
            <div
              :class="[
                'mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                isFromParent(msg)
                  ? 'bg-violet-600 text-white'
                  : 'bg-emerald-100 text-emerald-700',
              ]"
            >
              {{ getInitials(msg.senderName) }}
            </div>

            <!-- Bubble -->
            <div>
              <div
                :class="[
                  'rounded-2xl px-3.5 py-2.5',
                  isFromParent(msg)
                    ? 'rounded-br-md bg-violet-600 text-white'
                    : 'rounded-bl-md bg-white text-gray-900 shadow-sm',
                ]"
              >
                <p class="text-[13px] leading-relaxed">{{ msg.content }}</p>
              </div>
              <p
                class="mt-0.5 text-[10px]"
                :class="isFromParent(msg) ? 'text-right text-gray-400' : 'text-gray-400'"
              >
                {{ formatMessageTime(msg.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="border-t bg-white px-3 py-2.5">
      <div class="flex items-end gap-2">
        <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
          <Paperclip class="h-5 w-5" />
        </button>
        <div class="flex-1">
          <textarea
            v-model="newMessage"
            placeholder="Type a message..."
            rows="1"
            class="max-h-24 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-300 focus:bg-white"
            @keydown="handleKeydown"
          />
        </div>
        <button
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
          :class="
            newMessage.trim()
              ? 'bg-violet-600 text-white active:bg-violet-700'
              : 'bg-gray-100 text-gray-300'
          "
          :disabled="!newMessage.trim()"
          @click="sendMessage"
        >
          <Send class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>
