<template>
  <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false">
    <md-dialog-title>Edit Object</md-dialog-title>

    <md-dialog-content>
      <md-field>
        <label>URL</label>
        <md-input v-model="url"/>
      </md-field>

      <md-field>
        <label>Back URL</label>
        <md-input v-model="backUrl"/>
      </md-field>

      <md-field>
        <label>Height</label>
        <md-input v-model="height"/>
      </md-field>

      <md-field>
        <label>Width</label>
        <md-input v-model="width"/>
      </md-field>

      <md-field>
        <label>Scale</label>
        <md-input v-model="scale"/>
      </md-field>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="$emit('closeEditDialog')">Close</md-button>
      <md-button class="md-primary" @click="saveEditDialog">Save</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import { getProperty } from "../../utils/utils.js"
export default {
  components: {
  },
  props: {
    showDialog: Boolean,
    object: Object
  },
  data() {
    return {
      purl: "",
      pbackUrl: "",
      pheight: 0,
      pwidth: 0,
      pscale: 0
    }
  },
  computed: {
    url: {
      get() {return getProperty(this.object, "url")},
      set(value) {this.purl = value;}
    },
    backUrl: {
      get() {return getProperty(this.object, "backUrl")},
      set(value) {this.pbackUrl = value;}
    },
    height: {
      get() {return getProperty(this.object, "height")},
      set(value) {this.pheight = value;}
    },
    width: {
      get() {return getProperty(this.object, "width")},
      set(value) {this.pwidth = value;}
    },
    scale: {
      get() {return getProperty(this.object, "scale")},
      set(value) {this.pscale = value;}
    },
  },
  methods: {
    saveEditDialog() {
        this.$store.dispatch("commitMutation", {
          mutation: "updateObject",
          params: {
            objectId: this.object.id,
            url: this.purl,
            backUrl: this.pbackUrl,
            height: this.pheight,
            width: this.pwidth,
            scale: this.pscale
          }
        });
        this.$emit('closeEditDialog');
    }
  },
  mounted() {}
};
</script>

<style scoped>
</style>