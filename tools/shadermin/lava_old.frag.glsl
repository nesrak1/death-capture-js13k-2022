#version 300 es

uniform sampler2D shadowTex;
uniform highp vec3 lightPos;
uniform highp float itime;
in highp vec3 var_position;
in highp vec3 var_fragPos;
in highp vec4 var_fragPosLight;
in highp vec3 var_normal;
layout (location = 0) out highp vec4 FragColor;

highp float random(highp vec2 uv, highp float seed) {
    uv = uv * fract(uv + seed);
    return (fract(sin(dot(uv, vec2(15.8989, 76.132) * 1.0f)) * 46336.23745));
}

const highp float PI = 3.141;
const highp vec2 RESOLUTION = vec2(512.0, 512.0);

highp float getMip(highp vec2 uv, highp vec2 offset, highp float size, highp float globalTime) {
    highp vec2 uvlocal = trunc((uv.xy / size) + offset) * size;
    
    uvlocal.xy /= RESOLUTION;
    
    //next mip
    
    highp float time = globalTime + 4.0*PI;
    
    highp float timetrunc = trunc(time / (2.0 * PI));
    highp float timetrunc2 = trunc((time + PI) / (2.0 * PI)) - PI;
    
    highp float rand1 = random(uvlocal, timetrunc);
    highp float rand2 = random(uvlocal, timetrunc2);
    
    return mix(rand2, rand1, 1.0 - (cos(time)+1.0)/2.0 );
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
	for (int x = -4; x <= 4; ++x)
	{
		for (int y = -4; y <= 4; ++y)
		{
			highp float pcfDepth = texture(shadowTex, projCoords.xy + vec2(x, y) * texelSize).r;
			shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
		}
	}
	shadow /= 81.0;
	
	// keep the shadow at 0.0 when outside the far_plane region of the light's frustum.
	if (projCoords.z > 1.0)
		shadow = 0.0;
		
	return shadow;
}

void main() {
    highp vec2 randsmall1 = vec2(random(var_position.xz / RESOLUTION, 1.0), random(1.0-(var_position.xz / RESOLUTION), 0.5)) * 2.0 - 1.0;
    highp vec2 randsmall2 = vec2(random(var_position.xz / RESOLUTION, randsmall1.x), random(1.0-(var_position.xz / RESOLUTION), randsmall1.y)) * 2.0 - 1.0;
    
    highp vec2 randsmall = mix(randsmall1, randsmall2, (sin(itime)+1.0)/2.0);
    
    highp float rand2 = getMip(var_position.xz, randsmall, 8.0, itime * 2.0);
    highp float rand3 = getMip(var_position.xz, randsmall, 16.0, itime * 2.1);
    highp float rand4 = getMip(var_position.xz, randsmall, 32.0, itime);
    
    highp float rand = rand2+rand3+rand4;
    rand /= 3.0;
    
    rand = 1.0-rand;
    rand = pow(rand,1.5);
    rand = 1.0-rand;

    highp vec3 col; 
    
    if (rand <= 0.5) {
        col = mix(vec3(1,1,0), vec3(1,0,0), rand * 2.0);
    } else {
        col = mix(vec3(1,0,0), vec3(0,0,0), (rand - 0.5) * 2.0);
    }

    col *= ((1.0 - ShadowCalculation(var_fragPosLight)*0.3));
    FragColor = vec4(col, 1.0);
}