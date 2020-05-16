<template>
  <div
    class="table"
    @keyup.prevent.70="flip"
    @keyup.prevent.81="rotateLeft"
    @keyup.prevent.69="rotateRight"
  >
    
    <EditDialog
      :showDialog="showEditDialog"
      :object="selectedObject"
      @closeEditDialog="showEditDialog = false"
    />

    <CreateDialog :showDialog="showCreateDialog" @closeCreateDialog="showCreateDialog = false" />
    <RegisterDialog :showDialog="showRegisterDialog" @closeRegisterDialog="showRegisterDialog = false" />
    <ImportDialog :showDialog="showImportDialog" @closeImportDialog="showImportDialog = false" />

    <GameObject
      v-for="(object, index) in ownerless"
      :key="index"
      :id="object.id"
      :data-id="object.id"
      :object="object"
      @showEditDialog="showEditDialogHandler"
    />

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
        <md-button class="md-icon-button" @click="showRegisterDialog = true">Register</md-button>
        <md-button class="md-icon-button" @click="leftRoom">Left Room</md-button>
        <md-button class="md-icon-button" @click="showCreateDialog = true">Create Object</md-button>
        <md-button class="md-icon-button" @click="exportGame">Export</md-button>
        <md-button class="md-icon-button" @click="showImportDialog = true">Import</md-button>
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
      <md-button class="md-primary expand" @click="toggleHand = !toggleHand">{{toggleHand ? 'Collapse' : 'Expand'}}</md-button>
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

import { getSelectedIndexes } from "../utils/utils.js";

export default {
  name: "Table",
  components: {
    GameObject,
    EditDialog,
    CreateDialog,
    RegisterDialog,
    ImportDialog
  },
  data() {
    return {
      showEditDialog: false,
      showCreateDialog: false,
      showRegisterDialog: false,
      showImportDialog: false,
      selectedObject: null,
      toggleHand: true,
    };
  },
  computed: {
    ownerfull() {
      return this.$store.state.user ? this.game.objects.filter(o => o.owner === this.$store.state.user.uid) : []
    },
    ownerless() {
      return this.game.objects.filter(o => o.owner === undefined || o.owner === '')
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
      return `hand ${this.toggleHand ? "expanded" : "collapsed"}`
    }
  },
  methods: {
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
    exportGame() {
      const element = document.createElement('a');
      const url = element.setAttribute('href', 'data:text/json;charset=utf-8,' + window.encodeURIComponent(JSON.stringify(this.game)));
      element.setAttribute('download', 'game.json');
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

    interact(".draggable").draggable({
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
          self.$store.dispatch("commitMutation", {
            mutation: "moveObject",
            params: {
              event,
              scale: 1
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
  width: 4000px;
  height: 2500px;
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