/**
 * main.js
 * Configuracion global de Phaser: dimensiones base, fisicas Arcade y ScaleManager en modo FIT
 * (se adapta a cualquier pantalla movil vertical u horizontal).
 *
 * `input.activePointers: 3` es clave para movil: por defecto Phaser solo trackea 2 punteros
 * simultaneos, lo que impide sostener "izquierda" y tocar "salto" al mismo tiempo con dos dedos.
 *
 * Nota sobre pantalla completa: con un lienzo fijo de 800x600 (4:3), Scale.FIT dejaba barras
 * negras a los lados en telefonos modernos (mucho mas anchos, ~19:9 o ~20:9). La alternativa
 * comun, Scale.ENVELOP (recortar para cubrir toda la pantalla), se probo y en esos telefonos
 * recorta ~120px de la parte de arriba Y de abajo del juego -> tapaba los corazones/boton de
 * pausa arriba y los controles tactiles abajo. En vez de recortar, el ANCHO del lienzo se
 * calcula al vuelo segun el aspecto real de la pantalla (el alto se deja fijo en 600, del que
 * depende toda la logica del piso/plataformas/HUD). Como el mundo de cada nivel ya es mucho
 * mas ancho que la camara y esta lo sigue, un lienzo mas ancho simplemente muestra mas nivel a
 * los lados -> pantalla completa, sin barras y sin recortar nada.
 */
function computeGameWidth() {
  const aspect = window.innerWidth / window.innerHeight;
  const width = Math.round(600 * aspect);
  return Phaser.Math.Clamp(width, 700, 1500);
}

const initialWidth = computeGameWidth();

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: initialWidth,
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
    width: initialWidth,
    height: 600
  },
  input: {
    // Punteros simultaneos. Con el valor por defecto (1 tactil) es imposible sostener
    // "izquierda" y tocar "salto" al mismo tiempo con dos dedos.
    activePointers: 4
  },
  scene: [BootScene, MenuScene, WorldMapScene, GameScene, PauseScene, VictoryScene]
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);

  /**
   * Al girar el telefono, cambiar de ventana, o cuando la barra de direcciones movil aparece
   * o desaparece (Safari/Chrome la ocultan al hacer scroll, cambiando el alto disponible sin
   * que sea un "resize" clasico), hay que recalcular el ANCHO del lienzo -no solo re-centrarlo-
   * para que siga llenando la pantalla sin barras. game.scale.resize() ya deja todo consistente
   * (incluida la caja usada para mapear toques).
   */
  const adaptToScreen = () => {
    game.scale.resize(computeGameWidth(), 600);
  };

  window.addEventListener('resize', adaptToScreen);
  window.addEventListener('orientationchange', () => setTimeout(adaptToScreen, 150));

  // visualViewport es la API pensada especificamente para el caso de arriba (barra de
  // direcciones movil apareciendo/ocultandose): window.innerHeight no siempre se actualiza a
  // tiempo o dispara 'resize' en ese momento en todos los navegadores moviles, pero
  // visualViewport si. Se usa ademas de 'resize', no en su lugar, por si algun navegador no
  // la soporta (entonces simplemente no se registra este listener extra).
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', adaptToScreen);
  }

  // La barra de direcciones movil a veces termina de acomodarse unos ms despues del evento
  // 'load'; un reintento corto cubre ese caso sin depender de que el usuario mueva el telefono.
  setTimeout(adaptToScreen, 300);
});
