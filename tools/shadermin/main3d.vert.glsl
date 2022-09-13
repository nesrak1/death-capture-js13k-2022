#version 300 es

in vec3 in_position, in_normal, in_color;
uniform mat4 model, view, proj;
uniform mat4 lightMatrix;
uniform highp vec3 lightPos;
out highp vec4 var_color;
out highp vec3 var_light;
out highp vec3 var_fragPos;
out highp vec4 var_fragPosLight;
out highp vec3 var_normal;

void main() {
    //highp vec4 mp = model * vec4(in_position, 1.);
    //mp.x = round(mp.x * 400.0) / 400.0;
    //mp.y = round(mp.y * 400.0) / 400.0;
    //mp.z = round(mp.z * 400.0) / 400.0;
    //gl_Position = proj * view * mp;
    
    gl_Position = proj * view * model * vec4(in_position, 1.);
    
    highp vec3 ambience = vec3(0.2, 0.2, 0.2);
    highp vec3 sunColor = vec3(1.6, 1.6, 1.6);
    //highp vec3 sunDir = normalize(vec3(-0.843,0.414,0.642));
    highp vec3 sunDir = normalize(lightPos);
    highp vec4 norm = vec4(in_normal, 1.0);
    highp float lightVal = max(dot(mat3(model) * norm.xyz, sunDir), 0.0);
    var_color = vec4(in_color, 1.);
    var_light = ambience + (sunColor * lightVal);
    var_fragPos = vec3(model * vec4(in_position, 1.0));
    var_fragPosLight = lightMatrix * vec4(var_fragPos, 1.0);
    var_normal = transpose(inverse(mat3(model))) * in_normal;
}