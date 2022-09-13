var tmp = null; //stupid javascript
var shaderHouse;
var activeShader = undefined;

function loadShaders() {
shaderHouse = {
	main3d: {
		prog: tmp = loadShaderProg(
			"#version 300 es\nin vec3 in_position,in_normal,in_color;uniform mat4 model,view,proj,lightMatrix;uniform vec3 lightPos;out vec4 var_color;out vec3 var_light,var_fragPos;out vec4 var_fragPosLight;out vec3 var_normal;void main(){gl_Position=proj*view*model*vec4(in_position,1.);vec3 ambience=vec3(.2),sunColor=vec3(1.6),sunDir=normalize(lightPos);vec4 norm=vec4(in_normal,1.);float lightVal=max(dot(mat3(model)*norm.xyz,sunDir),0.);var_color=vec4(in_color,1.);var_light=ambience+sunColor*lightVal;var_fragPos=vec3(model*vec4(in_position,1.));var_fragPosLight=lightMatrix*vec4(var_fragPos,1.);var_normal=transpose(inverse(mat3(model)))*in_normal;}",
			"#version 300 es\nprecision highp float;uniform lowp sampler2D shadowTex,tex;uniform float useTex;uniform vec3 lightPos;in vec4 var_color;in vec3 var_light,var_fragPos;in vec4 var_fragPosLight;in vec3 var_normal;layout(location=0)out vec4 FragColor;float ShadowCalculation(vec4 fragPosLightSpace){vec3 projCoords=fragPosLightSpace.xyz/fragPosLightSpace.w;projCoords=projCoords*.5+.5;float closestDepth=texture(shadowTex,projCoords.xy).x,currentDepth=projCoords.z;vec3 normal=normalize(var_normal),lightDir=normalize(lightPos-var_fragPos);float bias=max(.001*(1.-dot(normal,lightDir)),5e-4),shadow=0.;vec2 texelSize=1./vec2(textureSize(shadowTex,0));for(int x=-1;x<=1;++x)for(int y=-1;y<=1;++y){float pcfDepth=texture(shadowTex,projCoords.xy+vec2(x,y)*texelSize).x;shadow+=currentDepth-bias>pcfDepth?1.:0.;}shadow/=9.;if(projCoords.z>1.)shadow=0.;return shadow;}void main(){float shadow=ShadowCalculation(var_fragPosLight);vec4 trueColor;if(useTex>.5)trueColor=texture(tex,vec2(var_color.xy))*3.;else trueColor=var_color;if(trueColor.w<.1)discard;FragColor=vec4(vec3(trueColor.xyz*var_light)*(1.-shadow*.3),trueColor.w);}",
		),
		in_position: gl.getAttribLocation(tmp, "in_position"),
		in_normal: gl.getAttribLocation(tmp, "in_normal"),
		in_color: gl.getAttribLocation(tmp, "in_color"),
		model: gl.getUniformLocation(tmp, "model"),
		view: gl.getUniformLocation(tmp, "view"),
		proj: gl.getUniformLocation(tmp, "proj"),
		lightMatrix: gl.getUniformLocation(tmp, "lightMatrix"),
		shadowTex: gl.getUniformLocation(tmp, "shadowTex"),
		tex: gl.getUniformLocation(tmp, "tex"),
		lightPos: gl.getUniformLocation(tmp, "lightPos"),
		useTex: gl.getUniformLocation(tmp, "useTex"),
		//var_color: gl.getUniformLocation(tmp, "var_color"),
		//var_light: gl.getUniformLocation(tmp, "var_light"),
		draw: (shdr, info, obj) => {
			if (activeShader != shdr.prog) {
				gl.useProgram(shdr.prog);
				activeShader = shdr.prog;
			}

			gl.activeTexture(GL_TEXTURE0);
			gl.bindTexture(GL_TEXTURE_2D, depthMapTex);
			gl.uniform1i(shdr.tex, 0);

			gl.uniform3fv(shdr.lightPos, Float32Array.of(lightTfm[0],lightTfm[1],lightTfm[2]));
			gl.uniformMatrix4fv(shdr.lightMatrix, false, lightMat);

			if (obj.tex != undefined) {
				gl.activeTexture(GL_TEXTURE1);
				gl.bindTexture(GL_TEXTURE_2D, obj.tex);
				gl.uniform1f(shdr.useTex, 1);
				gl.uniform1i(shdr.tex, 1);
			} else {
				gl.uniform1f(shdr.useTex, 0);
				//use the shadow texture lol (prevents from having to create dummy texture)
				//there's gotta be another way but whatever works right
				gl.uniform1i(shdr.tex, 0);
			}
	
			enableBuffer(shdr.in_position, obj.pos, 3);
			gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, obj.idx);
			enableBuffer(shdr.in_normal, obj.nrm, 3);
			enableBuffer(shdr.in_color, obj.col, 4);
			
			gl.uniformMatrix4fv(shdr.model, false, info.mm);
			gl.uniformMatrix4fv(shdr.view, false, info.vm);
			if (keysDown[70]) //debug
				gl.uniformMatrix4fv(shdr.proj, false, new Float32Array(orthoProjection(-shadowFov, shadowFov, -shadowFov, shadowFov)));
			else
				gl.uniformMatrix4fv(shdr.proj, false, info.proj);
		
			gl.drawElements(GL_TRIANGLES, obj.ict, GL_UNSIGNED_INT, 0);
		}
	},
	shadow: {
		prog: tmp = loadShaderProg(
			"#version 300 es\nin vec3 in_position,in_normal,in_color;uniform mat4 model,view,proj;void main(){gl_Position=proj*view*model*vec4(in_position,1.);}",
			"#version 300 es\nhighp float near=.1,far=10.;void main(){gl_FragDepth=gl_FragCoord.z;}"
		),
		in_position: gl.getAttribLocation(tmp, "in_position"),
		model: gl.getUniformLocation(tmp, "model"),
		view: gl.getUniformLocation(tmp, "view"),
		proj: gl.getUniformLocation(tmp, "proj"),
		draw: (shdr, info, obj) => {
			enableBuffer(shdr.in_position, obj.pos, 3);
			gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, obj.idx);
			
			gl.uniformMatrix4fv(shdr.model, false, info.mm);
			gl.uniformMatrix4fv(shdr.view, false, shadowVm);
			gl.uniformMatrix4fv(shdr.proj, false, shadowProj);
			
			gl.drawElements(GL_TRIANGLES, obj.ict, GL_UNSIGNED_INT, 0);
		}
	},
	lava: {
		prog: tmp = loadShaderProg(
			"#version 300 es\nin vec3 in_position,in_normal;uniform mat4 model,view,proj,lightMatrix;out vec3 var_position,var_fragPos;out vec4 var_fragPosLight;out vec3 var_normal;void main(){gl_Position=proj*view*model*vec4(in_position,1.);var_position=(vec3(in_position)+vec3(model[3][0],model[3][1],model[3][2]))*32.;var_fragPos=vec3(model*vec4(in_position,1.));var_fragPosLight=lightMatrix*vec4(var_fragPos,1.);var_normal=transpose(inverse(mat3(model)))*in_normal;}",
			"#version 300 es\nprecision highp float;uniform lowp sampler2D shadowTex;uniform vec3 lightPos;uniform float itime;in vec3 var_position,var_fragPos;in vec4 var_fragPosLight;in vec3 var_normal;layout(location=0)out vec4 FragColor;vec2 random2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.547);}float noise(vec2 st){vec2 i=floor(st),f=fract(st),u=f*f*(3.-2.*f);return mix(mix(dot(random2(i+vec2(0)),f-vec2(0)),dot(random2(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(random2(i+vec2(0,1)),f-vec2(0,1)),dot(random2(i+vec2(1)),f-vec2(1)),u.x),u.y);}vec3 magmaFunc(vec3 color,vec2 uv,float detail,float power,float colorMul,float glowRate,bool animate,float noiseAmount){vec3 rockColor=vec3(.09+abs(sin(itime*.75))*.03,.02,0.);float minDistance=1.;uv*=detail;vec2 cell=floor(uv),frac=fract(uv);for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){vec2 cellDir=vec2(float(i),float(j)),randPoint=random2(cell+cellDir);randPoint+=noise(uv)*noiseAmount;randPoint=animate?.5+.5*sin(itime*.35+6.2831*randPoint):randPoint;minDistance=min(minDistance,length(cellDir+randPoint-frac));}float powAdd=sin(uv.x*2.+itime*glowRate)+sin(uv.y*2.+itime*glowRate);vec3 outColor=vec3(color*pow(minDistance,power+powAdd*.95)*colorMul);outColor=mix(rockColor,outColor,minDistance);return outColor;}float ShadowCalculation(vec4 fragPosLightSpace){vec3 projCoords=fragPosLightSpace.xyz/fragPosLightSpace.w;projCoords=projCoords*.5+.5;float closestDepth=texture(shadowTex,projCoords.xy).x,currentDepth=projCoords.z;vec3 normal=normalize(var_normal),lightDir=normalize(lightPos-var_fragPos);float bias=max(.001*(1.-dot(normal,lightDir)),5e-4),shadow=0.;vec2 texelSize=1./vec2(textureSize(shadowTex,0));for(int x=-1;x<=1;++x)for(int y=-1;y<=1;++y){float pcfDepth=texture(shadowTex,projCoords.xy+vec2(x,y)*texelSize).x;shadow+=currentDepth-bias>pcfDepth?1.:0.;}shadow/=9.;if(projCoords.z>1.)shadow=0.;return shadow;}float getRiverXPos(float x){float riveriscale=5.;return sin(x/30./riveriscale)*cos(x/12./riveriscale)*cos(x/29./riveriscale)*cos(x/43./riveriscale);}float getRiverDir(float x){float xPos1=getRiverXPos(x*10.)*15.,xPos2=getRiverXPos(x*10.+.01)*15.;return atan(.01,(xPos2-xPos1)*9.);}void main(){vec2 uv=var_position.xz/vec2(128)*4.;uv=floor(vec2(mod(uv.x,5e2),uv.y)*30.)/30.;float riverDir=1.5705-getRiverDir(uv.x)*.5;uv.x+=mod(itime,69.102)*-.1*cos(riverDir);uv.y+=mod(itime,69.102)*-.1*sin(riverDir);vec4 col=vec4(0);col.xyz+=magmaFunc(vec3(1.5,.4,0),uv,3.,2.5,1.15,1.5,false,1.5);col.xyz+=magmaFunc(vec3(1.5,0,0),uv,6.,3.,.9,1.,false,0.);col.xyz+=magmaFunc(vec3(1.2,.2,0),uv,8.,4.,.4,1.9,true,.5);col*=1.-ShadowCalculation(var_fragPosLight)*.6;col.w=1.;FragColor=col;}"
		),
		in_position: gl.getAttribLocation(tmp, "in_position"),
		in_normal: gl.getAttribLocation(tmp, "in_normal"),
		model: gl.getUniformLocation(tmp, "model"),
		view: gl.getUniformLocation(tmp, "view"),
		proj: gl.getUniformLocation(tmp, "proj"),
		lightMatrix: gl.getUniformLocation(tmp, "lightMatrix"),
		itime: gl.getUniformLocation(tmp, "itime"),
		lightPos: gl.getUniformLocation(tmp, "lightPos"),
		shadowTex: gl.getUniformLocation(tmp, "shadowTex"),
		draw: (shdr, info, obj) => {
			if (activeShader != shdr.prog) {
				gl.useProgram(shdr.prog);
				activeShader = shdr.prog;
			}

			enableBuffer(shdr.in_position, obj.pos, 3);
			gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, obj.idx);
			enableBuffer(shdr.in_normal, obj.nrm, 3);

			gl.uniform3fv(shdr.lightPos, Float32Array.of(lightTfm[0],lightTfm[1],lightTfm[2]));
			gl.uniformMatrix4fv(shdr.lightMatrix, false, lightMat);
			
			gl.uniformMatrix4fv(shdr.model, false, info.mm);
			gl.uniformMatrix4fv(shdr.view, false, info.vm);
			gl.uniformMatrix4fv(shdr.proj, false, info.proj);
			gl.uniform1f(shdr.itime, info.time);
			
			gl.drawElements(GL_TRIANGLES, obj.ict, GL_UNSIGNED_INT, 0);
		}
	}
};
}