 /* Global variables */
 var gl = null; // webGL context
 var canvas = null;
 var shaders = [];
 var buttonToggleAnimation = null;

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
 // after maxAnimationTime, the animation restarts
 var maxAnimationTime = 20;

 var restartingAnimation = false;
// ID used for animation
 var animationRequestID = false;
  // top node in the Node hierarchy
 var scene = [];
  // pointer to elements in the scene
 var elements = {0:scene};
 var nEl = 1;

 // containers of the three main UI blocks
 var content,formAdd,formTransCont;
 // variables to add a new Node
 var type = null;
 var levels = 0;
//  meshes in GPU
 var cylinder_mesh,cone_mesh,cube_mesh,circle_mesh;
 // global variables for UI
 var modelMatrix,parentNode,parentNodeContainer,keyframes;
 var editedNode,editedNodeContainer;

  // register callbacks
 window.onload = function(){
	setupWebGL();
	setupWhatToDraw();
	setupHowToDraw();
};

function setupLightControl(){
    var yaw = document.getElementById("yaw");
    var pitch = document.getElementById("pitch");
    yaw.oninput = function(){
		var output = document.getElementById("yawValue");
        output.innerHTML = this.value;
        updateAngle(this.value,pitch.value);
    }
    pitch.oninput = function(){
		output = document.getElementById("pitchValue");
        output.innerHTML = this.value;
        updateAngle(yaw.value,this.value);
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.5;
	canvas.height = window.innerHeight - 10;
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	Trackball.width = parseInt(canvas.width);
	Trackball.height = parseInt(canvas.height);
	draw(freezeTS);
}

 /* Initialization */
 function setupWebGL() {
	canvas = document.getElementById("A-CANVAS");
	gl = canvas.getContext("experimental-webgl");  // or, "webgl"

	shaders.push(new Skinned_Blinn_Phong(gl));
	shaders.push(new Blinn_Phong(gl));
	setupLightControl();

	canvas.onmousemove = myMouseMove;
	canvas.onwheel = myMouseWheel;

	buttonToggleAnimation = document.getElementById("toggleAnimation");
	resizeCanvas()
	window.onresize = resizeCanvas;

	content = document.getElementById("content");
	formAdd= document.getElementById("form-add");
	formTransCont= document.getElementById("form-transform-container");
	document.getElementById("0").firstElementChild.addEventListener('click',addFormAdd);
 }

// draws a cylinder with bases
function fullCylinder(model,id){
	var cyl_node = new MeshNode(mat,model,cylinder_mesh,id);
	model = translationMatrix(0,1,0);
	cyl_node.push(new MeshNode(mat,model,circle_mesh)); 
	model = multMatrix(translationMatrix(0,-1,0),rotate(vec3(1,0,0),180))
	cyl_node.push(new MeshNode(mat,model,circle_mesh)); 
	return cyl_node;
	} 
// draws a skinned cylinder with bases
function fullSkeletalCylinder(model,id){
	var cyl_node = new SkinnedCylinder(shaders[0],mat,model,60,levels,id);
	model = translationMatrix(0,2,0);
	cyl_node.bones[cyl_node.bones.length-1].push(new MeshNode(mat,model,circle_mesh)); 
	model = rotate(vec3(1,0,0),180);
	cyl_node.bones[0].push(new MeshNode(mat,model,circle_mesh)); 
	return cyl_node;
}
// setup the meshes
function setupWhatToDraw() {  
	// various GPU meshes used by the program
	cylinder_mesh  = new GpuMesh(shaders[1],new Cylinder(60));
	cone_mesh = new GpuMesh(shaders[1],new Cone(60));
	circle_mesh = new GpuMesh(shaders[1],new Cone(60,flat=true));
	cube_mesh = new GpuMesh(shaders[1],new Cube());
}

// helper functions to display or not the number of bones
function addLevels(){
	var levelSelector = document.getElementById("level-selector");
	if(levelSelector.classList.contains("inactive"))
		levelSelector.classList.remove("inactive");
}
function removeLevels(){
	var levelSelector = document.getElementById("level-selector");
	if(!levelSelector.classList.contains("inactive"))
		levelSelector.classList.add("inactive");
}

// add new Node
function addFormAdd(){
	parentNodeContainer = this.parentElement;
	parentNode = elements[parentNodeContainer.id];
	content.classList.add("disabled");
	formAdd.classList.remove("inactive");
}

// the user chose NodeType, save the values and ask for a transform matrix
function setElemType(){
	if(!document.getElementById("form-add").checkValidity())
		return;
	// clean the form
	removeLevels();
	// setup type, levels and modelMatrix to go on
	var inputs =  document.getElementsByName("node-type");
	inputs.forEach(input=>{
		if(input.checked)
			type = input.value;
	});
	if(type.includes("sk"))
		levels = parseInt(document.getElementById("levels").value);
	modelMatrix = identityMatrix();
									// document.getElementById("submit-transforms").removeEventListener('click',applyTransform);
	document.getElementById("submit-transforms").addEventListener('click',createNewElement);
	let btns = document.getElementsByClassName("transform");
	for(let i=0; i<btns.length;i++) btns[i].addEventListener('click',setTransform);
	// clean everything before going on
	formAdd.classList.add("inactive");
	formAdd.reset();
	// go on
	formTransCont.classList.remove("inactive");
}

// here the user updates the model matrix
function setTransform(){
	if(!this.parentElement.checkValidity())
		return;
	var id = this.parentElement.id
	var inputs =  document.getElementsByName(id);
	var vals = [];
	inputs.forEach(f=>{vals.push(parseFloat(f.value));});
	switch(id){
		case "translation":	modelMatrix=multMatrix(translationMatrix(vals[0],vals[1],vals[2]),modelMatrix); break;
		case "rotation":	if(vals[0]==0 && vals[1]==0 && vals[2]==0) return;
							modelMatrix=multMatrix(rotate(vec3(vals[0],vals[1],vals[2]),vals[3]),modelMatrix); break;
		case "scaling": 	modelMatrix=multMatrix(scalingMatrix(vals[0],vals[1],vals[2]),modelMatrix); break;
	}
	// alert the user that the matrix was updated
	this.value = "Done!";
	this.classList.add("ok");
	this.disabled=true;
	// clean the form
	this.parentElement.reset()
	// get ready for another transform
	setTimeout(() => {this.classList.remove("ok"); this.value = "Apply"; 
	this.disabled=false}, 1000);
}

// the user chose the transformation, the element is ready to be created
function createNewElement(){
	let id=nEl.toString();
	var node;
	switch(type){
		case "empty":		node = new Node(modelMatrix,id);break;
		case "cone":		node = new MeshNode(mat,modelMatrix,cone_mesh,id);break;
		case "cube":		node = new MeshNode(mat,modelMatrix,cube_mesh,id);break;
		case "circle":		node = new MeshNode(mat,modelMatrix,circle_mesh,id);break;
		case "cyl":			node = new MeshNode(mat,modelMatrix,cylinder_mesh,id);break;
		case "f-cyl":		node = fullCylinder(modelMatrix,id);break;
		case "sk-cyl":		node = new SkinnedCylinder(shaders[0],mat,modelMatrix,60,levels,id);break;
		case "sk-f-cyl":	node = fullSkeletalCylinder(modelMatrix,id);break;
		default: return;
	}
	parentNode.push(node);
	createContainer(node);
	// clean global variables
	parentNodeContainer = null;
	parentNode = null;
	type = null;
	levels = 0;
	modelMatrix = identityMatrix();
	// clean the transformation form
	formTransCont.classList.add("inactive");
	let forms = formTransCont.children;
	for(let i=0; i<forms.length; i++){ if(forms[i].tagName=="FORM") forms[i].reset();};
	document.getElementById("submit-transforms").removeEventListener('click',createNewElement);
	let btns = document.getElementsByClassName("transform");
	for(let i=0; i<btns.length;i++) btns[i].removeEventListener('click',setTransform);
	content.classList.remove("disabled");
	// draw
	if(!animationRequestID)
		draw(freezeTS);
}
// button helper functions for createContainer()
function addButton(htmlNode){
	var button = document.createElement("input");
	button.type="button";
	button.classList.add("btn");
	htmlNode.appendChild(button);
	return button;
}
function addButtonAdd(htmlNode){
	var button = addButton(htmlNode);
	button.addEventListener('click',addFormAdd);
	button.value="+";
}
function addButtonDel(htmlNode){
	var button = addButton(htmlNode);
	button.addEventListener('click',removeElement);
	button.value="x";
}
function addButtonTrans(htmlNode){
	button = addButton(htmlNode);
	button.addEventListener('click',editTransform);
	button.value="tr";
}
function addButtonAddKey(htmlNode){
	button = addButton(htmlNode);
	button.classList.add("keyframe");
	button.addEventListener('click',addKeyframe);
	button.value="+k";
}

// create the element in the UI controls pad
function createContainer(node){
	var htmlNode = document.createElement("span");
	htmlNode.id = nEl;
	elements[nEl] = node;
	nEl++;
	htmlNode.classList.add("object");
	var textnode = document.createTextNode(type);
	htmlNode.appendChild(textnode);
	addButtonAdd(htmlNode);
	addButtonDel(htmlNode);
	addButtonTrans(htmlNode);
	addButtonAddKey(htmlNode);
	if(levels>0)
		for(let i=0;i<levels;i++){
			var bone = document.createElement("span");
			bone.id = nEl;
			elements[nEl]=node.bones[i]
			nEl++;
			bone.classList.add("bone");
			addButtonAdd(bone);
			addButtonTrans(bone);
			addButtonAddKey(bone);
			htmlNode.appendChild(bone);
		}
	parentNodeContainer.appendChild(htmlNode);
}
// remove the selected element
function removeElement(){
	let nodeId = this.parentElement.id;
	let parentId = this.parentElement.parentElement.id;
	document.getElementById(nodeId).remove();
	if(parentId==0) {
		let idx = scene.findIndex(node=>{node.name==nodeId})
		scene.splice(idx,1);
	}
	else
		elements[parentId].removeChild(nodeId);
	delete elements.nodeId;
	if(!animationRequestID)
		draw(freezeTS);
}
// edit the Node transform
function editTransform(){
	let btns = document.getElementsByClassName("transform");
	for(let i=0; i<btns.length;i++) btns[i].addEventListener('click',setTransform);
	document.getElementById("submit-transforms").addEventListener('click',applyTransform);
	editedNode = elements[this.parentElement.id];
	content.classList.add("disabled");
	formTransCont.classList.remove("inactive");
}
// apply it
function applyTransform(){
	editedNode.transform = modelMatrix;
	modelMatrix = identityMatrix();
	// clean UI and global variables
	formTransCont.classList.add("inactive");
	let btns = document.getElementsByClassName("transform");
	for(let i=0; i<btns.length;i++) btns[i].removeEventListener('click',setTransform);
	document.getElementById("submit-transforms").removeEventListener('click',applyTransform);
	editedNode = null;
	content.classList.remove("disabled");
	if(!animationRequestID)
		draw(freezeTS);
}
// add a new keyframe
function addKeyframe(){
	// setup UI and global variables
	let btns = document.getElementsByClassName("transform");
	for(let i=0; i<btns.length;i++) btns[i].addEventListener('click',createKeyframe);
	let fstime = document.getElementsByClassName("time-field");
	for(let i=0; i<fstime.length;i++) fstime[i].classList.remove("inactive");
	document.getElementById("submit-transforms").addEventListener('click',closeKeyframeEditor);
	editedNode = elements[this.parentElement.id];
	editedNodeContainer = this.parentElement;
	content.classList.add("disabled");
	formTransCont.classList.remove("inactive");
}
// helper function to add a new keyframe button
function addKeyframeButton(timeVal){
	var button = addButton(editedNodeContainer);
	button.classList.add("keyframe");
	button.addEventListener('click',removeKeyframe);
	button.value=timeVal.toString();
}
// create the keyframe on the UI and in the program
function createKeyframe(){
	form = this.parentElement;
	if(!form.checkValidity()) return;
	// get the values
	var inputs = document.getElementsByName(form.id);
	var vals = [];
	inputs.forEach(f=>{vals.push(parseFloat(f.value));});
	var timeForm = document.getElementById("time-".concat(form.id));
	var timeVal = parseFloat(timeForm.value);
	var keyframe;
	switch(form.id){
		case "translation":	keyframe = new Keyframe(timeVal,vals); break;
		case "rotation":	let axis = vec3(vals[0],vals[1],vals[2]);
							let q = axisAngle2Quaternion(axis,vals[3]*Math.PI / 180);
							keyframe = new Keyframe(timeVal,null,q);
							break;
		case "scaling": 	keyframe = new Keyframe(timeVal,null,null,vec3(vals[0],vals[1],vals[2])); break;
	}
	if(editedNode.keyframes==null)
		editedNode.keyframes = new TransformKeyframes();
	let res = editedNode.keyframes.push(keyframe);
	// alert the user that the matrix was updated
	this.value = "Done!";
	this.classList.add("ok");
	this.disabled=true;
	// clean the form
	form.reset();
	// res is true only if there already was a keyframe for the specified timeVal
	if(!res)
		addKeyframeButton(timeVal);
	// get ready for another transform
	setTimeout(() => {this.classList.remove("ok"); this.value = "Apply"; 
	this.disabled=false}, 1000);
	
}
// clean UI and global variables
function closeKeyframeEditor(){
	let btns = document.getElementsByClassName("transform");
	for(let i=0; i<btns.length;i++){
		btns[i].removeEventListener('click',createKeyframe);
		btns[i].parentElement.reset()
	}
	let fstime = document.getElementsByClassName("time-field");
	for(let i=0; i<fstime.length;i++) fstime[i].classList.add("inactive");
	document.getElementById("submit-transforms").removeEventListener('click',closeKeyframeEditor);
	editedNode = null;
	editedNodeContainer = null;
	content.classList.remove("disabled");
	formTransCont.classList.add("inactive");

}
function removeKeyframe(){
	let nodeId = this.parentElement.id;
	let node = elements[nodeId];
	node.keyframes.remove(parseFloat(this.value));
	if(node.keyframes.keyframes.length==0)
		node.keyframes = null;
	this.remove();
}

function setupHowToDraw() {	 
	 // set OpenGL parameters
	 gl.enable( gl.DEPTH_TEST ); 
	//  gl.enable( gl.CULL_FACE ); // back face culling
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
	 // Convert the time to seconds and restart after maxAnimationTime seconds
	var t = (time * 0.001) % maxAnimationTime;
	gl.clearColor(1.0,1.0,1.0,1.0);
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	scene.forEach(element => {
		element.draw(identityMatrix(),Trackball.getView(),Trackball.getProjection(),t);
	});
 }
 
 
 /* callbacks */

function updateAngle(yaw,pitch){
    yaw = toRad(yaw)
    pitch = toRad(pitch)
    var proj = Math.cos(pitch);
	var ldir = [proj*Math.cos(yaw),Math.sin(pitch),proj*Math.sin(yaw),0];
    shaders.forEach(s =>{
        s.lightOppositeDir = ldir;
	})
	if(!animationRequestID)
		draw(freezeTS);
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
		buttonToggleAnimation.setAttribute("value", "Restart");
	}
	else {
		restartingAnimation = true;
		animationRequestID = requestAnimationFrame(animate);
		buttonToggleAnimation.setAttribute("value", "Stop animation");
	}
}	 

function setAnimationRestart(button){
	if(!button.checkValidity())
		return;
	maxAnimationTime = parseFloat(document.getElementById("time-set").value);
}