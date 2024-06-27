let textura_papel;
let controlPoints = [];
let r;
let numero;
let caminantes = [];

let trazos = [];
let maxTrazos;
let trazoManager;
let bgCumplioElTiempo = true;

let IMPRIMIR = true;

let mic;
let amp;
let pitch;
let audioContext;

let haySonido = false;
let antesHabiaSonido;

let AMP_MIN = 0.009;
let AMP_MAX = 0.055;
let AMORTIGUACION = 0.9;

let FREC_MIN = 200;
let FREC_MAX = 400;

let gestorAmp;
let gestorPitch;

let margen = 50;

let ahora;
let marca;
let limiteTiempo = 2000;

const model_url =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

function preload() {
  textura_papel = loadImage("imagenes/textura_fondo.png");
  for (let i = 0; i < 53; i++) {
    let imagenPath = "imagenes/layer" + nf(i, 2) + ".png";
    trazos.push(loadImage(imagenPath));
  }
}

function setup() {
  createCanvas(594, 869);

  let numCaminantes = 4;
  let radius = 150;
  let centerX = width / 2;
  let centerY = height / 2;

  maxTrazos = random(15, 20);

  for (let i = 0; i < numCaminantes; i++) {
    let angle = (TWO_PI / numCaminantes) * i;
    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;
    caminantes.push(new Caminante(x, y));
  }

  numero = random(2, 5);

  initializeControlPoints();

  mic = new p5.AudioIn();

  mic.start(startPitch);

  gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);
  gestorAmp.f = AMORTIGUACION;

  audioContext = getAudioContext();
  userStartAudio();

  gestorPitch = new GestorSenial(FREC_MIN, FREC_MAX);

  antesHabiaSonido = false;

  trazoManager = new TrazoManager(maxTrazos, trazos, width, height, margen);
}

function draw() {
  gestorAmp.actualizar(mic.getLevel());

  amp = gestorAmp.filtrada;

  haySonido = gestorAmp.filtrada > 0.1;

  let inicioElSonido = haySonido && !antesHabiaSonido;
  let finDelSonido = !haySonido && antesHabiaSonido;

  let vol = mic.getLevel();
  gestorAmp.actualizar(vol);

  ahora = millis();

  background(textura_papel);

  if (amp > 0.4 && bgCumplioElTiempo) {
    marca = millis();
    trazoManager.generarNuevaConfiguracion();
    bgCumplioElTiempo = false;
  }

  if (ahora > marca + limiteTiempo) {
    bgCumplioElTiempo = true;
  }

  trazoManager.mover();
  trazoManager.dibujar();
  image(trazoManager.getGraphics(), 0, 0);

  push();
  noFill();
  strokeWeight(45);

  strokeJoin(ROUND);
  strokeCap(ROUND);

  beginShape();
  push();
  noFill();
  let c1ini = caminantes[0];
  let c2ini = caminantes[(0 + 1) % caminantes.length];

  vertex(c1ini.x, c1ini.y);
  for (let i = 0; i < caminantes.length; i++) {
    let c1 = caminantes[i];
    let c2 = caminantes[(i + 1) % caminantes.length];
    let cp = controlPoints[i];
    bezierVertex(c1.x, c1.y, cp.x1, cp.y1, cp.x2, cp.y2, c2.x, c2.y);
  }
  vertex(c1ini.x, c1ini.y);

  endShape();

  pop();

  for (let caminante of caminantes) {
    caminante.dibujar();
    caminante.mover(caminantes);
  }

  updateControlPoints();

  if (IMPRIMIR) {
    printData();
  }

  antesHabiaSonido = haySonido;
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

function printData() {
  background(255);
  push();
  textSize(16);
  fill(0);
  let texto;

  texto = "pitch: " + amp;
  text(texto, 20, 20);

  fill(0);
  ellipse(width / 2, height - amp * 300, 30, 30);

  pop();

  gestorAmp.dibujar(100, 500);
  gestorPitch.dibujar(100, 100);
}
function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (frequency) {
      gestorPitch.actualizar(frequency);
    }
    getPitch();
  });
}
