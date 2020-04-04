window.ActorObject = class ActorObject extends Actor {
  /**
   * @param {Vector3} {position
   * @param {Vector3} bounds
   * @param {PIXI.Sprite|PIXI.Container} entity}={}
   */
  constructor({ position, bounds, entity } = {}) {
    super();

    /**
     * Position in the world
     * @type {Vector3}
     */
    this.position = position || Vector3();

    /**
     * Width (x), Length (y), Height (z)
     * @type {Vector3}
     */
    this.bounds = bounds || Vector3();

    /**
     * @type {PIXI.Container|PIXI.Sprite}
     */
    this.entity = entity;

    this.init();
  }

  /**
   * Called after constructor or after fundamental variables set
   */
  init() {
    /**
     * Position on the viewport
     */
    this.viewportPosition = Engine.worldToViewport(this.position);
    this.entity.position.set(this.viewportPosition.x, this.viewportPosition.y);
  }

  /**
   * Logics for handling the actor at each frame render
   * @param {Number} deltaTime
   */
  update(deltaTime) {}

  /**
   * Just check if the actor's position projected on viewport is inside it
   * @returns {Boolean}
   */
  isVisible() {
    this.viewportPosition = Engine.worldToViewport(this.position);

    // Consider a tollerance of epsilon, for visibility
    const epsilon = Math.max(Viewport.unit.x, Viewport.unit.y);

    return (
      this.viewportPosition.x > -epsilon &&
      this.viewportPosition.x < Viewport.size.x + epsilon &&
      this.viewportPosition.y > -epsilon &&
      this.viewportPosition.y < Viewport.size.y + epsilon
    );
  }

  /**
   * Which is the depth?
   */
  zIndex() {
    return this.position.x + this.position.y + this.position.z;
  }
};
