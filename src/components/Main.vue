<template>
  <div class="md-layout md-gutter md-alignment-top-space-around">
    <md-card class="md-layout-item md-size-60">
      <md-card-header>
        <div class="md-title">Room</div>
      </md-card-header>
      <md-card-content>Create new empty room or connect to existing one</md-card-content>
      <md-card-content class="md-layout md-gutter md-alignment-top-space-around">
        <md-field>
          <label>Room ID</label>
          <md-input v-model="roomId" />
        </md-field>
        <md-button class="md-primary md-raised md-layout-item md-size-49" @click="openRoom">Connect</md-button>
        <md-button
          class="md-primary md-raised md-layout-item md-size-49"
          @click="createRoom"
        >Create Room</md-button>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
export default {
  components: {},
  computed: {},
  data() {
    return {
      roomId: ""
    };
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
  mounted() {},
  computed: {}
};
</script>

<style scoped>
</style>