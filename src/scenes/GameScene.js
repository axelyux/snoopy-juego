/**
 * GameScene
 * Escena principal: construye el nivel actual (1-3) con fondo, traje de Snoopy, plataformas
 * y enemigos tematicos reales, gestiona fisicas/colisiones, scroll de camara, HUD (corazones +
 * barra de progreso). El jefe final SOLO aparece en el nivel 3: ahi el cofre queda oculto hasta
 * derrotarlo, y al tocarlo se lanza VictoryScene. En los niveles 1 y 2 (sin jefe) el cofre esta
 * visible desde el inicio al final del recorrido; tocarlo desbloquea el siguiente nivel en el
 * registry y vuelve al minimundo (WorldMapScene).
 *
 * Nota de fondo: se colocan copias de la imagen de fondo a escala uniforme (cover de los 600px
 * de alto, sin deformar x/y de forma distinta) una al lado de la otra hasta cubrir el mundo ->
 * nitido y sin costuras raras.
 *
 * Nota de plataformas: cada plataforma real (parque/desierto/nieve) tiene una silueta "gruesa"
 * (una isla flotante con relieve, no una barra plana), asi que el cuerpo de colision solo cubre
 * una franja delgada arriba del sprite (ver _makePlatform) -> Snoopy pisa la superficie real en
 * vez de colisionar con todo el bloque visual. El desierto y la nieve alternan entre 4 variantes
 * de arte real para que no se repita siempre la misma pieza; las que desaparecen usan siempre la
 * barra generica tenida de rojo, como lenguaje visual comun a los 3 niveles ("rojo = peligro").
 */
const DESERT_PLATFORM_KEYS = ['plataforma-desierto1', 'plataforma-desierto2', 'plataforma-desierto3', 'plataforma-desierto4'];
const SNOW_PLATFORM_KEYS = ['plataforma-nieve1', 'plataforma-nieve2', 'plataforma-nieve3', 'plataforma-nieve4'];

