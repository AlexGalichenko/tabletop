<template>
  <Cylinder
    :position="[object.x, object.z + (object.depth ? object.depth / 2 : 0.15), object.y]"
    :scaling="[object.height / 100, object.depth || 0.3, object.width / 100]"
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
  computed: {},
  methods: {},
  mounted() {},
  computed: {}
};
</script>

<style scoped>
</style>