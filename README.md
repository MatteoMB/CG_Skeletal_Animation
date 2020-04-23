# CG Skeletal Animation
Computer Graphics Course Project, based on University of Grenoble CG course exercises.

File guide:
  - index.html : simple html page with canvas and button
  - js
      - main.js               : main application file. It manages the program flow and the user control
      - AnimationKeyframes.js : function that outputs animation keyframe data
      - Blinn-Phong           : shader object with vertex and fragment sources and uniform setting function
      - modules
                    - KeyframeNode.js : main drawable object, supporting for interpolation of keyframes
                    - matrices.js     : matrix utilities library (supports also quaternions)
                    - matrixStack.js  : stack of model transformation matrices
                    - mesh.js         : CPU and GPU mesh manager, supports procedural modeling (cubes, cones and cylinders)
                    - Shader.js       : generic shader object, with initialization and uniform managing shortcuts
                    - Trackball.js    : trackball interaction object
