<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  components:{
  },
  created(){
    this.$store.dispatch('firebaseInit');
  }
}
</script>

<style>
  .md-dialog-container {
    transform: unset;
    width: 50%;
    z-index: 100000000;
  }
  .md-dialog {
    z-index: 100000010;
  }
  .md-speed-dial, .md-menu-content, .md-menu-content.md-select-menu {
    z-index: 100000020;
  }
</style>