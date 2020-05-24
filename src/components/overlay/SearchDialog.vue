<template>
  <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false">
    <md-dialog-title>Search Object</md-dialog-title>

    <md-dialog-content>
      <SearchObject 
      v-for="obj in containerObjects" 
      :key="'internal' + obj.id" 
      :object="obj" 
      :containerId="object.id"
      @closeDialog="$emit('closeSearchDialog')"/>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="$emit('closeSearchDialog')">Close</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import SearchObject from "./SearchObject.vue";

export default {
  components: {
    SearchObject
  },
  props: {
    showDialog: Boolean,
    object: Object
  },
  data() {
    return {
    };
  },
  computed: {

    containerObjects() {
      return this.object && this.object.objects ? this.object.objects : []
    }
  },
  methods: {},
  mounted() {}
};
</script>

<style scoped>
</style>