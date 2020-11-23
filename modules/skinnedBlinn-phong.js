class Skinned_Blinn_Phong extends Blinn_Phong{
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
        gl.bindAttribLocation( this.program,  2, "boneIdxs" );
        gl.bindAttribLocation( this.program,  3, "weights" );
    }
    getUniformLocations(){
        super.getUniformLocations();
        this.getLoc("bones");
    }
    setUniforms(model,view,projection,material,bones){
        super.setUniforms(model,view,projection,material);
        this.setMat4("bones", bones);
    }
}