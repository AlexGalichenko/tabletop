<template>
  <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false">
    <md-dialog-title>Import</md-dialog-title>

    <md-dialog-content>
      <md-field>
        <label>File</label>
        <md-file @md-change="getFileList"/>
      </md-field>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="$emit('closeImportDialog')">Close</md-button>
      <md-button class="md-primary" @click="saveImportDialog">Import</md-button>
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
      file: null,
    };
  },
  computed: {},
  methods: {
    getFileList(event) {
      this.file = event[0];
    },
    saveImportDialog() {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          this.$store.dispatch("importGame", JSON.parse(event.target.result));
          this.$emit('closeImportDialog');
        });
        reader.readAsText(this.file);
    }
  },
  mounted() {}
};
</script>

<style scoped>
</style>