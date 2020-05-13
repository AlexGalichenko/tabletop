<template>
  <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false">
    <md-dialog-title>Register</md-dialog-title>

    <md-dialog-content>
      <md-field>
        <label>Name</label>
        <md-input v-model="name"></md-input>
      </md-field>

      <md-field>
        <label for="color">Color</label>
        <md-select v-model="color" name="color" id="color">
          <md-option value="red">Red</md-option>
          <md-option value="blue">Blue</md-option>
          <md-option value="green">Green</md-option>
          <md-option value="yellow">Yellow</md-option>
          <md-option value="purple">Purple</md-option>
          <md-option value="black">Black</md-option>
        </md-select>
      </md-field>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="$emit('closeRegisterDialog')">Close</md-button>
      <md-button class="md-primary" @click="saveRegisterDialog">Save</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import { getProperty } from "../../utils/utils.js";
export default {
  components: {},
  props: {
    showDialog: Boolean
  },
  data() {
    return {
      name: "",
      color: "red"
    };
  },
  computed: {},
  methods: {
    saveRegisterDialog() {
      const params = {
        name: this.name,
        color: this.color,
        uid: this.$store.state.user.uid,
        email: this.$store.state.user.email
      };
      if (this.$store.state.game.players && Object.values(this.$store.state.game.players).find(obj => obj.uid === this.$store.state.user.uid)) {
        this.$store.dispatch("updatePlayer", params);
      } else {
        this.$store.dispatch("registerPlayer", params);
      }
      this.$emit("closeRegisterDialog");
    }
  },
  mounted() {}
};
</script>

<style scoped>
</style>