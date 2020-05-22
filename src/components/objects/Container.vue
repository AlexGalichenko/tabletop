<template>
  <Box
    :position="position"
    :scaling="scaling"
    :rotation="rotation"
  >
    <Property name="checkCollisions" :any="true" />
    <Property name="dataObject" :any="object" />
    <Property name="name" :any="'container'" />
    <Material>
      <Texture :src="object.url"/>
    </Material>
  </Box>
</template>

<script>
export default {
  components: {},
  props: {
    object: Object
  },
  data() {
    return {
      DEFAULT_DEPTH: 30
    };
  },
  computed: {
    scaling() {
      return [
        (this.object.height / 100) * this.object.scale,
        ((this.object.depth || this.DEFAULT_DEPTH) / 100) * this.object.scale,
        (this.object.width / 100) * this.object.scale
      ];
    },
    position() {
      return [
        this.object.x,
        this.object.z +
          ((this.object.depth || this.DEFAULT_DEPTH) * this.object.scale) / 200,
        this.object.y
      ];
    },
    rotation() {
      return [0, (this.object.rotation / 180) * Math.PI, 0];
    }
  },
  methods: {},
  mounted() {}
};
</script>

<style scoped>
</style>