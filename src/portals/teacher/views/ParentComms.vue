<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { students } from '@/data/students'
import { parents } from '@/data/parents'
import { messages as allMessages } from '@/data/milestones'
import type { Message } from '@/types'
import {
  Send,
  Megaphone,
  MessageCircle,
  ChevronRight,
} from 'lucide-vue-next'

// Teacher identity
const teacherId = 'stf-001'
const teacherName = 'Teacher Anne Njeri'

// Filter students for Butterfly class at Karen campus
const classStudents = computed(() =>
  students.filter(
    (s) => s.className === 'Butterfly' && s.campusId === 'campus-karen',
  ),
)

// Build parent-student relationships for the class
interface ParentContact {
  parentId: string
  parentName: string
  studentName: string
  studentId: string
  studentInitials: string
}

const parentContacts = computed<ParentContact[]>(() => {
  return classStudents.value.map((student) => {
    const parent = parents.find((p) => p.id === student.parentId)
    return {
      parentId: parent?.id ?? '',
      parentName: parent
        ? `${parent.firstName} ${parent.lastName}`
        : 'Unknown Parent',
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.id,
      studentInitials: student.photoInitials,
    }
  })
})

// Reactive messages
const messagesData = ref<Message[]>([...allMessages])

// Selected parent
const selectedParentId = ref<string | null>(
  parentContacts.value[0]?.parentId ?? null,
)

const selectedContact = computed(() =>
  parentContacts.value.find((c) => c.parentId === selectedParentId.value),
)

// Messages for selected conversation
const conversationMessages = computed(() => {
  if (!selectedParentId.value) return []
  return messagesData.value
    .filter(
      (m) =>
        (m.senderId === teacherId &&
          m.recipientId === selectedParentId.value) ||
        (m.senderId === selectedParentId.value &&
          m.recipientId === teacherId),
    )
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
})

// Unread count per parent
function unreadCount(parentId: string): number {
  return messagesData.value.filter(
    (m) =>
      m.senderId === parentId &&
      m.recipientId === teacherId &&
      !m.read,
  ).length
}

// Message input
const messageInput = ref('')
const chatContainerRef = ref<HTMLElement | null>(null)

function sendMessage() {
  if (!messageInput.value.trim() || !selectedParentId.value) return

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    senderId: teacherId,
    senderName: teacherName,
    senderRole: 'teacher',
    recipientId: selectedParentId.value,
    content: messageInput.value.trim(),
    timestamp: new Date().toISOString(),
    read: false,
  }

  messagesData.value.push(newMsg)
  messageInput.value = ''

  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
}

// Quick message templates
const templates = [
  'Reminder: Bring raincoats tomorrow',
  'Your child had a great day!',
  'Please call the school',
]

function useTemplate(template: string) {
  messageInput.value = template
}

// Send to all
function sendToAll() {
  alert(
    'Class-wide announcement would be sent to all parents of Butterfly Class. (Demo only)',
  )
}

// Format timestamp
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Avatar colors
const avatarColors = [
  'bg-teal-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
]

function getAvatarColor(index: number): string {
  return avatarColors[index % avatarColors.length]
}

// Mobile: show chat panel
const showChat = ref(false)

