import Vue from 'vue';
import axios from 'axios';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import './styles/index.scss';

import App from './App';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.use(iView);
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
