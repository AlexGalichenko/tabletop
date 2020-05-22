<template>
  <div id="room">
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
  mounted() {},
};
</script>

<style scoped>
</style>