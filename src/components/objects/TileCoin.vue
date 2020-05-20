<template>
  <Cylinder
    :position="position"
    :scaling="scaling"
    :options="{tessellation: 20}"
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
    }
  },
  computed:{
    scaling() {
      return [
        (this.object.height / 100) * this.object.scale,
        ((this.object.depth || this.DEFAULT_DEPTH) / 100) * this.object.scale,
        (this.object.width / 100) * this.object.scale,
      ]
    },
    position() {
      return [
        this.object.x,
        this.object.z + (this.object.depth || this.DEFAULT_DEPTH) / 200,
        this.object.y
      ]
    }
  },
  methods: {},
  mounted() {},
};
</script>

<style scoped>
</style>