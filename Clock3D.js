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

 
const clockRadius = 5;
const clockDepth = 1;
const secondHandLength = clockRadius-0.1;
const minuteHandLegth = clockRadius/2
const hourHandLegth = clockRadius/4;

// Clock cylinder
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
  
  const secondHandGeo = new THREE.BoxGeometry(0.1,secondHandLength, 0.05);
  const secondHandMaterial = new THREE.MeshBasicMaterial({color:'black'});
  const secondHand = new THREE.Mesh(secondHandGeo, secondHandMaterial);
  secondHand.name = "secondHand";

  face.add(secondHand);
  secondHand.matrixAutoUpdate = false;

  
  // Minute Hand
  const minuteHandGeo = new THREE.SphereGeometry(minuteHandLegth, 32, 16);
  const minuteHandMaterial = new THREE.MeshStandardMaterial({color: 'red', metalness: 1, roughness: 0.2})
  minuteHandMaterial.transparent = false;
  minuteHandMaterial.opacity = 0.1;
  const minuteHand = new THREE.Mesh(minuteHandGeo, minuteHandMaterial);
  minuteHand.name = "minuteHand";

  face.add(minuteHand);
  minuteHand.matrixAutoUpdate = false;
  
  // Hour Hand
  
  const hourHandGeo = new THREE.SphereGeometry(hourHandLegth, 32, 16);
  const hourHandMaterial = new THREE.MeshStandardMaterial({color: 'blue', metalness: 1, roughness: 0.2})
  const hourHand = new THREE.Mesh(hourHandGeo, hourHandMaterial);
  hourHand.name = "hourHand"

  face.add(hourHand);
  hourHand.matrixAutoUpdate = false;

  return face;
}

// Hamburg clock
const hamburgFace = clockFace(clockRadius);

// Bogota clock
// const bogotaFace = clockFace(clockRadius);
// // Rotate Bogota Face
// const theta = Math.PI;
// const ax = new THREE.Vector3(0,1,0);
// bogotaFace.matrixAutoUpdate = false;
// bogotaFace.matrix.makeRotationAxis(ax,theta);




const omSeconds = -Math.PI/30; // 6 degrees per second
const pivot = new THREE.Vector3(0, -(clockRadius-0.1/2)/2, clockDepth/2 );

const omMinutes = -Math.PI/30/60; // 6 degrees per minute

const omHours = -Math.PI/30/60/60;




const cl = new THREE.Clock();
const controls = new TrackballControls(camera, renderer.domElement);
// Render the scene
function render() {
  requestAnimationFrame(render);
  
  const t =  cl.getElapsedTime();
  
  // Hamburg second hand movement
 
  const T = new THREE.Matrix4().setPosition(new THREE.Vector3(0, (clockRadius-0.1)/2, clockDepth/2)); // initial position desired for second and minute hand
  const Rseconds = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,0,1), omSeconds*t); // Rotation matrix for second hand
  const rp = pivot.clone().applyMatrix4(Rseconds); // Applying rotation matrix to position of second hand
  const prp = pivot.clone().sub(rp); // difference vector (prp) between the original pivot position and the newly rotated position
  Rseconds.setPosition(prp); // sets the translation part of the rotation matrix (Rseconds) to this difference vector 

  hamburgFace.getObjectByName("secondHand").matrix.copy(Rseconds.premultiply(T));


  // Hamburg minute hand movement
  const scaleMinuteHand = new THREE.Matrix4().makeScale(0.05, 1, 0.025) // make scale matrix for minute hand
  const Tr = new THREE.Matrix4().setPosition(new THREE.Vector3(Math.sin(Math.PI/30)+0.1, (clockRadius-0.1)/2, clockDepth/2));
  const Rminutes = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,0,1), omMinutes*t); // Rotation matrix for minute hand
  const rp1 = pivot.clone().applyMatrix4(Rminutes); // Applying rotation matrix to position of minute hand
  const prp1 = pivot.clone().sub(rp1); // difference vector (prp1) between the original pivot position and the newly rotated position
  Rminutes.setPosition(prp1);

  hamburgFace.getObjectByName("minuteHand").matrix.copy(scaleMinuteHand.premultiply(Rminutes).premultiply(T));

  // Hamburg hour hand movement
  const T1 = new THREE.Matrix4().setPosition(new THREE.Vector3(0, hourHandLegth, clockDepth/2+0.05*clockRadius/2))
  const scaleHourHand = new THREE.Matrix4().makeScale(0.1, 1, 0.05) // make scale matrix for hour hand
  const Rhours = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,0,1), omHours*t); // Rotation matrix for minute hand
  const rp2 = pivot.clone().applyMatrix4(Rhours); // Applying rotation matrix to position of hour hand
  const prp2 = pivot.clone().sub(rp2); // difference vector (prp2) between the original pivot position and the newly rotated position
  Rhours.setPosition(prp2);

  hamburgFace.getObjectByName("hourHand").matrix.copy(scaleHourHand.premultiply(Rhours).premultiply(T1));

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