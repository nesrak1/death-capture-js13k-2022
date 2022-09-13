#version 300 es
 
uniform sampler2D shadowTex;
uniform highp vec3 lightPos;
uniform highp float itime;
in highp vec3 var_position;
in highp vec3 var_fragPos;
in highp vec4 var_fragPosLight;
in highp vec3 var_normal;
layout (location = 0) out highp vec4 FragColor;

const highp float PI = 3.141;
const highp vec2 RESOLUTION = vec2(128.0, 128.0);

// random2 function by Patricio Gonzalez
highp vec2 random2(highp vec2 p) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

// Value Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
highp float noise(highp vec2 st) {
    highp vec2 i = floor(st);
    highp vec2 f = fract(st);

    highp vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                        dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                        dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

highp vec3 magmaFunc(highp vec3 color, highp vec2 uv, highp float detail, highp float power,
    highp float colorMul, highp float glowRate, bool animate, highp float noiseAmount)
{
    highp vec3 rockColor = vec3(0.09 + abs(sin(itime * .75)) * .03, 0.02, .0);
    highp float minDistance = 1.;
    uv *= detail;
    
    highp vec2 cell = floor(uv);
    highp vec2 frac = fract(uv);
    
    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            highp vec2 cellDir = vec2(float(i), float(j));
            highp vec2 randPoint = random2(cell + cellDir);
            randPoint += noise(uv) * noiseAmount;
            randPoint = animate ? 0.5 + 0.5 * sin(itime * .35 + 6.2831 * randPoint) : randPoint;
            minDistance = min(minDistance, length(cellDir + randPoint - frac));
        }
    }
        
    highp float powAdd = sin(uv.x * 2. + itime * glowRate) + sin(uv.y * 2. + itime * glowRate);
    highp vec3 outColor = vec3(color * pow(minDistance, power + powAdd * .95) * colorMul);
    outColor.rgb = mix(rockColor, outColor.rgb, minDistance);
    return outColor;
}
            
highp float ShadowCalculation(highp vec4 fragPosLightSpace) {
    // perform perspective divide
    highp vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    highp float closestDepth = texture(shadowTex, projCoords.xy).r; 
    // get depth of current fragment from light's perspective
    highp float currentDepth = projCoords.z;
    // calculate bias (based on depth map resolution and slope)
    highp vec3 normal = normalize(var_normal);
    highp vec3 lightDir = normalize(lightPos - var_fragPos);
    highp float bias = max(0.001 * (1.0 - dot(normal, lightDir)), 0.0005);
    // check whether current frag pos is in shadow
    // float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
    // PCF
    highp float shadow = 0.0;
    highp vec2 texelSize = 1.0 / vec2(textureSize(shadowTex, 0));
    for (int x = -1; x <= 1; ++x)
    {
        for (int y = -1; y <= 1; ++y)
        {
            highp float pcfDepth = texture(shadowTex, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;
    
    // keep the shadow at 0.0 when outside the far_plane region of the light's frustum.
    if (projCoords.z > 1.0)
        shadow = 0.0;
        
    return shadow;
}

highp float getRiverXPos(highp float x) {
    highp float riveriscale = 5.;
    return sin(x/30./riveriscale)*cos(x/12./riveriscale)*cos(x/29./riveriscale)*cos(x/43./riveriscale);
}

highp float getRiverDir(highp float x) {
    highp float xPos1 = getRiverXPos(x*10.)*15.;
    highp float xPos2 = getRiverXPos(x*10.+0.01)*15.;
    return atan(0.01, (xPos2-xPos1)*9.);
}

void main() {
    // https://www.shadertoy.com/view/4lXfR7
    highp vec2 uv = var_position.xz / RESOLUTION * 4.;
    
    // btw: we mod with 500 because... float precision ig?
    // after a certain distance the lava gets really broken
    uv = floor(vec2(mod(uv.x, 500.), uv.y) * 30.) / 30.; // "pixelate" lava
    highp float riverDir = PI/2. - getRiverDir(uv.x)*.5;
    // as time goes on, this gets more broken as well
    // so mod this too?? I don't have enough time to fix this
    uv.x += mod(itime, PI*22.) * -.1 * cos(riverDir);
    uv.y += mod(itime, PI*22.) * -.1 * sin(riverDir);
    highp vec4 col = vec4(0.);
    col.rgb += magmaFunc(vec3(1.5, .4, 0.), uv, 3., 2.5, 1.15, 1.5, false, 1.5);
    col.rgb += magmaFunc(vec3(1.5, 0., 0.), uv, 6., 3., .9, 1., false, 0.);
    col.rgb += magmaFunc(vec3(1.2, .2, 0.), uv, 8., 4., .4, 1.9, true, 0.5);
    
    col *= ((1.0 - ShadowCalculation(var_fragPosLight)*0.6));
    col.a = 1.0;
    FragColor = col;
}