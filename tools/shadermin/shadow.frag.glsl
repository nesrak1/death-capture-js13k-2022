#version 300 es

highp float near = 0.1;
highp float far  = 10.0;

highp float LinearizeDepth(highp float depth) {
    highp float z = depth * 2.0 - 1.0;
    return (2.0 * near * far) / (far + near - z * (far - near));
}

void main() {
    gl_FragDepth = gl_FragCoord.z;
}