const LEVEL_CONFIGS = [
  // Nivel 1 - Parque (arbol rosa)
  {
    bgKey: 'bg-parque',
    groundTexture: 'plataforma-pixel',
    groundTint: null,
    platformTextures: ['plataforma-musgo'],
    playerCostume: 'normal',
    worldWidth: 4400,
    groundGaps: [[500, 630], [1150, 1280], [1800, 1930], [2450, 2600], [3150, 3300], [3800, 3950]],
    floatingPlatforms: [
      { x: 320, y: 440, w: 150 },
      { x: 700, y: 410, w: 140 },
      { x: 1000, y: 470, w: 150 },
      { x: 1500, y: 440, w: 150 },
      { x: 1780, y: 470, w: 150 },
      { x: 2150, y: 410, w: 150 },
      { x: 2450, y: 470, w: 140 },
      { x: 2850, y: 440, w: 150 },
      { x: 3450, y: 410, w: 150 },
      { x: 3750, y: 470, w: 140 },
      { x: 4100, y: 440, w: 150 }
    ],
    movingPlatforms: [
      { x: 1300, y: 430, w: 130, rangeX: 0, rangeY: 70, duration: 1200 },
      { x: 2300, y: 440, w: 130, rangeX: 150, rangeY: 0, duration: 1400 },
      { x: 3050, y: 430, w: 130, rangeX: 0, rangeY: 70, duration: 1300 },
      { x: 3900, y: 440, w: 130, rangeX: 130, rangeY: 0, duration: 1300 }
    ],
    vanishingPlatforms: [
      { x: 1865, y: 470, w: 130 },
      { x: 3875, y: 470, w: 130 }
    ],
    enemies: [
      { x: 420, y: 500, patrolMinX: 350, patrolMaxX: 580, type: 'walker' },
      { x: 950, y: 330, patrolMinX: 900, patrolMaxX: 1080, type: 'walker' },
      { x: 1200, y: 500, type: 'thrower' },
      { x: 1650, y: 340, patrolMinX: 1550, patrolMaxX: 1750, type: 'walker' },
      { x: 2000, y: 500, type: 'thrower' },
      { x: 2400, y: 500, patrolMinX: 2300, patrolMaxX: 2550, type: 'walker' },
      { x: 2750, y: 500, type: 'thrower' },
      { x: 3100, y: 500, patrolMinX: 3000, patrolMaxX: 3250, type: 'walker' },
      { x: 3500, y: 500, type: 'thrower' },
      { x: 3900, y: 500, patrolMinX: 3820, patrolMaxX: 4050, type: 'walker' },
      { x: 4200, y: 500, type: 'thrower' }
    ]
  },
  // Nivel 2 - Desierto
  {
    bgKey: 'bg-desierto',
    groundTexture: 'piso-desierto',
    groundTint: null,
    platformTextures: DESERT_PLATFORM_KEYS,
    playerCostume: 'vaquero',
    worldWidth: 5000,
    groundGaps: [[500, 630], [1150, 1280], [1850, 1980], [2550, 2690], [3250, 3400], [3950, 4090], [4550, 4680]],
    floatingPlatforms: [
      { x: 320, y: 440, w: 150 },
      { x: 850, y: 410, w: 140 },
      { x: 1500, y: 440, w: 150 },
      { x: 1780, y: 410, w: 140 },
      { x: 2250, y: 470, w: 150 },
      { x: 2900, y: 410, w: 150 },
      { x: 3600, y: 440, w: 150 },
      { x: 4250, y: 410, w: 150 },
      { x: 4750, y: 440, w: 150 }
    ],
    movingPlatforms: [
      { x: 650, y: 440, w: 130, rangeX: 150, rangeY: 0, duration: 1400 },
      { x: 2050, y: 430, w: 130, rangeX: 0, rangeY: 70, duration: 1300 },
      { x: 3050, y: 430, w: 130, rangeX: 150, rangeY: 0, duration: 1500 },
      { x: 4100, y: 430, w: 130, rangeX: 0, rangeY: 70, duration: 1300 }
    ],
    vanishingPlatforms: [
      { x: 1215, y: 470, w: 130 },
      { x: 2620, y: 470, w: 130 },
      { x: 4020, y: 470, w: 130 }
    ],
    enemies: [
      { x: 420, y: 500, patrolMinX: 350, patrolMaxX: 590, type: 'walker' },
      { x: 800, y: 500, type: 'thrower' },
      { x: 1200, y: 500, patrolMinX: 1100, patrolMaxX: 1350, type: 'walker' },
      { x: 1600, y: 500, type: 'thrower' },
      { x: 2000, y: 500, patrolMinX: 1900, patrolMaxX: 2150, type: 'walker' },
      { x: 2450, y: 500, type: 'thrower' },
      { x: 2850, y: 500, patrolMinX: 2750, patrolMaxX: 3000, type: 'walker' },
      { x: 3300, y: 500, type: 'thrower' },
      { x: 3700, y: 500, patrolMinX: 3600, patrolMaxX: 3850, type: 'walker' },
      { x: 4150, y: 500, type: 'thrower' },
      { x: 4550, y: 500, patrolMinX: 4450, patrolMaxX: 4680, type: 'walker' },
      { x: 4850, y: 500, type: 'thrower' }
    ]
  },
  // Nivel 3 - Nieve / Montanas (jefe final)
  {
    bgKey: 'bg-nieve',
    groundTexture: null,
    groundTint: 0xe8f1f8,
    platformTextures: SNOW_PLATFORM_KEYS,
    playerCostume: 'caballero',
    // Vida extra solo aqui: es el nivel mas largo y el unico con jefe.
    maxHealth: 4,
    worldWidth: 5400,
    groundGaps: [[480, 610], [1150, 1280], [1800, 1930], [2450, 2600], [3100, 3250], [3750, 3900], [4400, 4550], [5050, 5180]],
    floatingPlatforms: [
      { x: 320, y: 440, w: 150 },
      { x: 850, y: 410, w: 150 },
      { x: 1550, y: 470, w: 140 },
      { x: 2200, y: 410, w: 150 },
      { x: 2850, y: 440, w: 150 },
      { x: 3500, y: 410, w: 150 },
      { x: 4150, y: 440, w: 150 },
      { x: 4800, y: 410, w: 150 }
    ],
    movingPlatforms: [
      { x: 570, y: 430, w: 130, rangeX: 0, rangeY: 70, duration: 1200 },
      { x: 1400, y: 440, w: 130, rangeX: 130, rangeY: 0, duration: 1400 },
      { x: 2050, y: 430, w: 130, rangeX: 0, rangeY: 70, duration: 1300 },
      { x: 3350, y: 440, w: 130, rangeX: 130, rangeY: 0, duration: 1400 },
      { x: 4650, y: 430, w: 130, rangeX: 0, rangeY: 70, duration: 1300 }
    ],
    vanishingPlatforms: [
      { x: 1215, y: 470, w: 130 },
      { x: 1865, y: 440, w: 130 },
      { x: 2525, y: 470, w: 130 },
      { x: 3175, y: 440, w: 130 },
      { x: 3825, y: 470, w: 130 },
      { x: 4475, y: 440, w: 130 }
    ],
    enemies: [
      { x: 800, y: 340, patrolMinX: 700, patrolMaxX: 1000, type: 'flyer' },
      { x: 1150, y: 500, type: 'thrower' },
      { x: 1650, y: 500, patrolMinX: 1550, patrolMaxX: 1850, type: 'walker' },
      { x: 2000, y: 340, patrolMinX: 1900, patrolMaxX: 2200, type: 'flyer' },
      { x: 2400, y: 500, type: 'thrower' },
      { x: 2800, y: 500, patrolMinX: 2700, patrolMaxX: 2950, type: 'walker' },
      { x: 3300, y: 340, patrolMinX: 3200, patrolMaxX: 3500, type: 'flyer' },
      { x: 3700, y: 500, type: 'thrower' },
      { x: 4100, y: 500, patrolMinX: 4000, patrolMaxX: 4250, type: 'walker' },
      { x: 4500, y: 340, patrolMinX: 4400, patrolMaxX: 4700, type: 'flyer' },
      { x: 4900, y: 500, type: 'thrower' },
      { x: 5200, y: 500, patrolMinX: 5100, patrolMaxX: 5350, type: 'walker' }
    ],
    // La arena del jefe es el ultimo tramo de piso solido (5180..5400). El rango de patrulla
    // se acota a el a proposito: fuera de ahi esta el hueco [5050,5180] y el jefe se caia.
    boss: { x: 5300, y: 450, health: 9, speed: 95, throwInterval: 1500, patrolMinX: 5225, patrolMaxX: 5365 },
    hasBoss: true
  }
];

