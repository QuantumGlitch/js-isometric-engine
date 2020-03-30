window.Actor = class Actor {
  constructor() {}

  /**
   * Logics for handling the actor at each frame render
   * @param {Number} time milliseconds from first frame render
   * @param {Number} deltaTime millisecond from last frame render
   */
  update(time, deltaTime) {}

  /**
   * Logics for drawing the actor on the canvas
   * @param {CanvasRenderingContext2D} canvasContext
   */
  render(canvasContext) {}

  /**
   * Just check if the actor's position projected on viewport is inside it
   * @returns {Boolean}
   */
  isVisible() {
    return true;
  }
};
