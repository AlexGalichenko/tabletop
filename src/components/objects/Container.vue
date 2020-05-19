<template>
  <Box
    :position="[object.x, object.z + (object.depth ? object.depth / 2 : 0.25), object.y]"
    :scaling="[object.height / 100, object.depth || 0.5, object.width / 100]"
  >
    <Property name="checkCollisions" :any="true" />
    <Property name="dataObject" :any="object" />
    <Material>
      <Texture :src="object.url"></Texture>
    </Material>
  </Box>
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