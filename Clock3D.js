import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

// Initialize WebGL renderer
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setClearColor(0xfdffea);  // background color

// Create a new Three.js scene
const scene = new THREE.Scene();

// Add a camera
const camera = new THREE.PerspectiveCamera(100, canvas.width / canvas.height, 0.1, 500);
camera.position.set(1, 2, 7);

// Add light sources
const light = new THREE.DirectionalLight();
light.position.set(0, 8, 2);
scene.add(light);

// Add the clock here:
const clockRadius = 5;
const clockDepth = 1;
const secondHandLength = clockRadius - 0.1;
const minuteHandLegth = clockRadius / 2;
const hourHandLegth = clockRadius / 4;

// Clock cylinder
const clockGeometry = new THREE.CylinderGeometry(clockRadius, clockRadius, clockDepth, 100);
const clockMaterial = new THREE.MeshStandardMaterial({
  color: 0xc92c8f,
  metalness: 0.1,
  roughness: 0.5,
  flatShading: true
});
const clockCylinder = new THREE.Mesh(clockGeometry, clockMaterial);
clockCylinder.rotation.x = Math.PI / 2;
scene.add(clockCylinder);

// Clock bezel
function bezel(clockRadius) {
  const outerRadius = clockRadius + 0.2;
  const outerCircle = new THREE.Shape();
  outerCircle.moveTo(outerRadius, 0);
  const innerCircle = new THREE.Shape();   // serves as hole in outerCircle
  innerCircle.moveTo(clockRadius, 0);
  const N = 100;
  const deltaPhi = 2 * Math.PI / N;
  for (let k = 1; k <= N; ++k) {
    outerCircle.lineTo(outerRadius * Math.cos(k * deltaPhi),
      outerRadius * Math.sin(k * deltaPhi));
    innerCircle.lineTo(clockRadius * Math.cos(k * deltaPhi),
      clockRadius * Math.sin(k * deltaPhi));
  }
  outerCircle.holes.push(innerCircle);

  const extrudeSettings = {
    bevelEnabled: false,
    depth: 0.6 * clockDepth,
  };
  const extrudeGeo = new THREE.ExtrudeGeometry(outerCircle, extrudeSettings);
  const extrudeRing = new THREE.Mesh(extrudeGeo, clockMaterial);
  return extrudeRing;
}

function clockFace(clockRadius) {
  const face = new THREE.Object3D();
  scene.add(face);

  const tickLenght = 0.3;
  const tickWidth = 0.05;
  const tickDepth = 0.01;
  const smallTickGeo = new THREE.BoxGeometry(tickLenght, tickWidth, tickDepth);
  const bigTickGeo = new THREE.BoxGeometry(2 * tickLenght, 2 * tickWidth, 2 * tickDepth);
  const tickMaterial = new THREE.MeshBasicMaterial({ color: 'pink' });

  // Define the radius
  const radius = clockRadius - 1.5 * tickLenght;
  let angle = Math.PI / 2;
  const angleStep = -Math.PI / 30;

  // Create the small and big ticks
  for (let i = 0; i < 60; i++) {
    const smallTick = new THREE.Mesh(smallTickGeo, tickMaterial);

    // position and rotation
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = clockDepth / 2;
    smallTick.position.set(x, y, z);
    smallTick.rotation.z = angle;

    face.add(smallTick);

    if (i % 5 === 0) {
      // big tick
      let bigTick = new THREE.Mesh(bigTickGeo, tickMaterial);
      if (i === 0) {
        // twelve tick
        bigTick = new THREE.Mesh(bigTickGeo, new THREE.MeshBasicMaterial({ color: 0x3b8189 }));
      }
      bigTick.position.set(x, y, z);
      bigTick.rotation.z = angle;

      face.add(bigTick);
    }
    angle += angleStep;
    face.add(bezel(clockRadius));
  }

  // Blob
  const blobGeo = new THREE.SphereGeometry(0.3, 32, 16);
  const blob = new THREE.Mesh(blobGeo, clockMaterial);
  blob.position.set(0, 0, clockDepth / 2);
  blob.scale.z = 0.5;
  blob.name = "blob";
  face.add(blob);

  // Second Hand
  const secondHandGeo = new THREE.BoxGeometry(0.1, secondHandLength, 0.05);
  const secondHandMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
  const secondHand = new THREE.Mesh(secondHandGeo, secondHandMaterial);
  secondHand.name = "secondHand";
  face.add(secondHand);
  secondHand.matrixAutoUpdate = false;

  // Minute Hand
  const minuteHandGeo = new THREE.SphereGeometry(minuteHandLegth, 32, 16);
  const minuteHandMaterial = new THREE.MeshStandardMaterial({ color: 0xc92c8f, metalness: 1, roughness: 0.2 });
  const minuteHand = new THREE.Mesh(minuteHandGeo, minuteHandMaterial);
  minuteHand.name = "minuteHand";
  face.add(minuteHand);
  minuteHand.matrixAutoUpdate = false;

  // Hour Hand
  const hourHandGeo = new THREE.SphereGeometry(hourHandLegth, 32, 16);
  const hourHandMaterial = new THREE.MeshStandardMaterial({ color: 0x82b2b7, metalness: 1, roughness: 0.2 });
  const hourHand = new THREE.Mesh(hourHandGeo, hourHandMaterial);
  hourHand.name = "hourHand";
  face.add(hourHand);
  hourHand.matrixAutoUpdate = false;

  return face;
}

