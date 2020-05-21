<template>
  <Entity :position="position" :scaling="scaling" :rotation="rotation">
    <Property name="name" :any="'entity'" />
    <Property name="isPickable" :any="false" />
    <Box :position="[0, 0.15, -1]" :scaling="[1, 0.3, 1]">
      <Property name="name" :any="'decreaseCount'" />
      <Property name="dataObject" :any="object" />
      <Material :diffuse="'#999'" />
    </Box>
    <Box :position="[0, 0.15, 0]" :scaling="[1, 0.3, 1]" :options="meshOptions">
      <Property name="dataObject" :any="object" />
      <Property name="name" :any="'count'" />
      <Material>
        <Texture :value="texture" />
      </Material>
    </Box>
    <Property name="dataObject" :any="object" />
    <Box :position="[0, 0.15, 1]" :scaling="[1, 0.3, 1]">
      <Property name="name" :any="'increaseCount'" />
      <Property name="dataObject" :any="object" />
      <Material :diffuse="'#999'" />
    </Box>
  </Entity>
</template>

<script>
import { BABYLON } from "vue-babylonjs";

const ZERO_VECTOR = new BABYLON.Vector4(0, 0, 0, 0);

export default {
  components: {},
  props: {
    object: Object
  },
  computed: {
    rotation() {
      return [0, (this.object.rotation / 180) * Math.PI, 0];
    },
    meshOptions() {
      return {
        faceUV: [
          ZERO_VECTOR,
          ZERO_VECTOR,
          ZERO_VECTOR,
          ZERO_VECTOR,
          new BABYLON.Vector4(0, 0, 1, 1),
          ZERO_VECTOR
        ]
      };
    },
    scaling() {
      return [
        Number.parseFloat(this.object.scale),
        Number.parseFloat(this.object.scale),
        Number.parseFloat(this.object.scale)
      ];
    },
    position() {
      return [
        this.object.x,
        this.object.z +
          ((this.object.depth || this.DEFAULT_DEPTH) * this.object.scale) / 200,
        this.object.y
      ];
    }
  },
  data() {
    return {
      DEFAULT_DEPTH: 1,
      texture: new BABYLON.DynamicTexture(
        "dynamic texture",
        { width: 128, height: 128 },
        this.$parent.scene
      )
    };
  },
  methods: {},
  updated() {
    const font = "bold 80px monospace";
    this.texture.drawText(
      this.object.count,
      null,
      null,
      font,
      "black",
      "gray",
      true,
      true
    );
  }
};
</script>

<style scoped>
</style>