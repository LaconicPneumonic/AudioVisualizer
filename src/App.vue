<template>
  <div>
    <div id="stats"></div>

    <div id="container">
      <button @click="startPlaying">START</button>
      <button @click="stopPlaying">STOP</button>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import Stats from "stats-js";
import { Sound } from "pts";
import { GridGeometry } from "./lib/grid";
import { OrbitControls } from "./lib/orbit";

const textureJpg = require("/src/assets/fiveTone.jpg");
const binSize = 128;
const gridWidth = 128;
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
  camera.position.z = 100;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  //

  const ambientLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(ambientLight);

  const width = 100;
  const height = 100;
  const intensity = 1;
  const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
  rectLight.position.set(5, 5, 100);
  rectLight.lookAt(0, 0, 0);
  scene.add(rectLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  camera.add(pointLight);
  scene.add(camera);

  const texture = new THREE.TextureLoader().load(textureJpg);

  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  //

  geometry = new GridGeometry(30, gridWidth);

  const material = new THREE.MeshPhongMaterial({
    // gradientMap: texture,
    color: "#03fcdf",
    side: THREE.DoubleSide,
    vertexColors: true,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  controls = new OrbitControls(camera, renderer.domElement);

  //controls.update() must be called after any manual changes to the camera's transform
  camera.position.set(0, 0, 100);
  controls.update();

  document.body.appendChild(renderer.domElement);

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
        geometry.pushRow(analyzer.freqDomain().map((v) => v / 30));
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
</style>
