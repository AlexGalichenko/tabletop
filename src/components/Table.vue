<template>
  <div class="table">
    <!-- Dialogs -->
    <EditDialog
      :showDialog="showEditDialog"
      :object="interactedObject || selectedObject"
      @closeEditDialog="showEditDialog = false"
    />
    <CreateDialog :showDialog="showCreateDialog" @closeCreateDialog="showCreateDialog = false"/>
    <RegisterDialog :showDialog="showRegisterDialog" @closeRegisterDialog="showRegisterDialog = false"/>
    <ImportDialog :showDialog="showImportDialog" @closeImportDialog="showImportDialog = false"/>
    <ChangeBackgroundDialog :showDialog="showChangeBackgroundDialog" @closeChangeBackgroundDialog="showChangeBackgroundDialog = false"/>

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
        <md-button class="md-icon-button" @click="showChangeBackgroundDialog = true">Change Background</md-button>
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

    <Scene @scene="readyScene" @engine="readyEngine">
      <Property name="collisionsEnabled" :any="true" />
      <Camera type="arcRotate" :alpha="0" :beta="0" :radius="30">
        <Property name="checkCollisions" :any="true" />
        <Property name="panningSensibility" :float="150" />
        <Property name="wheelDeltaPercentage" :float="0.01" />
        <Property name="lowerRadiusLimit" :float="2" />
        <Property name="upperRadiusLimit" :float="40" />
      </Camera>
      <HemisphericLight :direction="[1,1,0]">
        <property name="intensity" :float="1.3"></property>
      </HemisphericLight>
      <Ground :options="{width:200, height:200}">
        <Property name="name" :any="'table'" />
        <Material>
          <Texture
            :src="game.background"
          >
            <Property name="uScale" :any="10" />
            <Property name="vScale" :any="10" />
          </Texture>
        </Material>
        <Property name="checkCollisions" :any="true" />
      </Ground>

      <!-- 3D scene -->
      <!-- Cards -->
      <Card
        v-for="(object, index) in ownerless.filter(card => card.type === 'card')"
        :key="'card' + index"
        :object="object"
      />

      <!-- Containers -->
      <Container
        v-for="(object, index) in ownerless.filter(object => object.type === 'container' && object.shape !== 'deck')"
        :key="'container' + index"
        :object="object"
      />

      <!-- Deck -->
      <Deck
        v-for="(object, index) in ownerless.filter(object => object.type === 'container' && object.shape === 'deck')"
        :key="'deck' + index"
        :object="object"
      />

      <!-- Tiles Box -->
      <TileBox
        v-for="(object, index) in ownerless.filter(tile => tile.type === 'tile' && (!tile.shape || tile.shape =='box'))"
        :key="'tile-box' + index"
        :object="object"
      />

      <!-- Tiles Hex -->
      <TileHex
        v-for="(object, index) in ownerless.filter(tile => tile.type === 'tile' && tile.shape =='hex')"
        :key="'tile-hex' + index"
        :object="object"
      />

      <!-- Tiles Coin -->
      <TileCoin
        v-for="(object, index) in ownerless.filter(tile => tile.type === 'tile' && tile.shape =='coin')"
        :key="'tile-coin' + index"
        :object="object"
      />

      <!-- Tiles Coin -->
      <Counter
        v-for="(object, index) in ownerless.filter(counter => counter.type === 'counter')"
        :key="'counter' + index"
        :object="object"
      />
    </Scene>

    <div :style="dropdownStyle">
      <md-menu 
        :md-active="showDropdown"
        :md-close-on-select="false"
        :md-close-on-click="false"
        @md-closed="showDropdown = false"
      >
        <md-menu-content class="contextMenu">
          <md-menu-item @click="showDealDropdown = !showDealDropdown">Deal</md-menu-item>
          <md-menu-item @click="flip">Flip</md-menu-item>
          <md-menu-item @click="takeObjectFromContainer">Take From Container</md-menu-item>
          <!-- <md-menu-item @click="takeObjectFromContainerToHand">Take From Container To Hand</md-menu-item> -->
          <md-menu-item @click="draw">Draw</md-menu-item>
          <md-menu-item @click="shuffle">Shuffle</md-menu-item>
          <md-menu-item @click="copy">Copy</md-menu-item>
          <md-menu-item @click="showEditDialog = true">Edit</md-menu-item>
          <md-menu-item @click="deleteObject">Delete</md-menu-item>
          <md-menu-item
            @click="pin"
          >{{(interactedObject && interactedObject.isPinned) ? "Unpin" : "Pin"}}</md-menu-item>
        </md-menu-content>
      </md-menu>

      <md-menu :md-active="showDealDropdown" @md-closed="showDealDropdown = false" :md-close-on-select="false" :md-close-on-click="false" :style="level2dropdownStyle">
        <md-menu-content>
          <md-menu-item @click="deal(players.map(p => p.uid))">All</md-menu-item>
          <md-menu-item 
            v-for="player in game.players" :key="'player' + player.displayName"
            @click="deal([player.uid])"
          >
            <span :style="'color:' + player.color">
              {{player.displayName}}
            </span>
          </md-menu-item>
        </md-menu-content>
      </md-menu>
    </div>
  </div>
</template>

<script>
import interact from "interactjs";
import uniqid from "uniqid";
import { BABYLON } from "vue-babylonjs";

//Dialogs
import GameObject from "./GameObject.vue";
import EditDialog from "./overlay/EditDialog.vue";
import CreateDialog from "./overlay/CreateDialog.vue";
import RegisterDialog from "./overlay/RegisterDialog.vue";
import ImportDialog from "./overlay/ImportDialog.vue";
import ChangeBackgroundDialog from "./overlay/ChangeBackgroundDialog.vue";

