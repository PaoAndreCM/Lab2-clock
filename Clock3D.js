// "use strict";

import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

// Initialize WebGL renderer
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setClearColor(0xfdffea);  // background color


// Create a new Three.js scene
const scene = new THREE.Scene();
// Just for debugging: delete for the final version!
const axesHelper = new THREE.AxesHelper();
scene.add( axesHelper );

// Add a camera
const camera = new THREE.PerspectiveCamera( 100, canvas.width / canvas.height, 0.1, 500 );
camera.position.set(1,2,7);

// Add light sources
// scene.add(new THREE.AmbientLight('#ffffff'));
const light = new THREE.DirectionalLight();
light.position.set(0,8,2);
scene.add(light);

// Add the clock here:

// Clock cylinder 
const clockRadius = 5;
const clockDepth = 1;
const clockGeometry = new THREE.CylinderGeometry( clockRadius, clockRadius, clockDepth, 100 ); 
const clockMaterial = new THREE.MeshStandardMaterial({color:0x9b8292,
                                                      metalness:0.1,
                                                      roughness:0.5,
                                                      flatShading:true})
clockMaterial.transparent = false;
clockMaterial.opacity = 0.3;
const clockCylinder = new THREE.Mesh( clockGeometry, clockMaterial ); 
clockCylinder.rotation.x = Math.PI/2
scene.add( clockCylinder ); 

// Clock bezel
function bezel(clockRadius){
  const outerRadius = clockRadius+0.2;
  const outerCircle = new THREE.Shape();
  outerCircle.moveTo(outerRadius, 0);
  const innerCircle = new THREE.Shape();   // serves as hole in outerCircle
  innerCircle.moveTo(clockRadius, 0);
  const N =100;
  const deltaPhi = 2*Math.PI / N;
  for(let k=1; k<=N; ++k) {
    outerCircle.lineTo(outerRadius*Math.cos(k*deltaPhi),
                      outerRadius*Math.sin(k*deltaPhi));
    innerCircle.lineTo(clockRadius*Math.cos(k*deltaPhi),
                      clockRadius*Math.sin(k*deltaPhi));
  }
  outerCircle.holes.push(innerCircle);

  const extrudeSettings = {
    bevelEnabled: false,
    depth: 0.6*clockDepth,
  };
  const extrudeGeo = new THREE.ExtrudeGeometry(outerCircle, extrudeSettings);
  const extrudeRing = new THREE.Mesh(extrudeGeo, clockMaterial);
  return extrudeRing
}

// scene.add(extrudeRing);
// extrudeRing.matrixAutoUpdate = false;
// extrudeRing.updateMatrix;
// printMat(extrudeRing.matrix)

// Mouse control

