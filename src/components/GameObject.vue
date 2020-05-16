<template>
  <!-- Object -->
  <div
    :class="objectClass"
    :style="style"
    @mouseenter="selected = true"
    @mouseleave="selected = false"
    @click.right.prevent="showContextMenu = true"
  >
    <!-- Counter Internals -->
    <div v-if="object.type === 'counter'">
      <button @click="decreaseCount" class="minus">-</button>
      <span class="value">{{object.count}}</span>
      <button @click="increaseCount" class="plus">+</button>
    </div>

    <!-- Container Internals -->
    <div v-if="object.type === 'container'">
      <span class="value">{{object.objects ? object.objects.length : ""}}</span>
    </div>

    <!-- Context Menu -->
    <md-menu md-size="big" md-direction="bottom-start" :md-active.sync="showContextMenu">
      <md-menu-content>
        <md-menu-item v-if="cardLike" @click="flip">Flip</md-menu-item>
        <md-menu-item v-if="cardLike" @click="draw">Draw</md-menu-item>
        <md-menu-item v-if="cardLike" @click="play">Play</md-menu-item>
        <md-menu-item @click="pin">{{pinned}}</md-menu-item>

        <md-menu-item v-if="container" @click="takeObjectFromContainer">Take From Deck</md-menu-item>
        <md-menu-item v-if="container" @click="takeObjectFromContainerToHand">Take From Deck To Hand</md-menu-item>
        <md-menu-item v-if="container" @click="shuffleContainer">Shuffle</md-menu-item>

        <md-menu-item v-if="counter" @click="set0">Set 0</md-menu-item>
        <md-menu-item @click="rotateLeft">&lt;</md-menu-item>
        <md-menu-item @click="rotateRight">&gt;</md-menu-item>
        <md-menu-item @click="$emit('showEditDialog', id)" >Edit</md-menu-item>
        <md-menu-item @click="deleteObject">Delete Object</md-menu-item>
      </md-menu-content>
    </md-menu>
  </div>
</template>

<script>
import Table from "./Table.vue";

