/**
 * MenuScene
 * Pantalla de inicio: fondo real de Snoopy en su casita, titulo, dedicatoria y
 * "Toca para iniciar". Al tocar la pantalla pasa al minimundo de niveles (WorldMapScene).
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.image(0, 0, 'fondo-inicio');
    SpriteUtils.coverBackground(bg, width, height);

    // Panel semitransparente detras del texto para que se lea bien sobre el fondo ilustrado.
    this.add.rectangle(width / 2, height * 0.16, width, 90, 0x000000, 0.35);

    this.add.text(width / 2, height * 0.13, 'SNOOPY', {
      fontSize: '52px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.13 + 46, 'Aventura de Fantasía', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffe9b3',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const startText = this.add.text(width / 2, height * 0.82, 'Toca para iniciar', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#00000066',
      padding: { x: 14, y: 8 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.add.text(width / 2, height * 0.94, 'Creado por Axel, para su hermosa novia ♥', {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#00000055',
      padding: { x: 8, y: 3 }
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('WorldMapScene');
    });
  }
}
