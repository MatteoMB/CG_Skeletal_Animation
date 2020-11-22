var Trackball = {
	// x, y and z position of the camera
	x: 0.0,
	y: 0.0,
	d: 20.0,
	// current rotations
	qcurr: identityQuaternion(),
	// trackball sphere radius
	r: .8,
	// canvas dimension
	width: 0,
	height: 0,
	
	getProjection: function(){
		var aspectRatio = this.width/this.height;
		return perspectiveMatrixFOV( 35, aspectRatio, 0.1*this.d, 100.0*this.d );
		//ortho(-5,5,-5,5,0.1*trackball.d, 100.0*trackball.d );
	},
	// return the view matrix with its inverse
	getView: function() {
		var m1 = translationMatrix(this.x,this.y,-this.d );
		var m2 = quaternion2Matrix(this.qcurr);
		var inv1 = translationMatrix(-this.x,-this.y,this.d);
		var inv2 = transposeMatrix4(m2);
		return {matrix:multMatrix(m1,m2),inverse:multMatrix(inv2,inv1)};
	},
	// "private" support function that inverts viewport transformation of a point on the
	// screen and projects it on the virtual sphere or on the iperbolic function
	rescaleAndProject: function(x,y){
		var xClip = 2*x/this.width - 1;
		var yClip = 2*(this.height - y)/this.height -1;
		var p2 = xClip*xClip+yClip*yClip;
		var r2 = this.r*this.r;
		// check if the point falls on the sphere o in the iperbolic function
		var z = (2*p2 < r2)? Math.sqrt(r2-p2) : r2/(2*Math.sqrt(p2));
		return vec3(xClip,yClip,z);
	},
	// rotate the view
	rotate: function(oldX,oldY,mouseX,mouseY){
		var p0 = normalize(this.rescaleAndProject(oldX,oldY));
		var p1 = normalize(this.rescaleAndProject(mouseX,mouseY));
		var d = dot(p0,p1);
		// avoid machine errors changing d
		d = d > 1 ? 1 : d;
		d = d < -1 ? -1 : d;
		let phi = 2 * Math.acos(d);
		let qnew = axisAngle2Quaternion(cross(p0,p1),phi);
		this.qcurr = multQuaternion(qnew,this.qcurr);
	},
	pan: function(dx,dy){
		this.x += dx * 0.001 * this.d;
		this.y -= dy * 0.001 * this.d;
	},
	dolly: function(deltaY) {
		var d = this.d*(1+deltaY/(3*Math.abs(deltaY)));
        if(d < 0.001) 
			this.d = 0.001;
		else this.d = d;
	}
 };