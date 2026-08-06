/**
 * Player (Snoopy)
 * Sprite fisico con traje segun el nivel (normal/vaquero/caballero), reaccion de dano con
 * sprite dedicado ('snoopy-hurt') durante 1.5s, y esa misma pose reutilizada mientras esta
 * en el aire (saltando o cayendo). Sin animacion de caminata: se pidio quitarla, asi que en
 * el suelo siempre muestra la pose idle del traje. El recorte del fondo blanco de la textura
 * ya viene resuelto por BootScene (flood-fill en canvas). Controlado por teclado (debug en
 * escritorio) y por los botones tactiles en pantalla.
 */
const PLAYER_COSTUMES = {
  normal: { idle: 'snoopy-normal' },
  vaquero: { idle: 'snoopy-vaquero' },
  caballero: { idle: 'snoopy-caballero' }
};

/**
 * Hacia donde mira cada dibujo ORIGINAL. No todas las imagenes vienen orientadas igual:
 * snoopy-caballero esta dibujado mirando a la izquierda, mientras que normal y vaquero miran
 * a la derecha. Sin esta tabla, aplicar el mismo flip a todos dejaba al caballero caminando
 * de espaldas en el nivel 3. Se consulta por TEXTURA (no por traje) para que la pose de salto
 * y la de dano tambien se orienten bien.
 */
const TEXTURE_FACES_LEFT = {
  'snoopy-caballero': true
};

class Player extends Phaser.Physics.Arcade.Sprite {
  // Cuerpo de colision fijo en pixeles de mundo, identico para todos los trajes y poses.
  // Ver _applyBodyFit() para por que tiene que ser constante.
  static BODY_W = 26;
  static BODY_H = 46;

  constructor(scene, x, y, costume = 'normal', maxHealth = 3) {
    const skin = PLAYER_COSTUMES[costume] || PLAYER_COSTUMES.normal;

    super(scene, x, y, skin.idle);

    this.costume = skin;
    this.maxW = 44;
    this.maxH = 64;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this._applyBodyFit();

    this.body.setCollideWorldBounds(true);
    this.body.setMaxVelocity(220, 900);

    this.speed = 200;
    this.jumpForce = -580;
    this.isDead = false;
    this.isHurt = false;
    this.maxHealth = maxHealth;
    this.health = this.maxHealth;
    this.invulnerable = false;

    // Direccion a la que mira Snoopy: 1 = derecha, -1 = izquierda. Arranca mirando a la
    // derecha porque los niveles avanzan hacia ese lado.
    this._facing = 1;

    // "Coyote time": body.blocked.down de Arcade Physics puede dar false por un solo frame
    // aunque el jugador este parado quieto sobre el suelo (artefacto normal del motor).
    // Sin este margen, ese parpadeo de 1 frame se traducia en Snoopy cambiando sin parar
    // entre la pose normal y la de salto. Se considera "en el suelo" si piso hace <120ms.
    this._lastGroundedTime = -Infinity;

    this.cursors = scene.input.keyboard ? scene.input.keyboard.createCursorKeys() : null;
    this.touchControls = scene.touchControls;
  }

  /**
   * Ajusta el tamano VISIBLE a partir de la textura actual (cada traje tiene su proporcion:
   * vaquero/caballero son retratos altos, snoopy-hurt es casi cuadrada), pero mantiene el
   * cuerpo de colision SIEMPRE del mismo tamano y centrado en this.y.
   *
   * Esto es critico: antes el hitbox se derivaba del displayHeight, asi que al cambiar a la
   * pose de aire el cuerpo se encogia (nivel 2: 46->37px, nivel 3: 54->37px). Ese cambio
   * despegaba a Snoopy del suelo -> quedaba "en el aire" -> volvia a la textura de aire ->
   * bucle: habia que saltar sin parar para no hundirse. En el nivel 1 no pasaba porque
   * snoopy-normal y snoopy-hurt son ambas cuadradas y daban exactamente el mismo hitbox.
   * Un hitbox constante es ademas lo correcto: la caja de colision no debe cambiar solo
   * porque cambie el dibujo.
   */
  _applyBodyFit() {
    SpriteUtils.fitDisplaySize(this, this.maxW, this.maxH);

    // Tamano del cuerpo en pixeles de MUNDO (constante para todos los trajes y poses).
    const srcW = Player.BODY_W / this.scaleX;
    const srcH = Player.BODY_H / this.scaleY;

    this.body.setSize(srcW, srcH);
    // Centrado en this.y: el borde inferior del cuerpo queda siempre a BODY_H/2 por debajo
    // del centro del sprite, sin importar que tan alta sea la textura actual.
    this.body.setOffset(
      (this.width - srcW) / 2,
      this.height / 2 + (Player.BODY_H / 2) / this.scaleY - srcH
    );
  }

  _setTextureFitted(key) {
    if (this.texture.key === key) return;
    this.setTexture(key);
    this._applyBodyFit();
    this._updateFlip();
  }

  /**
   * Orienta el sprite hacia _facing compensando hacia donde mira el dibujo original
   * (ver TEXTURE_FACES_LEFT). Solo hay que espejar cuando la direccion deseada no coincide
   * con la nativa de la textura actual.
   */
  _updateFlip() {
    const nativeLeft = !!TEXTURE_FACES_LEFT[this.texture.key];
    const wantLeft = this._facing < 0;
    this.setFlipX(wantLeft !== nativeLeft);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.isDead) return;

    this._handleMovement(time);
  }

  _handleMovement(time) {
    const touch = this.touchControls ? this.touchControls.state : { left: false, right: false, jump: false };
    const keys = this.cursors;

    const goLeft = touch.left || (keys && keys.left.isDown);
    const goRight = touch.right || (keys && keys.right.isDown);
    const goJump = touch.jump || (keys && keys.up.isDown);

    if (goLeft) {
      this.body.setVelocityX(-this.speed);
      this._facing = -1;
    } else if (goRight) {
      this.body.setVelocityX(this.speed);
      this._facing = 1;
    } else {
      this.body.setVelocityX(0);
    }

    const rawOnGround = this.body.blocked.down || this.body.touching.down;
    if (rawOnGround) this._lastGroundedTime = time;
    const onGround = rawOnGround || (time - this._lastGroundedTime < 120);

    if (goJump && onGround) {
      this.body.setVelocityY(this.jumpForce);
      this._lastGroundedTime = -Infinity;
    }

    if (!this.isHurt) {
      if (!onGround) {
        // Snoopy usa la misma pose de "sorpresa" del golpe mientras esta en el aire (saltando o cayendo).
        this._setTextureFitted('snoopy-hurt');
      } else {
        this._setTextureFitted(this.costume.idle);
      }
    }

    // Se reaplica cada frame (no solo al cambiar de textura) para que girar en el sitio,
    // sin que cambie el sprite, tambien voltee a Snoopy.
    this._updateFlip();
  }

  takeDamage(amount = 1) {
    if (this.invulnerable || this.isDead) return;

    this.health -= amount;
    this.invulnerable = true;
    this.isHurt = true;

    this._setTextureFitted('snoopy-hurt');

    this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      duration: 120,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.setAlpha(1)
    });

    this.scene.time.delayedCall(1500, () => {
      this.invulnerable = false;
      this.isHurt = false;
      if (!this.isDead) this._setTextureFitted(this.costume.idle);
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.body.setVelocity(0, 0);
    this.body.setEnable(false);
    this._setTextureFitted('snoopy-derrotado');
  }
}
