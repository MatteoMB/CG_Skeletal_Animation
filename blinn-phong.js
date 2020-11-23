// a Blinn_Phong shader
class Blinn_Phong extends Shader{
    constructor(gl){
        var vsSource = `
        uniform mat4 mvp;  // model-view-projection 
        attribute vec3 vertexPos;
        attribute vec3 normal; // per vertex - object space!
        varying vec3 norm_i;

        void main(void) {
            gl_Position = mvp*vec4( vertexPos , 1.0);
            norm_i = normal;
        }
        `;
        var fsSource = `precision highp float;
        struct Material {
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
            float shininess;
        }; 
        
        varying vec3 norm_i;
        uniform Material material;
        uniform vec3 lightDir; // object space!
        uniform vec3 halfWay; // object space!
        uniform vec3 colDiffuse;  // material: different for each object

        vec3 lighting( vec3 norm ) {
            float diffuse = max(  dot( norm, lightDir ) , 0.0 );
            float ambient = max( -dot( norm, lightDir ) , 0.0 )*0.3; // trick
            float specular = pow(max(dot(norm,halfWay),0.0), material.shininess);
            return material.ambient * ambient
                    + material.diffuse  * diffuse
                    + material.specular * specular;
        }

        void main(void)
        {
            vec3 col = lighting( normalize(norm_i) );
            gl_FragColor = vec4( col , 1.0);
        }
        `;
        super(gl,vsSource,fsSource);
    }
    bindAttribLocations(){
        gl.bindAttribLocation( this.program,  0, "vertexPos" );
        gl.bindAttribLocation( this.program,  1, "normal" );
    }
    getUniformLocations(){
        this.getLoc("mvp");
        this.getLoc("lightDir");
        this.getLoc("halfWay");
        this.getLoc("material.ambient");
        this.getLoc("material.diffuse");
        this.getLoc("material.specular");
        this.getLoc("material.shininess");
    }
    setUniforms(model,view,projection,material){
        // part 1: set & upload transformation matrices:
        var mvp = multMatrix( view.matrix, model );
        mvp = multMatrix(projection, mvp );
            
        // part 2: set & upload light directions etc
        var viewDir = [ 0,0,1,0 ]; // eye space, for now
        var halfWay = [];

        var modelInv = invMatrix4(model);
        if(modelInv === undefined)
            console.log(modelInv)
        var viewInv = view.inverse;   
        var ldir = multMatrixVec( modelInv, this.lightOppositeDir);	 // L <- inv(V) * L
        ldir = normalize(ldir);
        // view dir: from eye space (always) to object
        viewDir = multMatrixVec( viewInv, viewDir ); 
        viewDir = multMatrixVec( modelInv, viewDir ); 
        viewDir = normalize(viewDir);
        halfWay = sum(viewDir,ldir);
        halfWay= normalize(halfWay);
        this.setMat4("mvp", mvp);
        this.setVec3("lightDir", ldir);
        this.setVec3("halfWay", halfWay);
        this.setVec3("material.ambient",material.ambient);
        this.setVec3("material.diffuse",material.diffuse);
        this.setVec3("material.specular",material.specular);
        this.setFloat("material.shininess",material.shininess);
    }
}