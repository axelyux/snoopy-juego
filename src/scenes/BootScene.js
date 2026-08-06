/**
 * BootScene
 * Carga todos los assets reales de /snopy-img (fondos, Snoopy por nivel, enemigos, jefe,
 * cofre y decoracion de UI), recorta el fondo blanco de los sprites de personajes con un
 * flood-fill en canvas (ver _cutoutWhiteBackground) y muestra una barra de progreso.
 * Al terminar pasa a MenuScene (pantalla de "Presiona para iniciar").
 *
 * Nota tecnica: se descarto un enfoque con shader (chroma-key en tiempo real) porque estos
 * sprites son lineart blanco/negro sobre fondo blanco -> un chroma-key global de "quitar todo
 * lo blanco" tambien borra el cuerpo blanco de Snoopy. El flood-fill parte de las 4 esquinas
 * de la imagen y solo vacia de color el blanco CONECTADO al borde, preservando el blanco
 * interior (encerrado por el contorno negro) del personaje.
 */
const CUTOUT_KEYS = [
  'snoopy-normal', 'snoopy-walk2', 'snoopy-hurt', 'snoopy-vaquero', 'snoopy-caballero', 'snoopy-derrotado', 'snoopy-menu',
  'boss-calavera',
  'woodstock-normal', 'woodstock-walk2', 'woodstock-bruja'
];

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this._createProgressBar();
    this._loadRealAssets();
    this._generatePlaceholderTextures();
  }

  create() {
    CUTOUT_KEYS.forEach(key => this._cutoutWhiteBackground(key));
    this.scene.start('MenuScene');
  }

  _createProgressBar() {
    const { width, height } = this.scale;

    const barBg = this.add.rectangle(width / 2, height / 2, 220, 24, 0x222222).setStrokeStyle(2, 0xffffff);
    const barFill = this.add.rectangle(width / 2 - 106, height / 2, 4, 16, 0xffffff).setOrigin(0, 0.5);
    const label = this.add.text(width / 2, height / 2 - 30, 'Cargando...', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      barFill.width = 212 * value;
    });

    this.load.on('complete', () => {
      barBg.destroy();
      barFill.destroy();
      label.destroy();
    });
  }

  _loadRealAssets() {
    const path = 'snopy-img/';

    // Fondos por nivel
    this.load.image('bg-bosque', path + 'bg-bosque.jpeg');
    this.load.image('bg-desierto', path + 'bg-desierto.jpeg');
    this.load.image('bg-nieve', path + 'bg-nieve.jpeg');
    this.load.image('bg-parque', path + 'bg-parque.jpeg');

    // Snoopy: trajes por nivel + animacion + reaccion de dano + derrota
    this.load.image('snoopy-normal', path + 'snoopy-normal.jpeg');
    this.load.image('snoopy-walk2', path + 'snoopy-walk2.jpeg');
    this.load.image('snoopy-hurt', path + 'snoopy-hurt.jpeg');
    this.load.image('snoopy-vaquero', path + 'snoopy-vaquero.jpeg');
    this.load.image('snoopy-caballero', path + 'snoopy-caballero.jpeg');
    this.load.image('snoopy-derrotado', path + 'snoopy-derrotado.jpeg');

    // Jefe final
    this.load.image('boss-calavera', path + 'boss-calavera.jpeg');

    // Enemigos Woodstock
    this.load.image('woodstock-normal', path + 'woodstock-normal.jpeg');
    this.load.image('woodstock-walk2', path + 'woodstock-walk2.jpeg');
    this.load.image('woodstock-bruja', path + 'woodstock-bruja.jpeg');

    // Snoopy del menu de inicio
    this.load.image('snoopy-menu', path + 'snoopy-menu.jpeg');

    // UI y decoracion
    // UI (corazon.png ya viene recortado con alfa, no necesita flood-fill)
    this.load.image('cofre', path + 'cofre.png');
    this.load.image('corazon', path + 'corazon.png');
    this.load.image('tile-pasto', path + 'tile-pasto.jpeg');

    // Plataformas del parque (nivel 1)
    this.load.image('plataforma-barra', path + 'plataforma1.png');
    this.load.image('plataforma-musgo', path + 'plataforma2.png');
    this.load.image('plataforma-pixel', path + 'plataforma3.png');

    // Piso y plataformas del desierto (nivel 2)
    this.load.image('piso-desierto', path + 'piso-para-desierto.webp');
    this.load.image('plataforma-desierto1', path + 'plataforma-desierto.png');
    this.load.image('plataforma-desierto2', path + 'plataforma-disierto2.png');
    this.load.image('plataforma-desierto3', path + 'plataforma-desierto3.png');
    this.load.image('plataforma-desierto4', path + 'plataforma-desierto4.png');

    // Plataformas de nieve (nivel 3)
    this.load.image('plataforma-nieve1', path + 'plataforma-nieve.png');
    this.load.image('plataforma-nieve2', path + 'plataforma-nieve2.png');
    this.load.image('plataforma-nieve3', path + 'plataforma-nieve3.png');
    this.load.image('plataforma-nieve4', path + 'plataforma-nieve4.png');

    // Fondos de menu e intro
    this.load.image('fondo-inicio', path + 'fondo-img-inicio.jpeg');
    this.load.image('fondo-niveles', path + 'img-fondo-niveles.jpeg');
  }

  /** Texturas generadas: pixel blanco (plataformas sin arte, tintado por sprite) y bola de fuego. */
  _generatePlaceholderTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('pixel', 4, 4);
    g.destroy();

    this._generateFireballTexture();
  }

  /**
   * Dibuja una bola de fuego (nucleo claro + halo naranja/rojo) en vez de usar la textura
   * 'pixel' estirada como proyectil, que se veia como un cuadrado feo sin forma.
   */
  _generateFireballTexture() {
    const size = 20;
    const f = this.make.graphics({ x: 0, y: 0, add: false });

    f.fillStyle(0xc0392b, 1);
    f.fillCircle(size / 2, size / 2, size / 2);

    f.fillStyle(0xe67e22, 1);
    f.fillCircle(size / 2, size / 2, size / 2 - 3);

    f.fillStyle(0xf9e79f, 1);
    f.fillCircle(size / 2, size / 2, size / 2 - 7);

    f.generateTexture('fireball', size, size);
    f.destroy();
  }

  /**
   * Reemplaza la textura `key` (JPEG opaco) por una version recortada con canal alfa real:
   * BFS desde los 4 bordes de la imagen, volviendo transparente solo el blanco conectado
   * al fondo (no el blanco interior del dibujo).
   */
  _cutoutWhiteBackground(key, threshold = 245) {
    const source = this.textures.get(key).getSourceImage();
    const w = source.width;
    const h = source.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const visited = new Uint8Array(w * h);

    const isWhite = (pixelIndex) => {
      const i = pixelIndex * 4;
      return data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold;
    };

    const stack = [];
    const trySeed = (x, y) => {
      const p = y * w + x;
      if (!visited[p] && isWhite(p)) {
        visited[p] = 1;
        stack.push(p);
      }
    };

    for (let x = 0; x < w; x++) {
      trySeed(x, 0);
      trySeed(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      trySeed(0, y);
      trySeed(w - 1, y);
    }

    while (stack.length > 0) {
      const p = stack.pop();
      const x = p % w;
      const y = (p / w) | 0;

      data[p * 4 + 3] = 0;

      if (x > 0) trySeed(x - 1, y);
      if (x < w - 1) trySeed(x + 1, y);
      if (y > 0) trySeed(x, y - 1);
      if (y < h - 1) trySeed(x, y + 1);
    }

    ctx.putImageData(imageData, 0, 0);

    this.textures.remove(key);
    this.textures.addCanvas(key, canvas);
  }
}
