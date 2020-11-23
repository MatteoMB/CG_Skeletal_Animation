/* 
   matrices.js:
   function to handle matrices
   Courtesy of Marco Tarini, Università dell'Insubria
*/ 

/* ALL MATRICES ARE IN COLUMN-MAJOR FORMAT  */
/* ALL ANGLES ARE IN DEGREES                */

function identityMatrix() {
	return [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1
	];
}
function rotationXMatrix( deg ){
	var s = Math.sin( deg * 3.1415 / 180);
	var c = Math.cos( deg * 3.1415 / 180);
	return res = [
	   1 ,0 ,0 ,0,
	   0 ,c ,s ,0,
	   0 ,-s,c ,0,
	   0 ,0, 0 ,1
	];
}

function rotationYMatrix( deg ){
	var s = Math.sin( deg * 3.1415 / 180);
	var c = Math.cos( deg * 3.1415 / 180);
	return res = [
	   c ,0 ,-s,0,
	   0 ,1 ,0 ,0,
	   s ,0, c ,0,
	   0 ,0, 0 ,1
	];
}

function rotationZMatrix( deg ){
	var s = Math.sin( deg * 3.1415 / 180);
	var c = Math.cos( deg * 3.1415 / 180);
	return res = [
	   c ,s ,0 ,0,
	   -s,c ,0 ,0,
	   0 ,0, 1 ,0,
	   0 ,0, 0 ,1
	];
}

function translationMatrix( dx, dy, dz ){
	return [
	   1 ,0 ,0 ,0,
	   0 ,1 ,0 ,0,
	   0 ,0 ,1 ,0,
	   dx,dy,dz,1
	];
}

function scalingMatrix( sx, sy, sz ){
    if (typeof sy == 'undefined' ) sy = sx;
    if (typeof sz == 'undefined' ) sz = sx;
	return [
	   sx,0 ,0 ,0,
	   0 ,sy,0 ,0,
	   0 ,0 ,sz,0,
	   0 ,0 ,0 ,1
	];
}
function perspectiveMatrix( focal, aspect, near, far ){
	return [
	   focal ,0           ,0 ,                     0,
	   0     ,focal*aspect,0 ,                     0,
	   0     ,0           ,(far+near)/(near-far) ,-1,  
	   0     ,0           ,2*far*near/(near-far) , 0
	];
}

function perspectiveMatrixFOV( fov, aspect, near, far ){
    var focal = 1.0/Math.tan(fov * 3.1415 / 360);
	return [
	   focal/aspect,   0,     0,                      0,
	   0           ,   focal, 0,                      0,
	   0           ,   0,     (far+near)/(near-far), -1,  
	   0           ,   0,     2*far*near/(near-far),  0
	];
}
function ortho(left, right, bot, top, near, far){
    // """ orthogonal projection matrix for OpenGL """
    var dx = right - left
    var dy = top - bot
    var dz = far - near
    var rx = -(right+left) / dx;
    var ry =  -(top+bot) / dy;
    var rz =  -(far+near) / dz;
    return transposeMatrix4([	2/dx, 0,    0,     rx,
								0,    2/dy, 0,     ry,
								0,    0,    -2/dz, rz,
								0,    0,    0,     1]);
	}
function multMatrix( a, b ) {
	/* product row by column */
	var res = [];
	for (var i=0; i<4; i++)    // column
	for (var j=0; j<4; j++) {  // row
		res[i*4+j] = 0;
		for (var k=0; k<4; k++)
			res[i*4+j] += a[k*4+j] * b[i*4+k];
	}
	return res;
}

function multMatrixVec( a, v ) {
    var res = [];
    for (var j=0; j<4; j++) {  // row
        res[j]=0;
        for (var k=0;k<4;k++)
            res[j] += a[k*4+j]*v[k];
    }
    return res;
}

function norm( v ){
	var res = 0;
	v.forEach(elem => {
		res += elem*elem;
	});
    return Math.sqrt(res);
}

function transposeMatrix3(m) {
    return [m[0], m[3], m[6],
            m[1], m[4], m[7],
            m[2], m[5], m[7]];
}

function transposeMatrix4(m) {
    return [m[0], m[4], m[ 8], m[12],
            m[1], m[5], m[ 9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]];
}

function detMatrix3(m) {
    return  m[0]*(m[4]*m[8]-m[5]*m[7]) -
            m[1]*(m[3]*m[8]-m[5]*m[6]) +
            m[2]*(m[3]*m[7]-m[4]*m[6]);
}

function invMatrix3(m) {
    var det = detMatrix3(m);
    if (det == 0) return [0,0,0,0,0,0,0,0,0];
    var A = m[4]*m[8]-m[7]*m[5];
    var B = m[7]*m[2]-m[1]*m[8];
    var C = m[5]*m[1]-m[4]*m[2];
    var D = m[6]*m[5]-m[3]*m[8];
    var E = m[0]*m[8]-m[6]*m[2];
    var F = m[3]*m[2]-m[0]*m[5];
    var G = m[3]*m[7]-m[6]*m[4];
    var H = m[6]*m[1]-m[0]*m[7];
    var I = m[4]*m[0]-m[3]*m[1];
    return [A/det, B/det, C/det,
            D/det, E/det, F/det,
            G/det, H/det, I/det];
}
    
