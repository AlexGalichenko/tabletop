import Login from '../components/Login.vue';
import Main from '../components/Main.vue';
import Room from '../components/Room.vue';

export default [
  {
    path: '/',
    component: Login
  },
  {
    path: '/main',
    component: Main
  },
  {
    path: '/room/:id',
    component: Room
  }
]