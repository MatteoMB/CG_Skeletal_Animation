// material object
class Material{
    constructor(ambient,diffuse,specular,shininess){
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
    }
}

// shortening-code functions
function key(elem){
    return Object.keys(elem)[0];
}
function val(elem){
    return Object.values(elem)[0];
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

    // TRS matrix builder
    TRS(t,r,s){
        var m0 = translationMatrix(t[0],t[1],t[2]);
        var m1 = quaternion2Matrix(r);
        var m2 = scalingMatrix(s[0],s[1],s[2]);
        return multMatrix(multMatrix(m0,m1),m2);
    }
    // linear interpolation between points
    lerp(p0,p1,value){
        var weight = (value-key(p0))/(key(p1)-key(p0));
        return sum(scalarMult((1-weight),val(p0)),scalarMult(weight,val(p1)));
    }
    // spherical interpolation
    slerp(q0, q1, value){
        var weight = (value-key(q0))/(key(q1)-key(q0));
        var q0 = normalize(val(q0));
        var q1 = normalize(val(q1));
        var d = dot(q0, q1);
        // if negative dot product, the quaternions have opposite handedness
        // and slerp won't take the shorter path. Fix by reversing one quaternion.
        if(d < 0){
            q1 = scalarMult(-1,q1);
            d *= -1;
        }
        var theta = Math.acos(d) * weight;                       // angle between q0 and result
        var q2 = normalize(subtract(q1,scalarMult(d,q0)));        //{q0, q2} now orthonormal basis
        return  sum(scalarMult(Math.cos(theta),q0),scalarMult(Math.sin(theta),q2));
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
                transforms.push(this.slerp(keys[index-1], keys[index],time));
            else
                transforms.push(this.lerp(keys[index-1], keys[index],time));
        }
        // build the model matrix
        return this.TRS(transforms[0],transforms[1],transforms[2]);
        }
}



// object that stores all the information for drawing. With children array it's possibile
// to build hierarchical objects.
// A Node doesn't necessarily contain a mesh, it can also be used to store hierarchical transformations
class Node{
    constructor(material,model,name,mesh = null,keyframes = null) {
    this.name = name;
    this.mesh = mesh;
    this.material = material;
    this.transform = model;
    this.children = [];
    this.keyframes = keyframes;
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
        // draw itself
        if(this.mesh!=null){
            shader.setUniforms(m,view,projection,this.material);
            this.mesh.draw();
        }
    }
} 