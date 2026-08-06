/**
 * VictoryScene
 * Se lanza como overlay sobre GameScene (pausada) al tocar el cofre del nivel final.
 * Detiene la accion y muestra el mensaje final junto al cofre real y la decoracion
 * de corazon/barra de vida. Al tocar, reinicia el progreso y vuelve a la pantalla de inicio.
 */
class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.92).setScrollFactor(0);

    const chest = this.add.image(width / 2, height / 2 - 110, 'cofre');
    SpriteUtils.fitDisplaySize(chest, 110, 110);

    this.tweens.add({
      targets: chest,
      y: chest.y - 10,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, height / 2 + 10, 'Te ganaste mi corazón', {
      fontSize: '30px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 60 }
    }).setOrigin(0.5);

    const heart = this.add.image(width / 2, height / 2 + 72, 'corazon');
    SpriteUtils.fitDisplaySize(heart, 56, 56);

    this.tweens.add({
      targets: heart,
      scale: heart.scale * 1.15,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const restartText = this.add.text(width / 2, height / 2 + 130, 'Toca para volver al inicio', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Al terminar el juego se reinicia el progreso y se vuelve a la pantalla principal.
    this.input.once('pointerdown', () => {
      this.registry.set('unlockedLevel', 1);
      this.scene.stop('GameScene');
      this.scene.stop('VictoryScene');
      this.scene.start('MenuScene');
    });
  }

}
