function AnimationKeyframesOld(){
    var translation = [{ 0: vec3(0, 0, 0) }, { 5: vec3(5, 8, -10) }, { 10: vec3(40, 20, 0) }, { 15: vec3(-20, 10, -40) }, { 20: vec3(0, 0, 0) }];
    var scaling = [{ 0: vec3(1, 1, 1) }, { 5: vec3(10, 3, 5) }, { 10: vec3(5, 1, 7) }, { 15: vec3(3, 6, 3) }, { 20: vec3(1, 1, 1) }];
    var r0 = axisAngle2Quaternion(vec3(1, 0, 0), 0 * Math.PI / 180);
    var r1 = axisAngle2Quaternion(vec3(0, 1, 0), 45 * Math.PI / 180);
    var r2 = axisAngle2Quaternion(vec3(1, 0, 0), 250 * Math.PI / 180);
    var r3 = axisAngle2Quaternion(vec3(0, 0, 1), 300 * Math.PI / 180);
    var r4 = axisAngle2Quaternion(vec3(1, 0, 0), 0);
    var rotation = [{ 0: r0 }, { 5: r1 }, { 10: r2 }, { 15: r3 }, { 20: r4 }];
    return new TransformKeyframes(translation,rotation,scaling); 
}
function AnimationKeyframes(){
    var zero     = new Keyframe(0, [0,0,0],     axisAngle2Quaternion(vec3(1,0,0),  0 * Math.PI / 180),[1,1,1])
    var five     = new Keyframe(5, [5,8,-10],   axisAngle2Quaternion(vec3(0,1,0), 45 * Math.PI / 180),[10,3,5])
    var ten      = new Keyframe(10,[40,20,0],   axisAngle2Quaternion(vec3(1,0,0),250 * Math.PI / 180),[5,1,7])
    var fifteen  = new Keyframe(15,[-20,10,-40],axisAngle2Quaternion(vec3(0,0,1),300 * Math.PI / 180),[1,6,1])
    var twenty   = new Keyframe(20,[0,0,0],     axisAngle2Quaternion(vec3(1,0,0),  0 * Math.PI / 180),[1,1,1])
    return new TransformKeyframes([zero,five,ten,fifteen,twenty]);
}