const GROUND_Y = 560;

class GameScene extends Phaser.Scene {
  // Alto fijo de toda plataforma. Con esto el borde superior siempre es y - PLATFORM_H/2,
  // condicion necesaria para poder garantizar que ningun salto sea imposible.
  static PLATFORM_H = 34;

  constructor() {
    super('GameScene');
  }

  init(data) {
    this.currentLevel = data.level || 1;
  }

  create() {
    const config = LEVEL_CONFIGS[this.currentLevel - 1];
    this.levelConfig = config;
    this.worldWidth = config.worldWidth;
    this.bossDefeated = false;
    this.chestOpened = false;
    this._gameOverTriggered = false;

    this.physics.world.setBounds(0, 0, this.worldWidth, 600);
    this.cameras.main.setBounds(0, 0, this.worldWidth, 600);
    // setBoundsCollision(left, right, up, down). El "down" queda abierto (false) a proposito:
    // permite detectar caidas a un pozo y restar una vida en vez de que el jugador quede
    // "pegado" en un piso invisible en el fondo del mundo.
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.staticGroup();
    this.vanishingPlatforms = this.physics.add.staticGroup();
    this.enemiesGroup = this.physics.add.group();
    this.projectilesGroup = this.physics.add.group({ allowGravity: false });

    this._buildBackground(config);
    this._buildGround(config);
    this._buildFloatingPlatforms(config);
    this._buildMovingPlatforms(config);
    this._buildVanishingPlatforms(config);

    // Los segmentos de piso con textura se agregan al grupo con `.add()` en vez de
    // `.create()` (ver _buildGround); Phaser indexa los StaticGroup para colisiones rapidas
    // al crearlos, y los miembros sumados despues por fuera de ese flujo pueden quedar mal
    // indexados si no se refresca el grupo. Sin este refresh(), la colision con el piso
    // fallaba de forma intermitente en los niveles largos (habia que saltar sin parar para
    // no hundirse), porque el arbol interno de colisiones no se habia actualizado con ellos.
    this.platforms.refresh();
    this.movingPlatforms.refresh();
    this.vanishingPlatforms.refresh();

    // Controles tactiles (deben crearse antes que el jugador para que este los pueda leer)
    this.touchControls = new TouchControls(this);

    this.player = new Player(this, 100, 450, config.playerCostume, config.maxHealth || 3);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    this._buildEnemies(config);

    if (config.hasBoss) {
      this._buildBoss(config);
    }
    this._prepareChest(config);

    this._setupCollisions();
    this._buildHUD();
  }

