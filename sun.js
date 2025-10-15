import * as THREE from "three";

const GlowShader = {
    uniforms: {
        'c': { type: 'f', value: 0.6 },
        'p': { type: 'f', value: 6.0 },
        glowColor: { type: 'c', value: new THREE.Color(0xffaa33) },
        viewVector: { type: 'v3', value: new THREE.Vector3(0, 0, 0) }
    },
    vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity; 

        void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormView = normalize(viewVector - (modelViewMatrix * vec4(position, 1.0)).xyz);

            intensity = pow(c - dot(vNormal, vNormView), p);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;

        void main() { 
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4(glow, 1.0);
        }
    `
};

export function crearSol(scene, camera, clock) {
    const textureLoader = new THREE.TextureLoader();

    // Cargar la textura del Sol
    const sunTexture = textureLoader.load('https://cdn.glitch.global/6d80f8a6-9964-4cf7-8be7-8289db6965d5/2k_sun%20(1).jpg?v=1729577796262');

    // Esfera del Sol
    const geomSol = new THREE.SphereGeometry(3, 64, 64);
    const matSol = new THREE.MeshStandardMaterial({
        map: sunTexture,
        emissive: 0xffaa00, // Color de emisión inicial (amarillo)
        roughness: 0.1,
        metalness: 0.7
    });
    const sol = new THREE.Mesh(geomSol, matSol);
    scene.add(sol);

    // Crear el efecto de resplandor volumétrico
    const glowGeom = new THREE.SphereGeometry(3.5, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(GlowShader.uniforms),
        vertexShader: GlowShader.vertexShader,
        fragmentShader: GlowShader.fragmentShader,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    glowMat.uniforms.glowColor.value = new THREE.Color(0xffaa33);

    const glowMesh = new THREE.Mesh(glowGeom, glowMat);
    sol.add(glowMesh);

    // Función para animar el brillo, color y emisividad
    function animateGlow() {
        const time = clock.getElapsedTime(); // Tiempo desde el inicio de la animación

        // Oscilar intensidad
        const intensity = 0.4 + Math.sin(time * 2.0) * 0.2; // Oscilación entre 0.2 y 0.6
        glowMat.uniforms.c.value = intensity; // Ajustar el valor de 'c'

        // Cambiar el color de resplandor entre amarillo pálido y naranja intenso
        const red = 1.0; // Mantener el rojo constante para un amarillo-naranja
        const green = 0.6 + Math.sin(time * 3.0) * 0.9; // Oscila entre 0.2 y 1.0
        const blue = 0.2 + Math.sin(time * 3.0) * 0.1; // Oscila entre 0.0 y 0.4
        glowMat.uniforms.glowColor.value.setRGB(red, green, blue); // Actualizando el color dinámicamente

        // Cambiar el color del sol a un amarillo mas realista
        const emissiveRed = 1.0;
        const emissiveGreen = 1; 
        const emissiveBlue = 0.3; 
        matSol.emissive.setRGB(emissiveRed, emissiveGreen, emissiveBlue); 
    }

    // Añadir función de actualización al objeto Sol
    sol.update = animateGlow;

    return sol;
}