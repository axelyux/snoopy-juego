/**
 * Projectile ("bola de fuego")
 * Pequeno proyectil disparado por un enemigo "lanzador" (Woodstock). Usa la textura
 * 'fireball' generada en BootScene (circulo con nucleo claro y halo naranja/rojo) en vez
 * de un pixel cuadrado estirado, que se veia mal. Vuela en linea recta sin gravedad, gira
 * sobre si mismo para dar sensacion de movimiento, y se autodestruye al salir de un rango
 * horizontal razonable respecto a su origen para no acumular objetos fuera de camara.
 */
class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, velocityX, damage = 1) {
    super(scene, x, y, 'fireball');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(18, 18);
    // body.setSize() toma pixeles "fuente" (se multiplican por la escala actual), no el
    // tamano final en pantalla -> dividir por la escala para que el cuerpo mida 14x14 reales.
    this.body.setSize(14 / this.scaleX, 14 / this.scaleY);
    this.body.setOffset((this.width - 14 / this.scaleX) / 2, (this.height - 14 / this.scaleY) / 2);
    this.body.setAllowGravity(false);

    this.damage = damage;
    this._originX = x;

    this.body.setVelocityX(velocityX);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    this.rotation += 0.25;

    if (Math.abs(this.x - this._originX) > 420) {
      this.destroy();
    }
  }

  explode() {
    this.destroy();
  }
}
