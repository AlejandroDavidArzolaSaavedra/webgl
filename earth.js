import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import getSpeed from "./planetSystem.js"; // Asegúrate de que esta función esté correctamente definida.

export function crearTierra(scene, lightParams, speed) {
    const textureLoader = new THREE.TextureLoader();
    const earthDayTexture = textureLoader.load('https://cdn.glitch.global/507b1b18-2f62-47da-b3a6-4dfa7475cb9b/earthmap1k.jpg?v=1698858918230');
    const earthNightTexture = textureLoader.load('https://cdn.glitch.global/341720a6-447a-46ce-b3c9-8002f2955b61/2k_earth_nightmap.jpg?v=1730447924263');
    const cloudTexture = textureLoader.load('https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/earthCloud.png?v=1730220255040');
    const bumpMap = textureLoader.load('https://cdn.glitch.global/b0922145-d216-40cd-9238-663140b6fa5f/earthbump.jpg?v=1730220260413');

    const uniforms = {
        texture1: { value: earthDayTexture },
        texture2: { value: earthNightTexture }
    };

    const earthMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragmentShader(),
        vertexShader: vertexShader(),
        bumpMap: bumpMap,
        bumpScale: 4.9,
        roughness: 5.9,
        metalness: 0.5,
    });

    const geomTierra = new THREE.SphereGeometry(1.8, 100, 100);
    const tierra = new THREE.Mesh(geomTierra, earthMaterial);
    tierra.castShadow = true;
    tierra.name = "tierra";

    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        shininess: 0.9,
    });

    const nubes = new THREE.Mesh(new THREE.SphereGeometry(1.85, 100, 100), cloudMaterial);
    nubes.position.copy(tierra.position);
    nubes.castShadow = true;
    nubes.receiveShadow = true;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(lightParams.color || 0xffffff, lightParams.intensity || 0.2);
    pointLight.position.set(...(lightParams.position || [5, 5, 5]));
    pointLight.castShadow = true;
    scene.add(pointLight);

    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;

    let angle = 0;
    const clock = new THREE.Clock();

    function animate() {
        const delta = clock.getDelta();
        angle += (delta * getSpeed()) / 10;

        tierra.position.set(16 * Math.cos(angle), 0, 16 * Math.sin(angle));
        nubes.position.copy(tierra.position);

        tierra.rotation.y += 0.0015 * getSpeed();
        nubes.rotation.y += 0.0015 * getSpeed();

        requestAnimationFrame(animate);
    }
    animate();

    return { tierra, nubes };
}

function fragmentShader() {
    return `
        uniform sampler2D texture1; // Textura de día
        uniform sampler2D texture2; // Textura de noche
        varying vec2 vUv;
        varying vec3 v_Luz;
        varying vec3 v_Normal;

        void main() {
            float LdotN = dot(v_Luz, v_Normal);

            // Calcular la mezcla gradual entre día y noche
            float mixFactor = smoothstep(-0.2, 0.2, LdotN); 

            // Mezclar ambas texturas en función de la luz
            vec3 dayColor = texture2D(texture1, vUv).rgb;
            vec3 nightColor = texture2D(texture2, vUv).rgb * 0.1;

            // Mezcla de colores entre día y noche
            vec3 finalColor = mix(nightColor, dayColor, mixFactor);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;
}

function vertexShader() {
    return `
        varying vec2 vUv;
        varying vec3 v_Normal;
        varying vec3 v_Luz;

        void main() {
            vUv = uv;
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            vec4 viewSunPos = viewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            v_Normal = normalize(normalMatrix * normal);
            v_Luz = normalize(viewSunPos.xyz - modelViewPosition.xyz);
            gl_Position = projectionMatrix * modelViewPosition;
        }
    `;
}