  // ---------- Construccion de nivel ----------

  /**
   * Fondo del nivel: copias de la imagen a escala uniforme (cover de los 600px de alto)
   * colocadas una al lado de la otra hasta cubrir worldWidth. Al escalar x/y por el mismo
   * factor no hay distorsion ni costuras raras.
   */
  _buildBackground(config) {
    const source = this.textures.get(config.bgKey).getSourceImage();
    const scale = 600 / source.height;
    const tileWidth = source.width * scale;
    const count = Math.ceil(this.worldWidth / tileWidth) + 1;

    for (let i = 0; i < count; i++) {
      const img = this.add
        .image(i * tileWidth, 0, config.bgKey)
        .setOrigin(0, 0)
        .setDisplaySize(tileWidth, 600)
        .setScrollFactor(1, 1)
        .setDepth(-10);

      if (config.bgTint) img.setTint(config.bgTint);
    }
  }

  _buildGround(config) {
    const gaps = config.groundGaps || [];
    const segments = [];
    let cursor = 0;

    gaps.forEach(([gapStart, gapEnd]) => {
      segments.push([cursor, gapStart]);
      cursor = gapEnd;
    });
    segments.push([cursor, config.worldWidth]);

    segments.forEach(([start, end]) => {
      const width = end - start;
      if (width <= 0) return;

      if (config.groundTexture) {
        const groundHeight = 80;
        const tile = this.add
          .tileSprite(start, GROUND_Y - 40, width, groundHeight, config.groundTexture)
          .setOrigin(0, 0);

        const srcHeight = this.textures.get(config.groundTexture).getSourceImage().height;
        const tileScale = groundHeight / srcHeight;
        tile.setTileScale(tileScale, tileScale);

        this.physics.add.existing(tile, true);
        this.platforms.add(tile);
      } else {
        const block = this.platforms.create(start + width / 2, GROUND_Y, 'pixel');
        block.setDisplaySize(width, 80).refreshBody();
        block.setTint(config.groundTint);
      }
    });
  }

  /**
   * Crea una plataforma "isla flotante" a partir de arte real, ajustando su tamano manteniendo
   * la proporcion original (algunas piezas son alargadas, otras casi cuadradas tipo escalera).
   * El cuerpo de colision usa refreshBody(), que hace que el hitbox sea EXACTAMENTE el sprite
   * visible completo: se probo antes un hitbox mas delgado y pegado arriba, pero el offset no
   * se comportaba igual entre las distintas proporciones de arte y quedaba mal ubicado (a veces
   * flotando por encima de la plataforma bloqueando el salto, a veces sin cubrirla), asi que
   * Snoopy no podia pararse encima de forma confiable. El bounding box completo es menos
   * "preciso" pero siempre coincide con lo que se ve.
   */
  _makePlatform(group, x, y, w, textureKey, tint) {
    const block = group.create(x, y, textureKey);
    // Tamano EXPLICITO (no fitDisplaySize): conservar la proporcion original hacia que las
    // texturas casi cuadradas se encogieran de ancho para respetar el tope de alto -> la barra
    // roja terminaba midiendo 66px en vez de 130, un blanco diminuto e injusto de alcanzar.
    // Con un tamano fijo, toda plataforma mide exactamente `w` de ancho y su borde superior
    // esta siempre en y - PLATFORM_H/2, que es lo que permite garantizar los saltos.
    block.setDisplaySize(w, GameScene.PLATFORM_H);
    if (tint) block.setTint(tint);
    block.refreshBody();

    return block;
  }

