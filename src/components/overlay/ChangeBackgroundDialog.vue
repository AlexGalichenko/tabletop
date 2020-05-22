<template>
  <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false">
    <md-dialog-title>Change Background</md-dialog-title>

    <md-dialog-content>
      <md-field>
        <label>Table Background</label>
        <md-input v-model="tableBackground"/>
      </md-field>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="$emit('closeChangeBackgroundDialog')">Close</md-button>
      <md-button class="md-primary" @click="saveChangeBackgroundDialog">Save</md-button>
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
      tableBackground: null
    };
  },
  computed: {},
  methods: {
    saveChangeBackgroundDialog() {
      this.$store.dispatch("commitMutation", {
        mutation: "updateBackground",
        params: this.tableBackground
      });
    }
  },
  mounted() {}
};
</script>

<style scoped>
</style>