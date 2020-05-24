import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import config from "../../config/firebase.json";
import { router } from "../main.js";

export default {
  async firebaseInit(store) {
    await firebase.initializeApp(config);
    const auth = await firebase.auth().getRedirectResult()
    if (auth.user !== null) {
      store.commit("setUser", auth.user);
    }

    firebase.auth().onAuthStateChanged(function (user) {
      store.commit("setUser", user);
    });
  },

  async signInWithGoogle(store) {
    const provider = new firebase.auth.GoogleAuthProvider();
    const user = await firebase.auth().signInWithPopup(provider)
    store.commit("setUser", user.user);
    router.push("/main");
  },

  async createRoom({ state }) {
    let id = new Date().getTime()
    firebase.database().ref(`room/${id}`).set({
      game: state.game,
      created: { ".sv": "timestamp" },
      creator: state.user.email
    })
    router.push(`/room/${id}`);
  },

  getData(store){
    const id = store.state.roomId;
    const fb = firebase.database().ref(`room/${id}`);

    if(store.state.sync==="full"){
      fb.on('value', function(snapshot) {
        let val = snapshot.val().game;
        store.commit('updateGame',{val});
      });
    }

    else if(store.state.sync==="advanced"){
      //game load once
      const load = () => {
        fb.child('/').once('value').then(function(snapshot){
          store.commit('updateGame', {
            id: "firstLoad",
            val: snapshot.val().game
          });
        });
      }

      load();

      //objects changed
      fb.child('/game/objects').on("child_changed", function(snapshot){
        store.commit('updateGame', {
          id: snapshot.ref.key,
          val: snapshot.val()
        });
      });

      //objects added
      fb.child('/game/objects').on("child_moved", function(snapshot){
        load();
      });

      //objects added
      fb.child('/game/objects').on("child_added", function(snapshot){
        load();
      });

      //objects removed
      fb.child('/game/objects').on("child_removed", function(snapshot){
        load();
      });
      
      //players changed
      fb.child('/game/players').on("value", function(snapshot){
        load();
      });

      //background changed
      fb.child('/game/background').on("value", function(snapshot){
        store.commit('updateGame', {
          id: "background",
          val: snapshot.val()
        });
      });
    }

  },

  commitMutation({commit, dispatch}, {mutation, params}) {
    commit(mutation, params);
    if (["deleteObject", "putObjectToContainer", "updateBackground"].includes(mutation)) {
      dispatch("putData");
    } else {
      dispatch("updateObjects");
    }
  },

  updateObjects(store) {
    let objects = store.state.game.objects;
    objects.forEach((object, index) => {
      if (object.new === true) {
        delete object.new;
        store.dispatch("updateState", {
          path: `objects/${index}`,
          data: object
        });
      }
    });
  },

  updateState(store, state){
    const roomId = store.state.roomId;
    firebase.database().ref(`/room/${roomId}/game/${state.path}`).update(state.data);
  },

  putData(store){
    const roomId = store.state.roomId;
    firebase.database().ref(`/room/${roomId}/game/`).set(store.state.game);
  },

  registerPlayer(store, params) {
    const roomId = store.state.roomId;
    const pushObject = {
      uid: params.uid,
      displayName: params.name,
      email: params.email,
      color: params.color
    };
    firebase.database().ref(`/room/${roomId}/game/players`).push(pushObject);
  },

  leftRoom(store, uid) {
    const roomId = store.state.roomId;
    const userKv = Object.entries(store.state.game.players).find(kv => kv[1].uid === uid);
    if (userKv) {
      firebase.database().ref(`/room/${roomId}/game/players/${userKv[0]}`).remove();
    }
  },

  updatePlayer(store, params) {
    const roomId = store.state.roomId;
    const key = Object.entries(store.state.game.players).find(entry => entry[1].uid === params.uid)[0];
    const updateObject = {
      uid: params.uid,
      displayName: params.name,
      email: params.email,
      color: params.color
    };
    firebase.database().ref(`/room/${roomId}/game/players/${key}`).set(updateObject);
  },

  importGame(store, data){
    const roomId = store.state.roomId;
    firebase.database().ref(`/room/${roomId}/game`).update(data);
  },
}