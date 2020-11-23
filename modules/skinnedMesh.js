class SkinnedGpuMesh extends GpuMesh{
    constructor(gl,mesh){
        super(gl,mesh);
        this.bufferWeights = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferWeights);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            mesh.weights,
            gl.STATIC_DRAW
        );

        this.bufferIdxs = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferIdxs);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            mesh.boneidxs,
            gl.STATIC_DRAW
        );
    }
    draw(shader){
        gl = this.gl;
        weightsAttributeIndex = gl.getAttribLocation(shader.program, "boneIdxs");
        gl.enableVertexAttribArray(weightsAttributeIndex);
        gl.vertexAttribPointer(weightsAttributeIndex , 
                 4, GL_UNSIGNED_BYTE , false , 4*2, 0);
  
        idxAttributeIndex = gl.getAttribLocation(shader.program, "weights");
        gl.enableVertexAttribArray(idxAttributeIndex);
        gl.vertexAttribPointer(idxAttributeIndex , 
                 4, gl.FLOAT , false , 4*4, 0);
        super.draw(shader);
     }
}
class SkinnedCpuMesh extends CpuMesh{
    constructor(){
        super();
        this.boneidxs = null;
        this.weights = null;
    }
       /* private methods */
   
    allocate( nverts, ntris, nbones ) {
        super.allocate(nverts,ntris);
        this.boneidxs = new Uint8Array(nverts * 4);
        this.weights = new Float32Array(nverts * 4);
    }

    setIdx( i, i0, i1, i2, i3 ){ this.boneidxs.set([i0, i1, i2, i3],i*4) }
    setWgt( i, w0, w1, w2, w3 ){ this.weights.set([w0, w1, w2, w3],i*4) }
    // setBone( i, m){ this.bones.set(m,i*16);  }

    // getBoneCpy(i){
    //     res = new Array(16);
    //     return this.bones.subarray(i,i+16).forEach((el, j) => res[j] = el)
    // }
    // getBone(i){ return this.bones.subarray(i,i+16)}
}

class SkinnedCylinder extends SkinnedCpuMesh {
    constructor( /*int*/ res, levels ){
       super()
       super.allocate( res*(levels+1), res*levels*2, levels);
       
       for (var i=0; i<res; i++) {
            var a = 2 * Math.PI * i/res;
            var s = Math.sin(a);
            var c = Math.cos(a);
            for (var l=0; l<=levels; l++){
                super.setVert( i+l*res,  c, l , s );
                super.setNorm( i+l*res,  c, 0 , s );
                if(l==0 || l==levels){
                    super.setWgt( i+l*res, 1, 0, 0, 0)
                    super.setIdx( i+l*res, l, 0, 0, 0);
                    }
                else{
                    super.setIdx( i+l*res, l, l+1, 0, 0);
                    super.setWgt( i+l*res, .5, .5, 0, 0)
                }
          }
       }
       for (var i=0; i<res; i++) {
          for (var l=0; l<levels; l++){
             var a = i + l*res;
             var b = (i+1)%res + l*res;
             super.setTri( 2*(i+l*res)  , a,a+res,b+res );
             super.setTri( 2*(i+l*res)+1, b,a,b+res ); 
          }
       }
    }
 }
 