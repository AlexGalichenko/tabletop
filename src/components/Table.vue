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
    <RegisterDialog
      :showDialog="showRegisterDialog"
      @closeRegisterDialog="showRegisterDialog = false"
    />
    <ImportDialog :showDialog="showImportDialog" @closeImportDialog="showImportDialog = false" />

    <!-- <GameObject
      v-for="(object, index) in ownerless"
      :key="index"
      :id="object.id"
      :data-id="object.id"
      :object="object"
      @showEditDialog="showEditDialogHandler"
    />-->

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

    <div class="hand collapsed">
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

    <Scene @complete="readyScene">
      <Camera type="arcRotate"></Camera>
      <PointLight :position="[0, 2, -1]"></PointLight>
      <Ground :options="{width:100, height:100}">
        <Material diffuse="#F00"></Material>
      </Ground>
      <Box :position="[1, 0, 0]" :scaling="[3,0.1,2]">
        <Property name="someSceneProperty" :any="{ aProperty: 'a value' }"></Property>
        <Material>
          <Texture src="https://i.imgur.com/mSK2V5v.jpg"></Texture>
        </Material>
      </Box>
    </Scene>
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
      scene: null,
      engine: null
    };
  },
  computed: {
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
    },
    readyScene(event) {
      this.engine = event.engine;
      this.scene = event.scene;

      var canvas = event.engine.getRenderingCanvas();
      var startingPoint;
      var currentMesh;
      console.log(event.scene)

      var getGroundPosition = function() {
        // Use a predicate to get position on the ground
        var pickinfo = event.scene.pick(event.scene.pointerX, event.scene.pointerY, function(mesh) {
          return mesh == event.scene.meshes[0];
        });

        if (pickinfo.hit) {
          return pickinfo.pickedPoint;
        }

        return null;
      };

      var onPointerDown = function(evt) {
        if (evt.button !== 0) {
          return;
        }

        // check if we are under a mesh
        var pickInfo = event.scene.pick(event.scene.pointerX, event.scene.pointerY, function(mesh) {
          return mesh !== event.scene.meshes[0];
        });

        if (pickInfo.hit) {
          currentMesh = pickInfo.pickedMesh;
          startingPoint = getGroundPosition();

          if (startingPoint) {
            // we need to disconnect camera from canvas
            setTimeout(function() {
              event.scene.activeCamera.detachControl(canvas);
            }, 0);
          }
        }
      };

      var onPointerUp = function() {
        if (startingPoint) {
          event.scene.activeCamera.attachControl(canvas, true);
          startingPoint = null;
          return;
        }
      };

      var onPointerMove = function(evt) {
        if (!startingPoint) {
          return;
        }

        var current = getGroundPosition();

        if (!current) {
          return;
        }

        var diff = current.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);

        startingPoint = current;
      };

      canvas.addEventListener("pointerdown", onPointerDown, false);
      canvas.addEventListener("pointerup", onPointerUp, false);
      canvas.addEventListener("pointermove", onPointerMove, false);
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
  /* width: 4000px;
  height: 2500px; */
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