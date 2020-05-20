<template>
  <Box
    :position="[object.x, object.z + deckHeight / 2, object.y]"
    :scaling="[object.height / 100, deckHeight , object.width / 100]"
    :options="meshOptions"
  >
    <Property name="checkCollisions" :any="true" />
    <Property name="dataObject" :any="object" />
    <Property name="name" :any="'container'" />
    <Material>
      <Texture v-if="lastObject" :src="object.isFlipped ? lastObject.backUrl : lastObject.url">
        <Property name="uOffset" :any="object.isFlipped ? 1 : (lastObject.column - 1) / lastObject.columns" />
        <Property name="vOffset" :any="object.isFlipped ? 1 : (lastObject.rows - lastObject.row) / lastObject.rows" />
        <Property name="uScale" :any="object.isFlipped ? 1 : 1 / lastObject.columns" />
        <Property name="vScale" :any="object.isFlipped ? 1 : 1 / lastObject.rows" />
      </Texture>
    </Material>
  </Box>
</template>

<script>
import { BABYLON } from "vue-babylonjs";

const WHITE_COLOR = new BABYLON.Color4(255, 255, 255, 0);

export default {
  components: {},
  props: {
    object: Object
  },
  computed: {
    deckHeight() {
      return this.object.depth || this.CARD_HEIGHT * (this.object.objects ? this.object.objects.length : 1)
    },
    lastObject() {
      return this.object.objects 
        ? this.object.objects[this.object.objects.length - 1] 
        : null
    },
    meshOptions() {
      return {
        faceUV: [
          WHITE_COLOR,
          WHITE_COLOR,
          WHITE_COLOR,
          WHITE_COLOR,
          new BABYLON.Vector4(0, 0, 1, 1),
          WHITE_COLOR
        ],
      }
    }
  },
  data() {
    return {
      CARD_HEIGHT: 1 / 100
    }
  },
  methods: {},
  mounted() {}
};
</script>

<style scoped>
</style>