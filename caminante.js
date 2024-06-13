class Caminante {
  constructor(x_, y_) {
    this.x = x_;
    this.y = y_;
    this.t = 20;
    this.vel = 4;
    this.dir = 0;
  }

  dibujar() {
  // ellipse(this.x, this.y, 50, 50);
  }

  mover(caminantes) {
    let anguloMouse = atan2(mouseY - this.y, mouseX - this.x);

    this.dir = anguloMouse;

    let dx = this.vel * cos(this.dir);
    let dy = this.vel * sin(this.dir);
    this.x += dx;
    this.y += dy;

    this.x = constrain(this.x, 0, width - 50);
    this.y = constrain(this.y, 0, height - 50);

    this.repulsion(caminantes);
  }

  repulsion(caminantes) {
    for (let other of caminantes) {
      if (other !== this) {
        let distancia = dist(this.x, this.y, other.x, other.y);
        let minDistancia = this.t * 20;

        if (distancia < minDistancia) {
          let angle = atan2(this.y - other.y, this.x - other.x);
          let targetX = this.x + cos(angle) * (minDistancia - distancia);
          let targetY = this.y + sin(angle) * (minDistancia - distancia);

          this.x = lerp(this.x, targetX, 0.05);
          this.y = lerp(this.y, targetY, 0.05);

          this.x = constrain(this.x, 0 + 120, width - 120);
          this.y = constrain(this.y, 0 + 150, height - 150);

        }
      }
    }
  }
}
