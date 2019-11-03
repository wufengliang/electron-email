import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'send-email',
      component: require('@/components/sendEmail').default,
    },
    {
      path: '/look-email',
      name: 'look-email',
      component: require('@/components/lookEmail').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