  _pickTexture(textures, index) {
    return textures[index % textures.length];
  }

  _buildFloatingPlatforms(config) {
    (config.floatingPlatforms || []).forEach((p, i) => {
      const texture = this._pickTexture(config.platformTextures, i);
      this._makePlatform(this.platforms, p.x, p.y, p.w, texture);
    });
  }

  _buildMovingPlatforms(config) {
    this.movingPlatformData = [];

    (config.movingPlatforms || []).forEach((p, i) => {
      const texture = this._pickTexture(config.platformTextures, i);
      const block = this._makePlatform(this.movingPlatforms, p.x, p.y, p.w, texture);

      this.movingPlatformData.push({
        block,
        startX: p.x,
        startY: p.y,
        rangeX: p.rangeX,
        rangeY: p.rangeY,
        // Frecuencia angular tal que a t=duration el seno llega a su pico (equivalente a la
        // mitad de un recorrido ida-y-vuelta), imitando el ritmo del tween Sine que usaba antes.
        omega: Math.PI / (2 * p.duration)
      });
    });
  }

  /** Reposiciona las plataformas moviles (bodies estaticos) cada frame -> ver nota de clase. */
  _updateMovingPlatforms(time) {
    (this.movingPlatformData || []).forEach(({ block, startX, startY, rangeX, rangeY, omega }) => {
      block.x = startX + rangeX * Math.sin(omega * time);
      block.y = startY + rangeY * Math.sin(omega * time);
      block.body.updateFromGameObject();
    });
  }

  _buildVanishingPlatforms(config) {
    (config.vanishingPlatforms || []).forEach(p => {
      const vp = this._makePlatform(this.vanishingPlatforms, p.x, p.y, p.w, 'plataforma-barra', 0xff5555);
      vp.isVanishing = false;
    });
  }

  /**
   * Tres roles de enemigo, combinando movimiento y ataque:
   * - walker : camina patrullando, no lanza.
   * - thrower: quieto, lanza fuego, tenido de naranja para reconocerlo de lejos.
   * - flyer  : la bruja vuela patrullando Y ademas lanza fuego.
   * Todos mueren de un pisoton.
   */
  _buildEnemies(config) {
    const ROLES = {
      walker: { texture: 'woodstock-normal', textureWalk2: 'woodstock-walk2', speed: 60, canThrow: false, isFlyer: false },
      thrower: { texture: 'woodstock-normal', textureWalk2: 'woodstock-walk2', speed: 0, canThrow: true, isFlyer: false, tint: 0xffa040 },
      flyer: { texture: 'woodstock-bruja', textureWalk2: 'woodstock-bruja', speed: 55, canThrow: true, isFlyer: true, throwInterval: 2600 }
    };

    (config.enemies || []).forEach(e => {
      const role = ROLES[e.type] || ROLES.walker;
      const stationary = role.speed === 0;

      const enemy = new Enemy(this, e.x, e.y, {
        ...role,
        patrolMinX: stationary ? e.x - 10 : e.patrolMinX,
        patrolMaxX: stationary ? e.x + 10 : e.patrolMaxX
      });
      this.enemiesGroup.add(enemy);
    });
  }

  /**
   * El rango de patrulla del jefe se toma del config y debe caer siempre sobre piso SOLIDO.
   * Antes se calculaba como x +/- 150 a ciegas: en el nivel 3 eso metia al jefe dentro del
   * hueco del piso, se caia por el fondo abierto del mundo y el jefe simplemente no aparecia.
   */
  _buildBoss(config) {
    const b = config.boss;
    this.boss = new Boss(this, b.x, b.y, {
      health: b.health,
      speed: b.speed,
      throwInterval: b.throwInterval,
      patrolMinX: b.patrolMinX ?? (b.x - 150),
      patrolMaxX: b.patrolMaxX ?? (b.x + 150),
      onDefeated: () => this._onBossDefeated()
    });
  }

