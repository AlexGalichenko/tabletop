<template>
  <Box 
    :position="position"
    :scaling="scaling"
  >
    <Property name="dataObject" :any="object" />
    <Material>
      <Texture :src="object.isFlipped ? object.backUrl :object.url">
        <Property name="uOffset" :any="object.isFlipped ? 1 : (object.column - 1) / object.columns" />
        <Property name="vOffset" :any="object.isFlipped ? 1 : (object.rows - object.row) / object.rows" />
        <Property name="uScale" :any="object.isFlipped ? 1 : 1 / object.columns" />
        <Property name="vScale" :any="object.isFlipped ? 1 : 1 / object.rows" />
      </Texture>
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
      DEFAULT_DEPTH: 1
    }
  },
  computed: {
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
  mounted() {}
};
</script>

<style scoped>
</style>