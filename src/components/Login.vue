<template>
  <div>
    <button @click="login">Firebase Login</button>
  </div>
</template>

<script>
import firebase from "firebase/app";

export default {  
  components: {
  },
  computed: {},
  methods: {
    login() {
      this.$store.dispatch("signInWithGoogle");
    }
  },
  computed: {
  }
};
</script>

<style scoped>
</style>