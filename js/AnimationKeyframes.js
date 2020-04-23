function AnimationKeyframes(){
    var translation = [{ 0: vec3(0, 0, 0) }, { 5: vec3(5, 8, -10) }, { 10: vec3(40, 20, 0) }, { 15: vec3(-20, 10, -40) }, { 20: vec3(0, 0, 0) }];
    var scaling = [{ 0: vec3(1, 1, 1) }, { 5: vec3(10, 3, 5) }, { 10: vec3(5, .88, 7) }, { 15: vec3(.3, 10, .5) }, { 20: vec3(1, 1, 1) }];
    var r0 = axisAngle2Quaternion(vec3(1, 0, 0), 0 * Math.PI / 180);
    var r1 = axisAngle2Quaternion(vec3(0, 1, 0), 45 * Math.PI / 180);
    var r2 = axisAngle2Quaternion(vec3(1, 0, 0), 250 * Math.PI / 180);
    var r3 = axisAngle2Quaternion(vec3(0, 0, 1), 300 * Math.PI / 180);
    var r4 = axisAngle2Quaternion(vec3(1, 0, 0), 0);
    var rotation = [{ 0: r0 }, { 5: r1 }, { 10: r2 }, { 15: r3 }, { 20: r4 }];
    return new TransformKeyFrames(translation,rotation,scaling); 
}
