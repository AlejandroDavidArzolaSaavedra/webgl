import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { focusOnObject } from "./focusOnObject.js";
// No se usa porque es poco intuitiva, descomentar para ver su funcionamiento
// import { TransformControls } from 'https://unpkg.com/three@0.152.1/examples/jsm/controls/TransformControls.js';
import { crearTierra } from "./earth.js";
import { crearSol } from "./sun.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 5;
controls.maxDistance = 100;
controls.enablePan = true;

const flyControls = new FlyControls(camera, renderer.domElement);
flyControls.movementSpeed = 0.1;
flyControls.rollSpeed = 0;
flyControls.dragToLook = false;

const planetLabels = new Map();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
scene.add(ambientLight);





function createOrbit(radius) {
    const orbitGeometry = new THREE.RingGeometry( radius - 0.05, radius + 0.05, 64 );
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
  }

  for (let i = 1; i <= 3; i++) {
    createOrbit(i * 8);
  }

  const asteroidsGroup = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();
  const asteroidTexture = textureLoader.load("https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/images%20(1).jpg?v=1729665508526"); 
  const asteroidNormalMap = textureLoader.load("https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/2k_earth_normal_map.jpg?v=1729577791867");

  const asteroidMaterial = new THREE.MeshStandardMaterial({
    map: asteroidTexture,
    normalMap: asteroidNormalMap,
    displacementScale: 0.2,
    roughness: 0.5,
    metalness: 0.3,
  });

  function createStars(count) {
    const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const starMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

    for (let i = 0; i < count; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(THREE.MathUtils.randFloatSpread(200), THREE.MathUtils.randFloatSpread(200), THREE.MathUtils.randFloatSpread(200));
      scene.add(star);
    }
  }

  function changeModeText(mode) { document.getElementById("modeText").innerText = `Modo: ${mode}`;}

  var speed = 10.5;

  function changeSpeed(newSpeed) { speed = newSpeed;}

  export default function getSpeed(){ return speed;}

  let lastSpeed;

  document.getElementById("btnStop").addEventListener("click", () => { lastSpeed = speed; speed = 0; });

  document.getElementById("btnSlow").addEventListener("click", () => changeSpeed(10.5));
  document.getElementById("btnNormal").addEventListener("click", () => changeSpeed(30.5));
  document.getElementById("btnFast").addEventListener("click", () => changeSpeed(50.5));

  document.getElementById("camera1").addEventListener("click", () => { changeModeText("Vista fija 1"); switchCamera();});
  document.getElementById("camera2").addEventListener("click", () => { changeModeText("Vista fija 2"); switchCamera();});
  document.getElementById("camera3").addEventListener("click", () => { changeModeText("Vista fija 3"); switchCamera();});

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10).normalize();
  directionalLight.castShadow = true; 
  scene.add(directionalLight);

  createStars(100);
  for (let i = 0; i < 300; i++) {
    const size = THREE.MathUtils.randFloat(0.1, 0.5);

    const asteroidGeometry = new THREE.DodecahedronGeometry(size, 0);
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

    const baseRadius = THREE.MathUtils.randFloat(32, 45);
    const irregularity = THREE.MathUtils.randFloat(-3, 3);
    const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const heightVariation = THREE.MathUtils.randFloat(-4, 4);
    asteroid.position.set((baseRadius + irregularity) * Math.cos(angle),heightVariation,(baseRadius + irregularity) * Math.sin(angle));

    asteroid.castShadow = true;
    asteroid.receiveShadow = true;

    asteroid.rotation.x = THREE.MathUtils.randFloat(0, Math.PI * 2);
    asteroid.rotation.y = THREE.MathUtils.randFloat(0, Math.PI * 2);
    asteroid.rotation.z = THREE.MathUtils.randFloat(0, Math.PI * 2);

    asteroid.userData.rotationSpeed = THREE.MathUtils.randFloat(0.001, 0.01);
    asteroid.userData.orbitRadius = baseRadius + irregularity;
    asteroid.userData.orbitAngle = angle;
    asteroid.userData.orbitSpeed = THREE.MathUtils.randFloat(0.00005, 0.0005);

    asteroidsGroup.add(asteroid);
  }

  function animateAsteroids() {
    asteroidsGroup.children.forEach((asteroid) => {
      asteroid.userData.orbitAngle += asteroid.userData.orbitSpeed * speed;
      asteroid.position.set(asteroid.userData.orbitRadius * Math.cos(asteroid.userData.orbitAngle), 0, asteroid.userData.orbitRadius * Math.sin(asteroid.userData.orbitAngle));
      asteroid.rotation.x += asteroid.userData.rotationSpeed;
      asteroid.rotation.y += asteroid.userData.rotationSpeed;
    });
  }
  
  scene.add(asteroidsGroup);

  for (let i = 5; i <= 8; i++) { createOrbit(i * 8 * 1.33);}

  camera.position.set(0, 30, 60);

  // Efecto de bloom (brillo)
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85 );
  composer.addPass(bloomPass);

  const gltfLoader = new GLTFLoader();
  const objects = {};

  function loadModel(name, url, scale, position, onLoad = () => {}) {
    gltfLoader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(...scale);
        model.position.set(...position);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              child.material.roughness = 0.9;
              child.material.metalness = 0.025;
              if("hole" === name) child.material.color.set(0x333333);
              if (name === "kamisama") {
                child.material.roughness = 0.5;
                child.material.metalness = 0.1;
              }
            }
          }
        });

        scene.add(model);
        objects[name] = model;
        onLoad(model);
      },
      undefined,
      (error) => {
        console.error(`Error loading model ${name}:`, error);
      }
    );
  }

  // Modelos cargados
  loadModel("pizzaPlanet", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/pizza_planet_restaurant.glb?v=1729953477943", [0.01, 0.01, 0.01], [0, -12, -100]);
  loadModel("hole", "https://cdn.glitch.me/6d80f8a6-9964-4cf7-8be7-8289db6965d5/black_hole.glb?v=1729981013280", [0.01, 0.01, 0.01], [0, -0, 80]);
  loadModel("spaceship", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/explorative_space_craft.glb?v=1729977210728", [0.1, 0.1, 0.1], [-40, 10, 10]);
  loadModel("spaceshipNamek", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/namek_spaceship.glb?v=1729978015377", [0.5, 0.5, 0.5], [20, 10, 5]);
  loadModel("doctorWho", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/doctor_who_-_the_tardis.glb?v=1729978891907", [0.5, 0.5, 0.5], [-30, 10, 5]);
  loadModel("spaceshipObject", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/nave_espacial_ultrassonica.glb?v=1729976824183", [0.5, 0.5, 0.5], [80, 10, 10]);
  loadModel("spaceCar", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/orbiter_space_shuttle_ov-103_discovery.glb?v=1729979852323", [0.1, 0.1, 0.1], [40, 5, -20]);
  loadModel("meteor", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/meteorite.glb?v=1729980556670", [0.1, 0.1, 0.1], [40, 25, -30]);

  function movementSpace() {
    if (objects.spaceshipNamek) objects.spaceshipNamek.position.z += 0.1;
    if (objects.spaceship) objects.spaceship.position.z += 0.1;
    if (objects.spaceshipObject) objects.spaceshipObject.position.y += 0.001;
    if (objects.doctorWho) objects.doctorWho.position.z += 0.01;
    if (objects.spaceCar) objects.spaceCar.position.z += 0.01;
    if (objects.meteor) objects.meteor.position.z += 0.01;
  }

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    composer.setSize(width, height);
  });

  function switchCamera() { isTransitioning = false; }

  document.getElementById("freeView").addEventListener("click", () => { changeModeText("Vista Libre"); switchCamera(); });

  const minimapCanvas = document.getElementById("minimap");

  // CCámara ortográfica para el minimapa
  const minimapCamera = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 800);
  minimapCamera.position.set(0, 160, 0);
  minimapCamera.lookAt(0, 0, 0); 

  // Cámara adicional
  const miniCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  miniCamera.position.set(0, 15, 30);

  const minimapRenderer = new THREE.WebGLRenderer({canvas: minimapCanvas, alpha: true,});

  function resizeMinimap() { 
    const canvasWidth = minimapCanvas.clientWidth;
    const canvasHeight = minimapCanvas.clientHeight;
    minimapRenderer.setSize(canvasWidth, canvasHeight);
  }

  resizeMinimap();
  window.addEventListener("resize", resizeMinimap);

  function renderMinimap() { minimapRenderer.render(scene, minimapCamera); requestAnimationFrame(renderMinimap); }

  renderMinimap();

  let cameraPosition1 = new THREE.Vector3(0, 30, 60); 
  let cameraPosition2 = new THREE.Vector3(60, 30, 0);
  let cameraPosition3 = new THREE.Vector3(0, 0, 60); 
  let cameraLookAt = new THREE.Vector3(0, 0, 0); 

  let targetCameraPosition = new THREE.Vector3();
  let cameraTransitionSpeed = 0.1; 
  let isTransitioning = false;

  function setView1() { targetCameraPosition.copy(cameraPosition1); isTransitioning = true; }

  function setView2() { targetCameraPosition.copy(cameraPosition2); isTransitioning = true; }

  function setView3() { targetCameraPosition.copy(cameraPosition3); isTransitioning = true; }

  document.getElementById("camera1").addEventListener("click", setView1);
  document.getElementById("camera2").addEventListener("click", setView2);
  document.getElementById("camera3").addEventListener("click", setView3);

  function updateLabelPosition(planet, label) {
    const planetPosition = new THREE.Vector3().copy(planet.position);
    planetPosition.project(camera); 
    const x = (planetPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = ((planetPosition.y * -0.5 + 0.5) * window.innerHeight) / 1.125;
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
  }
  const clock = new THREE.Clock();

  const earthLabel = document.createElement("div");
  earthLabel.style.position = "absolute";
  earthLabel.style.top = "0";
  earthLabel.style.color = "white";
  document.body.appendChild(earthLabel);

  function createPlanetLabel(planet, name) {
    const label = document.createElement("div");
    label.style.position = "absolute";
    label.style.top = "0";
    label.style.color = "white";
    label.textContent = name;
    document.body.appendChild(label);
    planetLabels.set(name, label);
    return label;
  }
  const sol = crearSol(scene, camera, clock);
  const { tierra, nubes } = crearTierra(scene, sol);
  sol.castShadow = true; 
  sol.receiveShadow = true; 
  scene.add(sol);
  
  tierra.castShadow = true;  
  tierra.receiveShadow = true; 

  const tierraLabel = createPlanetLabel(tierra, "Tierra");
  tierra.name = "tierra";
  tierra.position.set(13, 0, -9);
  nubes.name = "nubes";
  nubes.position.set(13, 0, -9);
  scene.add(tierra);
  scene.add(nubes);

  const moonTexture = textureLoader.load('https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_moon.jpg?v=1729326623931');
  const displacementMap = textureLoader.load('https://cdn.glitch.global/507b1b18-2f62-47da-b3a6-4dfa7475cb9b/gebco_08_rev_elev_5400x2700.png?v=1700050274157');
  const normalMap = textureLoader.load('https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/2k_earth_normal_map.jpg?v=1729577791867');


  const geomLuna = new THREE.SphereGeometry(0.5, 64, 64);
  const matLuna = new THREE.MeshStandardMaterial({ 
      map: moonTexture,
      normalMap: normalMap, 
      displacementMap: displacementMap, 
      displacementScale: 0.001, 
      metalness: 0.1, 
      roughness: 0.5  
  });

const luna = new THREE.Mesh(geomLuna, matLuna);
luna.castShadow = true; 
luna.receiveShadow = true; 
scene.add(luna);

const moonOrbitRadius = 2.8;
let moonAngle = 0;

function rotateLuna() {
    const delta = clock.getDelta();
    moonAngle += delta * 4;
    luna.position.set( tierra.position.x + moonOrbitRadius * Math.cos(moonAngle), 0, tierra.position.z + moonOrbitRadius * Math.sin(moonAngle));
    luna.rotation.x += delta * 10.5;
    requestAnimationFrame(rotateLuna);
}
rotateLuna();

function createPlanet(name, textureUrl, normalMapUrl, size, orbitRadius, rotationSpeed, orbitSpeed, labelColor = "white") {
    const label = document.createElement("div");
    label.style.position = "absolute";
    label.style.top = "0";
    label.style.color = labelColor;
    document.body.appendChild(label);

  const surfaceTexture = textureLoader.load(textureUrl);
    const normalMap = textureLoader.load(normalMapUrl);
    const geometry = new THREE.SphereGeometry(size, 128, 128);
    const material = new THREE.MeshStandardMaterial({
        map: surfaceTexture,
        normalMap: normalMap,
        metalness: 0.5,
        roughness: 0.5,
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.name = name;
    scene.add(planet);
    const planetLabel = createPlanetLabel(planet, name);

    let angle = 0;

    function rotate() {
        const delta = clock.getDelta();
        planet.rotation.y += delta * rotationSpeed * speed;
        updateLabelPosition(planet, planetLabel);
        angle += delta * orbitSpeed * speed;
        planet.position.set(orbitRadius * Math.cos(angle), 0, orbitRadius * Math.sin(angle));
        requestAnimationFrame(rotate);
    }

    return { planet, rotate,planetLabel };
}

const planets = [];
let normalMapPlanet = "https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_earth_normal_map.jpg?v=1729525738684";

planets.push(createPlanet("marte", "https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_mars.jpg?v=1729326692027", normalMapPlanet, 1, 24, 0.8, 0.1));
planets.push(createPlanet("neptuno", "https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_neptune%20(1).jpg?v=1729540300042", normalMapPlanet, 0.4, 32, 0.035, 0.035));
planets.push(createPlanet("mercurio", "https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_mercury.jpg?v=1729543326046", normalMapPlanet, 0.4, 8, 0.55, 1.52));
planets.push(createPlanet("júpiter", "https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_jupiter%20(1).jpg?v=1729544358617", normalMapPlanet, 1.5, 64, 3.15, 0.315));
planets.push(createPlanet("venus", "https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_venus_surface.jpg?v=1729540807279", normalMapPlanet, 0.5, 64, 0.02, 0.21));
planets.push(createPlanet("urano", "https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_uranus.jpg?v=1729543627139", normalMapPlanet, 0.4, 74.4, 0.22, 0.22));
planets.push(createPlanet("ceres", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/2k_ceres_fictional.jpg?v=1730274663337", normalMapPlanet,  1.5, 58, 1, 1));
planets.push(createPlanet("eris", "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/2k_eris_fictional%20(1).jpg?v=1730275221799", normalMapPlanet,  0.7, 38, 0.6, 1));

function rotatePlanets() {
    planets.forEach(({ rotate }) => rotate());
    rotateLuna();
    updateLabelPosition(tierra, tierraLabel);
}

planets.forEach(({ planet, planetLabel }) => {
    const capitalizedPlanetName = planet.name.charAt(0).toUpperCase() + planet.name.slice(1);
    planetLabels.set(capitalizedPlanetName, planetLabel);
});

let planetsCreated = []; // Array para almacenar planetas creados

document.getElementById("createPlanet").addEventListener("click", () => {
  const planetName = document.getElementById("planetName").value;
  const orbitRadius = parseFloat(document.getElementById("planetOrbit").value);
  const planetColor = document.getElementById("planetColor").value;

  if (planetName === "") {
    alert("Por favor, ingresa un nombre para el planeta.");
    return;
  }

  // Crear el planeta
  const planetGeometry = new THREE.SphereGeometry(1, 32, 32);
  const planetMaterial = new THREE.MeshStandardMaterial({ color: planetColor });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);

  // Posicionar el planeta en su órbita inicial
  planet.position.set(orbitRadius, 0, 0);
  planet.name = planetName; // Nombre del planeta

  // Crear la etiqueta del planeta
  const label = createPlanetLabel(planet, planetName);

  // Crear un objeto para almacenar la información de órbita y animación
  planetsCreated.push({
    planetMesh: planet,
    orbitRadius: orbitRadius,
    angle: 0, // ángulo de inicio
    orbitSpeed: 0.01, // velocidad de rotación
    label: label // Asignar la etiqueta creada
  });

  // Añadir el planeta a la escena
  scene.add(planet);
});

// Función para actualizar la posición de cada planeta y su etiqueta
function animatePlanetsCreated() {
  planetsCreated.forEach((planetObj) => {
    planetObj.angle += planetObj.orbitSpeed; // Incrementar ángulo para movimiento orbital
    planetObj.planetMesh.position.x = Math.cos(planetObj.angle) * planetObj.orbitRadius;
    planetObj.planetMesh.position.z = Math.sin(planetObj.angle) * planetObj.orbitRadius;

    // Actualizar la posición de la etiqueta para que siga al planeta
    updateLabelPosition(planetObj.planetMesh, planetObj.label);
  });
}



const saturnTexture = textureLoader.load("https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_saturn.jpg?v=1729517006218");
const ringTexture = textureLoader.load( "https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/2k_saturn_ring_alpha.png?v=1729516936098");
const geomSaturno = new THREE.SphereGeometry(1.6, 128, 128);
const matSaturno = new THREE.MeshStandardMaterial({
    map: saturnTexture,
    normalMap: normalMap,
    metalness: 0.5,
    roughness: 0.5,
  });
  const saturno = new THREE.Mesh(geomSaturno, matSaturno);
  saturno.name = "saturno";
  saturno.castShadow = true;
  scene.add(saturno);

  function crearAnillo(radioMayor, radioMenor, color) {
    const geomAnillo = new THREE.TorusGeometry(radioMayor, radioMenor, 2, 64);
    const matAnillo = new THREE.MeshStandardMaterial({
      map: ringTexture,
      color: color,
      transparent: true,
      opacity: 1.0,
    });
    const anillo = new THREE.Mesh(geomAnillo, matAnillo);
    anillo.rotation.x = Math.PI / 2; 
    anillo.position.set(0, 0, 0);
    anillo.castShadow = true;
    return anillo;
  }

  const anillos = [];
  const numAnillos = 4;
  for (let i = 0; i < numAnillos; i++) {
    const radioMayor = 2.1 + i * 0.2; 
    const radioMenor = 0.05 + i * 0.02;
    const color = new THREE.Color(1, 1 - i * 0.1, 1 - i * 0.2);
    const anillo = crearAnillo(radioMayor, radioMenor, color);
    anillos.push(anillo);
    saturno.add(anillo); 
  }

  const saturnoOrbitRadius = 86;
  let saturnoAngle = 86;
  const saturnoLabel = createPlanetLabel(saturno, "Saturno");
  function rotateSaturno() {
    const delta = clock.getDelta();
    saturno.rotation.y += delta * 0.05 * speed;
    updateLabelPosition(saturno, saturnoLabel);
    saturnoAngle += delta * 0.15 * speed;
    saturno.position.set(saturnoOrbitRadius * Math.cos(saturnoAngle), 0, saturnoOrbitRadius * Math.sin(saturnoAngle));
    anillos.forEach((anillo) => { anillo.rotation.z += delta * 0.02;});
    requestAnimationFrame(rotateSaturno);
  }

rotateSaturno();

function rotatePlanets2() { rotateSaturno(); }

const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;

      controls.target.copy(selectedObject.position);
      camera.position.set(
        selectedObject.position.x + 5,
        selectedObject.position.y + 5,
        selectedObject.position.z + 5
      );

      controls.update();
    }
  }

  window.addEventListener("click", onMouseClick);

  function controlVistasPrefijadas() {
    if (isTransitioning) {
      camera.position.lerp(targetCameraPosition, cameraTransitionSpeed);
      camera.lookAt(cameraLookAt);
      if (camera.position.distanceTo(targetCameraPosition) < 0.1) {
        isTransitioning = false; 
      }
    }
  }

  let buzz;
  let timeBuzz = 0;
  let flyModeBuzz = false;
  const buzzCameraOffset = { x: 0, y: 0.1, z: 0.1 }; 

  // Cargar modelo Buzz
  const mtlLoader = new MTLLoader();
  mtlLoader.load(
    "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/G7CVEC4O394HM1IJOEOC66LNO.mtl?v=1729896898646",
    (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(
        "https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/G7CVEC4O394HM1IJOEOC66LNO.obj?v=1729896430063",
        (object) => {
          scene.add(object);
          object.scale.set(0.35, 0.35, 0.35); 
          object.position.set(19, 19, 19);
          object.rotation.y = Math.PI * 7.4946;
          buzz = object;
          buzz.visible = false;
        }
      );
    }
  );

  // Configuración del Modo Buzz Lightyear
  document.getElementById("flyModeButton").addEventListener("click", () => {
    document.startViewTransition(() => {
      flyModeBuzz = !flyModeBuzz;
      controls.enabled = !flyModeBuzz;
      flyControls.enabled = flyModeBuzz;

      if (flyModeBuzz) {
        buzz.visible = true; 
        camera.position.set(
          buzz.position.x + 0,
          buzz.position.y + 0.1,
          buzz.position.z + 0.1
        );
        camera.lookAt(buzz.position); 
      } else {
        buzz.visible = false;
        focusOnObject(sol, camera, controls);
      }
      document.getElementById("flyModeButton").innerText = flyModeBuzz
        ? "Modo Normal"
        : "Modo Buzz";
    });
  });

  const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  };
  document.addEventListener("keydown", (event) => { if (event.key in keys) keys[event.key] = true; });
  document.addEventListener("keyup", (event) => { if (event.key in keys) keys[event.key] = false; });

  function animateBuzz() {
    if (buzz) {
      const speed = 0.2;

      let moveX = 0;
      let moveZ = 0;

      if (keys.ArrowUp) moveZ -= speed;
      if (keys.ArrowDown) moveZ += speed;
      if (keys.ArrowLeft) {
        moveX -= speed;
        buzz.rotation.y += 0.05;
      }
      if (keys.ArrowRight) {
        moveX += speed;
        buzz.rotation.y -= 0.05;
      }

      buzz.position.x += moveX;
      buzz.position.z += moveZ;

      timeBuzz += 0.02;
      buzz.position.y = Math.sin(timeBuzz) * 0.5 + 0.2; // Ajusta la altura del "bob"

      if (flyModeBuzz) {
        camera.position.x = buzz.position.x + buzzCameraOffset.x;
        camera.position.y = buzz.position.y + buzzCameraOffset.y;
        camera.position.z = buzz.position.z + buzzCameraOffset.z;

        camera.lookAt(buzz.position);
        controls.target.copy(buzz.position);
      }
    }
  }

  function showCardAndFocusOnPlanet(planetName, planetObject, camera, controls) { document.querySelectorAll(".card-client").forEach((card) => { card.classList.add("hidden"); });

  const card = document.getElementById(`${planetName}-card`);
    if (card) { card.classList.remove("hidden"); }
    focusOnObject(planetObject, camera, controls);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".planet-icon").forEach((icon) => {
      icon.addEventListener("click", function () {
        const planetName = this.getAttribute("data-name").toLowerCase();

        // Obten el objeto Three.js del planeta
        const planetObject = scene.getObjectByName(planetName);
        if (planetObject) {
          showCardAndFocusOnPlanet(planetName, planetObject, camera, controls);
        } else {
          console.warn(
            `No se encontró el objeto Three.js para el planeta: ${planetName}`
          );
        }
      });
    });
  });

  // Eliminar planeta seleccionado
  document.getElementById("deletePlanet").addEventListener("click", () => {
    const planetName = document.getElementById("deletePlanetSelect").value;

    if (planetName) {
      const planet = scene.getObjectByName(planetName);

      if (planet) {
        scene.remove(planet);
 
        const optionToRemove = document.querySelector(
          `#deletePlanetSelect option[value="${planetName}"]`
        );
        if (optionToRemove) optionToRemove.remove();

        let normalized =
          planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase();
        console.log(normalized)
        console.log(planetLabels)
        if (normalized == "Tierra") {
          const atmosferaCapa = scene.getObjectByName("atmosfera");
          const nubesCapa = scene.getObjectByName("nubes");
          scene.remove(atmosferaCapa);
          scene.remove(nubesCapa);
        }
        const label = planetLabels.get(normalized);
        if (label) {
          document.body.removeChild(label);
          planetLabels.delete(planetName);
        }
        document.getElementById("deletePlanetSelect").value = "";
      } else {
        console.error(`No se encontró el planeta: ${planetName}`);
      }
    } else {
      alert("Por favor, selecciona un planeta para eliminar.");
    }
  });

  /* 
  // ESTA PARTE ESTA COMO COMENTARIO Y SE PUEDE DESCOMENTAR SIN PROBLEMAS
  // NO SE PUSO POR QUE ES POCO INTUITIVO EL MANEJO CON LETRAS DEL TECLADO EN MI OPINION
  
  const transformControl = new TransformControls(camera, renderer.domElement);
  scene.add(transformControl);

  transformControl.addEventListener("change", () => renderer.render(scene, camera));
  transformControl.setMode("translate"); // Modo (mover)

  function addTransformControlToPlanet(planet) {
      transformControl.attach(planet);
      transformControl.setMode("translate"); 
      transformControl.setSpace("world");
      scene.add(transformControl);
  }

  document.addEventListener("keydown", (event) => {
      if (event.key === "t") { // Activa el modo  movimiento
          transformControl.setMode("translate");
      }
      if (event.key === "r") { // Activa el modo de rotación
          transformControl.setMode("rotate");
      }
      if (event.key === "s") { // Activa el modo de escala
          transformControl.setMode("scale");
      }
  });

  // addTransformControlToPlanet(jupiter); 
  */

const smallCameraCanvas = document.getElementById("smallCameraCanvas");
const smallCameraRenderer = new THREE.WebGLRenderer({ canvas: smallCameraCanvas, });
const smallCamera = new THREE.PerspectiveCamera(90, 1, 2.6, 2800);
smallCamera.position.set(5, 4, -75); 
const smallCamera2 = new THREE.PerspectiveCamera(75, 1, 0.1, 2500);
smallCamera2.position.set(5, 14, -55); 

function resizeSmallCamera() {
  const canvasWidth = smallCameraCanvas.clientWidth;
  const canvasHeight = smallCameraCanvas.clientHeight;
  smallCamera.aspect = canvasWidth / canvasHeight;
  smallCamera.updateProjectionMatrix();
  smallCameraRenderer.setSize(canvasWidth, canvasHeight);
}

resizeSmallCamera();
window.addEventListener("resize", resizeSmallCamera);

function animate() {
  requestAnimationFrame(animate);
  animateAsteroids();animatePlanetsCreated();
  rotatePlanets();rotatePlanets2();
  sol.rotation.y += 0.01 * speed/10;
  sol.update();
  asteroidsGroup.children.forEach((asteroid) => { asteroid.rotation.x += asteroid.userData.rotationSpeed * speed; asteroid.rotation.y += asteroid.userData.rotationSpeed * speed; });
  animateBuzz();
  movementSpace();
  controlVistasPrefijadas();
  controls.update();
  
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissorTest(false);
  composer.render(scene, camera);

  smallCameraRenderer.render(scene, smallCamera);
}

// Detectar cuando la ventana ha cargado completamente
window.onload = () => {
  // Ocultar la pantalla de carga cuando todo esté listo
  const loadingScreen = document.getElementById('loadingScreen');
  loadingScreen.style.display = 'none';
  

  animate();
setView1();
};
