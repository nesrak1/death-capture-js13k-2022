var aa="#000000ff #1c2b53ff #7f2454ff #008751ff #ab5236ff #60584fff #c3c3c6ff #fff1e9ff #ed1b51ff #faa21bff #f7ec2fff #5dbb4dff #51a6dcff #83769cff #00000000 #fcccabff".split(" ");function ba(a){a=ca(a,16,16);return da(a,16,16)}function da(a,b,c){var f=e.createTexture();e.bindTexture(3553,f);e.texImage2D(3553,0,6408,4*b,4*c,0,6408,5121,ea(a,b,c));e.texParameteri(3553,10240,9728);e.texParameteri(3553,10241,9728);return f}function ea(a,b,c){var f=document.createElement("canvas");f.width=4*b;f.height=4*c;f=[f,f.getContext("2d")];var d=f[1];a=fa(a,b,c);a=fa(a,2*b,2*c);for(var m=0;m<4*c;m++)for(var q=0;q<4*b;q++)d.fillStyle=aa[a[q+m*b*4]],d.fillRect(q,m,1,1);return f[0]}function ca(a,b,c){ha=a;ia=0;ja=1;a=x(2)+1;var f=[];b=Array(b*c);for(c=0;c<2**a;c++)f[c]=x(4);for(c=0;c<b.length;c++)b[c]=f[x(a)];return b}function fa(a,b,c){for(var f=[],d=[],m=0;m<c;m++)f.push(a.slice(m*b,(m+1)*b)),d.push(Array(2*b).fill(0)),d.push(Array(2*b).fill(0));a=-1;for(var q=m=0;q<c;q++){for(var p=f[a+(0==q?1:0)],u=f[a+1],t=f[a+(q==c-1?-1:0)+2],r=d[m],h=d[m+1],k=b,n=0;n<k;n++){var l=0==n?0:-1,g=n==k-1?0:1,v=n,w=2*n,E=p[v],z=u[v],A=t[v];E!=A&&u[v+l]!=u[v+g]?(r[w]=u[v+l]==E?E:z,r[w+1]=u[v+g]==E?E:z,h[w]=u[v+l]==A?A:z,h[w+1]=u[v+g]==A?A:z):(r[w]=z,r[w+1]=z,h[w]=z,h[w+1]=z)}a++;m+=2}return d.flat()};var y=null,B,ka=void 0;function la(){B={j:{f:y=ma("#version 300 es\nin vec3 in_position,in_normal,in_color;uniform mat4 model,view,proj,lightMatrix;uniform vec3 lightPos;out vec4 var_color;out vec3 var_light,var_fragPos;out vec4 var_fragPosLight;out vec3 var_normal;void main(){gl_Position=proj*view*model*vec4(in_position,1.);vec3 ambience=vec3(.2),sunColor=vec3(1.6),sunDir=normalize(lightPos);vec4 norm=vec4(in_normal,1.);float lightVal=max(dot(mat3(model)*norm.xyz,sunDir),0.);var_color=vec4(in_color,1.);var_light=ambience+sunColor*lightVal;var_fragPos=vec3(model*vec4(in_position,1.));var_fragPosLight=lightMatrix*vec4(var_fragPos,1.);var_normal=transpose(inverse(mat3(model)))*in_normal;}","#version 300 es\nprecision highp float;uniform lowp sampler2D shadowTex,tex;uniform float useTex;uniform vec3 lightPos;in vec4 var_color;in vec3 var_light,var_fragPos;in vec4 var_fragPosLight;in vec3 var_normal;layout(location=0)out vec4 FragColor;float ShadowCalculation(vec4 fragPosLightSpace){vec3 projCoords=fragPosLightSpace.xyz/fragPosLightSpace.w;projCoords=projCoords*.5+.5;float closestDepth=texture(shadowTex,projCoords.xy).x,currentDepth=projCoords.z;vec3 normal=normalize(var_normal),lightDir=normalize(lightPos-var_fragPos);float bias=max(.001*(1.-dot(normal,lightDir)),5e-4),shadow=0.;vec2 texelSize=1./vec2(textureSize(shadowTex,0));for(int x=-1;x<=1;++x)for(int y=-1;y<=1;++y){float pcfDepth=texture(shadowTex,projCoords.xy+vec2(x,y)*texelSize).x;shadow+=currentDepth-bias>pcfDepth?1.:0.;}shadow/=9.;if(projCoords.z>1.)shadow=0.;return shadow;}void main(){float shadow=ShadowCalculation(var_fragPosLight);vec4 trueColor;if(useTex>.5)trueColor=texture(tex,vec2(var_color.xy))*3.;else trueColor=var_color;if(trueColor.w<.1)discard;FragColor=vec4(vec3(trueColor.xyz*var_light)*(1.-shadow*.3),trueColor.w);}"),u:e.getAttribLocation(y,"in_position"),F:e.getAttribLocation(y,"in_normal"),S:e.getAttribLocation(y,"in_color"),model:e.getUniformLocation(y,"model"),view:e.getUniformLocation(y,"view"),g:e.getUniformLocation(y,"proj"),G:e.getUniformLocation(y,"lightMatrix"),M:e.getUniformLocation(y,"shadowTex"),c:e.getUniformLocation(y,"tex"),H:e.getUniformLocation(y,"lightPos"),O:e.getUniformLocation(y,"useTex"),B:(a,b,c)=>{ka!=a.f&&(e.useProgram(a.f),ka=a.f);e.activeTexture(33984);e.bindTexture(3553,na);e.uniform1i(a.c,0);e.uniform3fv(a.H,Float32Array.of(oa[0],oa[1],oa[2]));e.uniformMatrix4fv(a.G,!1,qa);void 0!=c.c?(e.activeTexture(33985),e.bindTexture(3553,c.c),e.uniform1f(a.O,1),e.uniform1i(a.c,1)):(e.uniform1f(a.O,0),e.uniform1i(a.c,0));ra(a.u,c.J,3);e.bindBuffer(34963,c.D);ra(a.F,c.L,3);ra(a.S,c.R,4);e.uniformMatrix4fv(a.model,!1,b.I);e.uniformMatrix4fv(a.view,!1,b.P);sa[70]?e.uniformMatrix4fv(a.g,!1,new Float32Array(ta())):e.uniformMatrix4fv(a.g,!1,b.g);e.drawElements(4,c.C,5125,0)}},A:{f:y=ma("#version 300 es\nin vec3 in_position,in_normal,in_color;uniform mat4 model,view,proj;void main(){gl_Position=proj*view*model*vec4(in_position,1.);}","#version 300 es\nhighp float near=.1,far=10.;void main(){gl_FragDepth=gl_FragCoord.z;}"),u:e.getAttribLocation(y,"in_position"),model:e.getUniformLocation(y,"model"),view:e.getUniformLocation(y,"view"),g:e.getUniformLocation(y,"proj"),B:(a,b,c)=>{ra(a.u,c.J,3);e.bindBuffer(34963,c.D);e.uniformMatrix4fv(a.model,!1,b.I);e.uniformMatrix4fv(a.view,!1,ua);e.uniformMatrix4fv(a.g,!1,va);e.drawElements(4,c.C,5125,0)}},U:{f:y=ma("#version 300 es\nin vec3 in_position,in_normal;uniform mat4 model,view,proj,lightMatrix;out vec3 var_position,var_fragPos;out vec4 var_fragPosLight;out vec3 var_normal;void main(){gl_Position=proj*view*model*vec4(in_position,1.);var_position=(vec3(in_position)+vec3(model[3][0],model[3][1],model[3][2]))*32.;var_fragPos=vec3(model*vec4(in_position,1.));var_fragPosLight=lightMatrix*vec4(var_fragPos,1.);var_normal=transpose(inverse(mat3(model)))*in_normal;}","#version 300 es\nprecision highp float;uniform lowp sampler2D shadowTex;uniform vec3 lightPos;uniform float itime;in vec3 var_position,var_fragPos;in vec4 var_fragPosLight;in vec3 var_normal;layout(location=0)out vec4 FragColor;vec2 random2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.547);}float noise(vec2 st){vec2 i=floor(st),f=fract(st),u=f*f*(3.-2.*f);return mix(mix(dot(random2(i+vec2(0)),f-vec2(0)),dot(random2(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(random2(i+vec2(0,1)),f-vec2(0,1)),dot(random2(i+vec2(1)),f-vec2(1)),u.x),u.y);}vec3 magmaFunc(vec3 color,vec2 uv,float detail,float power,float colorMul,float glowRate,bool animate,float noiseAmount){vec3 rockColor=vec3(.09+abs(sin(itime*.75))*.03,.02,0.);float minDistance=1.;uv*=detail;vec2 cell=floor(uv),frac=fract(uv);for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){vec2 cellDir=vec2(float(i),float(j)),randPoint=random2(cell+cellDir);randPoint+=noise(uv)*noiseAmount;randPoint=animate?.5+.5*sin(itime*.35+6.2831*randPoint):randPoint;minDistance=min(minDistance,length(cellDir+randPoint-frac));}float powAdd=sin(uv.x*2.+itime*glowRate)+sin(uv.y*2.+itime*glowRate);vec3 outColor=vec3(color*pow(minDistance,power+powAdd*.95)*colorMul);outColor=mix(rockColor,outColor,minDistance);return outColor;}float ShadowCalculation(vec4 fragPosLightSpace){vec3 projCoords=fragPosLightSpace.xyz/fragPosLightSpace.w;projCoords=projCoords*.5+.5;float closestDepth=texture(shadowTex,projCoords.xy).x,currentDepth=projCoords.z;vec3 normal=normalize(var_normal),lightDir=normalize(lightPos-var_fragPos);float bias=max(.001*(1.-dot(normal,lightDir)),5e-4),shadow=0.;vec2 texelSize=1./vec2(textureSize(shadowTex,0));for(int x=-1;x<=1;++x)for(int y=-1;y<=1;++y){float pcfDepth=texture(shadowTex,projCoords.xy+vec2(x,y)*texelSize).x;shadow+=currentDepth-bias>pcfDepth?1.:0.;}shadow/=9.;if(projCoords.z>1.)shadow=0.;return shadow;}float getRiverXPos(float x){float riveriscale=5.;return sin(x/30./riveriscale)*cos(x/12./riveriscale)*cos(x/29./riveriscale)*cos(x/43./riveriscale);}float getRiverDir(float x){float xPos1=getRiverXPos(x*10.)*15.,xPos2=getRiverXPos(x*10.+.01)*15.;return atan(.01,(xPos2-xPos1)*9.);}void main(){vec2 uv=var_position.xz/vec2(128)*4.;uv=floor(uv*30.)/30.;float riverDir=1.5705-getRiverDir(uv.x);uv.x+=itime*-.1*cos(riverDir);uv.y+=itime*-.1*sin(riverDir);vec4 col=vec4(0);col.xyz+=magmaFunc(vec3(1.5,.4,0),uv,3.,2.5,1.15,1.5,false,1.5);col.xyz+=magmaFunc(vec3(1.5,0,0),uv,6.,3.,.9,1.,false,0.);col.xyz+=magmaFunc(vec3(1.2,.2,0),uv,8.,4.,.4,1.9,true,.5);col*=1.-ShadowCalculation(var_fragPosLight)*.6;col.w=1.;FragColor=col;}"),u:e.getAttribLocation(y,"in_position"),F:e.getAttribLocation(y,"in_normal"),model:e.getUniformLocation(y,"model"),view:e.getUniformLocation(y,"view"),g:e.getUniformLocation(y,"proj"),G:e.getUniformLocation(y,"lightMatrix"),T:e.getUniformLocation(y,"itime"),H:e.getUniformLocation(y,"lightPos"),M:e.getUniformLocation(y,"shadowTex"),B:(a,b,c)=>{ka!=a.f&&(e.useProgram(a.f),ka=a.f);ra(a.u,c.J,3);e.bindBuffer(34963,c.D);ra(a.F,c.L,3);e.uniform3fv(a.H,Float32Array.of(oa[0],oa[1],oa[2]));e.uniformMatrix4fv(a.G,!1,qa);e.uniformMatrix4fv(a.model,!1,b.I);e.uniformMatrix4fv(a.view,!1,b.P);e.uniformMatrix4fv(a.g,!1,b.g);e.uniform1f(a.T,b.time);e.drawElements(4,c.C,5125,0)}}}};let wa=1234;function C(){let a=2**31-1;wa=16807*wa%a;return(wa-1)/(a-1)}function xa(a,b,c){return Math.min(Math.max(a,b),c)}function ya(a){return[-a[0],-a[1],-a[2]]}function za(a){return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2])}function Aa(a){var b=za(a);return 0<b?[a[0]/b,a[1]/b,a[2]/b]:[0,0,0]}function Ba(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]]}function Ca(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]]}function Da(a){return[a[12],a[13],a[14]]}function Ea(a,b){b=a.indexOf(b);-1!=b&&a.splice(b,1)};function Fa(){var a=["(",Ga.toString(),")()"];[D,Ca,Ba,ya,za,Aa,C].forEach(c=>{a=[c.toString()].concat(a)});var b=URL.createObjectURL(new Blob(a,{type:"application/javascript"}));return new Worker(b)};function Ga(){function a(q,p,u){for(var t=[],r=[],h=[],k=[],n=[],l=[],g=0;256>g;g++){for(var v=[],w=0;256>w;w++){var E=[];let K=g+q,P=w+p;for(var z=0;4>z;z++)for(var A=0;4>A;A++){var Q=b(4*K+z,4*P+A)/2+.5;u&&(Q*=.6*-(Math.E**-((Math.abs(P-(150*D(K)+128))/20)**3))+1);E.push(Q)}v.push(400*m(E))}l.push(v)}for(g=0;65536>g;g++)t.push(g%256/5,Math.max(0,l[g%256][Math.floor(g/256)]/5)/5,Math.floor(g/256)/5),h.push(97/255,16/255,16/255,1),k.push([0,0,0]),n.push(0);q=[];for(g=p=0;255>g;g++){for(w=0;255>w;w++)r.push(p,p+1,p+257),q.push([p,p+1,p+257]),r.push(p,p+257,p+256),q.push([p,p+257,p+256]),p++;p++}for(g=0;g<q.length;g++)w=3*q[g][0],p=3*q[g][1],u=3*q[g][2],v=[t[w],t[w+1],t[w+2]],l=Ca([t[p],t[p+1],t[p+2]],v),v=Ca([t[u],t[u+1],t[u+2]],v),l=Aa([l[1]*v[2]-l[2]*v[1],l[2]*v[0]-l[0]*v[2],l[0]*v[1]-l[1]*v[0]]),k[w/3]=Ba(k[w/3],l),k[p/3]=Ba(k[p/3],l),k[u/3]=Ba(k[u/3],l),n[w/3]++,n[p/3]++,n[u/3]++;for(g=0;g<k.length;g++)k[g]=ya(Aa(k[g]));k=k.flat(1);return{s:t,i:r,m:h,n:k}}function b(q,p){var u=d.size,t=Math.floor(q/u),r=Math.floor(p/u),h=d.v[t+";"+r];if(void 0===h){var k=d.v,n=d.size;h=Array(n);for(var l=0;l<n;l++)h[l]=Array(n);if(void 0!==k[t-1+";"+r]){var g=k[t-1+";"+r];for(l=0;l<n;l++)h[0][l]=g[n-1][l]}if(void 0!==k[t+1+";"+r])for(g=k[t+1+";"+r],l=0;l<n;l++)h[n-1][l]=g[0][l];if(void 0!==k[t+";"+(r-1)])for(g=k[t+";"+(r-1)],l=0;l<n;l++)h[l][0]=g[l][n-1];if(void 0!==k[t+";"+(r+1)])for(g=k[t+";"+(r+1)],l=0;l<n;l++)h[l][n-1]=g[l][0];void 0!==k[t-1+";"+(r-1)]&&(g=k[t-1+";"+(r-1)],h[0][0]=g[n-1][n-1]);void 0!==k[t+1+";"+(r-1)]&&(g=k[t+1+";"+(r-1)],h[n-1][0]=g[0][n-1]);void 0!==k[t-1+";"+(r+1)]&&(g=k[t-1+";"+(r+1)],h[0][n-1]=g[n-1][0]);void 0!==k[t+1+";"+(r+1)]&&(g=k[t+1+";"+(r+1)],h[n-1][n-1]=g[0][0]);void 0===h[0][0]&&(h[0][0]=C());void 0===h[n-1][0]&&(h[n-1][0]=C());void 0===h[0][n-1]&&(h[0][n-1]=C());void 0===h[n-1][n-1]&&(h[n-1][n-1]=C());k=d.v;n=d.W;for(g=l=d.size;2<g;){for(var v=0;v<l-1;v+=g-1)for(var w=0;w<l-1;w+=g-1){var E=(2*C()-1)*n,z=Math.floor(w/2+(w+g-1)/2),A=Math.floor(v/2+(v+g-1)/2);void 0===h[z][A]&&(h[z][A]=f(h[w][v],h[w+g-1][v],h[w][v+g-1],h[w+g-1][v+g-1])+E,0>h[z][A]&&(h[z][A]=0),1<h[z][A]&&(h[z][A]=1))}E=Math.floor(g/2);for(v=0;v<=l-1;v+=E)for(w=0===Math.floor(v/E)%2?E:0;w<=l-1;w+=g-1){z=h;A=w;var Q=v,K=n,P=k,Ta=t,Ua=r;if(void 0===z[A][Q]){var pa=Math.floor(g/2),gb=A+pa,hb=Q-pa,dc=Q+pa;pa=c(P,A-pa,Q,z,Ta,Ua);gb=c(P,gb,Q,z,Ta,Ua);hb=c(P,A,hb,z,Ta,Ua);P=c(P,A,dc,z,Ta,Ua);K=(2*C()-1)*K;K=f(pa,hb,gb,P)+K;0>K&&(K=0);1<K&&(K=1);z[A][Q]=K}}n/=2;g=Math.floor((g-1)/2+1)}d.v[t+";"+r]=h}return h[(q+(1+Math.floor(Math.abs(q/u)))*u)%u][(p+(1+Math.floor(Math.abs(p/u)))*u)%u]}function c(q,p,u,t,r,h){var k=d.size;if(0<=p&&0<=u&&p<k&&u<k)return t[p][u];q=q[Math.floor((r*k+p)/k)+";"+Math.floor((h*k+u)/k)];if(void 0!==q)return q[0<=p?p%k:k-1-Math.abs(p)%k][0<=u?u%k:k-1-Math.abs(u)%k]}function f(q,p,u,t){var r=0,h=0;void 0!==q&&(r+=q,h++);void 0!==p&&(r+=p,h++);void 0!==u&&(r+=u,h++);void 0!==t&&(r+=t,h++);return r/h}this.W=1;this.size=1025;this.get=b;this.v={};wa=1234;var d=this;this.addEventListener("message",function(q){d.postMessage(a(...q.data))},!1);const m=q=>q.reduce((p,u)=>p+u)/q.length};var Ha,Ia=20,Ja,na,ua,va,oa=[0,0,0,0,0],qa=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];function Ka(a,b){oa=[a,19.6,-17.6,-.65,b];a=La([a,19.6,-17.6],-.65,b);ua=Float32Array.of(...a);qa=Float32Array.of(...F(ta(),a))}function Ma(a){let b=Na({s:[-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],i:[0,1,2,0,2,3],m:[0,1,1,1,1,1,1,1,1,.01,1,1,0,.01,1,1],n:[0,1,0,0,1,0,0,1,0,0,1,0]},B.j);void 0!=a&&(b.c=ba(a));return b}var Oa=[],Pa=[],Qa=[];function Ra(){for(var a=0;2>a;a++)Oa.push(Na({s:[-.4,-.4,0,.4,-.4,0,.4,.4,0,-.4,.4,0],i:[0,1,2,0,2,3],m:[0,1,1,1,1,1,1,1,1,0,1,1,0,0,1,1],n:[0,1,0,0,1,0,0,1,0,0,1,0]},B.j)),Oa[a].c=ba(0==a?Sa:Va);a=[];var b=ca(Wa,32,20);for(var c=0;640>c;c++)0==c%32&&0==Math.floor(c/32)%5&&a.push(...Array(43).fill(14)),0==c%32%3&&a.push(14),a.push(b[0>c?0:c]);b=da(a,43,43);for(a=0;41>a;a++){var f=a%10,d=Math.floor(a/10);c=(4+16*f)/172;var m=(4+24*d)/172;f=(16*f+16)/172;d=(24*d+24)/172;Pa.push(Na({s:[-.02,-.03,0,.02,-.03,0,.02,.03,0,-.02,.03,0],i:[0,1,2,0,2,3],m:[f,d,1,1,c,d,1,1,c,m,1,1,f,m,1,1],n:[0,1,0,0,1,0,0,1,0,0,1,0]},B.j));Pa[a].c=b}}function Xa(a){for(var b=G.a,c=[],f=0;2>f;f++){var d=H(Oa[f],F(b,I(f?0:-.4,.9,0,0,0,0,1,1,1)));c.push(d)}c.push([]);c.push(b);c.push(a);c.push(0);Qa.push(c)}function Ya(){for(var a=0;a<Qa.length;a++){var b=Qa[a],c=b[3],f=b[4],d=b[5];d<f.length&&b[2].push(H(Pa["abcdefghijklmnopqrstuvwxyz.',?0123456789 ".indexOf(f[d])],F(c,I(.22-d%18*.05,1.05-.08*Math.floor(d/18),-.01,0,0,0,1,1,1))));b[5]++;b[5]>f.length+300&&(J(b[0]),J(b[1]),b[2].forEach(m=>J(m)))}}function Za(){for(var a=0;a<Qa.length;a++){var b=Qa[a];J(b[0]);J(b[1]);b[2].forEach(c=>J(c))}Qa=[]};var e,$a,L,ab,bb=[],cb=0,db=0,eb=0,fb=0,ib=0;const M=Math.PI;var jb,kb=[],lb=[],sa={};function mb(){ab.onclick=function(){ab.requestPointerLock()};document.onmouseup=a=>{kb[a.button]=!1;lb[a.button]=!1};document.onmousedown=a=>{kb[a.button]=!0;lb[a.button]=!0};document.addEventListener("mousemove",nb,!1);document.addEventListener("pointerlockchange",ob,!1);document.onkeydown=a=>{sa[a.keyCode]=!0};document.onkeyup=a=>{sa[a.keyCode]=!1}}function ob(){document.pointerLockElement===ab?document.addEventListener("mousemove",pb,!1):document.removeEventListener("mousemove",pb,!1)}function nb(){$a.getBoundingClientRect()}let qb=0;function rb(a){sb(a-qb);a=Math.floor((a-qb)/(1E3/60));for(let f=0;f<a;f++){if(void 0!=G){var b=0;2.3>za(Ca(Da(N.a),Da(G.a)))&&(b=1);tb+=.1*(b-tb);.9<tb&&!O?(0==ub&&vb(!1),O=!0,R=-1,wb=100,Xa("you seem like you could use an      upgrade. anything look appealing?"),xb=[0,0,0]):.3>tb&&O&&(vb(!0),O=!1,yb());if(O&&(wb--,!(0<wb)&&(-1==R&&0==wb&&(zb(),R=0),1!=ub)))if(0==R){b=Math.floor(-1.99*(S+.5));for(var c=0;3>c;c++)xb[c]=Math.max(.4*((b==c?1:0)-xb[c]),0),T[2*c].a[14]=.2-.6*xb[c];b!=Ab&&0<=b&&2>=b&&(Ab=b,Za(),Xa(";sucks in white    ghosts who are    close to you. justa warning though, it's pretty weak.;protects you when you accidently runinto obstacles in the way.;helps you row     faster. you're    here for eternity though so this maynot be useful.;lets you holds    more memories. i  like this since   it's more money   for me.;hold more soul    power. now you cango further without stopping for more soul.;river map. now youcan see if i'm    just around the   corner.".split(";")[Bb[Ab]]))}else 1==R&&(R=0)}b=Cb/56*Math.sin(Cb/3)*.09;N.a=I(U[0],3.7,U[1],b,V,b,.1,.1,.1);Db.push(N.a);4<Db.length&&Db.shift();b=F(Db[0],I(6+8*tb,4+5*tb,0));cb=b[12];db=b[13];eb=b[14];fb=-.25;ib=-Math.atan2(N.a[14]-b[14],N.a[12]-b[12])-Math.PI/2;sa[37]?V+=.01:sa[39]&&(V-=.01);b=[W[0],W[1],0];.04<za(b)&&(b=Aa(b),c=[.04,.04,.04],b=[b[0]*c[0],b[1]*c[1],b[2]*c[2]]);W[0]=b[0];W[1]=b[1];U[0]+=W[0];U[1]+=W[1];V+=W[2];W[0]*=.98;W[1]*=.98;W[2]*=.98;.9>tb&&(b=Eb(U[0]),W[0]+=1E-4*Math.sin(b),W[1]+=1E-4*Math.cos(b),W[2]+=1E-4*(b-V+M/2));for(let d of Fb){b=N.a[12]+.1*Math.cos(123*d.o);c=N.a[14]+.1*Math.sin(123*d.o);let m=za(Ca(Da(d.a),Da(N.a)));Gb.includes(1)&&1.2>m?d.h-=.008*m:d.h+=.008*m;d.h=xa(0,d.h,1);d.time+=d.speed;d.a[12]=b+d.h*(.002*d.time+d.V-b);d.a[14]=c+d.h*(15*D(10*d.a[12])+(d.o-.5)-c);d.a[13]=d.X+.07*Math.sin(d.time/130+123*d.o);d.l.c=14>(d.time+12345*d.o)%28?Hb[2*d.type]:Hb[1+2*d.type]}Ib*=.7;X*=.7;kb[2]&&(ub=1-ub,kb[2]=!1,O&&(0==ub?vb(!1):vb(!0)));if(1==ub)Y.l.c=Jb,Y.a=I(Kb+X,.5-(kb[0]?.2:0),-(S+Ib),0,Math.PI/2,0,.5,.5,.5),kb[0]&&(Lb-=Math.sqrt(Ib**2+X**2)*(Gb.includes(5)?.009:.015),W[0]+=-Mb/50*Math.cos(-V)*.4,W[1]+=-Mb/50*Math.sin(-V)*.4,W[2]+=.005*Nb,W[0]+=-X/50*Math.cos(-V)*.07,W[1]+=-X/50*Math.sin(-V)*.07,W[2]+=.001*Ib);else if(Y.l.c=Ob,O)Y.a=I(-(S+Ib)-.3,-(Kb+X)+.9,0,0,M,0,.2,.2,.2),lb[0]&&(b=Bb[Ab],c=Pb[b],0==R?(Za(),Gb.includes(b)?(R=1,Xa("you already own   this ..."),wb=120):c>Qb?(R=1,Xa(`this item is ${c}   memories but you  only have             ${Qb} memories`),wb=120):(R=2,Xa(`are you sure you  want to buy this  for ${c} memories?`),T[6].a[13]=.7,T[7].a[13]=.7)):2==R&&(-1.2>S?(R=0,T[6].a[13]=-100,T[7].a[13]=-100):(Qb-=c,R=3,Gb.push(b),yb(),Za(),Xa("thank you for your business."))));else if(Y.a=I(0,-(Kb+X)+.9,-(S+Ib),0,M/2,0,.5,.5,.5),kb[0])for(b=Fb.length;b--;)c=Fb[b],.5>Math.sqrt((N.a[12]-c.a[12])**2+(N.a[14]-c.a[14])**2)&&(Lb+=.06,Lb=Math.min(1,Lb),Fb.splice(b,1),0!=c.type&&(Qb+=2*c.type),J(c));b=Math.floor(U[0]/25.5-.5);Rb(b);Rb(b+1);Ka(1+cb,-2.7);Sb();Tb();Ya();lb=[];qb+=1E3/60}requestAnimationFrame(rb)}function sb(a){function b(c,f){c.b.forEach(d=>{Ub(d,f,c.a);b(d,f)})}L.clearRect(0,0,960,720);e.clearColor(.3,.05,.05,1);e.clearDepth(1);e.depthFunc(515);e.viewport(0,0,Ha,Ha);e.clear(16640);e.cullFace(1028);e.useProgram(B.A.f);ka=B.A.f;e.bindFramebuffer(36160,Ja);e.clear(256);bb.forEach(c=>{Ub(c,B.A);b(c,B.A)});e.bindFramebuffer(36160,null);e.cullFace(1029);e.clear(16640);e.viewport(0,0,e.canvas.clientWidth,e.canvas.clientHeight);bb.forEach(c=>{Ub(c,c.l.N);b(c,c.l.N)});jb+=a/1E3}function Ub(a,b,c=null){var f=a.a;null!=c&&(f=F(c,a.a));c=Math.tan(M/2-.425);var d=1/(Vb-Wb);f={g:new Float32Array([c/(e.canvas.clientWidth/e.canvas.clientHeight),0,0,0,0,c,0,0,0,0,(Vb+Wb)*d,-1,0,0,Vb*Wb*d*2,0]),P:new Float32Array(La([cb,db,eb],fb,ib)),I:new Float32Array(f),time:jb};b.B(b,f,a.l)}function ra(a,b,c){e.bindBuffer(34962,b);e.vertexAttribPointer(a,c,5126,!1,0,0);e.enableVertexAttribArray(a)}function La(a,b,c){function f(u,t){return u[0]*t[0]+u[1]*t[1]+u[2]*t[2]}var d=Math.cos(b);b=Math.sin(b);var m=Math.cos(c),q=Math.sin(c);c=[m,0,-q];var p=[q*b,d,m*b];d=[q*d,-b,d*m];return[c[0],p[0],d[0],0,c[1],p[1],d[1],0,c[2],p[2],d[2],0,-f(c,a),-f(p,a),-f(d,a),1]}function H(a,b){a=Z(a,b);bb.push(a);return a}function Z(a,b){return{l:a,a:b,b:[]}}function J(a){a=bb.indexOf(a);-1!==a&&bb.splice(a,1)}function Na(a,b){var c=e.createBuffer();e.bindBuffer(34962,c);e.bufferData(34962,new Float32Array(a.s),35044);var f=e.createBuffer();e.bindBuffer(34963,f);e.bufferData(34963,new Uint32Array(a.i),35044);var d=e.createBuffer();e.bindBuffer(34962,d);e.bufferData(34962,new Float32Array(a.n),35044);var m=e.createBuffer();e.bindBuffer(34962,m);e.bufferData(34962,new Float32Array(a.m),35044);return{J:c,D:f,L:d,R:m,C:a.i.length,N:b,Z:b.Y}}for(var F,Xb="return [",Yb=0;16>Yb;Yb++){for(var Zb=0;4>Zb;Zb++)Xb+=`a[${4*Zb+Yb%4}]*b[${Zb%4+4*Math.floor(Yb/4)}]`,3!=Zb&&(Xb+="+");15!=Yb&&(Xb+=",")}F=new Function("a","b",Xb+"];");function I(a,b,c,f=0,d=0,m=0,q=1,p=1,u=1){var t=Math.cos(f);f=Math.sin(f);var r=Math.cos(d);d=Math.sin(d);var h=Math.cos(m);m=Math.sin(m);return F([1,0,0,0,0,1,0,0,0,0,1,0,a,b,c,1],F([q,0,0,0,0,p,0,0,0,0,u,0,0,0,0,1],F([1,0,0,0,0,t,f,0,0,-f,t,0,0,0,0,1],F([h,m,0,0,-m,h,0,0,0,0,1,0,0,0,0,1],[r,0,-d,0,0,1,0,0,d,0,r,0,0,0,0,1]))))}var Vb=.1,Wb=1E3,$b=.1,ac=500;function ta(){var a=-Ia,b=Ia,c=-Ia,f=Ia,d=1/(a-b),m=1/(c-f),q=1/($b-ac);return[-2*d,0,0,0,0,-2*m,0,0,0,0,2*q,0,(a+b)*d,(f+c)*m,(ac+$b)*q,1]}function ma(a,b){var c=e.createProgram();e.attachShader(c,bc(35633,a));e.attachShader(c,bc(35632,b));e.linkProgram(c);return c}function bc(a,b){var c=e.createShader(a);e.shaderSource(c,b);e.compileShader(c);b=e.getShaderInfoLog(c);""!=b&&console.log("for "+(35633==a?"vertex":"fragment")+": \n"+b);return c};var cc=[0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0];function ec(a){ha=a;ia=0;ja=1;a=[];var b=[],c=[],f=[],d=x(5),m=x(5),q=x(5);d=d/2/10;q=q/2/10;m=m/2/10;for(var p=x(5),u=x(5),t=0;t<p;t++)f.push([x(5),x(5),x(5)]);for(t=0;t<u;t++){var r=x(5),h=x(5),k=x(5),n=x(5);var l=x(5);var g=x(5);p=x(5);p=f[p];r=r/-10+d;k=k/10-q;h=h/10-m;n=-.1+n/-10+d;g=.1+g/10-q;l=.1+l/10-m;l=[r,k,l,n,k,l,n,g,l,r,g,l,r,k,h,n,k,h,n,g,h,r,g,h,n,k,h,n,g,h,n,g,l,n,k,l,r,g,h,r,k,h,r,k,l,r,g,l,n,g,h,r,g,h,r,g,l,n,g,l,r,k,h,n,k,h,n,k,l,r,k,l];for(g=0;72>g;g++)a.push(l[g]);b=b.concat(cc);for(g=0;24>g;g++)c=c.concat([(p[0]+1)/16,(p[1]+1)/16,(p[2]+1)/16,1])}f=a.length/12;d=Array(6*f);for(m=0;m<4*f;m+=4)for(q=0;6>q;q++)d[m/4*6+q]=m+[0,1,2,0,2,3][q];return Na({s:a,i:d,m:c,n:b},B.j)};var ha,ia,ja;function x(a){for(var b=0,c=1,f=0;f<a;f++){var d=ha[ia]||"0";d=d.charCodeAt(0);b|=(0!=((47==d?44:d-48)&ja)?-1:0)&c;c<<=1;ja<<=1;64<=ja&&(ja=1,ia++)}return b}var Sa="i@200000000000DEEEEDZZZZBZZZZ:YZZZZTZZZZBZZZZ:YZZZZTZZZZBZZZZ:YZZZZDZZZZ2EEEE5",Va="i@20000000000@EEEE1ZZZZFXZZZZQZZZZ6ZZZZJXZZZZQZZZZ6ZZZZJXZZZZQZZZZ6ZZZZFDEEEE000@100004",Wa="hPfgok?]Y9YBlW^e;AKJB[4MO?_OddoooCcKKK4;]m]GddflAAOk3k5]]m@hdfF21BKU404]_:02LeZ;4aeOoo?MT=Q]DMoOmCE8IE9oolGW0";var N,Y,G,Fb=[],fc={},gc={},hc,ic=!0,jc,kc,lc,U=[.93,1],W=[0,0,0],V=2.5,Db=[],Cb=0,tb=0,mc,nc,oc=[],O=!1,Bb=[],Pb=[0,65,20,40,25,50,30],wb=300,Ab=1,T=[],xb=[],R=0,Lb=1,Qb=0,Gb=[],pc=[],Hb=[],Ob,Jb,qc,rc,[S,Kb,Ib,X,Nb,Mb]=[0,0,0,0,0,0],ub=1;function zb(){function a(b,c){let f=Ma(void 0);f.c=c;b=Z(f,b);G.b.push(b);T.push(b)}for(let b=0;3>b;b++){let c=[oc[Bb[b]],oc[0]];for(let f=0;2>f;f++){let d=I(.5+b/2,.34,.2+.01*f,0,M,0,.3,.3,.3);a(d,c[f])}}[[I(.8,-100,.2,0,M,0,.4,.4,.4),oc[7]],[I(1.2,-100,.2,0,M,0,.4,.4,.4),oc[8]]].forEach(b=>{a(b[0],b[1])})}function yb(){T.forEach(a=>Ea(G.b,a));T=[]}function vb(a){Ea(N.b,Y);void 0!=G&&Ea(G.b,Y);a?N.b.push(Y):G.b.push(Y)}function Tb(){for(let a in gc){let b=0;gc[a].forEach(c=>{if(!(0>c.type)){var f=U[0]-c.a[12];var d=U[1]-c.a[14];var m=-c.K;d=[f*Math.cos(m)+d*Math.sin(m),f*Math.sin(m)+d*Math.cos(m)];f=d[0];d=d[1];f-=xa(0,f,[15,7,7][c.type]/100);c=d-xa(0,d,[12,10,4][c.type]/100);(c=.0144>f*f+c*c)&&0==Cb&&(Lb-=Gb.includes(2)?.05:.15,Cb=18*M);b++}})}0<Cb?Cb--:Cb=0}function Rb(a){null!=fc[a-2]&&(J(fc[a-2]),delete fc[a-2],void 0!=gc[a-2]&&(gc[a-2].forEach(b=>J(b)),delete gc[a-2]));null==fc[a]&&ic&&(fc[a]=123,hc.postMessage([254*a,0,!0]),hc.onmessage=b=>{b=Na(b.data,B.j);fc[a]=H(b,I(25.4*a,0,-12.5,0,0,0,.5,.5,.5));gc[a]=[];b=H(jc,I(25.4*a,3.6,0,0,0,0,1,.8,.8));b.type=-1;b.K=0;gc[a].push(b);for(b=0;22>b;b++){if(8<b&&16>b)continue;var c=b+25.4*a;c=I(c,3.8,(D(10*c)+1)/2*25-12.5,0,M/2,0,.15,.15,.15);c=H(Ma(void 0),c);c.time=0;c.V=c.a[12];c.X=c.a[13];c.o=C();c.h=1;var f=.5,d=0;let m=321*c.o%1;.96<m?(d=4,f=1.1):.94<m?(d=3,f=.9):.9<m?(d=2,f=.7):.85<m&&(d=1,f=.6);c.type=d;c.speed=f;Fb.push(c)}for(b=0;4>b;b++)d=25.4*(a+(b+C())/4),c=Math.floor(3*C()),f=2*C()*M,d=I(d,3.7,15*D(10*d)+(C()-.5),0,f,0,.5,.5,.5),d=H(kc[c],d),d.type=c,d.K=f,gc[a].push(d);if(0==a%5)for(b=25.4*(a+.8),G=H(lc,I(b,4,15*D(10*b)+1,0,Eb(b),0,.6,.6,.6)),G.b.push(mc),G.b.push(nc),b=Bb=[1,2,3,4,5,6],c=b.length-1;0<c;c--)f=Math.floor(Math.random()*(c+1)),d=b[c],b[c]=b[f],b[f]=d;ic=!0},ic=!1)}function Sb(){let a=Gb.includes(4)?70:30;[[qc,Lb,100,"#c22",20],[rc,Qb/a,a,"#fc2",80]].forEach(b=>{L.drawImage(b[0],20,b[4]);L.fillStyle="#222";L.fillRect(100,b[4]+10,830,40);L.fillStyle=b[3];L.fillRect(100,b[4]+20,830*xa(0,b[1],1),20);L.globalCompositeOperation="difference";L.font="bold 24px sans-serif";L.textAlign="center";L.fillText(Math.floor(b[1]*b[2]*100)/100,515,b[4]+39);L.globalCompositeOperation="source-over"});Gb.forEach((b,c)=>{L.drawImage(pc[b],64*c,656)})}function pb(a){lb[0]&&(X=Ib=0);var b=[[-1,1,-2,1],[-1,1,-1.5,1.5],[-2,-.5,0,1],[-1,1,-1.5,1.5]][ub+2*O];let c=S,f=Kb;S=xa(b[0],S+.003*a.movementX,b[1]);Kb=xa(b[2],Kb+.003*a.movementY,b[3]);Nb=S-c;Mb=Kb-f;Ib+=9E-4*a.movementX;X+=9E-4*a.movementY}function D(a){return Math.sin(a/30/5)*Math.cos(a/12/5)*Math.cos(a/29/5)*Math.cos(a/43/5)}function Eb(a){return Math.atan2(.01,9*(15*D(10*a+.01)-15*D(10*a)))}(function(){$a=document.getElementById("g");e=$a.getContext("webgl2");ab=document.getElementById("e");L=ab.getContext("2d");e.enable(2929);e.enable(3042);e.blendFunc(770,771);la();Ha=4096;Ja=e.createFramebuffer();na=e.createTexture();e.bindTexture(3553,na);e.texImage2D(3553,0,36012,Ha,Ha,0,6402,5126,null);e.texParameteri(3553,10240,9728);e.texParameteri(3553,10241,9728);e.bindFramebuffer(36160,Ja);e.framebufferTexture2D(36160,36096,3553,na,0);e.drawBuffers([0]);e.readBuffer(0);e.bindFramebuffer(36160,null);e.useProgram(B.j.f);e.uniform1i(B.j.M,0);ua=new Float32Array(La([0,0,0],0,0));va=new Float32Array(ta());Ka(.16,-3.1);jb=0;mb();requestAnimationFrame(rb);hc=Fa();var a=ec("De8DH3@00T90800BP04B0IB0010090c0HR4"),b=ec("1D84H300007"),c=ec("b@84H3000R");N=H(a,I(0,3.7,-.36,0,-.41,0,.1,.1,.1));N.b.push(Z(b,I(.9,-.05,0,0,0,Math.PI/4)));N.b.push(Z(b,I(-.9,-.05,0,0,0,Math.PI/4)));N.b.push(Z(c,I(0,-.05,.4,Math.PI/4,0,0)));N.b.push(Z(c,I(0,-.05,-.4,Math.PI/4,0,0)));jc=Na({s:[0,0,-16,25.5,0,-16,25.5,0,16,0,0,16],i:[0,1,2,0,2,3],m:[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],n:[0,1,0,0,1,0,0,1,0,0,1,0]},B.U);"i`10000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TUFJ0@EEU105@@5 i`10000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TZZJ0@IUE10DA55 i030000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TUFJ0@EEU105@@5 i030000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TZZJ0@IUE10DA55 i020000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TUFJ0@EEU105@@5 i020000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TZZJ0@IUE10DA55 iP20000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TUFJ0@EEU105@@5 iP20000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TZZJ0@IUE10DA55 iP00000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TUFJ0@EEU105@@5 iP00000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TZZJ0@IUE10DA55".split(" ").forEach(f=>{Hb.push(ba(f))});kc=[ec("?f9`<0@80F[08@09d0020W2042@:9001PY2P00dF00Q0<628<0:T0860dH085`a@0P50/0P@B4B2"),ec("7e9`<0080671000640440QQ001@a4000XT0P@0@@1@804W1880Sb04601Y000P040R0HT20a`866"),ec("7B:/<0000:S08404a040Pa@022@@P000`<00@0D42@804220406A0@022@0:QA9<02AA8:")];Ra();lc=ec("FgL/=0Pci2Q`CLZ[7P0>e62d4=gj1JRS[`0=da]H00[5HBAQe<<Y`IB^3CP20D`8X10=H4860a<2:3@I6QQU<<V0`P46D8HA2;64/VPe23FK`J22[AH]PPi4<WH`L3V;@H>2c94/WPm23fK`N22kAH_PP95<9H`T3V<@HB2C2");mc=Z(Ma("i0F0010000E0000EE000DEE00DEE50@YYE00EEE10DEE50`oEe00ooo?0DeoO0@EEE1@EEE50EEEE0DEEE1@EEE5"),I(0,.34,0,0,M/2+M/4,0,.3,.3,.3));nc=Z(Ma("h0oo`o?lo3ooPo7ho1H60V1PI0H60V1PI0H60V1"),I(0,.05,0,0,M/2+M/4,0,.3,.3,.3));"i0100000@EEEE1YZZZ6TZZZJ@ZZZZ1YZZZ6TZZZJ@ZZZZ1YZZZ6TZZZJ@ZZZZ1YZZZ6TZZZJ@ZZZZ1EEEE5 i0N000000000000000000E1000YJ000YZ600TZJ00TJY60@JEJ00Y1Y10d7d70@O@O00E1E1 iPM00000000000005000@Y500@ZZ10@ZZN00YZj10TZZ70@ZZN00TZN00@Zj100Tj1000i1000@1 i`20000000000000000000000DEE10@FFF00YYY50DJJJ0@YYY10YYY50TUU50@EE5 i`G000000000000EE500TZJ00@ZZ100UZ500@o700DZZ50@ZZJ00YZZ10DZZ500YZ600DZF000EE i@10000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TUFJ0@EEU105@@5 i0Q000000@1000DJ100TZJ15@j_JY1ik[Z6T[^ZJ@^j[^1iZno7TZZZK@JYZZ1E@YZ600@Y5000@1 i`200000000000000000EEE10DEE60@EEJ00EEJ10TEJ50@JJE00UJE10DIE50@EEE00EEE1 i0200000000000000000EEE10TFU60@YUF00EZF10DUF50@UZE00UFJ10TFU60@FEI00EEE1".split(" ").forEach(f=>{oc.push(ba(f));pc.push(ea(ca(f,16,16),16,16))});Ob=ba("i@A000000@EE10@ZZ60@ZZJ00YEe10T1@7001@O000@O0000M1000m1000d5000d7000@G0000E");Jb=ba("i0100E0000T1000@60000I0000T1000@60000I0000T1000@6000@I1000Y6000TJ000@Z1000Y6000DE");Y=Z(Ma(void 0),I(0,.9,0,0,Math.PI/2,0));Y.l.c=Ob;vb(!0);qc=ea(ca("i`10000000EE00@YZ600YZJ00UUU50TZZJ0@YEJ10TEU10@ZZ60@YZZ10YZZ60TUFJ0@EEU105@@5",16,16),16,16);rc=ea(ca("i@Z000000000000@E000@Z600@j[100io600ToK000iK000@O0000m1000d7000@O0000m1000@1",16,16),16,16)})();