export default {
  components: {
    Table
  },
  props: {
    object: Object,
    id: String
  },
  data() {
    return {
      selected: false,
      showContextMenu: false
    };
  },
  computed: {
    pinned() {
      return this.object.isPinned ? "Unpin" : "Pin";
    },
    objectClass() {
      return `draggable ${this.object.type} ${this.object.isPinned ? "pinned" : ""}`;
    },
    style() {
      switch (this.object.type) {
        case "card":
          return this.cardStyle;
        case "counter":
          return this.counterStyle;
        case "container":
          return this.containerStyle;
        case "tile":
          return this.tileStyle;
      }
    },
    tileStyle() {
      const isFlipped =
        this.object.isFlipped ||
        (this.object.owner &&
          this.$store.state.user &&
          this.object.owner !== this.$store.state.user.uid);
      const background = isFlipped ? this.object.backUrl : this.object.url;
      const border = this.object.owner &&
          this.$store.state.user &&
          this.object.owner !== this.$store.state.user.uid
        ? "2px solid gray"
        : this.$store.state.user &&
          this.object.owner === this.$store.state.user.uid
        ? "2px solid green"
        : "0px";
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`
      const translate = `translate(${this.object.x}px,${this.object.y}px)`;
      const rotate = `rotate(${this.object.rotation}deg)`;
      const scale = `scale(${this.object.scale})`;

      return {
        border: border,
        "box-shadow": shadow,
        "background-image": `url('${background}')`,
        "background-size": "100% 100%",
        "background-position": "100% 100%",
        "min-height": `${this.object.height}px`,
        "min-width": `${this.object.width}px`,
        "z-index": this.object.z || 0,
        transform: `${translate} ${rotate} ${scale}`
      };
    },
    cardStyle() {
      const isFlipped =
        this.object.isFlipped ||
        (this.object.owner &&
          this.$store.state.user &&
          this.object.owner !== this.$store.state.user.uid);
      const background = isFlipped ? this.object.backUrl : this.object.url;
      const border = this.object.owner &&
          this.$store.state.user &&
          this.object.owner !== this.$store.state.user.uid
        ? "2px solid gray"
        : this.$store.state.user &&
          this.object.owner === this.$store.state.user.uid
        ? "2px solid green"
        : "0px";
      const translate = `translate(${this.object.x}px,${this.object.y}px)`;
      const rotate = `rotate(${this.object.rotation}deg)`;
      const scale = `scale(${this.object.scale})`;
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`

      return {
        border: border,
        "box-shadow": shadow,
        "background-image": `url('${background}')`,
        "border-radius": "10px",
        "background-size": isFlipped
          ? "100% 100%"
          : `${this.object.columns * 100}% ${this.object.rows * 100}%`,
        "background-position": isFlipped
          ? "100% 100%"
          : `${this.object.column * 100}% ${this.object.row * 100}%`,
        "min-height": `${this.object.height}px`,
        "min-width": `${this.object.width}px`,
        "z-index": this.object.z || 0,
        transform: `${translate} ${rotate} ${scale}`
      };
    },
    containerStyle() {
      const translate = `translate(${this.object.x}px,${this.object.y}px)`;
      const rotate = `rotate(${this.object.rotation}deg)`;
      const scale = `scale(${this.object.scale})`;
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`
      return {
        "box-shadow": shadow,
        "background-image": `url('${this.object.url}')`,
        "min-height": `${this.object.height}px`,
        "min-width": `${this.object.width}px`,
        "background-size": "100% 100%",
        "z-index": this.object.z || 0,
        transform: `${translate} ${rotate} ${scale}`
      };
    },
    counterStyle() {
      const translate = `translate(${this.object.x}px,${this.object.y}px)`;
      const rotate = `rotate(${this.object.rotation}deg)`;
      const scale = `scale(${this.object.scale})`;
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`
      return {
        "box-shadow": shadow,
        "z-index": this.object.z || 0,
        transform: `${translate} ${rotate} ${scale}`
      };
    },
    cardLike() {
      return ["card", "tile"].includes(this.object.type);
    },
    container() {
      return this.object.type === "container";
    },
    counter() {
      return this.object.type === "counter";
    },
    hasContextMenu() {
      return this.object.type !== "counter";
    }
  },
  methods: {
    increaseCount() {
      this.$store.dispatch("commitMutation", {
        mutation: "increaseCount",
        params: this.id
      });
    },
    decreaseCount() {
      this.$store.dispatch("commitMutation", {
        mutation: "decreaseCount",
        params: this.id
      });
    },
    set0() {
      this.$store.dispatch("commitMutation", {
        mutation: "set0",
        params: this.id
      });
    },
    flip() {
      this.$store.dispatch("commitMutation", {
        mutation: "flipObject",
        params: this.id
      });
    },
    pin() {
      this.$store.dispatch("commitMutation", {
        mutation: "pinObject",
        params: this.id
      });
    },
    draw() {
      this.$store.dispatch("commitMutation", {
        mutation: "drawObject",
        params: this.id
      });
    },
    play() {
      this.$store.dispatch("commitMutation", {
        mutation: "playObject",
        params: this.id
      });
    },
    rotateLeft() {
      this.$store.dispatch("commitMutation", {
        mutation: "rotateObjectLeft",
        params: this.id
      });
    },
    rotateRight() {
      this.$store.dispatch("commitMutation", {
        mutation: "rotateObjectRight",
        params: this.id
      });
    },
    takeObjectFromContainer() {
      this.$store.dispatch("commitMutation", {
        mutation: "takeObjectFromContainer",
        params: this.id
      });
    },
    takeObjectFromContainerToHand() {
      this.$store.dispatch("commitMutation", {
        mutation: "takeObjectFromContainerToHand",
        params: this.id
      });
    },
    shuffleContainer() {
      this.$store.dispatch("commitMutation", {
        mutation: "shuffleContainer",
        params: this.id
      });
    },
    deleteObject() {
      this.$store.dispatch("commitMutation", {
        mutation: "deleteObject",
        params: this.id
      });
    }
  },
  mounted() {}
};
</script>

<style scoped>
.counter div:nth-child(1) {
  background-color: gray;
}
.counter button {
  cursor: pointer;
  background-color: gray;
}
.value {
  background-color: gray;
}
</style>