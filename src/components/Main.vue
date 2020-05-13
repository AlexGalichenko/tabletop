<template>
  <div>
    <button @click="createRoom">Create Room</button>
    <input v-model="roomId" type="text"/>
    <button @click="openRoom">Connect</button>
  </div>
</template>

<script>
export default {
  components: {
  },
  computed: {},
  data() {
    return {
      roomId: 0
    }
  },
  methods: {
    login() {
      this.$store.dispatch("signInWithGoogle");
    },
    createRoom() {
      this.$store.dispatch("createRoom");
    },
    openRoom() {
      this.$router.push(`/room/${this.roomId}`);
    }
  },
  mounted() {
  },
  computed: {}
};
</script>

<style scoped>
</style>