<template>
  <div id="container">
    <button @click="startPlaying">PLAY</button>
  </div>
</template>

<script>
import * as THREE from "three";
import Stats from "stats-js";
import { Sound } from "pts";
import { GridGeometry } from "./grid";
import { OrbitControls } from "./orbit";

const test = require("/src/assets/test.mp3");
const binSize = 256;
const gridWidth = 128;
// get the average frequency of the sound
console.log(test);
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
  scene.background = new THREE.Color(0x050505);

  //

  const light = new THREE.HemisphereLight();
  scene.add(light);

  //

  geometry = new GridGeometry(10, gridWidth);
  const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    vertexColors: true,
    wireframe: true,
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
  stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
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

function animate(then) {
  requestAnimationFrame(animate);

  const now = Date.now();
  const elapsed = now - then;

  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    //
    render(now - startTime);
    controls.update();
  }

  stats.update();
}

function render() {
  // geometry.pushRow(
  //   Array.from({ length: gridWidth }).map(
  //     (v, i) =>
  //       5 * Math.sin((2 * Math.PI * (i - ((time / 1000) % 1000))) / gridWidth)
  //   )
  // );

  geometry.pushRow(
    analyzer
      .freqDomain()
      .slice(0, 128)
      // .filter((_v, i) => i % (binSize / gridWidth) == 0)
      .map((v) => v / 30)
  );

  renderer.render(scene, camera);
}

export default {
  name: "App",
  data: function () {
    return {
      init: false,
    };
  },
  mounted: async function () {},
  methods: {
    startPlaying: async function () {
      // create an Audio source\

      if (analyzer) {
        if (!analyzer.playing) {
          analyzer.start();
        } else {
          analyzer.start(0);
        }
      } else {
        analyzer = (await Sound.input()).analyze(binSize);
        // analyzer.start();
      }

      if (!this.init) {
        init();

        animate();

        this.init = true;
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
