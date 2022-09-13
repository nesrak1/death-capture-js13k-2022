#version 300 es

uniform sampler2D shadowTex;
uniform sampler2D tex;
uniform highp float useTex; 
uniform highp vec3 lightPos;
in highp vec4 var_color;
in highp vec3 var_light;
in highp vec3 var_fragPos;
in highp vec4 var_fragPosLight;
in highp vec3 var_normal;
layout (location = 0) out highp vec4 FragColor;

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

void main() {
    highp float shadow = ShadowCalculation(var_fragPosLight);
    highp vec4 trueColor;

    if (useTex > 0.5)
        trueColor = texture(tex, vec2(var_color.rg)) * 4.0;
    else
        trueColor = var_color;

    if (trueColor.a < 0.1)
        discard;

    FragColor = vec4(vec3(trueColor.rgb * var_light) * ((1.0 - shadow*0.3)), trueColor.a);
}