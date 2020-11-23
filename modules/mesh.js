/* GpuMesh:
  (indices to buffers holding) a mesh on video card RAM */
class GpuMesh{
   constructor(gl, mesh) {
        this.gl = gl;
        this.nTris = mesh.tris.length / 3;
        this.minX = mesh.minX;
        this.maxX = mesh.maxX;
        this.minY = mesh.minY;
        this.maxY = mesh.maxY;
        this.minZ = mesh.minZ;
        this.maxZ = mesh.maxZ;
  
        this.bufferVerts = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVerts );
        gl.bufferData(
           gl.ARRAY_BUFFER, 
           mesh.verts, 
           gl.STATIC_DRAW
        );
         
        this.bufferTris = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferTris );
        gl.bufferData(
           gl.ELEMENT_ARRAY_BUFFER, 
           mesh.tris, 
           gl.STATIC_DRAW
        );
   }
   draw(shader) {
      var gl = this.gl
      
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVerts );
      var posAttributeIndex = gl.getAttribLocation(shader.program, "vertexPos");
      gl.enableVertexAttribArray(posAttributeIndex);
      gl.vertexAttribPointer(posAttributeIndex , 
               3, gl.FLOAT , false , 6*4, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferTris );
      var normAttributeIndex = gl.getAttribLocation(shader.program, "normal");
      gl.enableVertexAttribArray(normAttributeIndex);
      gl.vertexAttribPointer(normAttributeIndex , 
               3, gl.FLOAT , false , 6*4, 3*4);
      
      gl.drawElements( 
         gl.TRIANGLES, 
 //         gl.POINTS,
         this.nTris*3, 
         gl.UNSIGNED_SHORT, 
         0
      );
   }
   
}

/*  CpuMesh: a mesh in main memory */
class CpuMesh{
   constructor(){
      this.verts = null;  // geo + norms
      this.tris = null;    // connectivity
      this.minX = 0;        // ABB limits
      this.maxX = 0;
      this.minY = 0;
      this.maxY = 0;
      this.minZ = 0;
      this.maxZ = 0;
   }
   /* methods */  

   /* private methods */
   
   allocate( nverts, ntris ) {
      this.verts = new Float32Array( nverts*6 ); 
      this.tris = new Uint16Array( ntris*3 );
   }

   setTri( i, va, vb, vc ){
      this.tris[ i*3 +0 ] = va;
      this.tris[ i*3 +1 ] = vb;
      this.tris[ i*3 +2 ] = vc;
   }
   
   setQuad( i, va, vb, vc, vd){
      // diagonal split!
      this.setTri( i+0, va, vb, vd );
      this.setTri( i+1, vd, vb, vc );
   }
   
   setVert( i, x,y,z ){
      this.verts[ i*6+0 ] = x;
      this.verts[ i*6+1 ] = y;
      this.verts[ i*6+2 ] = z;
   }
   
   setNorm( i, nx,ny,nz ){
      this.verts[ i*6+3 ] = nx;
      this.verts[ i*6+4 ] = ny;
      this.verts[ i*6+5 ] = nz;
   }

	// shortcuts
   vx(i) { return  this.verts[i*6+0]; }
	vy(i) { return  this.verts[i*6+1]; }
	vz(i) { return  this.verts[i*6+2]; }

	nx(i) { return  this.verts[i*6+3]; }
	ny(i){ return  this.verts[i*6+4]; }
	nz(i){ return  this.verts[i*6+5]; }
	
	nv(){ return this.verts.length/6; }
	nf(){ return this.tris.length/3; }

	// returns position of vert number i
	posOfVert(i){
		return [ this.vx(i), this.vy(i), this.vz(i) ];
	}

	// returns normal of vert number i
	normalOfVert(i){
		return [ this.nx(i), this.ny(i), this.nz(i) ];
	}
	
	// sets the normal of vert i
	setNormalOfVert(i, n){
		this.verts[i*6+3] = n[0];
		this.verts[i*6+4] = n[1];
		this.verts[i*6+5] = n[2];
	}
	
	// returns normal of face number i
	normalOfFace(i){
		var vi, vj, vk;
		vi = this.tris[ i*3 + 0 ];
		vj = this.tris[ i*3 + 1 ];
		vk = this.tris[ i*3 + 2 ];
		var pi,pj,pk;
		pi = this.posOfVert( vi );
		pj = this.posOfVert( vj );
		pk = this.posOfVert( vk );
		var norm = cross( subtract( pi, pk ), subtract( pj, pk ) );
		return normalize(norm);
	}
	