function clockFace(clockRadius){
  const face = new THREE.Object3D();
  scene.add(face);

  const tickLenght = 0.3;
  const tickWidth = 0.05;
  const tickDepth = 0.01;
  const smallTickGeo = new THREE.BoxGeometry(tickLenght, tickWidth, tickDepth);
  const bigTickGeo = new THREE.BoxGeometry(2*tickLenght, 2*tickWidth, 2*tickDepth);
  const tickMaterial = new THREE.MeshBasicMaterial( {color: 'pink'});

  // Define the radius
  const radius = clockRadius-1.5*tickLenght; 
  let angle = Math.PI/2;
  const angleStep = -Math.PI/30;

  // Create the small and big ticks
  for (let i = 0; i < 60; i++) {
      const smallTick = new THREE.Mesh(smallTickGeo, tickMaterial);
      
      // position and rotation
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = clockDepth/2;
      smallTick.position.set(x, y, z);
      smallTick.rotation.z = angle;

      face.add(smallTick);

      if (i % 5 == 0){
      // big tick
      let bigTick = new THREE.Mesh(bigTickGeo, tickMaterial);
        if (i == 0){
          // twelve tick
          bigTick = new THREE.Mesh(bigTickGeo, new THREE.MeshBasicMaterial({color: 'white'}))
        }
      bigTick.position.set(x,y,z);
      bigTick.rotation.z = angle;
      
      face.add(bigTick);
    }
      angle += angleStep;
      face.add(bezel(clockRadius))
  }

  // Blob
  const blobGeo = new THREE.SphereGeometry( 0.3, 32, 16 ); 
  const blobMaterial = new THREE.MeshBasicMaterial( { color: 'purple' } ); 
  const blob = new THREE.Mesh( blobGeo, clockMaterial ); 
  blob.position.set(0,0,clockDepth/2);
  blob.scale.z = 0.5;
  blob.name = "blob"
  face.add( blob );

  // Second Hand
  const secondHandLength = clockRadius-0.1;
  const secondHandGeo = new THREE.BoxGeometry(0.1,secondHandLength, 0.05);
  const secondHandMaterial = new THREE.MeshBasicMaterial({color:'black'});
  const secondHand = new THREE.Mesh(secondHandGeo, secondHandMaterial);
  secondHand.name = "secondHand";

  secondHand.position.set(0, secondHandLength/2, clockDepth/2)

  face.add(secondHand);

  
  // Minute Hand
  const minuteHandLegth = clockRadius/2
  const minuteHandGeo = new THREE.SphereGeometry(minuteHandLegth, 32, 16);
  const minuteHandMaterial = new THREE.MeshStandardMaterial({color: 'red', metalness: 1, roughness: 0.2})
  minuteHandMaterial.transparent = true;
  minuteHandMaterial.opacity = 0.1;
  const minuteHand = new THREE.Mesh(minuteHandGeo, minuteHandMaterial);
  minuteHand.name = "minuteHand";

  minuteHand.scale.set(0.05, 1, 0.025);
  minuteHand.position.set(Math.sin(Math.PI/30)+0.1, minuteHandLegth, clockDepth/2);
  minuteHand.rotation.z = -Math.PI/30;

  face.add(minuteHand);
  
  // Hour Hand
  const hourHandLegth = clockRadius/4;
  const hourHandGeo = new THREE.SphereGeometry(hourHandLegth, 32, 16);
  const hourHandMaterial = new THREE.MeshStandardMaterial({color: 'blue', metalness: 1, roughness: 0.2})
  const hourHand = new THREE.Mesh(hourHandGeo, hourHandMaterial);

  hourHand.scale.set(0.1, 1, 0.05);
  hourHand.position.set(0, hourHandLegth, clockDepth/2+0.05*clockRadius/2)

  face.add(hourHand);

  return face;
}

// Hamburg clock
const hamburgFace = clockFace(clockRadius);
hamburgFace.getObjectByName("secondHand").matrixAutoUpdate = false;
// hamburgFace.getObjectByName("minuteHand").matrixAutoUpdate = false;

// Bogota clock
const bogotaFace = clockFace(clockRadius);
// Rotate Bogota Face
const theta = Math.PI;
const ax = new THREE.Vector3(0,1,0);
bogotaFace.matrixAutoUpdate = false;
bogotaFace.matrix.makeRotationAxis(ax,theta);

const om1 = 1;


const om = -Math.PI/30;
const rad = 1;
const cl = new THREE.Clock();
const controls = new TrackballControls(camera, renderer.domElement);
// Render the scene
function render() {
  requestAnimationFrame(render);
  
  const t =  cl.getElapsedTime();

  const minuteHandPos = new THREE.Vector3(rad*Math.sin(om*t), rad*Math.cos(om*t), 0);

  // const spherePos = new THREE.Vector3(rad*Math.cos(om1*t),
  //                                     0,
  //                                     rad*Math.sin(om1*t));

  // sphere.matrix.setPosition(spherePos);

  hamburgFace.getObjectByName("minuteHand").matrix.setPosition(minuteHandPos);

  light.position.copy(camera.position.clone())
  controls.update();
  renderer.render(scene, camera);
}
render();

function printMat(m, fixed=3) {
  const len = Math.sqrt(m.elements.length);
  for(let r=0;r<len; ++r) {
    let str = '';
    for (let c=0; c<len; ++c) {
      const num = m.elements[c*len+r];
      if (num>=0) str += ' ' + num.toFixed(fixed) + ' ';
      else str += num.toFixed(fixed) + ' ';
    }
    console.log(str);
  }
}