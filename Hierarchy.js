var VSHADER_SOURCE = 
  'uniform mat4 model;\n' +
  'uniform mat4 view;\n' +
  'uniform mat4 projection;\n' +
  'uniform vec4 u_Color;\n' +
  'uniform mat3 normalMatrix;\n' +
  'uniform vec4 lightPosition;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec3 a_Normal;\n' +
  'varying vec4 color;\n' +
  'void main() {\n' +
    'float ambientFactor = 0.3;\n' +
    'vec3 lightDirection = normalize((view * lightPosition - view * model * a_Position).xyz);\n' +
    '//vec3 normal = (view * model * vec4(a_Normal, 0.0)).xyz;\n' +
    'vec3 normal = normalize(normalMatrix * a_Normal);\n' +
    'float diffuseFactor = max(0.0, dot(lightDirection, normal));\n' +
    'color = u_Color * diffuseFactor + u_Color * ambientFactor;\n' +
    'color.a = 1.0;\n' +
    'gl_Position = projection * view * model * a_Position;\n' +
  '}\n';

var FSHADER_SOURCE = 
  'precision mediump float;\n' +
  'varying vec4 color;\n' +
  'void main() {\n' +
    'gl_FragColor = color;\n' +
    '}\n';

/**
 * @file
 *
 * Summary.
 * <p>Hierarchical Robot object using a matrix stack.</p>
 *
 * @author Paulo Roma
 * @since 27/09/2016
 * @see https://orion.lcg.ufrj.br/WebGL/labs/WebGL/Assignment_3/Hierarchy.html
 * @see <a href="/WebGL/labs/WebGL/Assignment_3/Hierarchy.js">source</a>
 * @see <a href="/WebGL/labs/WebGL/teal_book/cuon-matrix.js">cuon-matrix</a>
 * @see https://www.cs.ucy.ac.cy/courses/EPL426/courses/eBooks/ComputerGraphicsPrinciplesPractice.pdf#page=188
 * @see https://www.cs.drexel.edu/~david/Classes/ICG/Lectures_new/L-14_HierchModels.pdf
 * @see https://www.lcg.ufrj.br/WebGL/labs/WebGL/Assignment_3/5.hierarchy.pdf
 * @see <img src="../robot.png" width="512">
 */
 "use strict";
 /**
  * A very basic stack class,
  * for keeping a hierarchy of transformations.
  * @class
  */
 class Stack {
   /**
    * Constructor.
    * @constructs Stack
    */
   constructor() {
     /** Array for holding the stack elements. */
     this.elements = [];
     /** Top of the stack. */
     this.t = 0;
   }
   /**
    * Pushes a given matrix onto this stack.
    * @param {Matrix4} m transformation matrix.
    */
   push(m) {
     this.elements[this.t++] = m;
   }
   /**
    * Return the matrix at the top of this stack.
    * @return {Matrix4} m transformation matrix.
    */
   top() {
     if (this.t <= 0) {
       console.log("top = ", this.t);
       console.log("Warning: stack underflow");
     } else {
       return this.elements[this.t - 1];
     }
   }
   /**
    * Pops the matrix at the top of this stack.
    * @return {Matrix4} m transformation matrix.
    */
   pop() {
     if (this.t <= 0) {
       console.log("Warning: stack underflow");
     } else {
       this.t--;
       var temp = this.elements[this.t];
       this.elements[this.t] = undefined;
       return temp;
     }
   }
   /**
    * Returns whether this stack is empty.
    * @returns {Boolean} true if the stack is empty.
    */
   isEmpty() {
     return this.t <= 0;
   }
 }
 /**
  * <p>Creates data for vertices, colors, and normal vectors for
  * a unit cube. </p>
  *
  * Return value is an object with three attributes:
  * vertices, colors, and normals, each referring to a Float32Array.<br>
  * (Note this is a "self-invoking" anonymous function.)
  * @return {Object<{numVertices: Number, vertices: Float32Array, colors: Float32Array, normals: Float32Array}>}
  * vertex array with associated color and normal arrays.
  * @function
  * @global
  */
 var cube = (function makeCube() {
   // vertices of cube
   // prettier-ignore
   var rawVertices = new Float32Array([
       -0.5, -0.5, 0.5,
       0.5, -0.5, 0.5,
       0.5, 0.5, 0.5,
       -0.5, 0.5, 0.5,
       -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
       0.5, 0.5, -0.5,
       -0.5, 0.5, -0.5
     ]);
   // prettier-ignore
   var rawColors = new Float32Array([
       1.0, 0.0, 0.0, 1.0,  // red
       0.0, 1.0, 0.0, 1.0,  // green
       0.0, 0.0, 1.0, 1.0,  // blue
       1.0, 1.0, 0.0, 1.0,  // yellow
       1.0, 0.0, 1.0, 1.0,  // magenta
       0.0, 1.0, 1.0, 1.0,  // cyan
     ]);
   // prettier-ignore
   var rawNormals = new Float32Array([
       0, 0, 1,
       1, 0, 0,
       0, 0, -1,
       -1, 0, 0,
       0, 1, 0,
       0, -1, 0
     ]);
   // prettier-ignore
   var indices = new Uint16Array([
       0, 1, 2, 0, 2, 3,  // z face
       1, 5, 6, 1, 6, 2,  // +x face
       5, 4, 7, 5, 7, 6,  // -z face
       4, 0, 3, 4, 3, 7,  // -x face
       3, 2, 6, 3, 6, 7,  // + y face
       4, 5, 1, 4, 1, 0   // -y face
     ]);
   var verticesArray = [];
   var colorsArray = [];
   var normalsArray = [];
   for (var i = 0; i < 36; ++i) {
     // for each of the 36 vertices...
     var face = Math.floor(i / 6);
     var index = indices[i];
     // (x, y, z): three numbers for each point
     for (var j = 0; j < 3; ++j) {
       verticesArray.push(rawVertices[3 * index + j]);
     }
     // (r, g, b, a): four numbers for each point
     for (var j = 0; j < 4; ++j) {
       colorsArray.push(rawColors[4 * face + j]);
     }
     // three numbers for each point
     for (var j = 0; j < 3; ++j) {
       normalsArray.push(rawNormals[3 * face + j]);
     }
   }
   return {
     numVertices: 36,
     vertices: new Float32Array(verticesArray),
     colors: new Float32Array(colorsArray),
     normals: new Float32Array(normalsArray),
   };
 })();
 /**
  * Return a matrix to transform normals, so they stay
  * perpendicular to surfaces after a linear transformation.
  * @param {Matrix4} model model matrix.
  * @param {Matrix4} view view matrix.
  * @returns {Float32Array} modelview transposed inverse.
  */
 function makeNormalMatrixElements(model, view) {
   var n = new Matrix4(view).multiply(model);
   n.transpose();
   n.invert();
   n = n.elements;
   // prettier-ignore
   return new Float32Array([
       n[0], n[1], n[2],
       n[4], n[5], n[6],
       n[8], n[9], n[10]
     ]);
 }
 // A few global variables...
 /**
  * The OpenGL context.
  * @type {WebGL2RenderingContext}
  */
 var gl;
 /**
  * Handle to a buffer on the GPU.
  * @type {WebGLBuffer}
  */
 var vertexBuffer;
 /**
  * Handle to a buffer on the GPU.
  * @type {WebGLBuffer}
  */
 var vertexNormalBuffer;
 /**
  * Handle to the compiled shader program on the GPU.
  * @type {WebGLProgram}
  */
 var lightingShader;

 /**
  * Transformation matrix that is the root of 5 objects in the scene.
  * @type {Matrix4}
  */
 var torsoMatrix = new Matrix4().setTranslate(0, 0, 0);

 /**  @type {Matrix4} */
 var shoulderRMatrix = new Matrix4().setTranslate(3, 3, 0);
 var shoulderLMatrix = new Matrix4().setTranslate(-3, 3, 0);

 /**  @type {Matrix4} */
 var armRMatrix = new Matrix4().setTranslate(0, -5, 0);
 var armLMatrix = new Matrix4().setTranslate(0, -5, 0);

 /**  @type {Matrix4} */
 var handRMatrix = new Matrix4().setTranslate( 0.5, -4, 0);
 var handLMatrix = new Matrix4().setTranslate(-0.5, -4, 0);
 
 /**  @type {Matrix4} */
 var headMatrix = new Matrix4().setTranslate(0, 9, 0);

 /**  @type {Matrix4} */
 var eyeRMatrix = new Matrix4().setTranslate( 1.75, 0, 1.6).rotate(-5,0,0,1);
 var eyeLMatrix = new Matrix4().setTranslate(-1.75, 0, 1.6).rotate( 5,0,0,1);

 /**  @type {Matrix4} */
 var eyebrowRMatrix = new Matrix4().setTranslate(-1.75, 1.6, 1.6).rotate(0,0,0,1);
 var eyebrowLMatrix = new Matrix4().setTranslate( 1.75, 1.6, 1.6).rotate(0,0,0,1);

 /**  @type {Matrix4} */
 var tightRMatrix = new Matrix4().setTranslate( 1.75, -8.5, 0);
 var tightLMatrix = new Matrix4().setTranslate(-1.75, -8.5, 0); 

  /**  @type {Matrix4} */
 var calfRMatrix = new Matrix4().setTranslate(0, -5, 0); 
 var calfLMatrix = new Matrix4().setTranslate(0, -5, 0); 

 var torsoAngle = 0.0;

 var shoulderRAngle = 0.0;
 var shoulderLAngle = 0.0;

 var armRAngle = 0.0;
 var armLAngle = 0.0;

 var handRAngle = 0.0;
 var handLAngle = 0.0; 

 var headAngle = 0.0;

 var tightRAngle = 0.0;
 var tightLAngle = 0.0;

 var calfRAngle = 0.0;
 var calfLAngle = 0.0;

 var torsoAngle_X = 0.0;
 var torsoAngle_Y = 0.0;

 var torsoMatrixLocal     = new Matrix4().setScale(5, 12, 3);
 var shoulderMatrixLocal  = new Matrix4().setScale(2, 5, 2);
 var armMatrixLocal       = new Matrix4().setScale(2, 5, 2);
 var handMatrixLocal      = new Matrix4().setScale(1, 3, 3);
 var headMatrixLocal      = new Matrix4().setScale(7, 6, 4);
 var eyeMatrixLocal       = new Matrix4().setScale(1, 2, 1); 
 var eyebrowsMatrixLocal  = new Matrix4().setScale(1.5, 0.4, 1);
 var tightMatrixLocal     = new Matrix4().setScale(1, 5, 1); 
 var calfMatrixLocal      = new Matrix4().setScale(1, 5, 1); 

 /**
  * View matrix.
  * @type {Matrix4}
  */
 // prettier-ignore
 var view = new Matrix4().setLookAt(
         20, 20, 20,   // eye
         0, 0, 0,      // at - looking at the origin
         0, 1, 0); // up vector - y axis

 /**
  * <p>Projection matrix.</p>
  * Here use aspect ratio 3/2 corresponding to canvas size 600 x 400.
  * @type {Matrix4}
  */
 var projection = new Matrix4().setPerspective(60, 1.5, 0.1, 1000);

 /**
  * Translate keypress events to strings.
  * @param {KeyboardEvent} event key pressed.
  * @return {String | null}
  * @see http://javascript.info/tutorial/keyboard-events
  */
 function getChar(event) {
   if (event.which == null) {
     return String.fromCharCode(event.keyCode); // IE
   } else if (event.which != 0 && event.charCode != 0) {
     return String.fromCharCode(event.which); // the rest
   } else {
     return null; // special key
   }
 }

 /**
  * <p>Handler for key press events.</p>
  * Adjusts object rotations.
  * @param {KeyboardEvent} event key pressed.
  */
 function handleKeyPress(event) {
   var ch = getChar(event);
   let opt = document.getElementById("options");
   switch (ch) {
     case "t":
       torsoAngle += 15;
      //  torsoMatrix.setTranslate(0, 0, 0).rotate(torsoAngle, 0, 1, 0);
       torsoMatrix.setTranslate(0, 0, 0).rotate(torsoAngle_X + torsoAngle, 0, 1, 0);
       break;
     case "T":
       torsoAngle -= 15;
      //  torsoMatrix.setTranslate(0, 0, 0).rotate(torsoAngle, 0, 1, 0);
       torsoMatrix.setTranslate(0, 0, 0).rotate(torsoAngle_X + torsoAngle, 0, 1, 0);
       break;

     case "s":
       shoulderRAngle += 15;
       shoulderLAngle += 15;

       // rotate shoulder clockwise about a point 2 units above its center
       var currentRShoulderRot = new Matrix4()
         .setTranslate(0, 2, 0)
         .rotate(shoulderRAngle, 0, 0, 1)
         .translate(0, -2, 0);
       shoulderRMatrix.setTranslate( 3, 3, 0).multiply(currentRShoulderRot);

       var currentLShoulderRot = new Matrix4()
         .setTranslate(0, 2, 0)
         .rotate(-shoulderLAngle, 0, 0, 1)
         .translate(0, -2, 0);
       shoulderLMatrix.setTranslate(-3, 3, 0).multiply(currentLShoulderRot);
       break;

     case "S":
       shoulderRAngle -= 15;
       shoulderLAngle -= 15;

       var currentRShoulderRot = new Matrix4()
         .setTranslate(0, 2, 0)
         .rotate(-shoulderRAngle, 0, 0, -1)
         .translate(0, -2, 0);
       shoulderRMatrix.setTranslate(3, 3, 0).multiply(currentRShoulderRot);

       var currentLShoulderRot = new Matrix4()
         .setTranslate(0, 2, 0)
         .rotate(shoulderLAngle, 0, 0, -1)
         .translate(0, -2, 0);
       shoulderLMatrix.setTranslate(-3, 3, 0).multiply(currentLShoulderRot);
       break;

     case "a":
       armRAngle += 15;
       armLAngle += 15;

       // rotate arm clockwise about its top front corner
       var currentRArm = new Matrix4()
         .setTranslate(0, 2.5, 1.0)
         .rotate(armRAngle, 0, 0, 1)
         .translate(0, -2.5, -1.0);
       armRMatrix.setTranslate(0, -5, 0).multiply(currentRArm);

       var currentLArm = new Matrix4()
       .setTranslate(0, 2.5, 1.0)
       .rotate(armLAngle, 0, 0, -1)
       .translate(0, -2.5, -1.0);
       armLMatrix.setTranslate(0, -5, 0).multiply(currentLArm);
       break;

     case "A":
       armRAngle -= 15;
       armLAngle -= 15;

       var currentRArm = new Matrix4()
         .setTranslate(0, 2.5, 1.0)
         .rotate(-armRAngle, 0, 0, -1)
         .translate(0, -2.5, -1.0);
       armRMatrix.setTranslate(0, -5, 0).multiply(currentRArm);

       var currentLArm = new Matrix4()
       .setTranslate(0, 2.5, 1.0)
       .rotate(-armLAngle, 0, 0, 1)
       .translate(0, -2.5, -1.0);
       armLMatrix.setTranslate(0, -5, 0).multiply(currentLArm);
       break;
       
     case "h":
       handRAngle += 15;
       handRMatrix.setTranslate( 0.5, -4, 0).rotate(handRAngle, 0, 1, 0);
       handLMatrix.setTranslate(-0.5, -4, 0).rotate(-handRAngle, 0, 1, 0);
       break;

     case "H":
       handRAngle -= 15;
       handRMatrix.setTranslate( 0.5, -4, 0).rotate(handRAngle, 0, 1, 0);
       handLMatrix.setTranslate(-0.5, -4, 0).rotate(-handRAngle, 0, 1, 0);
       break;
     case "l":
       headAngle += 15;
       headMatrix.setTranslate(0, 9, 0).rotate(headAngle, 0, 1, 0);
       break;
     case "L":
       headAngle -= 15;
       headMatrix.setTranslate(0, 9, 0).rotate(headAngle, 0, 1, 0);
       break;

     case "m": // Cara de mau
       eyebrowRMatrix.setTranslate(-1.75, 1.0, 1.6).rotate(-5, 0, 0, 1);
       eyebrowLMatrix.setTranslate( 1.75, 1.0, 1.6).rotate( 5, 0, 0, 1);
       break;

     case "M": // Cara default
       eyebrowRMatrix.setTranslate(-1.75, 1.6, 1.6).rotate(0,0,0,1);
       eyebrowLMatrix.setTranslate( 1.75, 1.6, 1.6).rotate(0,0,0,1);
       break;

     case "y": // Coxas - Vai
       tightRAngle += 15;
       tightLAngle += 15;

       var currentRtight = new Matrix4()
       .setTranslate(0, 2.5, 0.0)
       .rotate (tightRAngle, -1, 0, 0)
       .translate(0, -2.5, 0.0);
       tightRMatrix.setTranslate( 1.75, -8.5, 0).multiply(currentRtight);

       var currentLtight = new Matrix4()
       .setTranslate(0, 2.5, 0.0)
       .rotate (tightLAngle, -1, 0, 0)
       .translate(0, -2.5, 0.0);
       tightLMatrix.setTranslate(-1.75, -8.5, 0).multiply(currentLtight);
       break;

    case "Y": // Coxas - Volta
       tightRAngle -= 15;
       tightLAngle -= 15;

       var currentRtight = new Matrix4()
       .setTranslate(0, 2.5, 0.0)
       .rotate (tightRAngle, -1, 0, 0)
       .translate(0, -2.5, 0.0);
       tightRMatrix.setTranslate( 1.75, -8.5, 0).multiply(currentRtight);

       var currentLtight = new Matrix4()
       .setTranslate(0, 2.5, 0.0)
       .rotate (tightLAngle, -1, 0, 0)
       .translate(0, -2.5, 0.0);
       tightLMatrix.setTranslate(-1.75, -8.5, 0).multiply(currentLtight);
       break;

    case "u": // Panturrilhas - Vai
       calfRAngle -= 15;
       calfLAngle -= 15;

       var currentRcalf = new Matrix4()
       .setTranslate(0, 2.5, 0.0)
       .rotate (calfRAngle, -1, 0, 0)
       .translate(0, -2.5, 0.0);
       calfRMatrix.setTranslate(0, -5, 0).multiply(currentRcalf);

       var currentLcalf = new Matrix4()
       .setTranslate(0, 2.5, 0.0)
       .rotate (calfLAngle, -1, 0, 0)
       .translate(0, -2.5, 0.0);
       calfLMatrix.setTranslate(0, -5, 0).multiply(currentLcalf);
       break;
       
    case "U": // Panturrilhas - Volta
       calfRAngle += 15;
       calfLAngle += 15;

       var currentRcalf = new Matrix4()
       .setTranslate(0, 2.5, 0.0)
       .rotate (calfRAngle, -1, 0, 0)
       .translate(0, -2.5, 0.0);
       calfRMatrix.setTranslate(0, -5, 0).multiply(currentRcalf);

       var currentLcalf = new Matrix4()
       .setTranslate(0, 2.5, 0.0)
       .rotate (calfLAngle, -1, 0, 0)
       .translate(0, -2.5, 0.0);
       calfLMatrix.setTranslate(0, -5, 0).multiply(currentLcalf);
       break;

     default:
       return;
   }
   opt.innerHTML = `<br>${gl.getParameter(
     gl.SHADING_LANGUAGE_VERSION
   )}<br>${gl.getParameter(gl.VERSION)}`;
 }

 var mouseIsPressed = false;
 var cvs = document.querySelector('canvas');
 
 window.addEventListener("mousedown", (event) => {
     mouseIsPressed = true;
 });
 
 window.addEventListener("mouseup", (event) => {
     mouseIsPressed = false;
 });
 
 var current_X = 0;
 var current_Y = 0;
 cvs.addEventListener("mousemove", (event) => {
   event = event || window.event;
   if(mouseIsPressed) {
     if(current_X < event.clientX) torsoAngle_X += event.clientX / 100;
     if(current_X > event.clientX) torsoAngle_X -= event.clientX / 100;
     if(current_Y < event.clientY) torsoAngle_Y -= event.clientY / 100;
     if(current_Y > event.clientY) torsoAngle_Y += event.clientY / 100;
     torsoMatrix.setTranslate(0, 0, 0).rotate(torsoAngle_X + torsoAngle, 0, 1, 0).rotate(torsoAngle_Y, 1, 0, 0);
     current_X = event.clientX;
     current_Y = event.clientY;
   }
 });

 /**
  * <p>Helper function.</p>
  * Renders the cube based on the model transformation
  * on top of the stack and the given local transformation.
  * @param {Matrix4} matrixStack matrix on top of the stack;
  * @param {Matrix4} matrixLocal local transformation.
  */
 function renderCube(matrixStack, matrixLocal) {
   // bind the shader
   gl.useProgram(lightingShader);
   // get the index for the a_Position attribute defined in the vertex shader
   var positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
   if (positionIndex < 0) {
     console.log("Failed to get the storage location of a_Position");
     return;
   }
   var normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
   if (normalIndex < 0) {
     console.log("Failed to get the storage location of a_Normal");
     return;
   }
   // "enable" the a_position attribute
   gl.enableVertexAttribArray(positionIndex);
   gl.enableVertexAttribArray(normalIndex);
   // bind data for points and normals
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
   gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
   var loc = gl.getUniformLocation(lightingShader, "view");
   gl.uniformMatrix4fv(loc, false, view.elements);
   loc = gl.getUniformLocation(lightingShader, "projection");
   gl.uniformMatrix4fv(loc, false, projection.elements);
   loc = gl.getUniformLocation(lightingShader, "u_Color");
   gl.uniform4f(loc, 0.0, 0.0, 1.0, 1.0);
   var loc = gl.getUniformLocation(lightingShader, "lightPosition");
   gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);
   var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
   var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");
   // transform using current model matrix on top of stack
   var current = new Matrix4(matrixStack.top()).multiply(matrixLocal);
   gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
   gl.uniformMatrix3fv(
     normalMatrixLoc,
     false,
     makeNormalMatrixElements(current, view)
   );
   gl.drawArrays(gl.TRIANGLES, 0, 36);
   // on safari 10, buffer cannot be disposed before drawing...
   gl.bindBuffer(gl.ARRAY_BUFFER, null);
   gl.useProgram(null);
 }

 function renderCubeColor(matrixStack, matrixLocal, r, g, b, a) {
  // bind the shader
  gl.useProgram(lightingShader);
  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }
  var normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }
  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  // bind data for points and normals
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  var loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, view.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(lightingShader, "u_Color");
  gl.uniform4f(loc, r, g, b, a);
  var loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);
  var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
  var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");
  // transform using current model matrix on top of stack
  var current = new Matrix4(matrixStack.top()).multiply(matrixLocal);
  gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
  gl.uniformMatrix3fv(
    normalMatrixLoc,
    false,
    makeNormalMatrixElements(current, view)
  );
  gl.drawArrays(gl.TRIANGLES, 0, 36);
  // on safari 10, buffer cannot be disposed before drawing...
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.useProgram(null);
 }

 /** Code to actually render our geometry. */
 function draw() {
    // clear the framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);
    // set up the matrix stack
    var s = new Stack();
    s.push(torsoMatrix);
    renderCube(s, torsoMatrixLocal);

      // right shoulder relative to torso
      s.push(new Matrix4(s.top()).multiply(shoulderRMatrix));
      renderCube(s, shoulderMatrixLocal);
        // right arm relative to shoulder
        s.push(new Matrix4(s.top()).multiply(armRMatrix));
        renderCube(s, armMatrixLocal);
          // right hand relative to arm
          s.push(new Matrix4(s.top()).multiply(handRMatrix));
          renderCubeColor(s, handMatrixLocal, 0.6, 0.0, 0.6, 1.0);
          s.pop();
        s.pop();
      s.pop();

      // left shoulder relative to torso
      s.push(new Matrix4(s.top()).multiply(shoulderLMatrix));
      renderCube(s, shoulderMatrixLocal);
        // left arm relative to shoulder
        s.push(new Matrix4(s.top()).multiply(armLMatrix));
        renderCube(s, armMatrixLocal);
          // left hand relative to arm
          s.push(new Matrix4(s.top()).multiply(handLMatrix));
          renderCubeColor(s, handMatrixLocal, 0.6, 0.0, 0.6, 1.0);
          s.pop();
        s.pop();
      s.pop();

      // head relative to torso
      s.push(new Matrix4(s.top()).multiply(headMatrix));
      renderCubeColor(s, headMatrixLocal, 0.6, 0.0, 0.6, 1.0);

        // eyes right - relativo to head
        s.push(new Matrix4(s.top()).multiply(eyeRMatrix));
        renderCubeColor(s, eyeMatrixLocal, 0.0, 0.0, 0.0, 1.0);
        s.pop();
        // eyes left  - relativo to head
        s.push(new Matrix4(s.top()).multiply(eyeLMatrix));
        renderCubeColor(s, eyeMatrixLocal, 0.0, 0.0, 0.0, 1.0);
        s.pop();

        // eyebrow right - relativo to head
        s.push(new Matrix4(s.top()).multiply(eyebrowRMatrix));
        renderCubeColor(s, eyebrowsMatrixLocal, 0.1, 0.1, 0.1, 1.0);
        s.pop(); 
        // eyebrow left  - relativo to head
        s.push(new Matrix4(s.top()).multiply(eyebrowLMatrix));
        renderCubeColor(s, eyebrowsMatrixLocal, 0.1, 0.1, 0.1, 1.0);
        s.pop(); 

      s.pop();

      // tights relative to torso
      s.push(new Matrix4(s.top()).multiply(tightRMatrix));
      renderCube(s, tightMatrixLocal);

        // calves relative to tights
        s.push(new Matrix4(s.top()).multiply(calfRMatrix));
        renderCube(s, calfMatrixLocal);
        s.pop();

      s.pop();

      // tights relative to torso
      s.push(new Matrix4(s.top()).multiply(tightLMatrix));
      renderCube(s, tightMatrixLocal);

        // calves relative to tights
        s.push(new Matrix4(s.top()).multiply(calfLMatrix));
        renderCube(s, calfMatrixLocal);
        s.pop();

      s.pop();

    s.pop();
    if (!s.isEmpty()) {
      console.log("Warning: pops do not match pushes");
    }
 }

 /**
  * <p>Entry point when page is loaded.</p>
  *
  * Basically this function does setup that "should" only have to be done once,<br>
  * while draw() does things that have to be repeated each time the canvas is
  * redrawn.
  * @function
  * @memberof Window
  * @name anonymous_load
  * @global
  * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
  */
 window.addEventListener("load", (event) => {
   // retrieve <canvas> element
   let canvas = document.getElementById("theCanvas");
   // key handler
   window.onkeypress = handleKeyPress;
   gl = canvas.getContext("webgl2");
   if (!gl) {
     console.log("Failed to get the rendering context for WebGL");
     return;
   }

  // load and compile the shader pair, using utility from the teal book
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }
  lightingShader = gl.program;
  gl.useProgram(null);

   // buffer for vertex positions for triangles
   vertexBuffer = gl.createBuffer();
   if (!vertexBuffer) {
     console.log("Failed to create the buffer object");
     return;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);
   // buffer for vertex normals
   vertexNormalBuffer = gl.createBuffer();
   if (!vertexNormalBuffer) {
     console.log("Failed to create the buffer object");
     return;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);
   // buffer is not needed anymore (not necessary, really)
   gl.bindBuffer(gl.ARRAY_BUFFER, null);
   // specify a fill color for clearing the framebuffer
   gl.clearColor(0.9, 0.9, 0.9, 1.0);
   gl.enable(gl.DEPTH_TEST);
   // define an animation loop
   var animate = function () {
     draw();
     requestAnimationFrame(animate, canvas);
    };
  
   animate();
 });