function invMatrix4(m) {
    var a = [m[0], m[1], m[2], 
             m[4], m[5], m[6], 
             m[8], m[9], m[10]];
    var b = [m[12], m[13], m[14]];
    a = invMatrix3(a);
    var c = [-a[0]*b[0]-a[3]*b[1]-a[6]*b[2],
             -a[1]*b[0]-a[4]*b[1]-a[7]*b[2],
             -a[2]*b[0]-a[5]*b[1]-a[8]*b[2]];
    return [a[0], a[1], a[2], 0,
            a[3], a[4], a[5], 0,
            a[6], a[7], a[8], 0,
            c[0], c[1], c[2], 1];
}
function rotate(axis=vec3(1., 0., 0.), deg=0.0){
	var ax = normalize(axis);
	var x = ax[0], y = ax[1], z = ax[2];
	var s = Math.sin( deg * 3.1415 / 180);
	var c = Math.cos( deg * 3.1415 / 180);
    var nc = 1 - c;
    return transposeMatrix4([	x*x*nc + c,   x*y*nc - z*s, x*z*nc + y*s, 0,
                    			y*x*nc + z*s, y*y*nc + c,   y*z*nc - x*s, 0,
                    			x*z*nc - y*s, y*z*nc + x*s, z*z*nc + c,   0,
					 			0,            0,            0,            1])
	}
/* Vector utilities */
function vec3( x,y,z ){
	return [x,y,z];
}
function scalarMult(n,v){
	var res = [];
	v.forEach((elem,i)=>{res[i] = n*elem;});
    return res;
}
function subtract( a,b ){
	var res = [];
	a.forEach((elem,i)=>{res[i] = elem - b[i];});
    return res;
}

function sum( a,b ){
	var res = [];
	a.forEach((elem,i)=>{res[i] = elem + b[i];});
    return res;
}
function dot( a,b ){
	var res = 0;
	a.forEach((elem,i)=>{res += elem * b[i];});
    return res;
}
function cross( a,b ){
	return [ 
		a[1]*b[2] - a[2]*b[1], 
		a[2]*b[0] - a[0]*b[2], 
		a[0]*b[1] - a[1]*b[0], 
		];
}
function normalize( a ){
	let k = norm(a);
	if(k==0) return a;
	var res = [];
	a.forEach((elem,i)=>{res[i] = elem/k;});
    return res;
}

/* Quaternion utilities */

function identityQuaternion(){
	return [1, 0, 0, 0];
}
function W(q){
	return q[0];
}
function V(q){
	return [q[1],q[2],q[3]];
}
function quaternion(w,v){
	return [w, v[0], v[1], v[2]];
}
function axisAngle2Quaternion(axis,alpha){
	var v = scalarMult(Math.sin(alpha/2),normalize(axis));
	return quaternion(Math.cos(alpha/2),v);
}
function multQuaternion(v1,v2){
	var a = v1,
		b = v2;
	return quaternion(W(a)*W(b) - dot(V(a),V(b)),
			sum(sum(scalarMult(W(b),V(a)),scalarMult(W(a),V(b))),cross(V(a),V(b))));
}

function quaternion2Matrix(a){
	let q = normalize(a)
	let w = W(q),
	 x = V(q)[0],
	 y = V(q)[1],
	 z = V(q)[2];
	return transposeMatrix4([
			1-2*y*y-2*z*z,	2*x*y-2*w*z,	2*x*z+2*w*y,	0,
			2*x*y+2*w*z,	1-2*x*x-2*z*z,	2*z*y-2*w*x,	0,
			2*x*z-2*w*y,	2*y*z+2*w*x,	1-2*x*x-2*y*y,	0,
			0,				0,				0,				1
		]);
}
function quaternion2AxisAngle(q){
	return [normalize(V(q)),2*Math.acos(W(q))];
}


/* Interpolation utilities */

// shortening-code functions
function key(elem){
    return Object.keys(elem)[0];
}
function val(elem){
    return Object.values(elem)[0];
}
// TRS matrix builder
function TRS(t,r,s){
	var m0 = translationMatrix(t[0],t[1],t[2]);
	var m1 = quaternion2Matrix(r);
	var m2 = scalingMatrix(s[0],s[1],s[2]);
	return multMatrix(multMatrix(m0,m1),m2);
}
// linear interpolation between points
function lerp(p0,p1,value){
	var weight = (value-key(p0))/(key(p1)-key(p0));
	return sum(scalarMult((1-weight),val(p0)),scalarMult(weight,val(p1)));
}
// spherical interpolation
function slerp(q0, q1, value){
	var weight = (value-key(q0))/(key(q1)-key(q0));
	var q0 = normalize(val(q0));
	var q1 = normalize(val(q1));
	var d = dot(q0, q1);
	// if negative dot product, the quaternions have opposite handedness
	// and slerp won't take the shorter path. Fix by reversing one quaternion.
	if(d < 0){
		q1 = scalarMult(-1,q1);
		d *= -1;
	}
	var theta = Math.acos(d) * weight;                       // angle between q0 and result
	var q2 = normalize(subtract(q1,scalarMult(d,q0)));        //{q0, q2} now orthonormal basis
	return  sum(scalarMult(Math.cos(theta),q0),scalarMult(Math.sin(theta),q2));
}
