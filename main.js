
 /* Global variables */
 var gl = null; // webGL context
 var canvas = null;
 var shader = null;
 var button = null;

 /* time variables  */
 var time = null;
 // copy of time variable which is not available when the animation is freezed
 var elapsedTime = 0;
 // timestamp in which the animation is stopped
 var stopAnimationTS = 0;
 // total time in which the animation was paused
 var pausedTime = 0;
 // timestamp of the last animation
 var freezeTS = 0;
 
 var restartingAnimation = true;

// ID used for animation
 var animationRequestID = null;

  // array of drawable Nodes
 var scene = [];

 //Materials
 var mat = new Material(vec3(.1,.18725,.1745), vec3(.396,.74151,.69102),vec3(.297254,.30829,.306678),.1*128);
 var mat2 = new Material(vec3(0.05375,0.05,0.06625),vec3(0.18275,0.17,0.22525),vec3(0.332741,0.328634,0.346435),0.3*128);
 //TODO add material for light
 var lightMat =  new Material(vec3(.3,.3,0), vec3(.5,.5,.5),vec3(.5,.5,.5),.0);



 /* Initialization */
 function setupWebGL() {
	canvas = document.getElementById("A-CANVAS");
	gl = canvas.getContext("experimental-webgl");  // or, "webgl"
	shader = new Blinn_Phong(gl);
	shader.lightOppositeDir = [1,1,1,0];
	canvas.onmousemove = myMouseMove;
	canvas.onwheel = myMouseWheel;

	button = document.getElementById("toggleAnimation");

	Trackball.width = parseInt(canvas.getAttribute("width"));
	Trackball.height = parseInt(canvas.getAttribute("height"));
 }

// the matrixStack's global variable model is used to store the current model transformation.
// however it's NOT used as it is meant to be: the Node constructor stores the model matrix and uses
// it for all its children. Therefore each child has its own model matrix that starts from identity
// and matrices are retrieved by pop() function

// draws a cylinder with bases
function FullCyl(cyl,cone,k){
	// var cyl_node = new Node(model.pop(),k);
	var cyl_node = new MeshNode(mat2,model.pop(),cyl,k,"cylinder");
	// top base: flattened cone 
	model.init();
	model.translate(0,1,0);
	cyl_node.add(new MeshNode(mat2,model.pop(),cone,null,"top base")); 
	// bottom base: flattened cone
	model.init();
	model.translate(0,-1,0);
	model.rotate(vec3(1,0,0),180);
	cyl_node.add(new MeshNode(mat2,model.pop(),cone,null,"bottom base")); 
	return cyl_node;
	} 
 function setupWhatToDraw() {  
	// various GPU meshes used by the program
	var cyl = new GpuMesh(gl,new Cylinder(60));
	var cone = new GpuMesh(gl,new Cone(60,flat=true));
	var cube = new GpuMesh(gl,new Cube());
	// create a full cylinder and animate it
	model.init();
	var keyframe = AnimationKeyframes();
	var cylinder = 	FullCyl(cyl,cone,keyframe);
	// create a world plane
	model.init();
	model.translate( 0, -4, 0);
	model.scale( 100, 1, 100);
	var plane = new MeshNode(mat,model.pop(),cube,null,"base plane"); 
	// add objects to scene array
	scene.push(cylinder);
	scene.push(plane);
}
 
function setupHowToDraw() {	 
	 // set OpenGL parameters
	 gl.enable( gl.DEPTH_TEST ); 
	 gl.enable( gl.CULL_FACE ); // back face culling
 }

function animate(time){
	// each time the animation is restarting, register the timestamp and update pausedTime
	if(restartingAnimation){
		pausedTime += time - stopAnimationTS;
		restartingAnimation = false;
	}
	elapsedTime = time;
	// running time = (total time) - (paused time)
	draw(time - pausedTime)
	// loop forever
	if(animationRequestID)
		animationRequestID = requestAnimationFrame(animate);
}

 // rendering: fill screen buffer
function draw(time) {
	 // Convert the time to seconds and restart after 20 seconds
	var t = (time * 0.001) % 20;
	gl.clearColor(1.0,1.0,1.0,1.0);
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	scene.forEach(element => {
		element.draw(shader,identityMatrix(),Trackball.getView(),Trackball.getProjection(),t);
	});
 }
 
 
 /* callbacks */
 function main(){
	setupWebGL();
	setupWhatToDraw();
	setupHowToDraw();
	animationRequestID = requestAnimationFrame(animate);
}

// define user control callbacks
 var mouseX = 0, mouseY = 0;
 
 function myMouseMove( event ) {
	var oldX = mouseX;
	var oldY = mouseY;  
	mouseX = event.pageX;
	mouseY = event.pageY ;
	if (event.buttons==0)
		return;
	 // left button is held down 
	if (event.buttons==1)
		Trackball.rotate(oldX,oldY,mouseX,mouseY);
 	if (event.buttons==2)
		Trackball.pan(mouseX - oldX,mouseY - oldY);
	if(!animationRequestID)
		draw(freezeTS);
 }
	 
function myMouseWheel( event ) {
	if(event.deltaY == 0) return;
	Trackball.dolly(event.deltaY);
	if(!animationRequestID)
		draw(freezeTS);
	}
function toggleAnimation(){
	if (animationRequestID){
		freezeTS = elapsedTime - pausedTime;
		stopAnimationTS = elapsedTime;
		cancelAnimationFrame(animationRequestID);
		animationRequestID = undefined;
		button.setAttribute("value", "Restart animation");
	}
	else {
		restartingAnimation = true;
		animationRequestID = requestAnimationFrame(animate);
		button.setAttribute("value", "Stop animation");
	}
}	 

 // register callbacks
 window.onload = main;