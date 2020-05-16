<template>
  <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="false">
    <md-dialog-title>Create Object</md-dialog-title>

    <md-dialog-content>
      <md-field>
        <label for="type">Type</label>
        <md-select v-model="type" name="type" id="type">
          <md-option value="Deck">Deck</md-option>
          <md-option value="Tile">Tile</md-option>
          <md-option value="Counter">Counter</md-option>
          <md-option value="Container">Container</md-option>
        </md-select>
      </md-field>

      <md-field v-if="type !== 'Counter'">
        <label>URL</label>
        <md-input v-model="url"/>
      </md-field>

      <md-field v-if="type !== 'Counter'">
        <label>Back URL</label>
        <md-input v-model="backUrl"/>
      </md-field>

      <md-field v-if="type === 'Deck'">
        <label>Rows</label>
        <md-input v-model="rows"/>
      </md-field>

      <md-field v-if="type === 'Deck'">
        <label>Columns</label>
        <md-input v-model="columns"/>
      </md-field>

      <md-field v-if="['Deck', 'Tile', 'Container'].includes(type)">
        <label>Height</label>
        <md-input v-model="height"/>
      </md-field>

      <md-field v-if="['Deck', 'Tile', 'Container'].includes(type)">
        <label>Width</label>
        <md-input v-model="width"/>
      </md-field>

      <md-field>
        <label>Scale</label>
        <md-input v-model="scale"/>
      </md-field>

      <md-checkbox v-if="['Container'].includes(type)" v-model="infinite" class="md-primary">Infinite</md-checkbox>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="$emit('closeCreateDialog')">Close</md-button>
      <md-button class="md-primary" @click="saveCreateDialog">Save</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import uniqid from "uniqid";
import { getProperty } from "../../utils/utils.js";

export default {
  components: {},
  props: {
    showDialog: Boolean
  },
  data() {
    return {
      url: "",
      backUrl: "",
      type: "Deck",
      rows: 1,
      columns: 1,
      height: 300,
      width: 200,
      scale: 1,
      infinite: false
    };
  },
  computed: {},
  methods: {
    saveCreateDialog() {
      switch (this.type) {
        case "Deck":
          {
            this.$store.dispatch("commitMutation", {
              mutation: "createDeck",
              params: {
                id: uniqid(),
                type: "container",
                url: this.url,
                backUrl: this.backUrl,
                rows: this.rows,
                columns: this.columns,
                height: this.height,
                width: this.width,
                scale: this.scale,
              }
            });
          } break;
        case "Tile":
          {
            this.$store.dispatch("commitMutation", {
              mutation: "createTile",
              params: {
                id: uniqid(),
                type: "tile",
                url: this.url,
                backUrl: this.backUrl,
                height: this.height,
                width: this.width,
                scale: this.scale,
              }
            });
          } break;
        case "Container":
        {
          this.$store.dispatch("commitMutation", {
            mutation: "createContainer",
            params: {
              id: uniqid(),
              type: "container",
              url: this.url,
              backUrl: this.backUrl,
              height: this.height,
              width: this.width,
              scale: this.scale,
              infinite: this.infinite
            }
          });
        } break;
        case "Counter":
          {
            this.$store.dispatch("commitMutation", {
              mutation: "createCounter",
              params: {
                id: uniqid(),
                type: "counter",
                url: this.url,
                scale: this.scale,
                count: 0
              }
            });
          } break;
      }
      this.$emit("closeCreateDialog");
    }
  },
  mounted() {}
};
</script>

<style scoped>
</style>