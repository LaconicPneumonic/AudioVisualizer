<template>
  <div>
    <button @click="startPlaying">PLAY</button>
    <div id="app"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import { Sound } from "pts";
import { GridGeometry } from "./grid";
import { OrbitControls } from "./orbit";

// get the average frequency of the sound

let analyzer;
let camera, scene, renderer;
let mesh;
let geometry;
let controls;

function init() {
  camera = new THREE.PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    1,
    3500
  );
  camera.position.z = 1000;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  //

  const light = new THREE.HemisphereLight();
  scene.add(light);

  //

  geometry = new GridGeometry(10, 5);
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
  camera.position.set(0, 20, 100);
  controls.update();

  document.body.appendChild(renderer.domElement);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);

  analyzer.freqDomain();
  controls.update();

  render();
}

let tick = true;
let num_ticks = 0;

function render() {
  const time = Date.now();

  // mesh.rotation.x = time * 0.025;
  // mesh.rotation.y = time * 0.05;

  if (Math.floor(time) % 5 == 0) {
    if (tick) {
      // console.log("TICK", num_ticks);
      // geometry.pushRow(
      //   analyzer
      //     .freqDomain()
      //     .filter((_v, i) => i % 2 == 0)
      //     .map((v) => v / 10)
      // );
      tick = false;

      if (num_ticks === 5) console.log(geometry.getAttribute("position"));

      num_ticks++;
    }
  } else {
    tick = true;
  }

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
      // create an Audio source

      if (!this.init) {
        init();

        analyzer = (await Sound.input()).analyze(128);
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
