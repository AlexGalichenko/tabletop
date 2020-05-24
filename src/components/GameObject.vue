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
      <div @click="decreaseCount" class="minus">-</div>
      <div class="value">{{object.count}}</div>
      <div @click="increaseCount" class="plus">+</div>
    </div>

    <!-- Container Internals -->
    <div v-if="object.type === 'container'">
      <span class="value">{{containerCount}}</span>
    </div>

    <!-- Dice Internals -->
    <div v-if="object.type === 'dice'" class="value">{{object.value}}</div>

    <!-- Context Menu -->
    <md-menu md-size="big" md-direction="bottom-start" :md-active.sync="showContextMenu">
      <md-menu-content>
        <md-menu-item @click="showDealDropdown = !showDealDropdown">Deal</md-menu-item>
        <md-menu-item v-if="cardLike" @click="flip">Flip</md-menu-item>
        <md-menu-item v-if="cardLike" @click="play">Play</md-menu-item>
        <md-menu-item v-if="dice" @click="roll">Roll</md-menu-item>
        <md-menu-item @click="pin">{{pinned}}</md-menu-item>

        <md-menu-item v-if="container" @click="takeObjectFromContainer">Take From Container</md-menu-item>
        <md-menu-item v-if="container" @click="shuffleContainer">Shuffle</md-menu-item>

        <md-menu-item v-if="counter" @click="set0">Set 0</md-menu-item>
        <md-menu-item @click="rotateLeft">&lt;</md-menu-item>
        <md-menu-item @click="rotateRight">&gt;</md-menu-item>
        <md-menu-item @click="$emit('showEditDialog', id)">Edit</md-menu-item>
        <md-menu-item @click="copyObject">Copy</md-menu-item>
        <md-menu-item @click="deleteObject">Delete Object</md-menu-item>
      </md-menu-content>
    </md-menu>

    <md-menu
      :md-active="showDealDropdown"
      @md-closed="showDealDropdown = false"
      :md-close-on-select="false"
      :md-close-on-click="false"
    >
      <md-menu-content>
        <md-menu-item @click="deal($parent.players.map(p => p.uid))">All</md-menu-item>
        <md-menu-item
          v-for="player in $parent.players"
          :key="'player' + player.displayName"
          @click="deal([player.uid])"
        >
          <span :style="'color:' + player.color">{{player.displayName}}</span>
        </md-menu-item>
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
      showContextMenu: false,
      showDealDropdown: false
    };
  },
  computed: {
    containerCount() {
      return this.object.objects
        ? this.object.infinite && this.object.objects.length > 0
          ? "Infinite"
          : this.object.objects.length
        : "0";
    },
    pinned() {
      return this.object.isPinned ? "Unpin" : "Pin";
    },
    objectClass() {
      const infinite =
        this.object.infinite &&
        this.object.objects &&
        this.object.objects.length > 0
          ? "infinite"
          : "";
      const pinned = this.object.isPinned ? "pinned" : "";
      return `draggable ${this.object.type} ${pinned} ${infinite}`;
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
        case "dice":
          return this.diceStyle;
      }
    },
    tileStyle() {
      const isFlipped =
        this.object.isFlipped ||
        (this.object.owner &&
          this.$store.state.user &&
          this.object.owner !== this.$store.state.user.uid);
      const background = isFlipped ? this.object.backUrl : this.object.url;
      const border =
        this.object.owner &&
        this.$store.state.user &&
        this.object.owner !== this.$store.state.user.uid
          ? "2px solid gray"
          : this.$store.state.user &&
            this.object.owner === this.$store.state.user.uid
          ? "2px solid green"
          : "0px";
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`;
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
      const border =
        this.object.owner &&
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
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`;

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
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`;
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
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`;
      return {
        "box-shadow": shadow,
        "z-index": this.object.z || 0,
        transform: `${translate} ${rotate} ${scale}`
      };
    },
    diceStyle() {
      const translate = `translate(${this.object.x}px,${this.object.y}px)`;
      const rotate = `rotate(${this.object.rotation}deg)`;
      const scale = `scale(${this.object.scale})`;
      const shadow = `red 0px 0px ${this.selected ? 10 : 0}px`;
      return {
        border: "black solid 1px",
        "box-shadow": shadow,
        "z-index": this.object.z || 0,
        height: "50px",
        width: "50px",
        "background-color": "gray",
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
    dice() {
      return this.object.type === "dice";
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
    deal(playerIds) {
      this.$store.dispatch("commitMutation", {
        mutation: "deal",
        params: {
          containerId: this.id,
          playerIds: playerIds
        }
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
    },
    copyObject() {
      this.$store.dispatch("commitMutation", {
        mutation: "copyObject",
        params: this.id
      });
    },
    roll() {
      this.$store.dispatch("commitMutation", {
        mutation: "rollObject",
        params: this.id
      });
    }
  },
  mounted() {}
};
</script>

<style scoped>
.container .value {
  background-color: gray;
}

.dice {
  border-radius: 5px;
}

.dice .value {
  position: absolute;
  font-size: 45px;
  top: 16px;
  left: 12px;
}

.counter {
  background-color: gray;
  width: 151px;
  height: 51px;
  border-radius: 25px;
  font-size: 20px;
  border: black solid 1px;
}
.counter .value,
.counter .minus,
.counter .plus {
  display: table-cell;
  position: relative;
  text-align: center;
  vertical-align: middle;
  height: 49px;
  width: 49px;
}
.counter .minus,
.counter .plus {
  cursor: pointer;
}
.counter .minus:hover,
.counter .plus:hover {
  background-color: dimgray;
}
.counter .minus {
  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;
}
.counter .plus {
  border-bottom-right-radius: 25px;
  border-top-right-radius: 25px;
}
</style>