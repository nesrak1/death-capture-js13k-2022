#version 300 es

in vec3 in_position, in_normal, in_color;
uniform mat4 model, view, proj;

void main() {
    gl_Position = proj * view * model * vec4(in_position, 1.);
}