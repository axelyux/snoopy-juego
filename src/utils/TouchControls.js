/**
 * TouchControls
 * Botones virtuales (izquierda, derecha, salto) fijos en pantalla, pensados para jugar con
 * los pulgares en un telefono.
 *
 * IMPORTANTE - por que NO se usan los eventos pointerdown/pointerup de cada boton:
 * ese enfoque falla en movil de varias formas. Si el dedo resbala un poco fuera del boton
 * el estado queda "pegado" en true y Snoopy sigue corriendo solo; si dos dedos entran y salen
 * en el mismo frame los eventos se pisan; y si el navegador cancela un toque (llamada, gesto
 * del sistema, cambio de app) el "soltar" nunca llega. En vez de eso, cada frame se consulta
 * la posicion real de TODOS los punteros activos y se recalcula el estado desde cero: si hay
 * un dedo dentro del circulo, el boton esta presionado; si no, no lo esta. Es imposible que
 * se quede trabado y soporta varios dedos a la vez de forma natural.
 *
 * Expone `state` con banderas booleanas que Player.js consulta cada frame.
 */
class TouchControls {
  constructor(scene) {
    this.scene = scene;

    this.state = { left: false, right: false, jump: false };

    this.radius = 46;
    this.margin = 22;
    this.gap = 30;

    // Alto de la franja tactil inferior. Las zonas de toque son RECTANGULOS grandes, no los
    // circulos que se ven: en un telefono el pulgar cae lejos del centro del icono, y ademas
    // asi el control tolera cualquier pequeno desfase entre las coordenadas del dedo y las
    // del lienzo (algo que ocurre cuando el canvas esta escalado y centrado con margenes).
    this.bandHeight = 150;

    this._createButtons();
    this._layout();

    scene.scale.on('resize', this._layout, this);

    // Si la escena se pausa o se duerme, se limpia el estado para que Snoopy no se quede
    // caminando al volver.
    scene.events.on('pause', this._resetState, this);
    scene.events.on('sleep', this._resetState, this);
    scene.events.on('shutdown', this.destroy, this);
  }

  _createButtons() {
    const s = this.scene;

    this.buttons = [
      { key: 'left', label: '◀', color: 0x3498db, obj: null, x: 0, y: 0 },
      { key: 'right', label: '▶', color: 0x3498db, obj: null, x: 0, y: 0 },
      { key: 'jump', label: '▲', color: 0xe74c3c, obj: null, x: 0, y: 0 }
    ];

    this.buttons.forEach(b => {
      const circle = s.add.circle(0, 0, this.radius, b.color, 0.45)
        .setStrokeStyle(3, 0xffffff, 0.75)
        .setScrollFactor(0)
        .setDepth(1000);

      const text = s.add.text(0, 0, b.label, {
        fontSize: '30px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

      b.obj = circle;
      b.text = text;
    });
  }

  _layout() {
    const { width, height } = this.scene.scale;
    const r = this.radius;
    const y = height - this.margin - r;

    const positions = {
      left: this.margin + r,
      right: this.margin + r * 3 + this.gap,
      jump: width - this.margin - r
    };

    this.buttons.forEach(b => {
      b.x = positions[b.key];
      b.y = y;
      b.obj.setPosition(b.x, b.y);
      b.text.setPosition(b.x, b.y);
    });

    // Zonas tactiles rectangulares, mucho mas grandes que los circulos y sin solaparse.
    const bandTop = height - this.bandHeight;
    const split = (positions.left + positions.right) / 2;

    this._zone('left', 0, bandTop, split, height);
    this._zone('right', split, bandTop, positions.right + r + 40, height);
    this._zone('jump', width * 0.62, bandTop, width, height);
  }

  _zone(key, x1, y1, x2, y2) {
    const b = this.buttons.find(btn => btn.key === key);
    b.zone = { x1, y1, x2, y2 };
  }

  _resetState() {
    this.state.left = false;
    this.state.right = false;
    this.state.jump = false;
    if (this.buttons) this.buttons.forEach(b => b.obj.setFillStyle(b.color, 0.45));
  }

  /**
   * Recalcula el estado a partir de los punteros activos. Debe llamarse cada frame desde
   * el update() de la escena.
   */
  /**
   * Reune todos los punteros activos. Se hace de forma defensiva porque segun la version de
   * Phaser la lista vive en distintos sitios; si se leyera solo una y no existiera, el control
   * quedaria mudo (los botones no responderian aunque el teclado si).
   */
  _collectPointers() {
    const input = this.scene.input;
    const found = [];

    if (input.manager && Array.isArray(input.manager.pointers)) {
      found.push(...input.manager.pointers);
    } else if (Array.isArray(input.pointers)) {
      found.push(...input.pointers);
    } else {
      if (input.mousePointer) found.push(input.mousePointer);
      for (let i = 1; i <= 10; i++) {
        if (input['pointer' + i]) found.push(input['pointer' + i]);
      }
    }

    if (input.activePointer && !found.includes(input.activePointer)) {
      found.push(input.activePointer);
    }

    return found;
  }

  update() {
    const pointers = this._collectPointers();
    const next = { left: false, right: false, jump: false };

    for (const p of pointers) {
      if (!p || !p.isDown) continue;

      // p.x / p.y vienen en coordenadas del lienzo del juego (el ScaleManager aplica la
      // conversion), que es el espacio en el que viven estos botones fijos en pantalla.
      for (const b of this.buttons) {
        const z = b.zone;
        if (p.x >= z.x1 && p.x <= z.x2 && p.y >= z.y1 && p.y <= z.y2) {
          next[b.key] = true;
          break; // un dedo activa una sola zona (no se solapan)
        }
      }
    }

    this.state.left = next.left;
    this.state.right = next.right;
    this.state.jump = next.jump;

    // Realimentacion visual coherente con el estado real.
    this.buttons.forEach(b => {
      b.obj.setFillStyle(b.color, this.state[b.key] ? 0.85 : 0.45);
    });
  }

  destroy() {
    this.scene.scale.off('resize', this._layout, this);
    this.scene.events.off('pause', this._resetState, this);
    this.scene.events.off('sleep', this._resetState, this);

    if (this.buttons) {
      this.buttons.forEach(b => {
        b.obj.destroy();
        b.text.destroy();
      });
      this.buttons = null;
    }
  }
}
