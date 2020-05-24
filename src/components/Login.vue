<template>
  <div class="md-layout md-gutter md-alignment-top-space-around">
    <md-card class="md-layout-item md-size-50 md-gutter">
      <md-card-header>
        <div class="md-title">Login</div>
      </md-card-header>

      <md-card-content>Welcome to Browser Tabletop Simulator. Please login with Google Account to continue</md-card-content>
      
      <md-button class="md-primary md-raised md-layout-item md-size-80" @click="login">Login with Google</md-button>
    </md-card>
  </div>
</template>

<script>
import firebase from "firebase/app";

export default {
  components: {},
  computed: {},
  methods: {
    login() {
      this.$store.dispatch("signInWithGoogle");
    }
  }
};
</script>

<style scoped>
</style>