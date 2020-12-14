class SkinnedGpuMesh extends GpuMesh{
    constructor(shader,mesh){
        super(shader,mesh);
        var gl = this.shader.gl;

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
    draw(){
        var gl = this.shader.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferWeights );
        var weightsAttributeIndex = gl.getAttribLocation(this.shader.program, "weights");
        gl.enableVertexAttribArray(weightsAttributeIndex);
        gl.vertexAttribPointer(weightsAttributeIndex , 
                 4, gl.FLOAT , false , 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferIdxs );
        var idxAttributeIndex = gl.getAttribLocation(this.shader.program, "boneIdxs");
        gl.enableVertexAttribArray(idxAttributeIndex);
        gl.vertexAttribPointer(idxAttributeIndex , 
            4, gl.UNSIGNED_BYTE , false , 0, 0);

        super.draw();
     }
}
class SkinnedCpuMesh extends CpuMesh{
    constructor(){
        super();
        this.boneidxs = null;
        this.weights = null;
    }
       /* private methods */
   
    allocate( nverts, ntris ) {
        super.allocate(nverts,ntris);
        this.boneidxs = new Uint8Array(nverts * 4);
        this.weights = new Float32Array(nverts * 4);
    }

    setIdx( i, i0, i1, i2, i3 ){ this.boneidxs.set([i0, i1, i2, i3],i*4) }
    setWgt( i, w0, w1, w2, w3 ){ this.weights.set([w0, w1, w2, w3],i*4) }

}

class SkinnedCpuCylinder extends SkinnedCpuMesh {
    constructor( /*int*/ res, levels ){
       super()
       super.allocate( res*(levels+1), res*levels*2);
       
       for (var i=0; i<res; i++) {
            var a = 2 * Math.PI * i/res;
            var s = Math.sin(a);
            var c = Math.cos(a);
            for (var l=0; l<=levels; l++){
                super.setVert( i+l*res,  c, 2*l , s );
                super.setNorm( i+l*res,  c, 0 , s );
                if(l==0 || l==levels){
                    super.setWgt( i+l*res, 1, 0, 0, 0);
                    super.setIdx( i+l*res, l, 0, 0, 0);
                    }
                else{
                    super.setIdx( i+l*res, l-1, l, 0, 0);
                    super.setWgt( i+l*res, .5, .5, 0, 0);
                }
          }
       };
       for (var i=0; i<res; i++) {
          for (var l=0; l<levels; l++){
             var a = i + l*res;
             var b = (i+1)%res + l*res;
             super.setTri( 2*(i+l*res)  , a,a+res,b+res );
             super.setTri( 2*(i+l*res)+1, b,a,b+res ); 
          }
       }
    //    super.updateAABB();
    //    super.autocenterNormalize();
    }
 }
 