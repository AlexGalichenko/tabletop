<template>
  <div
    class="table"
    @keyup.prevent.70="flip"
    @keyup.prevent.81="rotateLeft"
    @keyup.prevent.69="rotateRight"
  >
    <EditDialog
      :showDialog="showEditDialog"
      :object="interactedObject || selectedObject"
      @closeEditDialog="showEditDialog = false"
    />

    <CreateDialog :showDialog="showCreateDialog" @closeCreateDialog="showCreateDialog = false" />
    <RegisterDialog
      :showDialog="showRegisterDialog"
      @closeRegisterDialog="showRegisterDialog = false"
    />
    <ImportDialog :showDialog="showImportDialog" @closeImportDialog="showImportDialog = false" />

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
      <md-button
        class="md-primary expand"
        @click="toggleHand = !toggleHand"
      >{{toggleHand ? 'Collapse' : 'Expand'}}</md-button>
    </div>

    <Scene @complete="readyScene">
      <Property name="collisionsEnabled" :any="true" />
      <Camera type="arcRotate">
        <Property name="checkCollisions" :any="true" />
      </Camera>
      <HemisphericLight>
        <property name="intensity" :float="1.5"></property>
      </HemisphericLight>
      <Ground :options="{width:100, height:100}">
        <Property name="name" :any="'table'" />
        <Material>
          <Texture
            :src="'https://media.istockphoto.com/photos/green-worn-poker-or-pool-table-felt-texture-picture-id481055059?k=6&m=481055059&s=612x612&w=0&h=1jEKknomRjh0Kxh50sF-2-M_QgSltF8jcYmp-6RuUoI='"
          />
        </Material>
        <Property name="checkCollisions" :any="true" />
      </Ground>

      <!-- 3D scene -->
      <!-- Cards -->
      <Card 
      v-for="(object, index) in ownerless.filter(card => card.type === 'card')" 
      :key="'card' + index" 
      :object="object"/>

      <!-- Containers -->
      <Container 
        v-for="(object, index) in ownerless.filter(card => card.type === 'container')" 
        :key="'container' + index" 
        :object="object"/>

      <!-- Tiles Box -->
      <TileBox 
        v-for="(object, index) in ownerless.filter(tile => tile.type === 'tile' && (!tile.shape || tile.shape =='box'))"
        :key="'tile-box' + index"
        :object="object"/>

      <!-- Tiles Hex -->
      <TileHex 
        v-for="(object, index) in ownerless.filter(tile => tile.type === 'tile' && tile.shape =='hex')"
        :key="'tile-hex' + index"
        :object="object"/>

      <!-- Tiles Coin -->
      <TileCoin
        v-for="(object, index) in ownerless.filter(tile => tile.type === 'tile' && tile.shape =='coin')"
        :key="'tile-coin' + index"
        :object="object"/>
        
    </Scene>

    <div :style="dropdownStyle">
      <md-menu :md-active="showDropdown" @md-closed="showDropdown = false">
        <md-menu-content>
          <md-menu-item @click="flip">Flip</md-menu-item>
          <md-menu-item @click="takeObjectFromContainer">Take From Container</md-menu-item>
          <md-menu-item @click="takeObjectFromContainerToHand">Take From Container To Hand</md-menu-item>
          <md-menu-item @click="draw">Draw</md-menu-item>
          <md-menu-item @click="showEditDialog = true">Edit</md-menu-item>
          <md-menu-item
            @click="pin"
          >{{(interactedObject && interactedObject.isPinned) ? "Unpin" : "Pin"}}</md-menu-item>
        </md-menu-content>
      </md-menu>
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

import Card from "./objects/Card.vue";
import Container from "./objects/Container.vue";
import TileBox from "./objects/TileBox.vue";

import { getSelectedIndexes } from "../utils/utils.js";
import * as BABYLON from "babylonjs";