  /**
   * Cofre de fin de nivel. Si hay jefe (nivel 3) aparece oculto hasta derrotarlo y tocarlo
   * lanza VictoryScene; si no hay jefe (niveles 1 y 2) esta visible desde el inicio al final
   * del recorrido y tocarlo desbloquea el siguiente nivel y vuelve al minimundo.
   */
  _prepareChest(config) {
    const x = config.hasBoss ? config.boss.x : config.worldWidth - 130;

    this.chest = this.physics.add.staticSprite(x, GROUND_Y - 30, 'cofre');
    SpriteUtils.fitDisplaySize(this.chest, 46, 46);
    this.chest.refreshBody();

    if (config.hasBoss) {
      this.chest.setVisible(false);
      this.chest.body.enable = false;
    } else {
      this.tweens.add({ targets: this.chest, y: this.chest.y - 8, duration: 500, yoyo: true, repeat: -1 });
    }
  }

  // ---------- Colisiones ----------

  _setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.player, this.vanishingPlatforms, this._onTouchVanishingPlatform, null, this);

    this.physics.add.collider(this.enemiesGroup, this.platforms);
    this.physics.add.collider(this.projectilesGroup, this.platforms, (projectile) => projectile.explode());

    this.physics.add.overlap(this.player, this.enemiesGroup, this._onPlayerEnemyOverlap, null, this);
    this.physics.add.overlap(this.player, this.projectilesGroup, this._onPlayerProjectileOverlap, null, this);

    if (this.boss) {
      this.physics.add.collider(this.boss, this.platforms);
      this.physics.add.overlap(this.player, this.boss, this._onPlayerBossOverlap, null, this);
    }

    this.physics.add.overlap(this.player, this.chest, this._onChestTouched, null, this);
  }

  _onTouchVanishingPlatform(player, platform) {
    if (platform.isVanishing) return;
    platform.isVanishing = true;

    this.tweens.add({
      targets: platform,
      alpha: 0,
      delay: 650,
      duration: 250,
      onComplete: () => {
        platform.body.enable = false;
        platform.setVisible(false);

        // Reaparece tras un momento para no bloquear el nivel si el jugador cae
        this.time.delayedCall(2200, () => {
          platform.setVisible(true);
          platform.setAlpha(1);
          platform.body.enable = true;
          platform.isVanishing = false;
        });
      }
    });
  }

  /**
   * Detecta el pisoton comparando los CUERPOS de colision, no el tamano del dibujo.
   * Antes se usaba displayHeight, que cambia con cada textura (los trajes son retratos altos
   * y la bruja es otro tamano), asi que el umbral se movia y el pisoton fallaba a veces.
   * Con los bordes del body el criterio es siempre el mismo: venir cayendo y tener los pies
   * por encima de la cabeza del enemigo.
   */
  _isStomping(player, target) {
    return player.body.velocity.y > 0 && player.body.bottom <= target.body.top + 14;
  }

  _onPlayerEnemyOverlap(player, enemy) {
    if (enemy.isDead || player.isDead) return;

    if (this._isStomping(player, enemy)) {
      enemy.defeat();
      player.body.setVelocityY(-300);
    } else {
      player.takeDamage(enemy.damage);
    }
  }

  _onPlayerBossOverlap(player, boss) {
    if (boss.isDead || player.isDead) return;

    if (this._isStomping(player, boss)) {
      boss.hit(1);
      player.body.setVelocityY(-320);
    } else {
      player.takeDamage(boss.damage);
    }
  }

  _onPlayerProjectileOverlap(player, projectile) {
    if (player.isDead) return;
    projectile.explode();
    player.takeDamage(projectile.damage);
  }

  _onBossDefeated() {
    this.bossDefeated = true;

    this.chest.setVisible(true);
    this.chest.body.enable = true;
    this.tweens.add({ targets: this.chest, y: this.chest.y - 8, duration: 500, yoyo: true, repeat: -1 });
  }

  _onChestTouched() {
    if (this.chestOpened) return;
    if (this.levelConfig.hasBoss && !this.bossDefeated) return;

    this.chestOpened = true;
    this.player.body.setVelocity(0, 0);

    if (this.levelConfig.hasBoss) {
      this.scene.pause();
      this.scene.launch('VictoryScene');
    } else {
      this.time.delayedCall(500, () => this._returnToWorldMap());
    }
  }

  _returnToWorldMap() {
    const unlocked = this.registry.get('unlockedLevel') || 1;
    this.registry.set('unlockedLevel', Math.max(unlocked, this.currentLevel + 1));
    this.scene.start('WorldMapScene');
  }

  // ---------- HUD ----------

  _buildHUD() {
    this.heartIcons = [];
    const heartSize = 26;

    for (let i = 0; i < this.player.maxHealth; i++) {
      const icon = this.add.image(22 + i * (heartSize + 5), 20, 'corazon')
        .setScrollFactor(0)
        .setDepth(1000);
      SpriteUtils.fitDisplaySize(icon, heartSize, heartSize);
      this.heartIcons.push(icon);
    }

    this.levelText = this.add.text(20, 44, `Nivel ${this.currentLevel} / 3`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#00000066',
      padding: { x: 6, y: 3 }
    }).setScrollFactor(0).setDepth(1000);

    this._buildPauseButton();

    const barWidth = 140;
    const barX = this.scale.width - 16 - barWidth;
    const barY = 16 + this._pauseButtonSize + 8;

    this.progressBarBg = this.add.rectangle(barX, barY, barWidth, 16, 0x000000, 0.55)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1000).setStrokeStyle(1, 0xffffff, 0.6);

    this.progressBarFill = this.add.rectangle(barX + 2, barY + 2, barWidth - 4, 12, 0x2ecc71)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1000);

    this._progressBarWidth = barWidth - 4;

    this._updateHUD();
  }

  /** Boton de menu (tres lineas) arriba a la derecha: pausa el juego y abre PauseScene. */
  _buildPauseButton() {
    const size = this._pauseButtonSize = 34;
    const x = this.scale.width - 16 - size;
    const y = 16;

    const btn = this.add.rectangle(x, y, size, size, 0x000000, 0.55)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1000)
      .setStrokeStyle(1, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true });

    const icon = this.add.graphics().setScrollFactor(0).setDepth(1001);
    icon.lineStyle(3, 0xffffff, 1);
    for (let i = 0; i < 3; i++) {
      const lineY = y + 9 + i * 8;
      icon.lineBetween(x + 7, lineY, x + size - 7, lineY);
    }

    btn.on('pointerdown', () => this._openPauseMenu());
  }

  _openPauseMenu() {
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  _updateHUD() {
    this.heartIcons.forEach((icon, i) => {
      icon.setVisible(i < this.player.health);
    });

    if (this.progressBarFill && this.player) {
      const progress = Phaser.Math.Clamp(this.player.x / this.worldWidth, 0, 1);
      this.progressBarFill.width = this._progressBarWidth * progress;
    }
  }

  // ---------- Loop ----------

  update(time) {
    if (!this.player) return;

    // Los botones en pantalla se recalculan cada frame leyendo los punteros reales
    // (ver TouchControls: los eventos por boton se quedaban trabados en movil).
    this.touchControls.update();

    this._updateMovingPlatforms(time);
    this._updateHUD();

    // Caida al vacio: pierde una vida y reaparece
    if (this.player.y > 650 && !this.player.isDead) {
      this.player.takeDamage(1);
      if (!this.player.isDead) {
        this.player.setPosition(Math.max(80, this.player.x - 150), 400);
        this.player.body.setVelocity(0, 0);
      }
    }

    if (this.player.isDead && !this._gameOverTriggered) {
      this._gameOverTriggered = true;
      this.time.delayedCall(1200, () => this.scene.restart({ level: this.currentLevel }));
    }
  }
}
