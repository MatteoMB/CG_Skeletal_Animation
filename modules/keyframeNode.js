// material object
class Material{
    constructor(ambient,diffuse,specular,shininess){
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
    }
}


// Transform Keyframes object: it stores translation, rotation and scaling keyframes
// (arrays of {time : transformation} )
class TransformKeyFrames{

    constructor(t_keys,r_keys,s_keys){
        //sorting function
        var sub = (a,b)=>(key(a)-key(b));
        // Array of arrays of keyframes (translation, rotation, scaling)
        this.keyframes = [t_keys.sort(sub),r_keys.sort(sub),s_keys.sort(sub)];
    }
        // evaluator function: returns the interpolated transformation matrix at time = time
    value(time){
        // store here the transformations to be performed on the object
        var transforms = [];
        for(let i = 0; i < 3; i++){
            var keys = this.keyframes[i];
            // if time is before the first key return the first value
            if(time <= key(keys[0])){
                transforms.push(val(keys[0]));
                continue;
            }
            // same for the last key
            if(time >= keys[keys.length-1]){
                transforms.push(val(keys[keys.length-1]));
                continue;
            }
            // look for the first item with key greater than time
            var index = keys.findIndex((el)=>key(el)>time);
            // use spherical interpolation for rotation
            if(i==1)
                transforms.push(slerp(keys[index-1], keys[index],time));
            else
                transforms.push(lerp(keys[index-1], keys[index],time));
        }
        // build the model matrix
        return TRS(transforms[0],transforms[1],transforms[2]);
        }
}



// object that stores all the information for drawing. With children array it's possibile
// to build hierarchical objects.
// A Node doesn't necessarily contain a mesh, it can also be used to store hierarchical transformations
class Node{
    constructor(model,keyframes = null) {
        this.transform = model;
        this.children = [];
        this.keyframes = keyframes;
        }
    add(node){
        this.children.push(node);
    }
    // draw function 
    draw(shader,model,view,projection,time){
        // evaluate keyframes if there are any and use the resulting matrix m
        var m = this.keyframes !=null ? multMatrix(this.keyframes.value(time),this.transform) : this.transform;
        // build model matrix multiplying to the left the father's model matrix
        m = multMatrix(model,m);
        // draw its children with an updated modeling matrix
        this.children.forEach(child => {
            child.draw(shader,m,view,projection,time);
        });
        return m;
    }
}
class MeshNode extends Node{
    constructor(material,model,mesh,keyframes = null,name=""){
        super(model,keyframes);
        this.name = name;
        this.mesh = mesh;
        this.material = material;
        }
    draw(shader,model,view,projection,time){
        var m = super.draw(shader,model,view,projection,time);
        // draw itself
        shader.setUniforms(m,view,projection,this.material);
        this.mesh.draw(shader);
        return m;
    }
}
class Bone extends Node{
    constructor(model,pointer,keyframes = null){
        super(model,keyframes);
        this.pointer = pointer;
    }
    draw(shader,model,view,projection,time){
        var m = super.draw(shader,model,view,projection,time);
        shader.setBoneUniforms(pointer,m);
        return m;
    }
    
}

class SkinnedMesh extends MeshNode{
    constructor(material,model,mesh,nbones,keyframes = null,name=""){
        super(material,model,name,mesh,keyframes);
        this.boneArray = new Float32Array(nbones*4);
        this.bones = null;
    }
    addBone(bone){
        this.bones.push(bone);
    }
    draw(shader,model,view,projection,time){
        this.bones.forEach(bone => bone.draw);
        // draw indexes and weights
        super.draw(shader,model,view,projection,time);
        return m;
    }
}
