window.ActorObject = class ActorObject extends Actor {
  constructor() {
    /**
     * Position in the world
     * @type {Vector3}
     */
    this.position = Vector3.zero;

    /**
     * Width (x), Length (y), Height (z)
     * @type {Vector3}
     */
    this.bounds = Vector3.zero;
  }

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
    this.viewportPosition = Engine.worldPointToViewportPoint(this.position);

    return (
      this.viewportPosition.x > 0 &&
      this.viewportPosition.x < Viewport.size.x &&
      this.viewportPosition.y > 0 &&
      this.viewportPosition.y < Viewport.size.y
    );
  }
};