//Game Objects
import Card from "./objects/Card.vue";
import Container from "./objects/Container.vue";
import Deck from "./objects/Deck.vue";
import TileBox from "./objects/TileBox.vue";
import TileHex from "./objects/TileHex.vue";
import TileCoin from "./objects/TileCoin.vue";
import Counter from "./objects/Counter.vue";

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

    Card,
    Container,
    Deck,
    TileBox,
    TileHex,
    TileCoin,
    Counter
  },
  data() {
    return {
      showEditDialog: false,
      showCreateDialog: false,
      showRegisterDialog: false,
      showImportDialog: false,
      showChangeBackgroundDialog: false,

      selectedObject: null,
      interactedObject: null,

      toggleHand: true,

      scene:  null,
      engine: null,

      showDropdown: false,
      showDealDropdown: false,
      dropdownTop: 0,
      dropdownLeft: 0,
    };
  },
  computed: {
    dropdownStyle() {
      return `position: absolute; top: ${this.dropdownTop}px; left: ${this.dropdownLeft}px`;
    },
    level2dropdownStyle() {
      return `position: relative; top: 0px; left: 185px`;
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
    deleteObject() {
      this.$store.dispatch("commitMutation", {
        mutation: "deleteObject",
        params: this.interactedObject.id
      });
    },
    shuffle() {
      this.$store.dispatch("commitMutation", {
        mutation: "shuffleContainer",
        params: this.interactedObject.id
      });
    },
    copy() {
      this.$store.dispatch("commitMutation", {
        mutation: "copyObject",
        params: this.interactedObject.id
      });
    },
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
    deal(playerIds) {
      this.$store.dispatch("commitMutation", {
        mutation: "deal",
        params: {
          containerId: this.interactedObject.id,
          playerIds: playerIds
        }
      });
    },
    pin() {
      this.$store.dispatch("commitMutation", {
        mutation: "pinObject",
        params: this.interactedObject.id
      });
    },
    flip() {
      if (this.interactedObject.shape !== "deck") {
        this.$store.dispatch("commitMutation", {
          mutation: "flipObject",
          params: this.interactedObject.id
        });
      } 
      else {
        this.$store.dispatch("commitMutation", {
        mutation: "flipDeck",
        params: this.interactedObject.id
        });
      }
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
    readyEngine(engine) {
      this.engine = engine;
    },
    readyScene(scene) {
      const self = this;
      self.scene = scene;
      this.engine.enableOfflineSupport = false;
      var options = new BABYLON.SceneOptimizerOptions(80, 500);
      var optimizer = new BABYLON.SceneOptimizer(
        self.scene, 
        BABYLON.SceneOptimizerOptions.HighDegradationAllowed(), 
        true,
        true
      );
      optimizer.start();

      let canvas = this.engine.getRenderingCanvas();
      let startingPoint;
      let currentMesh;
      let clickPosition;

      canvas.addEventListener("pointerdown", onPointerDown, false);
      canvas.addEventListener("pointerup", onPointerUp, false);
      canvas.addEventListener("pointermove", onPointerMove, false);
      canvas.addEventListener("wheel", onWheel, false);

      function onWheel(event) {
        if (currentMesh) {
          self.$store.dispatch("commitMutation", {
            mutation: event.deltaY > 0 ? "rotateObjectLeft" : "rotateObjectRight",
            params: currentMesh.dataObject.id
          });
        }
      }

      function getGroundPosition() {
        // Use a predicate to get position on the ground
        var pickinfo = self.scene.pick(
          self.scene.pointerX,
          self.scene.pointerY,
          function(mesh) {
            return mesh == self.scene.meshes[0];
          }
        );

        if (pickinfo.hit) {
          return pickinfo.pickedPoint;
        }

        return null;
      }

      function onPointerDown(evt) {
        var pickInfo = self.scene.pick(
          self.scene.pointerX,
          self.scene.pointerY,
          function(mesh) {
            return mesh !== self.scene.meshes[0];
          }
        );
        if (evt.button === 0) {
          // check if we are under a mesh
          if (pickInfo.hit) {
            currentMesh = pickInfo.pickedMesh;
            startingPoint = getGroundPosition();
            if (startingPoint) {
              // we need to disconnect camera from canvas
              setTimeout(function() {
                self.scene.activeCamera.detachControl(canvas);
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
        const pickInfo = self.scene.pick(
          self.scene.pointerX,
          self.scene.pointerY,
          function(mesh) {
            return mesh !== self.scene.meshes[0];
          }
        );
        //Counter
        if (
          evt.button === 0 &&
          pickInfo.pickedMesh &&
          (pickInfo.pickedMesh.name === "increaseCount" ||
            pickInfo.pickedMesh.name === "decreaseCount")
        ) {
          self.$store.dispatch("commitMutation", {
            mutation: pickInfo.pickedMesh.name,
            params: pickInfo.pickedMesh.dataObject.id
          });
        }
        if (currentMesh && evt.button === 0) {
          if (pickInfo.pickedPoint) {
            const ray = new BABYLON.Ray(
              pickInfo.pickedPoint,
              new BABYLON.Vector3(0, -1, 0)
            );
            const underlyingMeshPickInfo = self.scene.pickWithRay(ray, item =>
              item.id !== currentMesh.id && item.name !== "entity"
                ? item
                : null
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
          self.scene.activeCamera.attachControl(canvas, true);
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
              z: 0.8
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

    //2d movement in hand
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