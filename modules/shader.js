function checkCompilation(gl,shader){
    var message = gl.getShaderInfoLog(shader);
    if (message.length > 0){
        /* message may be an error or a warning */
        console.log("Shader compilation result: ")
        console.log(message);
    }
}
// generic Shader object,can be instantiated to create different shaders
class Shader{
    constructor(gl){
        this.gl = gl;
        this.lightOppositeDir= [0,1,0,0];
        // array with uniform locations
        this.loc = [];
        this.setSources()
        // set the VERTEX SHADER
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, this.vsSource);
        gl.compileShader(vertexShader);	
        checkCompilation(gl,vertexShader);		   
        // set the FRAGMENT SHADER
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, this.fsSource);
        gl.compileShader(fragmentShader);
        checkCompilation(gl,fragmentShader);
        // join them in a "PROGRAM"
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        // tell webGL where to find attributes
        this.bindAttribLocations();
        gl.linkProgram(this.program);
        this.getUniformLocations();
    }
    // get uniform locations
    getLoc(name){
        this.loc[name] = this.gl.getUniformLocation(this.program, name)
    }
    use(){
        this.gl.useProgram(this.program);
    }
    // send uniforms to GPU
    setVec3(name,value){
        this.gl.uniform3f(this.loc[name],value[0],value[1],value[2] );
    }
    setFloat(name,value){
        this.gl.uniform1f(this.loc[name],value);
    }
    setInt(name,value){
        this.gl.uniform1i(this.loc[name],value);
    }
    setMat4(name,value){
        this.gl.uniformMatrix4fv( this.loc[name], false, new Float32Array(value));
    }
    // empty functions to be overridden in each child shader class
    setSources(){}
    bindAttribLocations(){}
    getUniformLocations(){}
    setUniforms(){}
}

