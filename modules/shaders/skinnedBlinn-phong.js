class Skinned_Blinn_Phong extends Blinn_Phong{
    constructor(gl){
        var ext = gl.getExtension('OES_texture_float');
        if(!ext) throw "OES_texture_float extension not available"
        super(gl);
    }
    setSources(){
        this.vsSource = `
        uniform mat4 mvp;  // model-view-projection 
        uniform sampler2D boneMatrixTexture;
        uniform float nBones;

        attribute vec3 vertexPos;
        attribute vec3 normal; // per vertex - object space!
        attribute vec4 boneIdxs;
        attribute vec4 weights;

        varying vec3 norm_i;

        // these offsets assume the texture is 4 pixels across
        #define ROW0 ((0.5 + 0.0) / 4.)
        #define ROW1 ((0.5 + 1.0) / 4.)
        #define ROW2 ((0.5 + 2.0) / 4.)
        #define ROW3 ((0.5 + 3.0) / 4.)

        mat4 getBoneMatrix(float index) {
            float v = (index + .5)/nBones;
            return mat4(
                texture2D(boneMatrixTexture, vec2(ROW0, v)),
                texture2D(boneMatrixTexture, vec2(ROW1, v)),
                texture2D(boneMatrixTexture, vec2(ROW2, v)),
                texture2D(boneMatrixTexture, vec2(ROW3, v)));
            }

        void main(void) {
            mat4 skinMatrix =   getBoneMatrix(boneIdxs[0]) * weights[0] +
                                getBoneMatrix(boneIdxs[1]) * weights[1] +
                                getBoneMatrix(boneIdxs[2]) * weights[2] +
                                getBoneMatrix(boneIdxs[3]) * weights[3];
            gl_Position = mvp * skinMatrix * vec4( vertexPos , 1.0);
            norm_i = mat3(skinMatrix) * normal;
        }
        `;
        this.fsSource = `precision highp float;
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
    }
    bindAttribLocations(){
        super.bindAttribLocations();
        this.gl.bindAttribLocation( this.program,  2, "boneIdxs" );
        this.gl.bindAttribLocation( this.program,  3, "weights" );
    }
    getUniformLocations(){
        super.getUniformLocations();
        this.getLoc("boneMatrixTexture");
        this.getLoc("nBones");
    }
    createTexture(){
        var boneMatrixTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, boneMatrixTexture);
        // since we want to use the texture for pure data we turn
        // off filtering
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // also turn off wrapping since the texture might not be a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return boneMatrixTexture;
    }
    setUniforms(model,view,projection,material,nBones,tex,boneArray){
        super.setUniforms(model,view,projection,material);
        this.setFloat("nBones", nBones);
        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,         // level
            gl.RGBA,   // internal format
            4,         // width 4 pixels, each pixel has RGBA so 4 pixels is 16 values
            nBones,  // one row per bone
            0,         // border
            gl.RGBA,   // format
            gl.FLOAT,  // type
            boneArray);
        // Tell the shader we bound the texture to texture unit 0
        this.setInt("boneMatrixTexture", 0);
    }
}