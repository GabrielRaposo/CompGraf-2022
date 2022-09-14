/**
 * @file
 *
 * Summary.
 *
 * Vertices are scaled by an amount that varies by
 * frame, and this value is passed to the draw function.
 *
 * @author Paulo Roma
 * @since 17/08/2022
 * @see https://orion.lcg.ufrj.br/cs336/examples/example123/content/GL_example3a.html
 */

"use strict";

/**
 * Raw data for some point positions -
 * this will be a square, consisting of two triangles.
 * <p>We provide two values per vertex for the x and y coordinates
 * (z will be zero by default).</p>
 * @type {Float32Array}
 */
var vertices = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);

/**
 * Number of points (vertices).
 * @type {Number}
 */
var numPoints = vertices.length / 2;

/**
 * Canvas width.
 * @type {Number}
 */
var w;

/**
 * Canvas height.
 * @type {Number}
 */
var h;

// -- Enum da Âncoras
const indexCoord = {'r': 0, 'g': 1, 'b': 2, 'w': 5 };

function mapToViewport (x, y, n = 5) {
    return [((x + n / 2) * w) / n, ((-y + n / 2) * h) / n];
}

function getVertex (n, i, vertices) {
    let j = (i % n) * 2;
    return [vertices[j], vertices[j + 1]];
}

function draw (ctx, angle, index) {
    ctx.fillStyle = "rgba(0, 204, 204, 1)";
    ctx.rect(0, 0, w, h);
    ctx.fill();

    // -- Três transformações necessárias para realizar o giro nas ângoras
    let [x, y] = mapToViewport(...getVertex(numPoints, index, vertices));
    ctx.translate(x, y);
    ctx.rotate(-angle * Math.PI / 180);
    ctx.translate(-x, -y)

    // -- Quadrado cinza do fundo
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
        if (i == 3 || i == 4) continue;
        let [x, y] = mapToViewport(...getVertex(numPoints, i, vertices).map((x) => x * 1.25));
        if (i == 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.fillStyle = 'rgba(50, 50, 50, 1)';
    ctx.fill();

    // -- Pintando os gradientes
    var grad;
    if (indexCoord['r'] === index) {
        grad = ctx.createLinearGradient(200, 170, x, y);
        grad.addColorStop(0, 'rgba(0, 0, 255, 1)');
        grad.addColorStop(1, 'rgba(255, 0, 0, 1)');
    } 
    else if (indexCoord['g'] === index) {
        grad = ctx.createLinearGradient(170, 200, x, y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(1, 'rgba(0, 255, 0, 1)');
    }
    else if (indexCoord['b'] === index) {
        grad = ctx.createLinearGradient(170, 200, x, y);
        grad.addColorStop(0, 'rgba(255, 0, 0, 1)');
        grad.addColorStop(1, 'rgba(0, 0, 255, 1)');
    } 
    else if (indexCoord['w'] === index) {
        grad = ctx.createLinearGradient(200, 270, x, y);
        grad.addColorStop(0, 'rgba(0, 255, 0, 1)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
    }

    // -- Gradiente principal
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
        if (i == 3 || i == 4) continue;
        let [x, y] = mapToViewport(...getVertex(numPoints, i, vertices).map((x) => x));
        if (i == 0) {
            ctx.moveTo(x, y);
        }
        else ctx.lineTo(x, y);
    }
    ctx.fillStyle = grad; 
    ctx.fill();

    var anchorOffset = 4;
    var anchorSize = 8;
    // -- Âncora vermelho
    let [aux_x, aux_y] = mapToViewport(...getVertex(numPoints, 0, vertices));
    ctx.beginPath();
    ctx.rect(aux_x - anchorOffset, aux_y - anchorOffset, anchorSize, anchorSize);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fill();
    ctx.closePath();

    // -- Âncora verde
    [aux_x, aux_y] = mapToViewport(...getVertex(numPoints, 1, vertices));
    ctx.beginPath();
    ctx.rect(aux_x - anchorOffset, aux_y - anchorOffset, anchorSize, anchorSize);
    ctx.fillStyle = 'rgba(0, 255, 0, 1)';
    ctx.fill();
    ctx.closePath();

    // -- Âncora azul
    [aux_x, aux_y] = mapToViewport(...getVertex(numPoints, 2, vertices));
    ctx.beginPath();
    ctx.rect(aux_x - anchorOffset, aux_y - anchorOffset, anchorSize, anchorSize);
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fill();
    ctx.closePath();

    // -- Âncora branca
    [aux_x, aux_y] = mapToViewport(...getVertex(numPoints, 5, vertices));
    ctx.beginPath();
    ctx.rect(aux_x - anchorOffset, aux_y - anchorOffset, anchorSize, anchorSize);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
    ctx.closePath();
}

var lastTime = Date.now();
function calculateAngle (angle) {
    var now = Date.now();
    var elapsed = now - lastTime;
    lastTime = now;
    var newAngle = angle + (angleDelta * elapsed) / 1000.0;
    return newAngle %= 360;
};

var angleDelta = 2.0;
function mainEntrance () {
    // retrieve <canvas> element
    var canvas = document.getElementById('theCanvas');
    var ctx = canvas.getContext("2d");
    
    // -- Inicialização de variáveis
    w = canvas.width;
    h = canvas.height;

    var currentAngle = angleDelta;
    var currentIndex = 0;

    // -- Leitura de inputs
    document.addEventListener("keydown", (e) => {
        if (e.key === 'r' ||
            e.key === 'g' ||
            e.key === 'b' ||
            e.key === 'w') {
            currentIndex = indexCoord[e.key];
        }
    });

    /**
     * A closure to set up an animation loop in which the
     * scale grows by "increment" each frame.
     * @global
     * @function
     */
    var runanimation = (() => {
        currentAngle = calculateAngle(currentAngle);
        //  if (scale >= 1.5 || scale <= 0.5) increment = -increment;

        // request that the browser calls runanimation() again "as soon as it can"
        return () => {
            draw(ctx, currentAngle, currentIndex);
            requestAnimationFrame(runanimation);
        };
    })();
    runanimation();
};