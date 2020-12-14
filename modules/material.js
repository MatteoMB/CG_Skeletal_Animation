// material object
class Material{
    constructor(ambient,diffuse,specular,shininess){
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
    }
}
 //Materials
 var mat = new Material(vec3(.1,.18725,.1745), vec3(.396,.74151,.69102),vec3(.297254,.30829,.306678),.1*128);
 var mat2 = new Material(vec3(0.05375,0.05,0.06625),vec3(0.18275,0.17,0.22525),vec3(0.332741,0.328634,0.346435),0.3*128);