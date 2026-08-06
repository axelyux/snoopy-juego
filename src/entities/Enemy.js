/**
 * Enemy
 * Clase base para enemigos (Woodstock). El rol se arma con dos ejes independientes:
 * MOVIMIENTO (camina / vuela / quieto) y si LANZA fuego o no.
 * - "walker": patrulla caminando sobre plataformas, con animacion de 2 frames.
 * - "thrower": se queda fijo en su sitio y lanza bolas de fuego. Se tine de naranja para
 *   distinguirlo a simple vista del walker.
 * - "flyer" (bruja en escoba): patrulla volando con un bamboleo vertical, sin gravedad, y
 *   TAMBIEN lanza fuego.
 *
 * Todos mueren de un pisoton (defeat()), incluida la bruja.
 */

/**
 * Hacia donde miran los dibujos originales. Todo el arte de Woodstock (normal, walk2 y bruja)
 * esta dibujado mirando a la IZQUIERDA, asi que hay que espejarlo cuando avanza a la derecha.
 * Sin esto la bruja volaba de espaldas.
 */
const ENEMY_TEXTURE_FACES_LEFT = {
  'woodstock-normal': true,
  'woodstock-walk2': true,
  'woodstock-bruja': true
};

class Enemy extends Phaser.Physics.Arcade.Sprite {
  // Cuerpo de colision fijo en pixeles de mundo, identico en todos los frames de animacion.
  static BODY_W = 24;
  static BODY_H = 24;

  constructor(scene, x, y, config = {}) {
    const texture = config.texture || 'woodstock-normal';
    super(scene, x, y, texture);

    this.textureIdle = texture;
    this.textureWalk2 = config.textureWalk2 || texture;
    this.isFlyer = !!config.isFlyer;
    this.canThrow = !!config.canThrow;
    this.animates = this.textureIdle !== this.textureWalk2;
    this.throwInterval = config.throwInterval || 2200;
    this.throwSpeed = config.throwSpeed || 220;
    this.maxW = config.maxWidth || 34;
    this.maxH = config.maxHeight || 34;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this._applyBodyFit();

    if (config.tint) this.setTint(config.tint);

    if (this.isFlyer) {
      this.body.setAllowGravity(false);
      this._baseY = y;
      this._bobPhase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    }

    this.patrolMinX = config.patrolMinX ?? (x - 100);
    this.patrolMaxX = config.patrolMaxX ?? (x + 100);
    this.speed = config.speed ?? 60;
    this.direction = 1;
    this.damage = config.damage || 1;
    this.isDead = false;

    this._walkFrame = 1;
    this._nextWalkSwap = 0;
    this._nextThrow = Phaser.Math.Between(600, this.throwInterval);

    this.body.setVelocityX(this.speed);
  }

  /**
   * Ajusta el tamano VISIBLE a partir de la textura actual (las imagenes de Woodstock no
   * comparten proporcion, asi que hay que reescalar en cada cambio de frame para que no se
   * vea estirada), pero mantiene el cuerpo de colision SIEMPRE del mismo tamano y centrado
   * en this.y. Mismo motivo que en Player: un hitbox que se encoge/crece con cada frame de
   * animacion despega al enemigo del suelo y lo hace vibrar o hundirse.
   */
  _applyBodyFit() {
    SpriteUtils.fitDisplaySize(this, this.maxW, this.maxH);

    const srcW = Enemy.BODY_W / this.scaleX;
    const srcH = Enemy.BODY_H / this.scaleY;

    this.body.setSize(srcW, srcH);
    this.body.setOffset(
      (this.width - srcW) / 2,
      this.height / 2 + (Enemy.BODY_H / 2) / this.scaleY - srcH
    );
  }

  /** Orienta el sprite compensando hacia donde mira el dibujo original. */
  _updateFlip(facing) {
    const nativeLeft = !!ENEMY_TEXTURE_FACES_LEFT[this.texture.key];
    const wantLeft = facing < 0;
    this.setFlipX(wantLeft !== nativeLeft);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.isDead) return;

    if (this.x <= this.patrolMinX) {
      this.direction = 1;
    } else if (this.x >= this.patrolMaxX) {
      this.direction = -1;
    }

    this.body.setVelocityX(this.speed * this.direction);
    if (this.speed > 0) this._updateFlip(this.direction);

    if (this.isFlyer) this._updateFlight(time);

    if (this.animates && time > this._nextWalkSwap) {
      this._walkFrame = this._walkFrame === 1 ? 2 : 1;
      this.setTexture(this._walkFrame === 1 ? this.textureIdle : this.textureWalk2);
      this._applyBodyFit();
      this._nextWalkSwap = time + 260;
    }

    if (this.canThrow && time > this._nextThrow) {
      this._throwProjectile();
      this._nextThrow = time + this.throwInterval;
    }
  }

  /**
   * Bamboleo vertical de la bruja, resuelto con VELOCIDAD y no reposicionando el sprite.
   * Antes se hacia `this.y = ...` cada frame + updateFromGameObject(): eso pelea contra el
   * motor, porque un cuerpo dinamico ya se sincroniza solo en el paso de fisica. Teletransportarlo
   * dejaba el cuerpo incoherente entre frames -> la bruja vibraba y los solapamientos fallaban,
   * por eso no se podia pisar. Con un control proporcional hacia la altura objetivo el motor
   * mueve el cuerpo por su cuenta, sin deriva y manteniendo las colisiones fiables.
   */
  _updateFlight(time) {
    const amplitude = 30;
    const targetY = this._baseY + Math.sin(time / 400 + this._bobPhase) * amplitude;
    this.body.setVelocityY((targetY - this.y) * 6);
  }

  _throwProjectile() {
    const player = this.scene.player;
    if (!player || player.isDead) return;

    const towardPlayer = player.x < this.x ? -1 : 1;
    this._updateFlip(towardPlayer);

    const velocityX = this.throwSpeed * towardPlayer;
    const projectile = new Projectile(this.scene, this.x, this.y, velocityX, this.damage);
    this.scene.projectilesGroup.add(projectile);
    // Group.add() reinicializa el body del objeto (lo vuelve a "habilitar" con la config del
    // grupo), lo que borraba la velocidad recien asignada en el constructor de Projectile y
    // dejaba la bola de fuego pegada en el sitio en vez de volar. Se reaplica despues de sumarla
    // al grupo para garantizar que quede en movimiento.
    projectile.body.setVelocityX(velocityX);
  }

  /** Llamado cuando el jugador lo pisa desde arriba (derrota al enemigo). */
  defeat() {
    if (this.isDead) return;
    this.isDead = true;
    this.body.setEnable(false);

    this.scene.tweens.add({
      targets: this,
      scaleY: 0.1,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy()
    });
  }
}