    // input mesh from OFF format - tris only
	importOFFfromString(string){
        string.replace("\n ","\n");
//		var tokens = string.split(/[\n' ']/);
		var tokens = string.split(/\s+/);
		// tokens[0] == "OFF"
		var ti = 0; // token index
		ti++;  // skip "OFF"
		var nv = tokens[ti++]; // number of vertices
		var nf = tokens[ti++]; // number of faces
		ti++;  // skip number of edges
        console.log(tokens[1] + ", " + tokens[2] + ", " + tokens[3]);
        console.log(tokens[4] + ", " + tokens[5] + ", " + tokens[6]);
		
		this.verts = new Float32Array( nv*6 );
			
		for (var i=0; i<nv; i++) {
			this.verts[ i*6 + 0  ] = tokens[ti++]; // X
			this.verts[ i*6 + 1  ] = tokens[ti++]; // Y
			this.verts[ i*6 + 2  ] = tokens[ti++]; // Z
//            console.log(this.verts[ i*6 + 0  ] + ", " +
//                       this.verts[ i*6 + 1  ] + ", " +
//                       this.verts[ i*6 + 2  ]);
		}

		this.tris = new Uint16Array( nf*3 );
		for (var i=0; i<nf; i++) {
			if (tokens[ti++]!=3) { // number of edges (3?) 
                console.log("At face " + i + ": Non triangular face! file input failed.");
                return;
            }
			this.tris[ i*3 + 0 ] = tokens[ti++]; // v0
			this.tris[ i*3 + 1 ] = tokens[ti++]; // v1
			this.tris[ i*3 + 2 ] = tokens[ti++]; // v2
		}
		console.log("Loaded "+nf+" faces and "+nv+" vertices");
	}
	
	updateAABB(){
		if (this.nv()==0) return;
		this.minX = this.maxX = this.vx(0);
		this.minY = this.maxY = this.vy(0);
		this.minZ = this.maxZ = this.vz(0);
		for (var i=1; i<this.nv(); i++) {
			if (this.minX>this.vx(i)) this.minX = this.vx(i);
			if (this.maxX<this.vx(i)) this.maxX = this.vx(i);
			if (this.minY>this.vy(i)) this.minY = this.vy(i);
			if (this.maxY<this.vy(i)) this.maxY = this.vy(i);
			if (this.minZ>this.vz(i)) this.minZ = this.vz(i);
			if (this.maxZ<this.vz(i)) this.maxZ = this.vz(i);
		}
	}
	
	updateNormals(){
		// 1: clear all normals
		for (var i=0; i<this.nv(); i++) this.setNormalOfVert(i, [0,0,0] );
		
		// 2: cumulate normals of all faces on their three vertices
		for (var i=0; i<this.nf(); i++)  {
			var n = this.normalOfFace(i);
			
			var vi, vj, vk; // indices of the three vertices of face i
			vi = this.tris[ i*3 + 0 ];
			vj = this.tris[ i*3 + 1 ];
			vk = this.tris[ i*3 + 2 ];
			
			this.setNormalOfVert( vi, sum( n, this.normalOfVert(vi) ) );
			this.setNormalOfVert( vj, sum( n, this.normalOfVert(vj) ) );
			this.setNormalOfVert( vk, sum( n, this.normalOfVert(vk) ) );
		}
		
		// ciclo 3: normalize all normals
		for (var i=0; i<this.nv(); i++) 
			this.setNormalOfVert( i, normalize( this.normalOfVert(i) )  );
	}

	// centers and rescales the mesh
	// invoke AFTER updating AABB
	autocenterNormalize(){
		var tr = translationMatrix( 
		    -(this.minX+this.maxX)/2.0,
		    -(this.minY+this.maxY)/2.0,
		    -(this.minZ+this.maxZ)/2.0
		);
		var dimX = this.maxX-this.minX;
		var dimY = this.maxY-this.minY;
		var dimZ = this.maxZ-this.minZ;
		var dimMax = Math.max( dimZ, dimY, dimX );
        for (var i=0; i<this.nv(); i++) {
			this.verts[ i*6 + 0  ] = (this.verts[i*6+0]-(this.minX+this.maxX)/2.0)*2.0/dimMax; // X
			this.verts[ i*6 + 1  ] = (this.verts[i*6+1]-(this.minY+this.maxY)/2.0)*2.0/dimMax; // Y
			this.verts[ i*6 + 2  ] = (this.verts[i*6+2]-(this.minZ+this.maxZ)/2.0)*2.0/dimMax; // Z
		}
        this.minX = (this.minX-this.maxX)/dimMax;
        this.maxX = (this.maxX-this.minX)/dimMax;
        this.minY = (this.minY-this.maxY)/dimMax;
        this.maxY = (this.maxY-this.minY)/dimMax;
        this.minZ = (this.minZ-this.maxZ)/dimMax;
        this.maxZ = (this.maxZ-this.minZ)/dimMax;
    }

