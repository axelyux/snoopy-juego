/**
 * SpriteUtils
 * Helper compartido para escalar sprites fisicos. El recorte de fondo blanco ya no se hace
 * con un shader en tiempo real: BootScene lo resuelve una sola vez con un flood-fill en canvas
 * (ver BootScene._cutoutWhiteBackground), asi que las texturas ya tienen alfa real aqui.
 */
const SpriteUtils = {
  /** Ajusta el tamano de un sprite fisico manteniendo su proporcion original dentro de un box maximo. */
  fitDisplaySize(gameObject, maxWidth, maxHeight) {
    const srcWidth = gameObject.width;
    const srcHeight = gameObject.height;
    const scale = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    gameObject.setDisplaySize(srcWidth * scale, srcHeight * scale);
    return gameObject;
  },

  /**
   * Escala un fondo (a menudo un retrato vertical) para cubrir por completo un area
   * canvasW x canvasH sin distorsionar su proporcion, centrado -> el sobrante se recorta
   * fuera de camara. Equivalente a CSS background-size: cover.
   */
  coverBackground(gameObject, canvasW, canvasH) {
    const scale = Math.max(canvasW / gameObject.width, canvasH / gameObject.height);
    gameObject.setDisplaySize(gameObject.width * scale, gameObject.height * scale);
    gameObject.setPosition(canvasW / 2, canvasH / 2);
    return gameObject;
  }
};
