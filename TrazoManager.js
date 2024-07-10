class TrazoManager {
  constructor(maxTrazos, trazos, width, height, margen) {
    this.maxTrazos = maxTrazos;
    this.trazos = trazos;
    this.width = width;
    this.height = height;
    this.margen = margen;
    this.pg = createGraphics(width, height);
    this.trazosData = [];

    this.transicionActiva = false;
    this.opacidadObjetivo = 255;

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
        speed: random(0.5, 2), // Ajustar velocidad de traslación
        rotationSpeed: random(-0.005, 0.005),
        rotationAngle: random(TWO_PI),
        opacity: 0
      };
      this.trazosData.push(trazo);
    }

    this.transicionActiva = true;

  }

  mover() {
    for (let trazo of this.trazosData) {
      trazo.rotationAngle += trazo.rotationSpeed;

      // Movimiento en el plano xy
      let offsetX = (trazo.speed * cos(trazo.angle)) / 10;
      let offsetY = (trazo.speed * sin(trazo.angle)) / 10;
      trazo.x += offsetX;
      trazo.y += offsetY;

      let imgOriginal = this.trazos[trazo.imgIndex];
      let radioEfectivo = max(imgOriginal.width, imgOriginal.height) * 0.4; // Ajuste del tamaño de la escala

      if (
        trazo.x - radioEfectivo <= this.margen ||
        trazo.x + radioEfectivo >= this.width - this.margen
      ) {
        trazo.angle = PI - trazo.angle;
      }
      if (
        trazo.y - radioEfectivo <= this.margen ||
        trazo.y + radioEfectivo >= this.height - this.margen
      ) {
        trazo.angle = TWO_PI - trazo.angle;
      }

      trazo.x = constrain(
        trazo.x,
        this.margen + radioEfectivo,
        this.width - this.margen - radioEfectivo
      );
      trazo.y = constrain(
        trazo.y,
        this.margen + radioEfectivo,
        this.height - this.margen - radioEfectivo
      );
    }
  }


  actualizarOpacidad() {
    if (!this.transicionActiva) return;

    let transicionCompletada = true;
    for (let trazo of this.trazosData) {
      if (trazo.opacity < this.opacidadObjetivo) {
        trazo.opacity += 5;
        transicionCompletada = false;
      }
      trazo.opacity = constrain(trazo.opacity, 0, this.opacidadObjetivo);
    }

    if (transicionCompletada) {
      this.transicionActiva = false;
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

      this.pg.tint(255, trazo.opacity);

      this.pg.imageMode(CENTER);
      this.pg.image(imgOriginal, 0, 0, nuevaAnchura, nuevaAltura);
      this.pg.pop();
    }
  }

  getGraphics() {
    return this.pg;
  }
}
