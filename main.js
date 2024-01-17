'use strict';

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.
let light = [];
let locatio = [0.5, 0.5]

window.onkeydown = (e) => {
    if (e.keyCode == 87) {
        locatio[0] = Math.min(locatio[0] + 0.05, 1);
    }
    else if (e.keyCode == 65) {
        locatio[1] = Math.max(locatio[1] - 0.05, 0);
    }
    else if (e.keyCode == 83) {
        locatio[0] = Math.max(locatio[0] - 0.05, 0);
    }
    else if (e.keyCode == 68) {
        locatio[1] = Math.min(locatio[1] + 0.05, 1);
    }
}

function deg2rad(angle) {
    return angle * Math.PI / 180;
}


// Constructor
function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iTexCoordBuffer = gl.createBuffer();
    this.count = 0;

    this.BufferData = function (vertices) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

        this.count = vertices.length / 3;
    }
    this.BufferDataNormals = function (normals) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STREAM_DRAW);

    }
    this.BufferDataTexCoords = function (texCoords) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STREAM_DRAW);

    }

    this.Draw = function () {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexCoord);

        gl.drawArrays(gl.TRIANGLES, 0, this.count);
    }
    this.DrawSphere = function () {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        gl.drawArrays(gl.TRIANGLES, 0, this.count);
    }
    this.DrawLine = function () {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.drawArrays(gl.LINE_LOOP, 0, this.count);
    }

}


// Constructor
function ShaderProgram(name, program) {

    this.name = name;
    this.prog = program;

    // Location of the attribute variable in the shader program.
    this.iAttribVertex = -1;
    // Location of the uniform specifying a color for the primitive.
    this.iColor = -1;
    // Location of the uniform matrix representing the combined transformation.
    this.iModelViewProjectionMatrix = -1;

    this.Use = function () {
        gl.useProgram(this.prog);
    }
}


/* Draws a colored cube, along with a set of coordinate axes.
 * (Note that the use of the above drawPrimitive function is not an efficient
 * way to draw with WebGL.  Here, the geometry is so simple that it doesn't matter.)
 */
function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Set the values of the projection transformation */
    let projection = m4.perspective(Math.PI / 8, 1, 8, 12);

    /* Get the view matrix from the SimpleRotator object.*/
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -10);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    /* Multiply the projection matrix times the modelview matrix to give the
       combined transformation matrix, and send that to the shader program. */
    let modelViewProjection = m4.multiply(projection, matAccum1);

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);

    /* Draw the six faces of a cube, with different colors. */
    gl.uniform4fv(shProgram.iColor, [1, 1, 0, 1]);
    let x = Math.sin(Date.now() * 0.001);
    let y = -Math.cos(Date.now() * 0.001);
    let z = 1;
    gl.uniform3fv(shProgram.iPosition, [x, y, z]);
    gl.uniform3fv(shProgram.iDirection, [-x, -y, -z]);
    gl.uniform1f(shProgram.iLimit, document.getElementById('limit').value);
    gl.uniform1f(shProgram.iBorder, document.getElementById('border').value);
    gl.uniform1f(shProgram.iScale, document.getElementById('scale').value);
    gl.uniform2fv(shProgram.iLocation, locatio);

    surface.Draw();
    gl.uniform1f(shProgram.iBorder, 1000);
    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, m4.multiply(modelViewProjection,
        m4.translation(...CreateDingDongVertex(locatio[0] * 2 * Math.PI, locatio[1] * 2 - 1))));
    light[0].DrawSphere();
    // light[1].BufferData([-x, -y, -z, 0, 0, 0])
    // light[1].DrawLine();
}

function CreateAnimation() {
    draw()
    window.requestAnimationFrame(CreateAnimation)
}

function CreateSurfaceData() {
    let vertexList = [];

    for (let i = 0; i < 360; i += 5) {
        vertexList.push(Math.sin(deg2rad(i)), 1, Math.cos(deg2rad(i)));
        vertexList.push(Math.sin(deg2rad(i)), 0, Math.cos(deg2rad(i)));
    }

    return vertexList;
}

let a = 1;
function CreateDingDongSurfaceData() {

    let divisionsU = 150;
    let divisionsV = 150;

    let vertexList = [];
    let normalList = [];
    let texCoordList = [];
    let u1 = 1 / (divisionsU - 1) * 2 * Math.PI
    let v1 = 1 / (divisionsV - 1) * 2

    for (let u = 0; u <= divisionsU; u++) {
        for (let v = 0; v <= divisionsV; v++) {
            let u0 = u * u1;
            let v0 = v * v1 - 1;
            vertexList.push(...CreateDingDongVertex(u0, v0));
            vertexList.push(...CreateDingDongVertex(u0 + u1, v0));
            vertexList.push(...CreateDingDongVertex(u0, v0 + v1));
            vertexList.push(...CreateDingDongVertex(u0, v0 + v1));
            vertexList.push(...CreateDingDongVertex(u0 + u1, v0));
            vertexList.push(...CreateDingDongVertex(u0 + u1, v0 + v1));
            normalList.push(...CreateAverageNormal(u0, v0, u1, v1));
            normalList.push(...CreateAverageNormal(u0 + u1, v0, u1, v1));
            normalList.push(...CreateAverageNormal(u0, v0 + v1, u1, v1));
            normalList.push(...CreateAverageNormal(u0, v0 + v1, u1, v1));
            normalList.push(...CreateAverageNormal(u0 + u1, v0, u1, v1));
            normalList.push(...CreateAverageNormal(u0 + u1, v0 + v1, u1, v1));
            texCoordList.push(u / divisionsU, v / divisionsV);
            texCoordList.push((u + 1) / divisionsU, v / divisionsV);
            texCoordList.push(u / divisionsU, (v + 1) / divisionsV);
            texCoordList.push(u / divisionsU, (v + 1) / divisionsV);
            texCoordList.push((u + 1) / divisionsU, v / divisionsV);
            texCoordList.push((u + 1) / divisionsU, (v + 1) / divisionsV);
        }
    }

    return { v: vertexList, n: normalList, t: texCoordList };
}

