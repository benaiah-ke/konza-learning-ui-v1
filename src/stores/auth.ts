import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PortalType = 'executive' | 'finance' | 'parent' | 'teacher' | 'admissions'

interface User {
  name: string
  role: string
  avatar: string
  email: string
}

const mockUsers: Record<PortalType, User> = {
  executive: {
    name: 'Dr. Sarah Wanjiku',
    role: 'Managing Director',
    avatar: 'SW',
    email: 'sarah.wanjiku@konza.ac.ke',
  },
  finance: {
    name: 'James Ochieng',
    role: 'Chief Finance Officer',
    avatar: 'JO',
    email: 'james.ochieng@konza.ac.ke',
  },
  parent: {
    name: 'Grace Muthoni',
    role: 'Parent',
    avatar: 'GM',
    email: 'grace.muthoni@gmail.com',
  },
  teacher: {
    name: 'Teacher Anne Njeri',
    role: 'Lead Teacher - Butterfly Class',
    avatar: 'AN',
    email: 'anne.njeri@konza.ac.ke',
  },
  admissions: {
    name: 'Peter Kamau',
    role: 'Admissions Manager',
    avatar: 'PK',
    email: 'peter.kamau@konza.ac.ke',
  },
}

export const useAuthStore = defineStore('auth', () => {
  const currentPortal = ref<PortalType>('executive')

  const currentUser = computed(() => mockUsers[currentPortal.value])

  function switchPortal(portal: PortalType) {
    currentPortal.value = portal
  }

  return { currentPortal, currentUser, switchPortal }
})
