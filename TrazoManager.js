class TrazoManager {
  constructor(maxTrazos, trazos, width, height, margen) {
    this.maxTrazos = maxTrazos;
    this.trazos = trazos;
    this.width = width;
    this.height = height;
    this.margen = margen;
    this.pg = createGraphics(width, height);
    this.trazosData = [];

    this.generarNuevaConfiguracion();
  }

  generarNuevaConfiguracion() {
    console.log("Generando nueva configuración de trazos");
    this.trazosData = [];
    for (let i = 0; i < this.maxTrazos; i++) {
      let trazo = {
        imgIndex: floor(random(this.trazos.length)),
        x: random(this.margen, this.width - this.margen),
        y: random(this.margen, this.height - this.margen),
        angle: random(TWO_PI),
        radius: random(5, 20),
        speed: random(0.001, 0.01),
        rotationSpeed: random(-0.005, 0.005),
        rotationAngle: random(TWO_PI),
      };
      this.trazosData.push(trazo);
    }
  }

  mover() {
    for (let trazo of this.trazosData) {
      trazo.rotationAngle += trazo.rotationSpeed;

      // Movimiento en el plano xy
      let offsetX = cos(trazo.angle) / 10;
      let offsetY = sin(trazo.angle) / 10;
      trazo.x += offsetX;
      trazo.y += offsetY;

      trazo.x = constrain(trazo.x, this.margen, this.width - this.margen);
      trazo.y = constrain(trazo.y, this.margen, this.height - this.margen);
    }
  }

  dibujar() {
    this.pg.clear();
    let escala = 0.8;

    for (let trazo of this.trazosData) {
      let imgOriginal = this.trazos[trazo.imgIndex];

      let nuevaAnchura = imgOriginal.width * escala;
      let nuevaAltura = imgOriginal.height * escala;

      this.pg.push();
      this.pg.translate(trazo.x, trazo.y);
      this.pg.rotate(trazo.rotationAngle);
      this.pg.imageMode(CENTER);
      this.pg.image(imgOriginal, 0, 0, nuevaAnchura, nuevaAltura);
      this.pg.pop();
    }
  }

  getGraphics() {
    return this.pg;
  }
}
