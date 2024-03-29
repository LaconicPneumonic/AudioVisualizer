/* eslint-disable no-unused-vars */
<template>
  <v-container fluid class="primary fill-height">
    <v-row class="text-center">
      <v-col>
        <v-btn @click="startPlaying" text outlined elevation="5">START</v-btn>
        <v-btn @click="stopPlaying" text outlined elevation="5">STOP</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div id="container"></div>
      </v-col>
    </v-row>
    <v-footer>
      <div id="stats"></div>
    </v-footer>
  </v-container>
</template>

<script>
import * as THREE from "three";
import Stats from "stats-js";
import { Sound } from "pts";
import { GridGeometry } from "./lib/grid";
import { OrbitControls } from "./lib/orbit";
// eslint-disable-next-line no-unused-vars
import { RectAreaLightHelper, RectAreaLightUniformsLib } from "./lib/rect";

const textureJpg = require("/src/assets/fiveTone.jpg");
const binSize = 128;
const gridSegments = 128;
const gridWidth = 30;
// get the average frequency of the sound
let analyzer;
let camera, scene, renderer;
let mesh;
let geometry;
let controls;
var stats;

function init() {
  camera = new THREE.PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    1,
    200
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  //

  // const ambientLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  // scene.add(ambientLight);

  // const pointLight = new THREE.PointLight(0xffffff, 0.8);
  // camera.add(pointLight);
  // scene.add(camera);

  const texture = new THREE.TextureLoader().load(textureJpg);

  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  // rect lights

  RectAreaLightUniformsLib.init();

  const rectHeight = 30;
  const rectWidth = gridWidth / 3;
  [0xff0000, 0x00ff00, 0x0000ff].forEach((c, i) => {
    const rectLight = new THREE.RectAreaLight(c, 75, rectWidth, rectHeight);
    rectLight.position.set(rectWidth * (i - 1), 15, rectHeight / 2);
    rectLight.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(rectLight);
    scene.add(new RectAreaLightHelper(rectLight));
  });

  geometry = new GridGeometry(gridWidth, gridSegments);

  const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 1,
    metalness: 0,
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  controls = new OrbitControls(camera, renderer.domElement);

  //controls.update() must be called after any manual changes to the camera's transform
  camera.position.set(0, 0, 90);
  controls.update();

  document.getElementById("container").appendChild(renderer.domElement);

  //

  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.dom.style.position = "relative";
  stats.dom.style.float = "left";
  document.getElementById("stats").appendChild(stats.dom);
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

let then = Date.now();
let fpsInterval = 1000 / 30;
const startTime = then;
export default {
  name: "App",
  data: function () {
    return {
      init: false,
      recording: false,
    };
  },
  mounted: async function () {
    init();

    this.animate();

    this.init = true;
  },
  methods: {
    startPlaying: async function () {
      // create an Audio source\

      if (!analyzer) {
        analyzer = (await Sound.input()).analyze(binSize);
      }
      this.recording = true;
    },
    stopPlaying: async function () {
      if (analyzer) {
        if (analyzer.playing) {
          analyzer.stop();
        }
      }
      this.recording = false;
    },
    render: function () {
      if (this.recording) {
        geometry.pushRow([...analyzer.freqDomain()]);
      }

      renderer.render(scene, camera);
    },

    animate: function () {
      const now = Date.now();
      const elapsed = now - then;

      requestAnimationFrame(() => this.animate());

      if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        //
        this.render(now - startTime);
        controls.update();
        stats.update();
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.fixed {
  position: fixed;
}
</style>
