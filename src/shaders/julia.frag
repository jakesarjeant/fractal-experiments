precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 c;
uniform int steps;

#define cx_mul(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define MAX_ITERATIONS 500
#define pi 3.141592653589793

// https://github.com/nathansolomon1678/nathansolomon1678.github.io/blob/9547391a0482a91e6c306d9678ab4652936d737c/fractals/index.html#L221C1-L233C6
float cubic_interpolation(float a, float b, float c, float d, float x) {
  // Returns f(x), where f is a cubic function, f(-1)=a, f(0)=b, f(1)=c, & f(2)=d
  return b +
         x * (.5 * c - .5 * a) +
         x * x * (a - 2.5 * b + 2. * c - .5 * d) +
         x * x * x * (-.5 * a + 1.5 * b - 1.5 * c + .5 * d);
}

// 
vec3 mix_cubic(vec3 color0, vec3 color1, vec3 color2, vec3 color3, float x) {
  return vec3(cubic_interpolation(color0.r, color1.r, color2.r, color3.r, x),
              cubic_interpolation(color0.g, color1.g, color2.g, color3.g, x),
              cubic_interpolation(color0.b, color1.b, color2.b, color3.b, x));
}

// https://github.com/nathansolomon1678/nathansolomon1678.github.io/blob/9547391a0482a91e6c306d9678ab4652936d737c/fractals/index.html#L236
vec3 classic_colorscheme(float x) {
  x *= pi * 2.;
  return vec3(.5 + sin(x     ) / 2.,
              .5 + sin(x + 1.) / 2.,
              .5 + sin(x + 2.) / 2.);
}

vec3 sherbet_colorscheme(float x) {
  vec3 grape   = vec3(.43, .08, .74);
  vec3 magenta = vec3(.55, .25, .40);
  vec3 peach   = vec3(.91, .64, .48);
  vec3 blue    = vec3(.36, .51, .55);
  vec3 green   = vec3(.12, .25, .26);
  x = fract(x) * 5.;
       if (x < 1.) { return mix_cubic(grape  , magenta,   peach,    blue, fract(x)); }
  else if (x < 2.) { return mix_cubic(magenta, peach  ,    blue,   green, fract(x)); }
  else if (x < 3.) { return mix_cubic(peach  , blue   ,   green,   grape, fract(x)); }
  else if (x < 4.) { return mix_cubic(blue   , green  ,   grape, magenta, fract(x)); }
  else if (x < 5.) { return mix_cubic(green  , grape  , magenta,   peach, fract(x)); }
  else             { return magenta; }
}

vec3 rachels_colorscheme(float x) {
  vec3 maroon = vec3(.2, .0, .1);
  vec3 orange = vec3(1., .5, .1);
  vec3 purple = vec3(.1, 0., .3);
  vec3 white  = vec3(1., 1., 1.);
  x = fract(x) * 4.;
       if (x < 1.) { return mix_cubic(purple, maroon, orange, white , fract(x)); }
  else if (x < 2.) { return mix_cubic(maroon, orange, white , purple, fract(x)); }
  else if (x < 3.) { return mix_cubic(orange, white , purple, maroon, fract(x)); }
  else if (x < 4.) { return mix_cubic(white , purple, maroon, orange, fract(x)); }
  else             { return maroon; }
}


void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  // Normalize pixel coordinates (from 0 to 1)
  vec2 uv = fragCoord / iResolution.xy;
  uv -= 0.5;
  uv.x *= iResolution.x / iResolution.y;
  
  // Zoom out
  uv *= 3.;

  vec3 color = vec3(0.);
  
  // INIT JULIA
  float speed = 1./2.;
  float offset = 1.22;
  float ring = 1.1;
  // vec2 c = vec2(ring*cos(offset+(iTime)*speed), ring*sin(offset+(iTime)*speed));
  // vec2 c = vec2(0.28, 0.4);
  vec2 z = uv;

  int j = 0;
  for (int i = 0; i < MAX_ITERATIONS; i++) {
    if (i >= steps) {
      break;
    }
    // STEP JULIA
    z = cx_mul(z, z) + c;

    // STEP SHIP
    // z = vec2((z.x*z.x)-(z.y*z.y)-uv.x, 2.0*abs(z.x*z.y)-uv.y);
    // z = -cx_mul(abs(z), abs(z)) + c;
    if (length(z) > 2.0) {
      j = i;
      break;
    }
  }

  color = rachels_colorscheme(float(j)/float(steps));
  fragColor = vec4(color, 1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
