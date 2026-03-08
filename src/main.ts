import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// Safety-net error handler: log and swallow errors that occur inside
// component lifecycle hooks (especially ApexCharts mount/unmount).
// Without this, an unhandled error in onMounted corrupts Vue's internal
// component tree and prevents RouterView from swapping children on
// subsequent navigations.
app.config.errorHandler = (err, instance, info) => {
  console.warn(`[Vue error handler] ${info}:`, err)
}

app.use(createPinia())
app.use(router)
app.mount('#app')
