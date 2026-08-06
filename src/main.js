/**
 * main.js
 * Configuracion global de Phaser: dimensiones base, fisicas Arcade y ScaleManager en modo FIT
 * (se adapta a cualquier pantalla movil vertical u horizontal).
 *
 * `input.activePointers: 3` es clave para movil: por defecto Phaser solo trackea 2 punteros
 * simultaneos, lo que impide sostener "izquierda" y tocar "salto" al mismo tiempo con dos dedos.
 */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  input: {
    // Punteros simultaneos. Con el valor por defecto (1 tactil) es imposible sostener
    // "izquierda" y tocar "salto" a la vez. Se deja holgura para 3 dedos.
    activePointers: 4
  },
  scene: [BootScene, MenuScene, WorldMapScene, GameScene, PauseScene, VictoryScene]
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);

  /**
   * Phaser convierte la posicion del dedo a coordenadas del juego usando la caja del lienzo
   * (posicion + tamano en pantalla). Si esa caja queda desactualizada -algo habitual cuando el
   * lienzo se escala y se centra con margenes, al girar el telefono o al cambiar de dispositivo
   * en las herramientas del navegador- los toques se mapean a un punto equivocado y los botones
   * en pantalla dejan de responder, aunque el teclado siga funcionando. refresh() la recalcula.
   */
  const refreshScale = () => game.scale.refresh();

  window.addEventListener('resize', refreshScale);
  window.addEventListener('scroll', refreshScale, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(refreshScale, 120));
});
