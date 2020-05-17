import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
import { sync } from 'vuex-router-sync';
import VueBabylonJs from 'vue-babylonjs';

import App from './App.vue'

import routes from './routes'
import store from './store'

export const router = new VueRouter({
    routes
});

Vue.use(VueRouter);
Vue.use(VueMaterial);
Vue.use(VueBabylonJs);

sync(store, router);

new Vue({
  el: '#app',
  router: router,
  store,
  render: h => h(App)
})