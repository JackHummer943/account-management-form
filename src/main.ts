import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify.ts';
import './assets/styles/common.css';
const app = createApp(App);
app.use(createPinia());
app.use(vuetify);
app.mount('#app');