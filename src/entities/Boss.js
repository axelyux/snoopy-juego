/**
 * Boss (Snoopy Calavera)
 * Jefe final: patrulla de un lado a otro, lanza bolas de fuego hacia el jugador y requiere
 * varios pisotones para caer. Muestra una barra de vida flotante. Al ser derrotado cambia al
 * sprite "snoopy-derrotado" antes de disparar el callback onDefeated (que revela el cofre).
 *
 * Nota: usa setCollideWorldBounds(true) a proposito. El fondo del mundo esta abierto para que
 * el JUGADOR pueda caer en los pozos y perder vida, pero eso hacia que el jefe se cayera por
 * un hueco del piso al patrullar y desapareciera del nivel. Con los limites activados el jefe
 * nunca puede salirse del mundo, y ademas su rango de patrulla se acota a piso solido.
 */
class Boss extends Phaser.Physics.Arcade.Sprite {
  // Cuerpo de colision fijo (el sprite cambia al morir, no debe alterar la fisica).
  static BODY_W = 46;
  static BODY_H = 76;

  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'boss-calavera');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.maxW = config.maxWidth || 80;
    this.maxH = config.maxHeight || 100;
    this._applyBodyFit();

    this.body.setCollideWorldBounds(true);

    this.patrolMinX = config.patrolMinX ?? (x - 150);
    this.patrolMaxX = config.patrolMaxX ?? (x + 150);
    this.speed = config.speed || 95;
    this.direction = -1;
    this.damage = config.damage || 1;
    this.isDead = false;

    this.throwInterval = config.throwInterval || 1500;
    this.throwSpeed = config.throwSpeed || 300;
    this._nextThrow = 1200;

    this.maxHealth = config.health || 3;
    this.health = this.maxHealth;
    this.onDefeated = config.onDefeated || null;

    const barW = 90;
    this._barW = barW;
    this._barBg = scene.add.rectangle(x, y - 70, barW + 4, 12, 0x000000, 0.7).setDepth(900);
    this._barFill = scene.add.rectangle(x - barW / 2, y - 70, barW, 7, 0xff2d2d).setOrigin(0, 0.5).setDepth(900);

    this.body.setVelocityX(this.speed * this.direction);
  }

  /** Tamano visible segun la textura actual, con cuerpo de colision constante centrado en y. */
  _applyBodyFit() {
    SpriteUtils.fitDisplaySize(this, this.maxW, this.maxH);

    const srcW = Boss.BODY_W / this.scaleX;
    const srcH = Boss.BODY_H / this.scaleY;

    this.body.setSize(srcW, srcH);
    this.body.setOffset(
      (this.width - srcW) / 2,
      this.height / 2 + (Boss.BODY_H / 2) / this.scaleY - srcH
    );
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
    this.setFlipX(this.direction < 0);

    this._barBg.setPosition(this.x, this.y - 70);
    this._barFill.setPosition(this.x - this._barW / 2, this.y - 70);

    if (time > this._nextThrow) {
      this._throwFire();
      this._nextThrow = time + this.throwInterval;
    }
  }

  _throwFire() {
    const player = this.scene.player;
    if (!player || player.isDead) return;

    const towardPlayer = player.x < this.x ? -1 : 1;
    const velocityX = this.throwSpeed * towardPlayer;

    const projectile = new Projectile(this.scene, this.x, this.y - 10, velocityX, this.damage);
    projectile.setDisplaySize(26, 26);
    this.scene.projectilesGroup.add(projectile);
    // Ver nota en Enemy._throwProjectile: Group.add() reinicia el body y borra la velocidad.
    projectile.body.setVelocityX(velocityX);
  }

  /** Golpe recibido al ser pisado por el jugador. Requiere varios pisotones para morir. */
  hit(amount = 1) {
    if (this.isDead) return;

    this.health -= amount;
    this._barFill.width = Math.max(0, this._barW * (this.health / this.maxHealth));

    this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      duration: 80,
      yoyo: true
    });

    if (this.health <= 0) {
      this.defeat();
    }
  }

  defeat() {
    if (this.isDead) return;
    this.isDead = true;
    this.body.setVelocity(0, 0);
    this.body.setEnable(false);
    this.setTexture('snoopy-derrotado');
    this._applyBodyFit();

    this._barBg.destroy();
    this._barFill.destroy();

    this.scene.time.delayedCall(600, () => {
      if (this.onDefeated) this.onDefeated();
    });
  }
}
