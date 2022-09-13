@echo off
java -jar cc.jar --compilation_level ADVANCED_OPTIMIZATIONS --language_in="ECMASCRIPT_2020" --language_out="ECMASCRIPT_2020" ^
--js wglc.js ^
--js s2xsprite.js ^
--js shaders.js ^
--js util.js ^
--js thread.js ^
--js terrain.js ^
--js effect.js ^
--js engine.js ^
--js voxelbox.js ^
--js data.js ^
--js dddddg.js ^
--js_output_file ggg.js
tr -d "\r\n" < ggg.js > gg.js
cut -c14- < gg.js > g.js
advzip -a g.zip -4 -i 5000 g.js
ls -l g.zip