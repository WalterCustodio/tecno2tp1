let textura_papel;
let r;
let numero;
let caminantes = [];
let controlPoints = [];
let ImagenActual = 3;
// let sound;
let capaFondo1;

let trazos = [];

let nombrestrazo = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 26, 28, 30, 31, 32, 38, 39, 45, 49,
];

function preload() {
  for (let i = 0; i < nombrestrazo.length; i++) {
    let nombre = "imagenes/manchas/layer " + nf(nombrestrazo[i], 2) + ".png";
    trazos[i] = loadImage(nombre);
  }
  textura_papel = loadImage("imagenes/textura_fondo.png");
  // sound = loadSound("sonidos/mi_sonido.mp3"); // Asegúrate de que el archivo de sonido esté en la carpeta correcta
}

function setup() {
  createCanvas(594, 869);

  capaFondo = createGraphics(int(width * 1.2), int(height * 1.2));

  let numCaminantes = 3;
  let radius = 150;
  let centerX = width / 2;
  let centerY = height / 2;

  for (let i = 0; i < numCaminantes; i++) {
    let angle = (TWO_PI / numCaminantes) * i;
    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;
    caminantes.push(new Caminante(x, y));
  }

  numero = random(2, 5);
  r = 25;

  // Inicializar puntos de control
  initializeControlPoints();
}

function draw() {
  background(textura_papel);

  push();
  strokeWeight(16);
  stroke(129, 166, 202);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // Dibujar curvas bezier entre los caminantes
  for (let i = 0; i < caminantes.length; i++) {
    let c1 = caminantes[i];
    let c2 = caminantes[(i + 1) % caminantes.length];
    drawBezierCurve(c1, c2, i);
  }

  pop();

  for (let caminante of caminantes) {
    caminante.dibujar();
    caminante.mover(caminantes);
  }

  // Actualizar puntos de control lentamente
  updateControlPoints();
}

function initializeControlPoints() {
  for (let i = 0; i < caminantes.length; i++) {
    let c1 = caminantes[i];
    let c2 = caminantes[(i + 1) % caminantes.length];
    controlPoints.push({
      x1: (2 * c1.x + c2.x) / 3 + random(-50, 50),
      y1: (2 * c1.y + c2.y) / 3 + random(-50, 50),
      x2: (c1.x + 2 * c2.x) / 3 + random(-50, 50),
      y2: (c1.y + 2 * c2.y) / 3 + random(-50, 50),
    });
  }
}

function updateControlPoints() {
  for (let i = 0; i < caminantes.length; i++) {
    let c1 = caminantes[i];
    let c2 = caminantes[(i + 1) % caminantes.length];
    let cp = controlPoints[i];

    cp.x1 = lerp(cp.x1, (2 * c1.x + c2.x) / 3 + random(-50, 50), 0.01);
    cp.y1 = lerp(cp.y1, (2 * c1.y + c2.y) / 3 + random(-50, 50), 0.01);
    cp.x2 = lerp(cp.x2, (c1.x + 2 * c2.x) / 3 + random(-50, 50), 0.01);
    cp.y2 = lerp(cp.y2, (c1.y + 2 * c2.y) / 3 + random(-50, 50), 0.01);
  }
}

function drawBezierCurve(c1, c2, index) {
  let cp = controlPoints[index];
  push();
  noFill();
  bezier(c1.x, c1.y, cp.x1, cp.y1, cp.x2, cp.y2, c2.x, c2.y);
  pop();
}

function mouseClicked() {
  ImagenActual++;

  if (ImagenActual >= figuras.length) {
    ImagenActual = 0;
  }

  //  if (sound.isPlaying()) {
  //    sound.stop();
  //  } else {
  //    sound.play();
  //  }
}
