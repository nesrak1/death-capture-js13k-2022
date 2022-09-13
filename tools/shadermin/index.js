import { spglslAngleCompile } from "spglsl";
import * as fs from "fs";

async function compileFile(file) {
  if (!file.endsWith(".vert.glsl") && !file.endsWith(".frag.glsl")) {
    throw new Error("file must end with .vert.glsl or .frag.glsl.");
  }

  const result = await spglslAngleCompile({
    mainFilePath: file,
    mainSourceCode: fs.readFileSync(file, "utf8"),
    compileMode: "Compile",
    language: file.endsWith(".vert.glsl") ? "Vertex" : "Fragment",

    minify: true,

    // Mangle everything, except uniforms and globals, "main" and function starting with "main"
    mangle: true,

    //// Map of global variables to rename
    //mangle_global_map: {
    //  my_uniform_to_rename: "x",
    //  my_fragment_input_to_rename: "y",
    //},
  });

  if (!result.valid) {
    console.log(result.infoLog);
    throw new Error("compilation failed");
  }

  // Prints all the uniform used, key is the original uniform name and value is the renamed uniform, if it was defined in mangle_global_map
  //console.log(result.uniforms);

  // Prints all the globals used, key is the original variable name and value is the renamed uniform, if it was defined in mangle_global_map
  // Globals are varying, vertex and fragment input, outputs and buffers ...
  // Globals do not include uniforms.
  //console.log(result.globals);

  return result.output;
}

compileFile(process.argv[2]).then(p =>
{
  console.log(p.replace("\n","\\n"));
});