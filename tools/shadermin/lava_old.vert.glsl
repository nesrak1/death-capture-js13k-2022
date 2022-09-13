#version 300 es

in vec3 in_position, in_normal;
uniform mat4 model, view, proj;
uniform mat4 lightMatrix;
out highp vec3 var_position;
out highp vec3 var_fragPos;
out highp vec4 var_fragPosLight;
out highp vec3 var_normal;

void main() {
    gl_Position = proj * view * model * vec4(in_position, 1.);
    // calculates "world position" so that lava is always connected between chunks
    var_position = (vec3(in_position) + vec3(model[3][0], model[3][1], model[3][2])) * 32.0;
    var_fragPos = vec3(model * vec4(in_position, 1.0));
    var_fragPosLight = lightMatrix * vec4(var_fragPos, 1.0);
    var_normal = transpose(inverse(mat3(model))) * in_normal;
}