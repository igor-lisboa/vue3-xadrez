import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import './styles/global.css'
import App from './App.vue'
import { env } from './config/env'
import router from './router'
import { registerServiceWorker } from './services/pwa'

createApp(App).use(router).mount('#app')
registerServiceWorker(env.isProduction)
