/**
 * PauseScene
 * Overlay que se lanza sobre GameScene (pausada) al tocar el boton de menu (tres lineas).
 * Ofrece continuar la partida o volver al minimundo de niveles.
 */
class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65).setScrollFactor(0);

    const panel = this.add.rectangle(width / 2, height / 2, 260, 190, 0x1a2e33, 0.95)
      .setStrokeStyle(2, 0xffffff, 0.5);

    this.add.text(width / 2, height / 2 - 65, 'Pausa', {
      fontSize: '26px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    this._makeButton(width / 2, height / 2 - 5, 'Continuar', 0x2ecc71, () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });

    this._makeButton(width / 2, height / 2 + 55, 'Volver al mapa', 0xe67e22, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('WorldMapScene');
    });
  }

  _makeButton(x, y, label, color, onClick) {
    const btn = this.add.rectangle(x, y, 200, 44, color, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      fontSize: '17px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setScale(1.04));
    btn.on('pointerout', () => btn.setScale(1));
    btn.on('pointerdown', onClick);
  }
}
