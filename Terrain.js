window.Terrain = class Terrain extends Actor {
  set map(v) {
    this._map = v;
  }

  get map() {
    return this._map;
  }

  getTile(x, y, defaultZ = null) {
    return this._map[x] === undefined || this._map[x][y] === undefined ? defaultZ : this._map[x][y];
  }

  drawTile(canvasContext, x, y) {
    // Is tile out of visible map?
    if (this._map[x] === undefined || this._map[x][y] === undefined) return;

    const z = this._map[x][y];
    let position = new Vector3(x, y, z).sum([-0.5, -0.5, 0]);

    /**
     * -------- y
     * |
     * |
     *
     * x
     *
     *  A            B            C
     *    ▣          ▣          ▣
     *      0,0              0,1
     *
     *  D ▣          o          ▣ E
     *
     *      1,0             1,1
     *    ▣          ▣          ▣
     *  F            G           H
     */

    const A = this.getTile(x - 1, y - 1, z);
    const B = this.getTile(x - 1, y, z);
    const C = this.getTile(x - 1, y + 1, z);
    const D = this.getTile(x, y - 1, z);
    const E = this.getTile(x, y + 1, z);
    const F = this.getTile(x + 1, y - 1, z);
    const G = this.getTile(x + 1, y, z);
    const H = this.getTile(x + 1, y + 1, z);

    const centerPoint = position.sum([0.5, 0.5, (A + B + C + D + E + F + G + H) / 8 - 0.666666 * z]);

    {
      canvasContext.beginPath();

      const firstPoint = position.sum([0, 0, (A + B + D) / 3 - 0.666666 * z]);
      const secondPoint = position.sum([0, 1, (B + C + E) / 3 - 0.666666 * z]);

      Engine.worldPointToViewportPoint(centerPoint).let(({ x, y }) => canvasContext.moveTo(x, y));
      Engine.worldPointToViewportPoint(firstPoint).let(({ x, y }) => canvasContext.lineTo(x, y));
      Engine.worldPointToViewportPoint(secondPoint).let(({ x, y }) => canvasContext.lineTo(x, y));
      Engine.worldPointToViewportPoint(centerPoint).let(({ x, y }) => canvasContext.lineTo(x, y));

      // Find the vector between centerPoint and firstPoint
      const vectorA = centerPoint.subtract(firstPoint);
      // Find the vector between centerPoint and secondPoint
      const vectorB = centerPoint.subtract(secondPoint);
      // Find the unit vector perpendicular to the surface delimited by centerPoint-firstPoint-secondPoint
      // then find the cosin similarity between this vector and the light vector (new Vector3(0, 0, -1))
      // and translate to range 0-1
      const sim =
        (1 +
          vectorA
            .cross(vectorB)
            .unit()
            .angleTo(new Vector3(0, 0, -1))) /
        2;

      canvasContext.fillStyle = `rgb(${sim * 200}, ${sim * 200}, ${sim * 200})`;
      canvasContext.fill();
    }

    {
      canvasContext.beginPath();

      const firstPoint = position.sum([0, 1, (B + C + E) / 3 - 0.666666 * z]);
      const secondPoint = position.sum([1, 1, (E + H + G) / 3 - 0.666666 * z]);

      Engine.worldPointToViewportPoint(centerPoint).let(({ x, y }) => canvasContext.moveTo(x, y));
      Engine.worldPointToViewportPoint(firstPoint).let(({ x, y }) => canvasContext.lineTo(x, y));
      Engine.worldPointToViewportPoint(secondPoint).let(({ x, y }) => canvasContext.lineTo(x, y));
      Engine.worldPointToViewportPoint(centerPoint).let(({ x, y }) => canvasContext.lineTo(x, y));

      // Find the vector between centerPoint and firstPoint
      const vectorA = centerPoint.subtract(firstPoint);
      // Find the vector between centerPoint and secondPoint
      const vectorB = centerPoint.subtract(secondPoint);
      // Find the unit vector perpendicular to the surface delimited by centerPoint-firstPoint-secondPoint
      // then find the cosin similarity between this vector and the light vector (new Vector3(0, 0, -1))
      // and translate to range 0-1
      const sim =
        (1 +
          vectorA
            .cross(vectorB)
            .unit()
            .angleTo(new Vector3(0, 0, -1))) /
        2;

      canvasContext.fillStyle = `rgb(${sim * 200}, ${sim * 200}, ${sim * 200})`;
      canvasContext.fill();
    }

    {
      canvasContext.beginPath();

      const firstPoint = position.sum([1, 1, (E + H + G) / 3 - 0.666666 * z]);
      const secondPoint = position.sum([1, 0, (D + F + G) / 3 - 0.666666 * z]);

      Engine.worldPointToViewportPoint(centerPoint).let(({ x, y }) => canvasContext.moveTo(x, y));
      Engine.worldPointToViewportPoint(firstPoint).let(({ x, y }) => canvasContext.lineTo(x, y));
      Engine.worldPointToViewportPoint(secondPoint).let(({ x, y }) => canvasContext.lineTo(x, y));
      Engine.worldPointToViewportPoint(centerPoint).let(({ x, y }) => canvasContext.lineTo(x, y));

      // Find the vector between centerPoint and firstPoint
      const vectorA = centerPoint.subtract(firstPoint);
      // Find the vector between centerPoint and secondPoint
      const vectorB = centerPoint.subtract(secondPoint);
      // Find the unit vector perpendicular to the surface delimited by centerPoint-firstPoint-secondPoint
      // then find the cosin similarity between this vector and the light vector (new Vector3(0, 0, -1))
      // and translate to range 0-1
      const sim =
        (1 +
          vectorA
            .cross(vectorB)
            .unit()
            .angleTo(new Vector3(0, 0, -1))) /
        2;

      canvasContext.fillStyle = `rgb(${sim * 200}, ${sim * 200}, ${sim * 200})`;
      canvasContext.fill();
    }

    {
      canvasContext.beginPath();

      const firstPoint = position.sum([1, 0, (D + F + G) / 3 - 0.666666 * z]);
      const secondPoint = position.sum([0, 0, (A + B + D) / 3 - 0.666666 * z]);

      Engine.worldPointToViewportPoint(centerPoint).let(({ x, y }) => canvasContext.moveTo(x, y));
      Engine.worldPointToViewportPoint(firstPoint).let(({ x, y }) => canvasContext.lineTo(x, y));
      Engine.worldPointToViewportPoint(secondPoint).let(({ x, y }) => canvasContext.lineTo(x, y));
      Engine.worldPointToViewportPoint(centerPoint).let(({ x, y }) => canvasContext.lineTo(x, y));

      // Find the vector between centerPoint and firstPoint
      const vectorA = centerPoint.subtract(firstPoint);
      // Find the vector between centerPoint and secondPoint
      const vectorB = centerPoint.subtract(secondPoint);
      // Find the unit vector perpendicular to the surface delimited by centerPoint-firstPoint-secondPoint
      // then find the cosin similarity between this vector and the light vector (new Vector3(0, 0, -1))
      // and translate to range 0-1
      const sim =
        (1 +
          vectorA
            .cross(vectorB)
            .unit()
            .angleTo(new Vector3(0, 0, -1))) /
        2;

      canvasContext.fillStyle = `rgb(${sim * 200}, ${sim * 200}, ${sim * 200})`;
      canvasContext.fill();
    }
  }

  /**
   * Logics for drawing the actor on the canvas
   * @param {CanvasRenderingContext2D} canvasContext
   */
  render(canvasContext) {
    const [upLeft, upRight, downLeft, downRight] = Viewport.bounds.map(bound =>
      bound.worldPointAtZ(0)
    );

    upLeft.let(b => {
      b.x = Math.floor(b.x);
      b.y = Math.floor(b.y);
    });
    upRight.let(b => {
      b.x = Math.ceil(b.x);
      b.y = Math.ceil(b.y);
    });
    downLeft.let(b => {
      b.x = Math.floor(b.x);
      b.y = Math.floor(b.y);
    });
    downRight.let(b => {
      b.x = Math.ceil(b.x);
      b.y = Math.ceil(b.y);
    });

    let x0 = upLeft.x - 1;
    let y0 = upLeft.y;
    let x1 = upRight.x + 1;
    let y1 = upRight.y;

    let x = x0;
    let y = y0;

    while (x0 < downLeft.x - 1) {
      x0 += 1;
      x1 -= 1;

      x = x0;
      y = y0;

      while (x <= x1 || y <= y1) {
        this.drawTile(canvasContext, x, y);
        x++;
        y++;
      }

      y0 -= 1;

      x = x0 + 1;
      y = y0 + 1;

      while (x < x1 || y < y1) {
        this.drawTile(canvasContext, x, y);
        x++;
        y++;
      }

      y1 -= 1;
    }

    x0 += 1;
    x1 -= 1;

    x = x0;
    y = y0;

    while (x <= x1 || y <= y1) {
      this.drawTile(canvasContext, x, y);
      x++;
      y++;
    }
  }

  isVisible() {
    return !!this._map;
  }
};
