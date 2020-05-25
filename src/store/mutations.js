import Vue from "vue";
import uniqid from "uniqid";
import cloneDeep from "clone-deep";
import { getZ } from "../utils/utils.js";

const ROTATION_STEP = 15;

export default {

  setUser(state, user) {
    state.user = user;
  },

  setRoomId(state, id) {
    state.roomId = id;
  },

  /* Objects
  =======================================*/
  createDeck(state, params) {
    if (!state.game.objects) {
      state.game.objects = []
    }
    const objects = state.game.objects;
    const table = window.document.querySelector("#scalable-table");
    const createdDeck = {
      ...params,
      url: params.backUrl,
      x: -parseInt(table.style.marginLeft) + 100,
      y: -parseInt(table.style.marginTop) + 100,
      z: getZ(),
      rotation: 0,
      isFlipped: false
    };
    createdDeck.objects = [];
    for (let i = 1; i <= params.rows; i++) {
      for (let j = 1; j <= params.columns; j++) {
        createdDeck.objects.push({
          ...params,
          type: "card",
          id: uniqid(),
          row: i,
          column: j,
          rotation: 0,
          isFlipped: false
        })
      }
    }
    createdDeck.new = true;
    objects.push(createdDeck);
  },

  copyObject(state, containerId) {
    const object = state.game.objects.find(c => c.id === containerId);
    const clone = cloneDeep(object)
    clone.x = object.x + 25;
    clone.y = object.y + 25;
    clone.z = getZ(),
    clone.id = uniqid(),
    state.game.objects.push(clone);
    clone.new = true;
  },

  createContainer(state, params) {
    if (!state.game.objects) {
      state.game.objects = []
    }
    const objects = state.game.objects;
    const table = window.document.querySelector("#scalable-table");
    const createdContainer = {
      ...params,
      x: -parseInt(table.style.marginLeft) + 100,
      y: -parseInt(table.style.marginTop) + 100,
      z: getZ(),
      rotation: 0,
      isFlipped: false
    };
    createdContainer.new = true;
    objects.push(createdContainer);
  },

  createTile(state, params) {
    if (!state.game.objects) {
      state.game.objects = []
    }
    const objects = state.game.objects;
    const table = window.document.querySelector("#scalable-table");
    const createdTile = {
      ...params,
      x: -parseInt(table.style.marginLeft) + 100,
      y: -parseInt(table.style.marginTop) + 100,
      z: getZ(),
      rotation: 0,
      isFlipped: false
    };
    createdTile.new = true;
    objects.push(createdTile);
  },

  createCounter(state, params) {
    if (!state.game.objects) {
      state.game.objects = []
    }
    const objects = state.game.objects;
    const table = window.document.querySelector("#scalable-table");
    const createdCounter = {
      ...params,
      x: -parseInt(table.style.marginLeft) + 100,
      y: -parseInt(table.style.marginTop) + 100,
      z: getZ(),
      rotation: 0,
      isFlipped: false
    };
    createdCounter.new = true;
    objects.push(createdCounter);
  },

  createDice(state, params) {
    if (!state.game.objects) {
      state.game.objects = []
    }
    const objects = state.game.objects;
    const table = window.document.querySelector("#scalable-table");
    const createdDice = {
      ...params,
      x: -parseInt(table.style.marginLeft) + 100,
      y: -parseInt(table.style.marginTop) + 100,
      z: getZ(),
      rotation: 0,
      isFlipped: false
    };
    createdDice.new = true;
    objects.push(createdDice);
  },

  takeObjectFromContainer(state, containerId) {
    const container = state.game.objects.find(c => c.id === containerId);
    if (container.objects && container.objects.length > 0) {
      const object = container.infinite 
        ? container.objects[0]
        : container.objects.pop();

      if (container.infinite) {
        object.id = uniqid();
      }
      object.x = container.x + 25;
      object.y = container.y + 25;
      object.z = getZ();
      object.owner = "";
      object.new = true;
      state.game.objects.push(object);
      container.new = true;
    }
  },

  takeCertainObjectFromContainer(state, params) {
    const {containerId, objectId} = params;
    const container = state.game.objects.find(c => c.id === containerId);
    if (container.objects && container.objects.length > 0) {
      const objectIndex = container.objects.findIndex(obj => obj.id === objectId);
      const object = container.objects[objectIndex]; 
      if (container.infinite) {
        object.id = uniqid();
      } 
      else {
        container.objects.splice(objectIndex, 1)
      }
      object.x = container.x + 25;
      object.y = container.y + 25;
      object.z = getZ();
      object.owner = "";
      object.new = true;
      state.game.objects.push(object);
      container.new = true;
    }
  },

  shuffleContainer(state, containerId) {
    const container = state.game.objects.find(obj => obj.id === containerId);

    if (!container.objects) {
      Vue.set(container, 'objects', []);
    }

    container.objects.sort(() => 0.5 - Math.random());
    container.new = true;
  },

  deal(state, params) {
    const {containerId, playerIds} = params;
    const dealObject = state.game.objects.find(c => c.id === containerId);
    //Check if deal object is not a container
    if (dealObject.type !== "container") {
      dealObject.x = 0;
      dealObject.y = 0;
      dealObject.z = 0;
      dealObject.isFlipped = false;
      dealObject.owner = playerIds[0];
      dealObject.new = true;
    } else {
      playerIds.forEach(playerId => {
        if (dealObject.objects && dealObject.objects.length > 0) {
          const object = dealObject.infinite 
            ? dealObject.objects[0]
            : dealObject.objects.pop();
          if (object) {
            if (dealObject.infinite) {
              object.id = uniqid();
            }
      
            object.x = 0;
            object.y = 0;
            object.z = 0;
            object.isFlipped = false;
            object.owner = playerId;
            object.new = true;
            state.game.objects.push(object);
            dealObject.new = true;
          }
        }
      });
    }
  },

  putObjectToContainer(state, params) {
    const { objectId, containerId } = params;
    const objectIndex = state.game.objects.findIndex(obj => obj.id === objectId);
    const object = state.game.objects.find(obj => obj.id === objectId);
    const container = state.game.objects.find(obj => obj.id === containerId);
    const gameObjects = state.game.objects;

    if (!container.objects) {
      Vue.set(container, 'objects', []);
    }
    container.objects.push(object);
    gameObjects.splice(objectIndex, 1);
    container.new = true;
    state.selectedIndexes = [];
  },

  deleteObject(state, objectId) {
    const objects = state.game.objects;
    const objectIndex = objects.findIndex(obj => obj.id === objectId);
    const object = state.game.objects.find(obj => obj.id === objectId)
    if (objects[objectIndex] !== undefined) {
      objects.splice(objectIndex, 1);
    }
    state.selectedIndexes = [];
  },

  rotateObjectLeft(state, objectId) {
    const object = state.game.objects.find(obj => obj.id === objectId);
    if (object.rotation - ROTATION_STEP < -360) {
      object.rotation = -ROTATION_STEP
    } else {
      object.rotation -= ROTATION_STEP
    }
    object.new = true;
  },

  rotateObjectRight(state, objectId) {
    const object = state.game.objects.find(obj => obj.id === objectId);
    if (object.rotation + ROTATION_STEP > 360) {
      object.rotation = ROTATION_STEP
    } else {
      object.rotation += ROTATION_STEP
    }
    object.new = true;
  },

  drawObject(state, objectId) {
    const object = state.game.objects.find(obj => obj.id === objectId)
    object.owner = state.user.uid;
    object.x = 0;
    object.y = 0;
    object.z = 0;
    object.new = true;
  },

  playObject(state, params) {
    const {objectId, x, y} = params;
    const object = state.game.objects.find(obj => obj.id === objectId)
    if (object.owner === state.user.uid) {
      object.owner = "";
      object.x = x + 100;
      object.y = y + 100;
      object.z = 100000020;
      object.new = true;
    }
  },

  flipObject(state, objectId) {
    const object = state.game.objects.find(obj => obj.id === objectId)
    object.isFlipped = !object.isFlipped
    object.new = true;
  },

  flipDeck(state, objectId) {
    const deck = state.game.objects.find(obj => obj.id === objectId)
    deck.isFlipped = !deck.isFlipped
    deck.objects.reverse();
    deck.objects = deck.objects.map(card => {
      card.isFlipped = !card.isFlipped;
      return card
    })
    deck.new = true;
  },

  pinObject(state, objectId) {
    const object = state.game.objects.find(obj => obj.id === objectId)
    object.isPinned = !object.isPinned
    object.new = true;
  },

  selectObject(state, objectId) {
    const object = state.game.objects.find(obj => obj.id === objectId)
    object.selected = !object.selected;
  },

  updateObject(state, params) {
    const object = state.game.objects.find(obj => obj.id === params.objectId)
    delete params.objectId;
    Object.entries(params).forEach(entry => {
      if (object[entry[0]] !== undefined && entry[1]) {
        object[entry[0]] = entry[1];
      }
    })
  },

  moveObject(state, data) {
    const event = data.event;
    const scale = data.scale;
    const target = event.target;
    const dataId = target.getAttribute("data-id");
    const obj = state.game.objects.find(object => object.id === dataId);
    obj.x = (parseFloat(obj.x) || 0) + event.dx / scale;
    obj.y = (parseFloat(obj.y) || 0) + event.dy / scale;
    obj.z = getZ();
    obj.new = true;
  },

  increaseCount(state, id) {
    const counter = state.game.objects.find(c => c.id === id);
    counter.count++;
    counter.new = true;
  },

  decreaseCount(state, id) {
    const counter = state.game.objects.find(c => c.id === id);
    counter.count--;
    counter.new = true;
  },

  set0(state, id) {
    const counter = state.game.objects.find(c => c.id === id);
    counter.count = 0;
    counter.new = true;
  },

  rollObject(state, objectId) {
    const object = state.game.objects.find(obj => obj.id === objectId)
    object.value = Math.ceil(Math.random() * object.edges)
    object.new = true;
  },

  updateBackground(state, background) {
    state.game.background = background;
  },

  /* Room
  =======================================*/
  updateGame(state, { id = "firstLoad", val }) {
    if (id === "background") {
      Vue.set(state.game, "backgound", val);
    }

    else if (id === "firstLoad") {
      Vue.set(state, "game", val);
    }

    else {
      Vue.set(state.game.objects, id, val);
    }
  }

}