function selectParent(parentId: string) {
  selectedParentId.value = parentId
  showChat.value = true

  // Mark messages as read
  messagesData.value.forEach((m) => {
    if (m.senderId === parentId && m.recipientId === teacherId) {
      m.read = true
    }
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Parent Communication</h1>
        <p class="text-muted-foreground">
          Send updates, reports, and messages to parents
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-[#0891B2] px-4 py-2 text-sm font-medium text-white hover:bg-[#0891B2]/90 transition-colors"
        @click="sendToAll"
      >
        <Megaphone class="h-4 w-4" />
        Send to All Parents
      </button>
    </div>

    <!-- Two-panel layout -->
    <div class="grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-3" style="height: 600px">
      <!-- Left Panel: Parent List -->
      <div
        :class="[
          'border-r border-border lg:col-span-1 overflow-y-auto',
          showChat ? 'hidden lg:block' : '',
        ]"
      >
        <div class="border-b border-border p-4">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Parents &middot; Butterfly Class
          </h2>
        </div>
        <div class="divide-y divide-border">
          <button
            v-for="(contact, index) in parentContacts"
            :key="contact.parentId"
            :class="[
              'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
              selectedParentId === contact.parentId
                ? 'bg-[#0891B2]/10'
                : 'hover:bg-muted/50',
            ]"
            @click="selectParent(contact.parentId)"
          >
            <div
              :class="[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                getAvatarColor(index),
              ]"
            >
              {{ contact.studentInitials }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <p
                  :class="[
                    'truncate text-sm font-medium',
                    selectedParentId === contact.parentId
                      ? 'text-[#0891B2]'
                      : 'text-foreground',
                  ]"
                >
                  {{ contact.parentName }}
                </p>
                <span
                  v-if="unreadCount(contact.parentId) > 0"
                  class="flex h-5 w-5 items-center justify-center rounded-full bg-[#0891B2] text-[10px] font-bold text-white"
                >
                  {{ unreadCount(contact.parentId) }}
                </span>
              </div>
              <p class="truncate text-xs text-muted-foreground">
                Parent of {{ contact.studentName }}
              </p>
            </div>
            <ChevronRight class="h-4 w-4 shrink-0 text-muted-foreground/50 lg:hidden" />
          </button>
        </div>
      </div>

      <!-- Right Panel: Chat Thread -->
      <div
        :class="[
          'flex flex-col lg:col-span-2',
          showChat ? '' : 'hidden lg:flex',
        ]"
      >
        <!-- Chat Header -->
        <div class="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            class="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            @click="showChat = false"
          >
            <ChevronRight class="h-5 w-5 rotate-180" />
          </button>
          <template v-if="selectedContact">
            <div
              :class="[
                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white',
                getAvatarColor(
                  parentContacts.findIndex(
                    (c) => c.parentId === selectedContact.parentId,
                  ),
                ),
              ]"
            >
              {{ selectedContact.studentInitials }}
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">
                {{ selectedContact.parentName }}
              </p>
              <p class="text-xs text-muted-foreground">
                Parent of {{ selectedContact.studentName }}
              </p>
            </div>
          </template>
          <template v-else>
            <p class="text-sm text-muted-foreground">Select a parent to start messaging</p>
          </template>
        </div>

        <!-- Messages Area -->
        <div
          v-if="selectedContact"
          ref="chatContainerRef"
          class="flex-1 overflow-y-auto p-4 space-y-3"
        >
          <div
            v-if="conversationMessages.length === 0"
            class="flex h-full flex-col items-center justify-center text-center"
          >
            <MessageCircle class="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p class="text-sm text-muted-foreground">
              No messages yet. Start a conversation!
            </p>
          </div>

          <div
            v-for="msg in conversationMessages"
            :key="msg.id"
            :class="[
              'flex',
              msg.senderRole === 'teacher' ? 'justify-end' : 'justify-start',
            ]"
          >
            <div
              :class="[
                'max-w-[80%] rounded-2xl px-4 py-2.5',
                msg.senderRole === 'teacher'
                  ? 'bg-[#0891B2] text-white rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md',
              ]"
            >
              <p class="text-sm leading-relaxed">{{ msg.content }}</p>
              <p
                :class="[
                  'mt-1 text-[10px]',
                  msg.senderRole === 'teacher'
                    ? 'text-white/70'
                    : 'text-muted-foreground',
                ]"
              >
                {{ formatTime(msg.timestamp) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-1 items-center justify-center"
        >
          <div class="text-center">
            <MessageCircle class="mx-auto mb-3 h-12 w-12 text-muted-foreground/20" />
            <p class="text-sm text-muted-foreground">
              Select a parent from the list to view messages
            </p>
          </div>
        </div>

        <!-- Quick Templates + Input -->
        <div
          v-if="selectedContact"
          class="border-t border-border"
        >
          <!-- Template Buttons -->
          <div class="flex gap-2 overflow-x-auto px-4 pt-3 pb-2">
            <button
              v-for="template in templates"
              :key="template"
              class="shrink-0 rounded-full border border-[#0891B2]/30 bg-[#0891B2]/5 px-3 py-1 text-xs font-medium text-[#0891B2] transition-colors hover:bg-[#0891B2]/10"
              @click="useTemplate(template)"
            >
              {{ template }}
            </button>
          </div>

          <!-- Message Input -->
          <div class="flex items-end gap-2 px-4 pb-4">
            <textarea
              v-model="messageInput"
              rows="1"
              placeholder="Type a message..."
              class="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#0891B2] focus:outline-none focus:ring-1 focus:ring-[#0891B2]"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              :disabled="!messageInput.trim()"
              :class="[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                messageInput.trim()
                  ? 'bg-[#0891B2] text-white hover:bg-[#0891B2]/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              ]"
              @click="sendMessage"
            >
              <Send class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
