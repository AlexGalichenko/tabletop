<template>
  <div id="room"
    @keydown.83="scrollDown"
    @keydown.87="scrollUp"
    @keydown.65="scrollLeft"
    @keydown.68="scrollRight"
    tabindex="1"
  >
    <Table />
  </div>
</template>

<script>
import Table from "./Table.vue";
import {
  scrollDown,
  scrollUp,
  scrollLeft,
  scrollRight
} from "../utils/scroll.js";

export default {
  components: {
    Table
  },
  computed: {},
  methods: {
    scrollDown,
    scrollUp,
    scrollLeft,
    scrollRight
  },
  mounted() {}
};
</script>

<style scoped>
</style>