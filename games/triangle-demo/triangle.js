// Triangle Demo WebGL

let gl;
let program;

// Vertex shader with color support
const vertexShaderSource = `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    
    varying vec3 vColor;
    
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        vColor = aColor;
    }
`;

// Fragment shader
const fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 vColor;
    
    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

// Triangle vertices (x, y coordinates)
const vertices = new Float32Array([
     0.0,  0.8,   // Top vertex
    -0.8, -0.8,   // Bottom-left vertex
     0.8, -0.8    // Bottom-right vertex
]);

// Colors for each vertex (RGB)
const colors = new Float32Array([
    1.0, 0.0, 0.0,  // Red for top vertex
    0.0, 1.0, 0.0,  // Green for bottom-left vertex
    0.0, 0.0, 1.0   // Blue for bottom-right vertex
]);

function init() {
    const canvas = document.getElementById('glCanvas');
    gl = initWebGL(canvas);
    
    if (!gl) {
        return;
    }
    
    // Create shader program
    program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    
    if (!program) {
        return;
    }
    
    // Create and bind vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Get position attribute location and set up
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    
    // Create and bind color buffer
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    
    // Get color attribute location and set up
    const aColor = gl.getAttribLocation(program, 'aColor');
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
    
    // Set clear color (dark background)
    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    
    // Draw the triangle
    draw();
}

function draw() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use the shader program
    gl.useProgram(program);
    
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Initialize when page loads
window.addEventListener('load', init);