// Hamburg clock
const hamburgFace = clockFace(clockRadius);

// Bogota clock
const bogotaFace = clockFace(clockRadius);
// Rotate Bogota Face
const theta = Math.PI;
const ax = new THREE.Vector3(0, 1, 0);
bogotaFace.matrixAutoUpdate = false;
bogotaFace.matrix.makeRotationAxis(ax, theta);

const pivotMinSecHands = new THREE.Vector3(0, -(clockRadius - 0.1 / 2) / 2, clockDepth / 2);
const pivotHourHand = new THREE.Vector3(0, -hourHandLegth, clockDepth / 2);
const TranslationMinSecHands = new THREE.Matrix4().setPosition(new THREE.Vector3(0, (clockRadius - 0.1) / 2, clockDepth / 2));
const TranslationHourHands = new THREE.Matrix4().setPosition(new THREE.Vector3(0, hourHandLegth, clockDepth / 2 + 0.02 * clockRadius / 2));

const cl = new THREE.Clock();
const controls = new TrackballControls(camera, renderer.domElement);
// Render the scene
function render() {
  requestAnimationFrame(render);

  const currentDate = new Date();
  const seconds = currentDate.getSeconds();
  const minutes = currentDate.getMinutes();
  const hours = currentDate.getHours();
  const timeDifference = 6; // Hamburg is 6 hours ahead of Bogotá
  const hoursBogota = hours - timeDifference;

  const angleSeconds = -Math.PI / 30 * seconds;
  const angleMinutes = -Math.PI / 30 * minutes - Math.PI / 1800 * seconds;
  const angleHour = -Math.PI / 6 * hours - Math.PI / 360 * minutes;
  const angleHourBogota = -Math.PI / 6 * hoursBogota - Math.PI / 360 * minutes;

  // Call the function for Hamburg
  updateClockFace(hamburgFace, angleSeconds, angleMinutes, angleHour, pivotMinSecHands, pivotHourHand, TranslationMinSecHands, TranslationHourHands);

  // Call the function for Bogota
  updateClockFace(bogotaFace, angleSeconds, angleMinutes, angleHourBogota, pivotMinSecHands, pivotHourHand, TranslationMinSecHands, TranslationHourHands);

  light.position.copy(camera.position.clone());
  controls.update();
  renderer.render(scene, camera);
}
render();

function updateClockFace(clockFace, angleSeconds, angleMinutes, angleHour, pivot, pivotHourHand, TranslationMinSecHands, TranslationHourHands) {
  
  // update second hand
  const RotMatseconds = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), angleSeconds);
  const rp = pivot.clone().applyMatrix4(RotMatseconds);
  const prp = pivot.clone().sub(rp);
  RotMatseconds.setPosition(prp);
  clockFace.getObjectByName("secondHand").matrix.copy(RotMatseconds.premultiply(TranslationMinSecHands));

  // update minute hand
  const scaleMinuteHand = new THREE.Matrix4().makeScale(0.05, 1, 0.025);
  const RotMatMinutes = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), angleMinutes);
  const rpMinHand = pivot.clone().applyMatrix4(RotMatMinutes);
  const prpMinHand = pivot.clone().sub(rpMinHand);
  RotMatMinutes.setPosition(prpMinHand);
  clockFace.getObjectByName("minuteHand").matrix.copy(scaleMinuteHand.premultiply(RotMatMinutes).premultiply(TranslationMinSecHands));

  // update hour hand
  const scaleHourHand = new THREE.Matrix4().makeScale(0.1, 1, 0.05);
  const RotMatHours = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), angleHour);
  const rpHourHand = pivotHourHand.clone().applyMatrix4(RotMatHours);
  const prpHourHand = pivotHourHand.clone().sub(rpHourHand);
  RotMatHours.setPosition(prpHourHand);
  clockFace.getObjectByName("hourHand").matrix.copy(scaleHourHand.premultiply(RotMatHours).premultiply(TranslationHourHands));
}