function CreateAverageNormal(u0, v0, u1, v1) {
    let vertex = CreateDingDongVertex(u0, v0)
    let vertexA = CreateDingDongVertex(u0 + u1, v0)
    let vertexB = CreateDingDongVertex(u0, v0 + v1)
    let vertexC = CreateDingDongVertex(u0 - u1, v0 + v1)
    let vertexD = CreateDingDongVertex(u0 - u1, v0)
    let vertexE = CreateDingDongVertex(u0 - u1, v0 - v1)
    let vertexF = CreateDingDongVertex(u0, v0 - v1)
    vertex = m4.normalize(vertex)
    vertexA = m4.normalize(vertexA)
    vertexB = m4.normalize(vertexB)
    vertexC = m4.normalize(vertexC)
    vertexD = m4.normalize(vertexD)
    vertexE = m4.normalize(vertexE)
    vertexF = m4.normalize(vertexF)
    let a = m4.subtractVectors(vertexA, vertex)
    let b = m4.subtractVectors(vertexB, vertex)
    let c = m4.subtractVectors(vertexC, vertex)
    let d = m4.subtractVectors(vertexD, vertex)
    let e = m4.subtractVectors(vertexE, vertex)
    let f = m4.subtractVectors(vertexF, vertex)
    let n1 = m4.normalize(m4.cross(a, b))
    let n2 = m4.normalize(m4.cross(b, c))
    let n3 = m4.normalize(m4.cross(c, d))
    let n4 = m4.normalize(m4.cross(d, e))
    let n5 = m4.normalize(m4.cross(e, f))
    let n6 = m4.normalize(m4.cross(f, a))
    let avgNormal = [
        (n1[0] + n2[0] + n3[0] + n4[0] + n5[0] + n6[0]) / 6.0,
        (n1[1] + n2[1] + n3[1] + n4[1] + n5[1] + n6[1]) / 6.0,
        (n1[2] + n2[2] + n3[2] + n4[2] + n5[2] + n6[2]) / 6.0
    ]
    avgNormal = m4.normalize(avgNormal);
    return avgNormal;
}

function CreateDingDongVertex(u0, v0) {
    let x = a * v0 * Math.sqrt(1 - v0) * Math.cos(u0);
    let y = a * v0 * Math.sqrt(1 - v0) * Math.sin(u0);
    let z = a * v0
    return [x, y, z]
}

function CreateSphereSurfaceData() {
    let vertexList = [];
    let u = 0;
    let v = 0;
    let u1 = 0.1;
    let v1 = 0.1
    let v0 = 0;
    while (u < Math.PI * 2) {
        while (v < Math.PI) {
            let a = CreateSphereVertex(u, v);
            let b = CreateSphereVertex(u + u1, v);
            let c = CreateSphereVertex(u, v + v1);
            let d = CreateSphereVertex(u + u1, v + v1);
            vertexList.push(a.x, a.y, a.z);
            vertexList.push(b.x, b.y, b.z);
            vertexList.push(c.x, c.y, c.z);
            vertexList.push(c.x, c.y, c.z);
            vertexList.push(b.x, b.y, b.z);
            vertexList.push(d.x, d.y, d.z);
            v += v1;
        }
        v = v0;
        u += u1;
    }
    return vertexList
}
function CreateSphereVertex(long, lat, radius = 0.1) {
    return {
        x: radius * Math.cos(long) * Math.sin(lat),
        y: radius * Math.sin(long) * Math.sin(lat),
        z: radius * Math.cos(lat)
    }
}


/* Initialize the WebGL context. Called from init() */
function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iAttribNormal = gl.getAttribLocation(prog, "normal");
    shProgram.iAttribTexCoord = gl.getAttribLocation(prog, "texCoord");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iColor = gl.getUniformLocation(prog, "color");
    shProgram.iPosition = gl.getUniformLocation(prog, "u_position");
    shProgram.iDirection = gl.getUniformLocation(prog, "u_direction");
    shProgram.iLimit = gl.getUniformLocation(prog, "u_limit");
    shProgram.iBorder = gl.getUniformLocation(prog, "u_border");
    shProgram.iLocation = gl.getUniformLocation(prog, "u_location");
    shProgram.iScale = gl.getUniformLocation(prog, "u_scale");

    // surface = new Model('Surface');
    // surface.BufferData(CreateSurfaceData());

    surface = new Model('DingDongSurface');
    let dingDongSurfaceData = CreateDingDongSurfaceData()
    surface.BufferData(dingDongSurfaceData.v);
    surface.BufferDataNormals(dingDongSurfaceData.n);
    surface.BufferDataTexCoords(dingDongSurfaceData.t);
    light.push(new Model())
    light.push(new Model())
    light[0].BufferData(CreateSphereSurfaceData())
    light[0].BufferDataNormals(CreateSphereSurfaceData())
    light[1].BufferData([1, 0, 0, 0, 0, 0])

    gl.enable(gl.DEPTH_TEST);
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    draw();
    CreateAnimation();
    LoadTexture()
}

function LoadTexture() {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.crossOrigin = 'anonymus';
    image.src = "texture.jpg";
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
        console.log("imageLoaded")
        draw()
    }
}