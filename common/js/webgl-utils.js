// WebGL Utility Functions

/**
 * Initialize WebGL context
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {WebGLRenderingContext|null} The WebGL context or null if failed
 */
function initWebGL(canvas) {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return null;
    }
    return gl;
}

/**
 * Create and compile a shader
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {string} source - The shader source code
 * @param {number} type - The shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @returns {WebGLShader|null} The compiled shader or null if failed
 */
function createShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

/**
 * Create a shader program from vertex and fragment shaders
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {string} vertexSource - Vertex shader source
 * @param {string} fragmentSource - Fragment shader source
 * @returns {WebGLProgram|null} The shader program or null if failed
 */
function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) {
        return null;
    }
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    
    return program;
}

/**
 * Resize canvas to match display size
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {boolean} True if canvas was resized
 */
function resizeCanvas(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        return true;
    }
    
    return false;
}
