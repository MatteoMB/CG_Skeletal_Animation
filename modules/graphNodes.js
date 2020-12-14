class Keyframe{
    constructor(time,t=null,r=null,s=null){
        this.time = time;
        this.t = t;
        this.r = r;
        this.s = s;
    }
    getProperty(string){
        switch(string){
            case "time":    return this.time;
            case "t":       return this.t;
            case "r":       return this.r;
            case "s":       return this.s;
            default: throw "Keyframe hasn't got this property";
        }
    }
    merge(keyframe){
        if(this.time!=keyframe.time) throw "cannot merge different keyframes";
        if(keyframe.t!=null) this.t = keyframe.t;
        if(keyframe.r!=null) this.r = keyframe.r;
        if(keyframe.s!=null) this.s = keyframe.s;
    }
}
// Transform Keyframes object: it stores translation, rotation and scaling keyframes
// (arrays of {time : transformation} )
class TransformKeyframes{
    constructor(){
        this.keyframes = [];
    }
    push(keyframe){
        var index = this.keyframes.findIndex((el)=>el.time >= keyframe.time);
        if(index < 0){
            this.keyframes.push(keyframe);
            return false;
        }
        if(this.keyframes[index].time == keyframe.time){
            this.keyframes[index].merge(keyframe);
            return true;
        }
        this.keyframes.splice(index, 0, keyframe);
        return false;
    }
    remove(time){
        var index = this.keyframes.findIndex((el)=>el.time == time);
        if(index>=0)
            this.keyframes.splice(index, 1);
        return index;
    }
        // evaluator function: returns the interpolated transformation matrix at time = time
    value(time){
        // store here the transformations to be performed on the object
        var transforms = [];
        for(let i = 0; i < 3; i++){
            var p,interpolation;
            switch(i){
                case 0:     p="t", interpolation=lerp; break;
                case 1:     p="r", interpolation=slerp;break;
                case 2:     p="s", interpolation=lerp; break;
            }
            let next = this.keyframes.findIndex((el)=>el.time > time && el.getProperty(p)!=null);
            let last = next<0 ? this.keyframes.length-1: next - 1;
            while(last>=0 && this.keyframes[last].getProperty(p)==null) last-=1;
            if(last<0)
                transforms.push(null);
            else if(next<0)
                transforms.push(this.keyframes[last].getProperty(p));
            else
                transforms.push(interpolation(  this.keyframes[last].getProperty(p),this.keyframes[last].time,
                                                this.keyframes[next].getProperty(p),this.keyframes[next].time,
                time));
        }
        // build the model matrix
        return TRS(transforms[0],transforms[1],transforms[2]);
    }
}



// object that stores all the information for drawing. With children array it's possibile
// to build hierarchical objects.
// A Node doesn't necessarily contain a mesh, it can also be used to store hierarchical transformations
class Node{
    constructor(model,name="",keyframes = null) {
        this.transform = model;
        this.children = [];
        this.keyframes = keyframes;
        this.name=name;
        }
    push(node){
        this.children.push(node);
    }
    removeChild(id){
        this.children = this.children.filter(node=>node.name!=id);
    }
    // draw function 
    draw(model,view,projection,time){
        // evaluate keyframes if there are any and use the resulting matrix m
        this.now = this.keyframes !=null ? multMatrix(this.keyframes.value(time),this.transform) : this.transform;
        // build model matrix multiplying to the left the father's model matrix
        var t = multMatrix(model,this.now);
        // draw its children with an updated modeling matrix
        this.children.forEach(child => {
            child.draw(t,view,projection,time);
        });
        return t;
    }
}

class MeshNode extends Node{
    constructor(material,model,mesh,name="",keyframes = null){
        super(model,name,keyframes);
        this.mesh = mesh;
        this.material = material;
        }
    draw(m,v,p,time){
        var t = super.draw(m,v,p,time);
        // draw itself
        this.mesh.shader.setUniforms(t,v,p,this.material);
        this.mesh.draw();
    }
}

class Bone extends Node{
    constructor(model,meshNode,name="",keyframes = null){
        super(identityMatrix(),name,keyframes);
        this.meshNode = meshNode;
        meshNode.setBone(this);
        this.bind = model;
        this.offset = invMatrix4(model);
    }
    addBone(model,name="",keyframes = null){
        var bone = new Bone(model,this.meshNode,name,keyframes);
        super.push(bone);
        return bone;
    }
    draw(m,v,p,time){
        super.draw(multMatrix(m,this.bind),v,p,time);
        this.now = multMatrix(this.bind,this.now);
        this.now = multMatrix(this.now,this.offset);
        this.matrix.set(this.now,0);
    }
}

class SkinnedMeshNode extends Node{
    constructor(material,model,mesh,nBones,name="",keyframes = null){
        super(model,name,keyframes);
        this.name = name;
        this.mesh = mesh;
        this.material = material;
        this.nBones = nBones;
        this.boneArray = new Float32Array(nBones*16);
        this.bones = [];
        this.filled = 0;
        // prepare the texture for bone matrices
        this.boneMatrixTexture = this.mesh.shader.createTexture();
    }
    setBone(bone){
        if(this.filled >= this.nBones)
            throw "Skeleton Full";
        var view = new Float32Array(this.boneArray.buffer,this.filled * 4 * 16, 16);
        this.filled += 1;
        bone.matrix = view;
        this.bones.push(bone)
    }
    addBone(model,keyframes=null){
        var bone = new Bone(model,this,keyframes);
        this.push(bone);
        return bone;
    }
    draw(m,v,p,time){
        if(this.filled != this.nBones)
            throw "Some bones are missing";
        var t = super.draw(m,v,p,time);
        // draw itself
        this.mesh.shader.setUniforms(t,v,p,this.material,this.nBones,this.boneMatrixTexture,this.boneArray);
        this.mesh.draw();
    }
}

class SkinnedCylinder extends SkinnedMeshNode{
    constructor(shader,mat,m,res,levels,name="cyl",keyframes=null){
        var cpuMesh = new SkinnedCpuCylinder(res,levels);
        var mesh = new SkinnedGpuMesh(shader,cpuMesh);
        super(mat,m,mesh,levels,name,keyframes);
        for(var i=0; i<levels;i++)  this.addBone(translationMatrix(0,i*2,0));
    }
}