<template>
  <div style="display: inline-block">
    <div class="search-object" :style="internalStyle" @click.right.prevent="showContextMenu = true"/>
    
    <!-- Context Menu -->
    <md-menu md-size="big" md-direction="bottom-start" :md-active.sync="showContextMenu">
      <md-menu-content>
        <md-menu-item @click="take">Take</md-menu-item>
      </md-menu-content>
    </md-menu>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    object: Object,
    containerId: String
  },
  data() {
    return {
      showContextMenu: false
    }
  },
  computed: {
    internalStyle() {
      return {
        "background-image": `url('${this.object.url}')`,
        "background-size": `${(this.object.columns || 1) * 100}% ${(this.object.rows || 1) * 100}%`,
        "background-position": `${(this.object.column || 1) * 100}% ${(this.object.row || 1) * 100}%`,
        "height": `${this.object.height}px`,
        "width": `${this.object.width}px`,
      }
    }
  },
  methods: {
    take(id) {
      this.$store.dispatch("commitMutation", {
        mutation: "takeCertainObjectFromContainer",
        params: {
          containerId: this.containerId,
          objectId: this.object.id
        }
      });
      this.$emit("closeDialog");
    },
  },
  mounted() {}
};
</script>

<style scoped>
  .search-object:hover {
    box-shadow: red 0px 0px 10px;
  }
</style>