export default {
  name: "Table",
  components: {
    GameObject,
    EditDialog,
    CreateDialog,
    RegisterDialog,
    ImportDialog,

    Card,
    Container,
    TileBox
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
      engine: null,
      showDropdown: false,
      dropdownTop: 0,
      dropdownLeft: 0,
      interactedObject: null
    };
  },
  computed: {
    dropdownStyle() {
      return `position: absolute; top: ${this.dropdownTop}px; left: ${this.dropdownLeft}px`;
    },
    ownerfull() {
      return this.game && this.$store.state.user
        ? this.game.objects.filter(o => o.owner === this.$store.state.user.uid)
        : [];
    },
    ownerless() {
      return this.game
        ? this.game.objects.filter(o => o.owner === undefined || o.owner === "")
        : [];
    },
    players() {
      return this.game && this.game.players
        ? Object.values(this.game.players)
        : [];
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
    draw() {
      this.$store.dispatch("commitMutation", {
        mutation: "drawObject",
        params: this.interactedObject.id
      });
    },
    play() {
      this.$store.dispatch("commitMutation", {
        mutation: "playObject",
        params: this.interactedObject.id
      });
    },
    takeObjectFromContainer() {
      this.$store.dispatch("commitMutation", {
        mutation: "takeObjectFromContainer",
        params: this.interactedObject.id
      });
    },
    takeObjectFromContainerToHand() {
      this.$store.dispatch("commitMutation", {
        mutation: "takeObjectFromContainerToHand",
        params: this.interactedObject.id
      });
    },
    pin() {
      this.$store.dispatch("commitMutation", {
        mutation: "pinObject",
        params: this.interactedObject.id
      });
    },
    flip() {
      this.$store.dispatch("commitMutation", {
        mutation: "flipObject",
        params: this.interactedObject.id
      });
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
      const self = this;
      this.engine = event.engine;
      this.scene = event.scene;

      var canvas = event.engine.getRenderingCanvas();
      var startingPoint;
      var currentMesh;
      let clickPosition;

      canvas.addEventListener("pointerdown", onPointerDown, false);
      canvas.addEventListener("pointerup", onPointerUp, false);
      canvas.addEventListener("pointermove", onPointerMove, false);

      function getGroundPosition() {
        // Use a predicate to get position on the ground
        var pickinfo = event.scene.pick(
          event.scene.pointerX,
          event.scene.pointerY,
          function(mesh) {
            return mesh == event.scene.meshes[0];
          }
        );

        if (pickinfo.hit) {
          return pickinfo.pickedPoint;
        }

        return null;
      }

      function onPointerDown(evt) {
        var pickInfo = event.scene.pick(
          event.scene.pointerX,
          event.scene.pointerY,
          function(mesh) {
            return mesh !== event.scene.meshes[0];
          }
        );
        if (evt.button === 0) {
          // console.log(event.scene.meshes);
          // check if we are under a mesh

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
          return;
        } else if (evt.button === 2) {
          if (pickInfo.hit) {
            currentMesh = pickInfo.pickedMesh;
            self.interactedObject = pickInfo.pickedMesh.dataObject;
            clickPosition = pickInfo;
            self.showDropdown = true;
            self.dropdownTop = evt.clientY;
            self.dropdownLeft = evt.clientX;
          }
          return;
        }
      }

      function onPointerUp(evt) {
        var pickInfo = event.scene.pick(
          event.scene.pointerX,
          event.scene.pointerY,
          function(mesh) {
            return mesh !== event.scene.meshes[0];
          }
        );
        if (currentMesh && evt.button === 0) {
          if (pickInfo.pickedPoint) {
            const ray = new BABYLON.Ray(
              pickInfo.pickedPoint,
              new BABYLON.Vector3(0, -1, 0)
            );
            const underlyingMeshPickInfo = event.scene.pickWithRay(
              ray,
              item => {
                if (item.id !== currentMesh.id) {
                  return item;
                }
              }
            );
            const pickedMesh = underlyingMeshPickInfo.pickedMesh;
            if (
              pickedMesh.name !== "table" &&
              pickedMesh.dataObject.type === "container"
            ) {
              putToContainer(pickedMesh, currentMesh);
            } else {
              const z =
                pickedMesh.name !== "table"
                  ? pickedMesh.position.y + pickedMesh.scaling.y / 2
                  : 0;
              self.$store.dispatch("commitMutation", {
                mutation: "moveObject",
                params: {
                  objectId: currentMesh.dataObject.id,
                  x: 0,
                  y: 0,
                  z: z
                }
              });
            }
          } else {
            self.$store.dispatch("commitMutation", {
              mutation: "moveObject",
              params: {
                objectId: currentMesh.dataObject.id,
                x: 0,
                y: 0,
                z: 0
              }
            });
          }
        }
        if (startingPoint) {
          currentMesh = null;
          event.scene.activeCamera.attachControl(canvas, true);
          startingPoint = null;
          self.interactedObject = null;
          return;
        }
      }

      function onPointerMove(evt) {
        if (!startingPoint) {
          return;
        }

        var current = getGroundPosition();

        if (!current) {
          return;
        }

        if (currentMesh && !currentMesh.dataObject.isPinned) {
          const diff = current.subtract(startingPoint);
          currentMesh.position.addInPlace(diff);
          self.$store.dispatch("commitMutation", {
            mutation: "moveObject",
            params: {
              objectId: currentMesh.dataObject.id,
              x: diff.x,
              y: diff.z,
              z: 0.5
            }
          });
        }
        startingPoint = current;
        return;
      }

      function putToContainer(container, target) {
        self.$store.dispatch("commitMutation", {
          mutation: "putObjectToContainer",
          params: {
            objectId: target.dataObject.id,
            containerId: container.dataObject.id
          }
        });
        return;
      }
    }
  },
  created() {},
  mounted() {
    document.addEventListener(
      "contextmenu",
      function(e) {
        e.preventDefault();
      },
      false
    );
    this.$store.commit("setRoomId", this.$route.params.id);
    this.$store.dispatch("getData");

    const self = this;
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
            mutation: "moveObjectHand",
            params: {
              event,
              scale: 1
            }
          });
        }
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