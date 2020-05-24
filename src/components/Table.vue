<template>
  <div
    class="table"
    @keyup.prevent.70="flip"
    @keyup.prevent.81="rotateLeft"
    @keyup.prevent.69="rotateRight"
  >
    <EditDialog :showDialog="showEditDialog" :object="selectedObject" @closeEditDialog="showEditDialog = false"/>
    <CreateDialog :showDialog="showCreateDialog" @closeCreateDialog="showCreateDialog = false" />
    <RegisterDialog :showDialog="showRegisterDialog" @closeRegisterDialog="showRegisterDialog = false"/>
    <ImportDialog :showDialog="showImportDialog" @closeImportDialog="showImportDialog = false" />
    <ChangeBackgroundDialog :showDialog="showChangeBackgroundDialog" @closeChangeBackgroundDialog="showChangeBackgroundDialog = false"/>
    <SearchDialog :showDialog="showSearchDialog" :object="selectedObject" @closeSearchDialog="showSearchDialog = false"/>

    <div id="scalable-table" :style="scaleTableStyle" @mousewheel.prevent="tableScaleChange">
      <GameObject
        v-for="(object, index) in ownerless"
        :key="index"
        :id="object.id"
        :data-id="object.id"
        :object="object"
        @showEditDialog="showEditDialogHandler"
        @showSearchDialog="showSearchDialogHandler"
      />
    </div>

    <!-- Players Box -->
    <div class="players">
      <div
        class="player"
        v-for="(player, index) in players"
        :key="'p' + index"
        :style="{color: player.color, 'font-size': '20px'}"
      >{{player.displayName}}</div>
    </div>

    <!-- Speed Dial Global Actions -->
    <md-speed-dial class="actions">
      <md-speed-dial-target>
        <md-icon>+</md-icon>
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button class="md-icon-button" @click="showRegisterDialog = true"><i class="fas fa-door-open"/></md-button>
        <md-button class="md-icon-button" @click="leftRoom"><i class="fas fa-door-closed"/></md-button>
        <md-button class="md-icon-button" @click="showCreateDialog = true"><i class="fas fa-plus-circle"/></md-button>
        <md-button class="md-icon-button" @click="showChangeBackgroundDialog = true"><i class="fas fa-file-image"/></md-button>
        <md-button class="md-icon-button" @click="exportGame"><i class="fas fa-download"/></md-button>
        <md-button class="md-icon-button" @click="showImportDialog = true"><i class="fas fa-upload"/></md-button>
      </md-speed-dial-content>
    </md-speed-dial>

    <div :class="handClass">
      <GameObject
        v-for="(object, index) in ownerfull"
        :key="index"
        :id="object.id"
        :data-id="object.id"
        :object="object"
        @showEditDialog="showEditDialogHandler"
      />
      <md-button
        class="md-primary expand"
        @click="toggleHand = !toggleHand"
      >{{toggleHand ? 'Collapse' : 'Expand'}}</md-button>
    </div>
  </div>
</template>

<script>
import interact from "interactjs";
import uniqid from "uniqid";

import GameObject from "./GameObject.vue";
import EditDialog from "./overlay/EditDialog.vue";
import CreateDialog from "./overlay/CreateDialog.vue";
import RegisterDialog from "./overlay/RegisterDialog.vue";
import ImportDialog from "./overlay/ImportDialog.vue";
import ChangeBackgroundDialog from "./overlay/ChangeBackgroundDialog.vue";
import SearchDialog from "./overlay/SearchDialog.vue";

import { getSelectedIndexes } from "../utils/utils.js";