	// returns the matrix which centers the mesh and scales it 
	// invoke AFTER updating AABB
	autocenteringMatrix(){
		var tr = translationMatrix( 
		    -(this.minX+this.maxX)/2.0,
		    -(this.minY+this.maxY)/2.0,
		    -(this.minZ+this.maxZ)/2.0
		);
		var dimX = this.maxX-this.minX;
		var dimY = this.maxY-this.minY;
		var dimZ = this.maxZ-this.minZ;
		var dimMax = Math.max( dimZ, dimY, dimX );
		var sc = scalingMatrix( 2.0/dimMax );
		
		return multMatrix( sc , tr );
   }
}
       
    
    
    
    /* Procedural meshes */
    
    // Cube with vertex seams: six quad faces joined in a vertex array
class Cube extends CpuMesh {
   setQuadFace(i, v1, v2, v3, v4){
      var v1 = this.vertices[v1];
      var v2 = this.vertices[v2];
      var v3 = this.vertices[v3];
      var v4 = this.vertices[v4];
      super.setVert( i  , v1[0],v1[1],v1[2]);
      super.setVert( i+1, v2[0],v2[1],v2[2]);
      super.setVert( i+2, v3[0],v3[1],v3[2]);
      super.setVert( i+3, v4[0],v4[1],v4[2]);
      // create faces
      super.setQuad( i/2,   i, i+1, i+2, i+3 );
      // set normals
      var n = super.normalOfFace(i/2+1);
      super.setNormalOfVert( i, n);
      super.setNormalOfVert( i+1, n);
      super.setNormalOfVert( i+2, n);
      super.setNormalOfVert( i+3, n);
   }
   constructor(){
      super();
      super.allocate( 24 , 12 );
      //dictionary of vertices
      this.vertices = [ [-1,-1,+1],   [ +1,-1,+1 ], [ -1,-1,-1 ], [ +1,-1,-1 ],
                     [ -1,+1,+1 ], [ +1,+1,+1 ], [ -1,+1,-1 ], [ +1,+1,-1 ] ];
      this.setQuadFace( 0,  0,1,5,4 ); // setta anche 1
      this.setQuadFace( 4,  3,2,6,7 );
      this.setQuadFace( 8,  2,0,4,6 );
      this.setQuadFace( 12, 1,3,7,5 );
      this.setQuadFace( 16, 5,7,6,4 );
      this.setQuadFace( 20, 1,0,2,3 );
   }
}

class Cone extends CpuMesh {
   constructor(/*int*/ res, flat=false ){
      super();
      var z_value = flat? 0:-1;
      super.allocate( res +1, res );

      for (var i=0; i<res; i++) {
         var a = 2 * Math.PI * i/res;
         var s = Math.sin(a);
         var c = Math.cos(a);
         super.setVert( i ,c,z_value, s );
      }
      // vertex
      this.setVert( res,  0,-z_value,0 );
      // connect each couple of subsequent points with the vertex
      for (var i=0; i<res; i++) {
         var j = (i+1)%res;
         super.setTri( i,  j, i, res );
      }
      super.updateNormals();
   }
}

class Cylinder extends CpuMesh {
   constructor( /*int*/ res ){
      super()
      super.allocate( res*2, res*2 );
      
      for (var i=0; i<res; i++) {
         var a = 2 * Math.PI * i/res;
         var s = Math.sin(a);
         var c = Math.cos(a);
         super.setVert( i     ,  c,-1, s );
         super.setVert( i+res ,  c,+1, s );
         super.setNorm( i     ,  c, 0, s );
         super.setNorm( i+res ,  c, 0, s );
      }
      for (var i=0; i<res; i++) {
         var j = (i+1)%res;
         super.setTri( 2*i,  i,i+res,j+res );
         super.setTri( 2*i+1, j,i,j+res );
      }
   }
}

