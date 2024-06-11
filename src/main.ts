import { GUI } from "dat.gui";
import frag from "./shaders/julia.frag";
import vert from "./shaders/julia.vert";

const gui = new GUI();
const julia_set_folder = gui.addFolder("Julia Set");
let c = {
  x: 0.28,
  y: 0.4,
};
julia_set_folder.add(c, "x", 0, 1, 0.01);
julia_set_folder.add(c, "y", 0, 1, 0.01);
julia_set_folder.open();
const rendering_folder = gui.addFolder("rendering");
let rendering = { steps: 30 };
rendering_folder.add(rendering, "steps", 1, 500);

const $ = document.querySelectorAll.bind(document);

const canvas: HTMLCanvasElement = $("canvas")[0];
const gl: WebGLRenderingContext =
  canvas.getContext("webgl", { preserveDrawingBuffer: true })! ||
  canvas.getContext("experimental-webgl")!;

$("body > button")[0].addEventListener("click", () => {
  let url = canvas.toDataURL("image/png");
  window.open(url, "_blank")!.focus();
});

if (!gl) {
  document.write(
    "Unable to initialize WebGL. Your browser may not support it.",
  );
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      "Shader compilation failed: " + gl.getShaderInfoLog(shader),
    );
  }
  return shader;
}

const juliaProgram = (() => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vert);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, frag);

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      "Unable to linke shader program: " + gl.getProgramInfoLog(program),
    );
  }

  return program;
})();

function setupProgram(gl: WebGLRenderingContext, program: WebGLProgram) {
  gl.useProgram(program);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]),
    gl.STATIC_DRAW,
  );

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
  const iTimeLocation = gl.getUniformLocation(program, "iTime");
  const cLocation = gl.getUniformLocation(program, "c");
  const steps = gl.getUniformLocation(program, "steps");

  return [iResolutionLocation, iTimeLocation, cLocation, steps];
}

const [iResolutionLocation, iTimeLocation, cLocation, steps] = setupProgram(
  gl,
  juliaProgram,
);

function update(time: number) {}

function render(time: number) {
  update(time);

  gl.uniform2f(iResolutionLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(cLocation, c.x, c.y);
  gl.uniform1f(iTimeLocation, time * 0.001);
  gl.uniform1i(steps, rendering.steps);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

function resizeCanvas() {
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  gl.viewport(0, 0, gl.canvas.width * dpr, gl.canvas.height * dpr);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
