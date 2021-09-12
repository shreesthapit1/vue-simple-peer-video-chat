import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueMeta from 'vue-meta'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
