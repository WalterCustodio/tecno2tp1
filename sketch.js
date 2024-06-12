let textura_papel;
let controlPoints = [];
let r;
let numero;
let caminantes = []; // Única declaración de caminantes

let IMPRIMIR = true;

let mic;
let amp;
let pitch;
let audioCotext;

let haySonido = false;
let antesHabiaSonido; // moemoria del estado anterior del sonido

//----CONFIGURACION-----
let AMP_MIN = 0.02; // umbral mínimo de sonido qiu supera al ruido de fondo
let AMP_MAX = 0.2; // amplitud máxima del sonido

let AMORTIGUACION = 0.9; // factor de amortiguación de la señal

let FREC_MIN = 200;
let FREC_MAX = 400;

let gestorAmp;
let gestorPitch;

const model_url = "https://teachablemachine.withgoogle.com/models/afb0-_yXm/";

function preload() {
  textura_papel = loadImage("imagenes/textura_fondo.png");
  //  sound = loadSound("sonidos/mi_sonido.mp3"); // Asegúrate de que el archivo de sonido esté en la carpeta correcta
}

function setup() {
  createCanvas(594, 869);

  let numCaminantes = 3;
  let radius = 150;
  let centerX = width / 2;
  let centerY = height / 2;

  for (let i = 0; i < numCaminantes; i++) {
    let angle = (TWO_PI / numCaminantes) * i;
    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;
    caminantes.push(new Caminante(x, y));

    //----MICROFONO-----
    mic = new p5.AudioIn(); // objeto que se comunica con la enrada de micrófono
    mic.start(); // se inicia el flujo de audio
    mic.start(startPitch);
    //----GESTOR----
    gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX); // inicilizo en goestor con los umbrales mínimo y máximo de la señal

    gestorAmp.f = AMORTIGUACION;

    audioContext = getAudioContext(); // inicia el motor de audio

    //------MOTOR DE AUDIO-----
    userStartAudio(); // esto lo utilizo porque en algunos navigadores se cuelga el audio. Esto hace un reset del motor de audio (audio context)

    gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);
    gestorPitch = new GestorSenial(FREC_MIN, FREC_MAX);

    antesHabiaSonido = false;
  }

  numero = random(2, 5);
  //r = 25;

  // Inicializar puntos de control
  initializeControlPoints();
}

function draw() {
  gestorAmp.actualizar(mic.getLevel());

  amp = gestorAmp.filtrada;

  haySonido = amp > AMP_MIN;
  let vol = mic.getLevel(); // cargo en vol la amplitud del micrófono (señal cruda);
  gestorAmp.actualizar(vol);

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

  if (IMPRIMIR) {
    printData();
  }
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

function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (frequency) {
      //console.log(frequency);
      gestorPitch.actualizar(frequency);
      //console.log(frequency);
    }
    getPitch();
  });
}

function printData() {
  background(255);
  push();
  textSize(16);
  fill(0);
  let texto;

  texto = "amplitud: " + amp;
  text(texto, 20, 20);

  fill(0);
  ellipse(width / 2, height - amp * 300, 30, 30);

  pop();

  gestorAmp.dibujar(100, 500);
}
//function mouseClicked() {
//  ImagenActual++;
//
//  if (ImagenActual >= figuras.length) {
//    ImagenActual = 0;
//  }
//
//  if (sound.isPlaying()) {
//    sound.stop();
//  } else {
//    sound.play();
//  }
//}