export default {
  name: "Table",
  components: {
    GameObject,

    EditDialog,
    CreateDialog,
    RegisterDialog,
    ImportDialog,
    ChangeBackgroundDialog,
    SearchDialog
  },
  data() {
    return {
      showEditDialog: false,
      showCreateDialog: false,
      showRegisterDialog: false,
      showImportDialog: false,
      showChangeBackgroundDialog: false,
      showSearchDialog: false,

      selectedObject: null,
      toggleHand: true,

      scale: 1,
      pos: { x: 0, y: 0 },
      zoomTarget: { x: 0, y: 0 },
      zoomPoint: { x: 0, y: 0 }
    };
  },
  computed: {
    scaleTableStyle() {
      return {
        background: `url(${this.game.background})`,
        transform: `translate(${this.pos.x}px,${this.pos.y}px) scale(${this.scale},${this.scale})`,
        height: "100%",
        width: "100%"
      };
    },
    ownerfull() {
      return this.$store.state.user
        ? this.game.objects.filter(o => o.owner === this.$store.state.user.uid)
        : [];
    },
    ownerless() {
      return this.game.objects.filter(
        o => o.owner === undefined || o.owner === ""
      );
    },
    players() {
      return this.game.players ? Object.values(this.game.players) : [];
    },
    selectedIndexes() {
      return this.$store.state.selectedIndexes;
    },
    game() {
      return this.$store.state.game;
    },
    handClass() {
      return `hand ${this.toggleHand ? "expanded" : "collapsed"}`;
    }
  },
  methods: {
    tableScaleChange(event) {
      const MAX_SCALE = 4;
      const FACTOR = 0.3;
      const target = window.document.querySelector("#scalable-table");
      const size = {
        w: 6500,
        h: 6500,
      };
      this.zoomPoint.x = event.pageX - target.offsetLeft;
      this.zoomPoint.y = event.pageY - target.offsetTop;

      var delta = event.deltaY;
      if (delta === undefined) {
        delta = event.originalEvent.detail;
      }
      delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency

      this.zoomTarget.x = (this.zoomPoint.x - this.pos.x) / this.scale;
      this.zoomTarget.y = (this.zoomPoint.y - this.pos.y) / this.scale;

      this.scale += -delta * FACTOR * this.scale;
      this.scale = Math.max(1, Math.min(MAX_SCALE, this.scale));
      this.pos.x = -this.zoomTarget.x * this.scale + this.zoomPoint.x;
      this.pos.y = -this.zoomTarget.y * this.scale + this.zoomPoint.y;
      if (this.pos.x > 0) this.pos.x = 0;
      if (this.pos.x + size.w * this.scale < size.w)
        this.pos.x = -size.w * (this.scale - 1);
      if (this.pos.y > 0) this.pos.y = 0;
      if (this.pos.y + size.h * this.scale < size.h)
        this.pos.y = -size.h * (this.scale - 1);
    },
    register() {
      this.$store.dispatch("registerPlayer", this.$store.state.user);
    },
    leftRoom() {
      this.$store.dispatch("leftRoom", this.$store.state.user.uid);
    },
    showEditDialogHandler(id) {
      this.selectedObject = this.game.objects.find(obj => obj.id === id);
      this.showEditDialog = true;
    },
    showSearchDialogHandler(id) {
      this.selectedObject = this.game.objects.find(obj => obj.id === id);
      this.showSearchDialog = true;
    },
    exportGame() {
      const element = document.createElement("a");
      const url = element.setAttribute(
        "href",
        "data:text/json;charset=utf-8," +
          window.encodeURIComponent(JSON.stringify(this.game))
      );
      element.setAttribute("download", "game.json");
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  },
  created() {},
  mounted() {
    const self = this;
    
    this.$store.commit("setRoomId", this.$route.params.id);
    this.$store.dispatch("getData");

    interact("#scalable-table").draggable({
      listeners: {
        move: function(event) {
          event.target.style.marginLeft = (parseInt(event.target.style.marginLeft) || 0) + event.delta.x + "px";
          event.target.style.marginTop = (parseInt(event.target.style.marginTop) || 0) + event.delta.y  + "px";
        }
      }
    });

    interact("#scalable-table .draggable, .hand .draggable").draggable({
      ignoreFrom: ".pinned",
      inertia: {
        resistance: 60
      },
      restrict: {
        restriction: "parent",
        endOnly: false,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },
      // autoScroll: true,
      listeners: {
        move: function(event) {
          const isHand = event.target.parentElement.className.includes("hand");
          self.$store.dispatch("commitMutation", {
            mutation: "moveObject",
            params: {
              event,
              scale: isHand ? 1 : self.scale
            }
          });
        }
      }
    });

    interact(".container:not(.infinite)").dropzone({
      accept: ":not(.hand) > *",
      overlap: 0.1, //% of element
      ondragenter: function(event) {
        event.target.classList.add("drop-target");
        event.relatedTarget.classList.add("drop-relatedTarget");
      },
      ondragleave: function(event) {
        event.relatedTarget.classList.remove("drop-relatedTarget");
        event.target.classList.remove("drop-target");
      },
      ondrop: function(event) {
        event.relatedTarget.classList.remove("drop-relatedTarget");
        event.target.classList.remove("drop-target");

        const objectId = event.relatedTarget.getAttribute("data-id");
        const containerId = event.target.getAttribute("data-id");

        self.$store.dispatch("commitMutation", {
          mutation: "putObjectToContainer",
          params: {
            objectId,
            containerId
          }
        });
      }
    });
  }
};
</script>

<style scoped>
.table {
  background-color: darkslategray;
  width: 6500px;
  height: 6500px;
  padding: 500px;
}

#scalable-table {
  background-color: rebeccapurple;
  width: 5500px;
  height: 5500px;
  transition: transform .1s;
  transform-origin: 0 0;
  touch-action: none;
}

.draggable {
  position: absolute;
  touch-action: none;
}
.drop-target .drop-relatedTarget {
  border: 2px solid gray;
}

.actions {
  position: fixed;
  left: 95vw;
  bottom: 5vh;
}

.hand {
  position: fixed;
  height: 300px;
  width: 80vw;
  left: 10vw;
  background: rgba(0, 0, 0, 0.1);
  z-index: 100000000;
}

.hand.expanded {
  bottom: 0vh;
}

.hand.collapsed {
  bottom: -250px;
}

.hand .expand {
  position: absolute;
  top: 2px;
  right: 2px;
}

.players {
  position: fixed;
  height: auto;
  width: auto;
  top: 0px;
  right: 0px;
  background: rgba(0, 0, 0, 0.1);
  z-index: 100000000;
}
</style>