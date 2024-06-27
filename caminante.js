class Caminante {
  constructor(x_, y_) {
    this.x = x_;
    this.y = y_;
    this.t = 20;
    this.vel = 4;
    this.dir = 0;
    this.maxDist = width / 8;
    this.minDistancia = 400;
    this.mausX = 0;
    this.mausY = 0;
  }

  dibujar() {
    //ellipse(this.x, this.y, 50, 50);
  }

  setMinDist(valor) {
    this.minDistancia = map(valor, 0, 1, 500, 250);
  }

  setX(pitch) {
    this.mausX = map(pitch, 0, 1, 0, width - 50);
  }
  setY(vol) {
    this.mausY = map(vol, 0, 1, height / 2, 0);
  }

  mover(caminantes, pitch, vol) {
    this.setY(vol);
    this.setX(pitch);

    console.log(this.mausX, this.mausY);

    let anguloMouse = atan2(this.mausY - this.y, this.mausX - this.x);

    this.dir = anguloMouse;

    let dx = this.vel * cos(this.dir);
    let dy = this.vel * sin(this.dir);
    this.x += dx;
    this.y += dy;

    this.x = constrain(this.x, 0, width - 25);
    this.y = constrain(this.y, 0, height - 25);

    this.setMinDist(pitch);

    this.repulsion(caminantes);
  }

  repulsion(caminantes) {
    for (let other of caminantes) {
      if (other !== this) {
        let distancia = dist(this.x, this.y, other.x, other.y);

        if (distancia < this.minDistancia) {
          let angle = atan2(this.y - other.y, this.x - other.x);
          let targetX = this.x + cos(angle) * (this.minDistancia - distancia);
          let targetY = this.y + sin(angle) * (this.minDistancia - distancia);

          this.x = lerp(this.x, targetX, 0.05);
          this.y = lerp(this.y, targetY, 0.05);

          this.x = constrain(this.x, 0 + this.maxDist, width - this.maxDist);
          this.y = constrain(this.y, 0 + this.maxDist, height - this.maxDist);
        }
      }
    }
  }
}
