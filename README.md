# CG Skeletal Animation
Computer Graphics Course Project, based on University of Grenoble CG course exercises.

The application is an editor for skinned animation: the user can add nodes to the scene graph hierarchically and animate them defining the transformation keyframes. For the node hierarchy and the shaders, the Object-Oriented paradigm was chosen as coding style, therefore many functionalities are very flexible and eventually can be extended easily in the future.
There is only one skinned mesh available (the cylinder), but the program can support any kind of skinned mesh.
The bone hierarchy can be of any kind (bone nodes can be nested inside each other), but the cylinder has a flat structure, as any user can reasonably expect.Cull face is not enabled, so even if setting wrong transformations on the skinned mesh can reverse it, it will be visible.
There are two shaders, one for the normal meshes and one for the skinned meshes.
The scene is illuminated by directional light, the light direction can be modified by two sliders on the control section of the page. Illumination model is Blinn-Phong, and lighting is computed in object space. Even if each scene graph node with a mesh has its own material, only one material is used for all the elements, in order to lighten the UI. 
The animation is cyclic and can be stopped and restored. The cycling period can be updated in the UI. The animation is performed by interpolating the trasformations defined by keyframes. Each transformation type (translation, rotation, scaling) is interpolated indipendently from each other, so if the user wants to transform an element from an initial situation to some keyframe, he must add an identity transformation keyframe on time=0 for each transformation he wants to use in his keyframe.
The user can navigate the scene using a trackball. Both the trackball and the rotation keyframes make use of the quaternions.


User quick guide:
  - yaw and pitch sliders can change the light direction with aircraft axis
  - "restart animation time" refers to the duration of the period after which the time value restarts to 0
  - "+" button adds an element as child to the parent node (default scene)
  - "x" button removes the element and all his children from the scene
  - "tr" button RESETS the transformation of the element. It's not possible to edit a transformation, the user must restart from the beginning.
         Each transformation in performed on top of the last one.
  - "+k" adds a keyframe to the element. Keyframes can refer to one or more transformation types (translation, rotation, scaling).
  - the animation keyframes are displayed inside each node. If the user clicks on a keyframe, he will REMOVE it.
