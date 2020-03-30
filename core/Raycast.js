/**
 * @class Raycast
 * This class handles ray started from viewport
 * Each point on the viewport is a rect in the engine's world that can match a series of points
 */
window.Raycast = class Raycast {
  /**
   * @param {Vector2} viewportPoint Position on the viewport
   */
  constructor(viewportPoint) {
    this.viewportPoint = viewportPoint;
  }

  /**
   * Get world's position setting a fixed z for this ray
   * @param {Number} z
   * @returns {Vector3}
   */
  worldPointAtZ(z) {
    return new Vector3(
      (this.viewportPoint.x - Viewport.origin.x) / Viewport.unit.x -
        (Viewport.origin.y - z * Viewport.unit.z - this.viewportPoint.y) /
          Viewport.unit.y,
      (Viewport.origin.y - z * Viewport.unit.z - this.viewportPoint.y) /
        Viewport.unit.y +
        (this.viewportPoint.x - Viewport.origin.x) / Viewport.unit.x,
      z
    ).sum(Engine.observerPoint.multiply(1));
  }
};

