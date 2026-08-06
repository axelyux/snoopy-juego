/**
 * WorldMapScene
 * Minimundo estilo "mapa de Mario": 3 nodos, uno por nivel. Solo el primero esta
 * desbloqueado al inicio; superar el jefe de un nivel desbloquea el siguiente
 * (progreso guardado en el registry del juego, valido durante la sesion).
 */
const WORLD_NODES = [
  { level: 1, label: 'Parque', color: 0xe98fc2 },
  { level: 2, label: 'Desierto', color: 0xdaa520 },
  { level: 3, label: 'Nieve', color: 0x7fb3e8 }
];

class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
  }

  create() {
    if (this.registry.get('unlockedLevel') === undefined) {
      this.registry.set('unlockedLevel', 1);
    }

    const { width, height } = this.scale;
    const unlockedLevel = this.registry.get('unlockedLevel');

    const bg = this.add.image(0, 0, 'fondo-niveles');
    SpriteUtils.coverBackground(bg, width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.25);

    this.add.text(width / 2, 46, 'Elige un nivel', {
      fontSize: '26px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    const nodePositions = WORLD_NODES.map((node, i) => ({
      node,
      x: width * (0.22 + i * 0.28),
      y: height * 0.55
    }));

    this._drawPaths(nodePositions);

    let snoopyTargetPos = nodePositions[0];

    nodePositions.forEach(({ node, x, y }) => {
      const unlocked = node.level <= unlockedLevel;
      this._drawNode(x, y, node, unlocked);

      if (node.level === Math.min(unlockedLevel, WORLD_NODES.length)) {
        snoopyTargetPos = { x, y };
      }
    });

    const snoopy = this.add.image(snoopyTargetPos.x, snoopyTargetPos.y - 55, 'snoopy-normal');
    SpriteUtils.fitDisplaySize(snoopy, 40, 56);

    this.tweens.add({
      targets: snoopy,
      y: snoopy.y - 8,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, height - 34, 'Completa el nivel para desbloquear el siguiente', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aabbd0'
    }).setOrigin(0.5);
  }

  _drawPaths(nodePositions) {
    const g = this.add.graphics();
    g.lineStyle(6, 0x557799, 1);

    for (let i = 0; i < nodePositions.length - 1; i++) {
      const a = nodePositions[i];
      const b = nodePositions[i + 1];
      g.lineBetween(a.x, a.y, b.x, b.y);
    }
  }

  _drawNode(x, y, node, unlocked) {
    const radius = 44;
    const color = unlocked ? node.color : 0x555555;

    const circle = this.add.circle(x, y, radius, color, 1).setStrokeStyle(4, 0xffffff, unlocked ? 0.9 : 0.3);

    this.add.text(x, y, unlocked ? String(node.level) : '🔒', {
      fontSize: '26px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(x, y + radius + 20, node.label, {
      fontSize: '15px',
      fontFamily: 'Arial',
      color: unlocked ? '#ffffff' : '#778899'
    }).setOrigin(0.5);

    if (!unlocked) return;

    circle.setInteractive({ useHandCursor: true });

    circle.on('pointerover', () => circle.setScale(1.08));
    circle.on('pointerout', () => circle.setScale(1));

    circle.on('pointerdown', () => {
      this.scene.start('GameScene', { level: node.level });
    });
  }
}
