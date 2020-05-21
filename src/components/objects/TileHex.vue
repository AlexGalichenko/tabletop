<template>
  <Cylinder
    :position="position"
    :scaling="scaling"
    :rotation="rotation"
    :options="{tessellation: 6}"
  >
    <Property name="checkCollisions" :any="true" />
    <Property name="dataObject" :any="object" />
    <Material>
      <Texture :src="object.isFlipped ? object.backUrl :object.url" />
    </Material>
  </Cylinder>
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
    rotation() {
      return [0, (this.object.rotation / 180) * Math.PI, 0];
    },
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
          ((this.object.depth || this.DEFAULT_DEPTH) * this.object.scale) / 100,
        this.object.y
      ];
    }
  },
  methods: {},
  mounted() {}
};
</script>

<style scoped>
</style>