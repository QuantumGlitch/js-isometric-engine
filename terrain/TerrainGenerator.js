const PIXI = require('pixi.js');

const { Engine, Viewport } = require('../core/Engine');
const Vector3 = require('../core/Vector3');
const Vector2 = require('../core/Vector2');

const ActorObject = require('../core/actor/ActorObject');

class TerrainGenerator {
  constructor() {
    this.texturesMap = [];
    this.alignMap = [];

    Viewport.on('zoom-start', () => {
      // free memory
      delete this.texturesMap;
      this.texturesMap = [];

      if (this.refreshTimeouts) for (let timeout of this.refreshTimeouts) clearTimeout(timeout);

      this.refreshTimeouts = [];
    });
  }

  getTilePrecomputation(A, B, C, D, E, F, G, H) {
    if (!this.texturesMap[`${A}`]) this.texturesMap[`${A}`] = [];
    if (!this.texturesMap[`${A}`][`${B}`]) this.texturesMap[`${A}`][`${B}`] = [];
    if (!this.texturesMap[`${A}`][`${B}`][`${C}`]) this.texturesMap[`${A}`][`${B}`][`${C}`] = [];
    if (!this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`])
      this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`] = [];
    if (!this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`])
      this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`] = [];
    if (!this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`][`${F}`])
      this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`][`${F}`] = [];
    if (!this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`][`${F}`][`${G}`])
      this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`][`${F}`][`${G}`] = [];
    if (!this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`][`${F}`][`${G}`][`${H}`])
      this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`][`${F}`][`${G}`][`${H}`] = {
        texture: null,
        relativePosition: Vector3()
      };

    return this.texturesMap[`${A}`][`${B}`][`${C}`][`${D}`][`${E}`][`${F}`][`${G}`][`${H}`];
  }

  getTileAlignOffset(x, y) {
    if (!this.alignMap[x]) this.alignMap[x] = [];
    if (!this.alignMap[x][y]) this.alignMap[x][y] = { vector: null };
    return this.alignMap[x][y];
  }

  /**
   * @param {Vector3} vector
   */
  set lightVersor(vector) {
    return this._lightVersor;
  }

  /**
   * By default the light comes from the up direction
   */
  get lightVersor() {
    return this._lightVersor || (this.lightVersor = Vector3(0, 0, -1));
  }

  set map(v) {
    this._map = v;
  }

  get map() {
    return this._map;
  }

  getTile(x, y, defaultZ = null) {
    return this._map[x] === undefined || this._map[x][y] === undefined ? defaultZ : this._map[x][y];
  }

  /**
   * Get tile color based on the cosin similarity between vector perpendicular to the surface
   * and the light versor
   * @param {Number} lightShade value between 0 and 1
   */
  getTileColor(lightShade) {
    return `rgb(${lightShade * 200}, ${lightShade * 200}, ${lightShade * 200})`;
  }

  /**
   * Generate tile at world position x,y
   * @param {Number} x
   * @param {Number} y
   */
  tile(x, y) {
    let z = this._map[x][y];

    /**
     * -------- y
     * |
     * |
     * |
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

    const tilePrecomputation = this.getTilePrecomputation(
      z - A,
      z - B,
      z - C,
      z - D,
      z - E,
      z - F,
      z - G,
      z - H
    );

    const returnActorObjectConfiguration = () => {
      return {
        position: this.getTileAlignOffset(x, y).vector.add([-0.5, -0.5, 0]),
        texture: tilePrecomputation.texture
      };
    };

    if (tilePrecomputation.texture && this.getTileAlignOffset(x, y).vector)
      return returnActorObjectConfiguration();

    const position = Vector3(x, y, z);
    const centerPoint = position.add([0.5, 0.5, (A + B + C + D + E + F + G + H) / 8 - 0.667 * z]);
    const triangles = [];

    // Compute tile's triangles in 3D

    {
      const firstPoint = position.add([0, 0, (A + B + D) / 3 - 0.667 * z]);
      const secondPoint = position.add([0, 1, (B + C + E) / 3 - 0.667 * z]);

      // Find the vector between centerPoint and firstPoint
      const vectorA = centerPoint.subtract(firstPoint);
      // Find the vector between centerPoint and secondPoint
      const vectorB = centerPoint.subtract(secondPoint);
      // Find the unit vector perpendicular to the surface delimited by centerPoint-firstPoint-secondPoint
      // then find the cosin lightSimilarity between this vector and the light vector (Vector3(0, 0, -1))
      // and translate to range 0-1
      const lightSimilarity =
        (1 +
          vectorA
            .cross(vectorB)
            .unit()
            .cosinSimilarity(this.lightVersor)) /
        2;

      triangles.push({
        points: [firstPoint, secondPoint],
        lightSimilarity
      });
    }

    {
      const firstPoint = position.add([0, 1, (B + C + E) / 3 - 0.667 * z]);
      const secondPoint = position.add([1, 1, (E + H + G) / 3 - 0.667 * z]);

      // Find the vector between centerPoint and firstPoint
      const vectorA = centerPoint.subtract(firstPoint);
      // Find the vector between centerPoint and secondPoint
      const vectorB = centerPoint.subtract(secondPoint);
      // Find the unit vector perpendicular to the surface delimited by centerPoint-firstPoint-secondPoint
      // then find the cosin lightSimilarity between this vector and the light vector (Vector3(0, 0, -1))
      // and translate to range 0-1
      const lightSimilarity =
        (1 +
          vectorA
            .cross(vectorB)
            .unit()
            .cosinSimilarity(this.lightVersor)) /
        2;

      triangles.push({
        points: [firstPoint, secondPoint],
        lightSimilarity
      });
    }

    {
      const firstPoint = position.add([1, 1, (E + H + G) / 3 - 0.667 * z]);
      const secondPoint = position.add([1, 0, (D + F + G) / 3 - 0.667 * z]);

      // Find the vector between centerPoint and firstPoint
      const vectorA = centerPoint.subtract(firstPoint);
      // Find the vector between centerPoint and secondPoint
      const vectorB = centerPoint.subtract(secondPoint);
      // Find the unit vector perpendicular to the surface delimited by centerPoint-firstPoint-secondPoint
      // then find the cosin lightSimilarity between this vector and the light vector (Vector3(0, 0, -1))
      // and translate to range 0-1
      const lightSimilarity =
        (1 +
          vectorA
            .cross(vectorB)
            .unit()
            .cosinSimilarity(this.lightVersor)) /
        2;

      triangles.push({
        points: [firstPoint, secondPoint],
        lightSimilarity
      });
    }

    {
      const firstPoint = position.add([1, 0, (D + F + G) / 3 - 0.667 * z]);
      const secondPoint = position.add([0, 0, (A + B + D) / 3 - 0.667 * z]);

      // Find the vector between centerPoint and firstPoint
      const vectorA = centerPoint.subtract(firstPoint);
      // Find the vector between centerPoint and secondPoint
      const vectorB = centerPoint.subtract(secondPoint);
      // Find the unit vector perpendicular to the surface delimited by centerPoint-firstPoint-secondPoint
      // then find the cosin lightSimilarity between this vector and the light vector (Vector3(0, 0, -1))
      // and translate to range 0-1

      const lightSimilarity =
        (1 +
          vectorA
            .cross(vectorB)
            .unit()
            .cosinSimilarity(this.lightVersor)) /
        2;

      triangles.push({
        points: [firstPoint, secondPoint],
        lightSimilarity
      });
    }

    // Now draw triangles on a canvas to generate a texture for this kind of tile
    let xMinViewport = Number.POSITIVE_INFINITY,
      xMaxViewport = Number.NEGATIVE_INFINITY,
      yMinViewport = Number.POSITIVE_INFINITY,
      yMaxViewport = Number.NEGATIVE_INFINITY;

    // Find width and height for the canvas
    for (let triangle of triangles)
      for (let point of triangle.points) {
        const p = Engine.measureWorldToViewport(point);

        if (p.x < xMinViewport) xMinViewport = p.x;
        else if (p.x > xMaxViewport) xMaxViewport = p.x;

        if (p.y < yMinViewport) yMinViewport = p.y;
        else if (p.y > yMaxViewport) yMaxViewport = p.y;
      }

    const canvas = document.createElement('canvas');

    // Adapt canvas to tile width and height
    canvas.width = xMaxViewport - xMinViewport;
    canvas.height = yMaxViewport - yMinViewport;

    // Every tile has its own offset to take in consideration ( because every kind of tile has a different dimension on canvas )
    this.getTileAlignOffset(x, y).vector = Engine.measureViewportToWorld(
      new Vector2(xMinViewport, yMinViewport),
      0
    );

    if (tilePrecomputation.texture) return returnActorObjectConfiguration();

    // Render every triangle of this tile
    const canvasContext = canvas.getContext('2d');

    // This is the center of tile, on canvas
    const p0 = Engine.measureWorldToViewport(centerPoint);

    for (let triangle of triangles) {
      {
        canvasContext.beginPath();

        // From center
        canvasContext.moveTo(Math.round(p0.x - xMinViewport), Math.round(p0.y - yMinViewport));

        // To every point of triangle
        for (let point of triangle.points) {
          const p = Engine.measureWorldToViewport(point);
          canvasContext.lineTo(Math.round(p.x - xMinViewport), Math.round(p.y - yMinViewport));
        }

        // Back to center
        canvasContext.lineTo(Math.round(p0.x - xMinViewport), Math.round(p0.y - yMinViewport));

        canvasContext.fillStyle = this.getTileColor(triangle.lightSimilarity);
        canvasContext.fill();
      }
    }

    if (Engine.getDebug()) {
      let referencePoint = Engine.measureWorldToViewport(position).add([
        -xMinViewport,
        -yMinViewport
      ]);

      canvasContext.fillStyle = 'red';
      canvasContext.fillRect(referencePoint.x - 3, referencePoint.y - 3, 6, 6);

      referencePoint = Engine.measureWorldToViewport(centerPoint).add([
        -xMinViewport,
        -yMinViewport
      ]);
      canvasContext.fillStyle = 'blue';
      //canvasContext.fillRect(referencePoint.x - 3, referencePoint.y - 2, 6, 6);
      canvasContext.fillText(`${x},${y}`, referencePoint.x - 5, referencePoint.y - 2);

      referencePoint = Vector2(xMinViewport, yMinViewport).add([-xMinViewport, -yMinViewport]);
      canvasContext.fillStyle = 'green';
      canvasContext.fillRect(referencePoint.x - 3, referencePoint.y - 2, 6, 6);
    }

    // Return texture from Canvas
    tilePrecomputation.texture = new PIXI.Texture(PIXI.BaseTexture.from(canvas));
    if (tilePrecomputation.texture) return returnActorObjectConfiguration();
  }

  // Callbacks for tiles
  onZoom(zoom) {
    // Just set scale as approximation, until redraw
    this.entity.scale.set(zoom / this.lastZoomComputed);
  }

  onZoomEnd(x, y) {
    const tileObject = this._tilesObjects[x][y];

    const distance = Math.sqrt(
      Math.pow(Engine.observerPoint.x - tileObject.position.x, 2) +
        Math.pow(Engine.observerPoint.y - tileObject.position.y, 2) +
        Math.pow(Engine.observerPoint.z - tileObject.position.z, 2)
    );

    // Compute distance from observerPoint
    this.refreshTimeouts.push(
      setTimeout(this.refreshTimeout.bind(this, this.refreshTimeouts.length, x, y), distance * 20)
    );
  }

  refreshTimeout(timeoutIndex, x, y) {
    this.setOrRefreshActorObjectTile(x, y);
    this.refreshTimeouts.splice(timeoutIndex, 1);
    if (this.refreshTimeouts.length == 0) {
      // free memory
      delete this.texturesMap;
      this.texturesMap = [];
    }
  }

  /**
   * Generate the ActorObject for tile at x,y
   * @param {Number} x
   * @param {Number} y
   * @returns {ActorObject}
   */
  setOrRefreshActorObjectTile(x, y) {
    const { position, texture } = this.tile(x, y);

    const alreadyExists = !!this._tilesObjects[x][y];
    const tileObject = alreadyExists
      ? this._tilesObjects[x][y]
      : new ActorObject({ entity: new PIXI.Sprite() });

    tileObject.position = position;
    tileObject.entity.texture = PIXI.Texture.EMPTY;
    tileObject.entity.texture = texture;
    tileObject.entity.scale.set(1, 1);
    tileObject.lastZoomComputed = Viewport.getZoom();
    tileObject.init();

    if (!alreadyExists) {
      tileObject.entity.visible = false;
      tileObject.entity.interactive = true;

      Viewport.on('zoom', this.onZoom.bind(tileObject));
      Viewport.on('zoom-end', this.onZoomEnd.bind(this, x, y));

      // Add to engine
      Engine.addActorObject(tileObject);
      this._tilesObjects[x][y] = tileObject;
    }

    return tileObject;
  }

  setActorTiles() {
    if (!this._map) return;
    if (this._tilesObjects) this.removeActorTiles();

    this._tilesObjects = [];

    for (let x = 0; x < this._map.length; x++) {
      this._tilesObjects[x] = [];
      for (let y = 0; y < this._map[0].length; y++) this.setOrRefreshActorObjectTile(x, y);
    }

    // free memory
    delete this.texturesMap;
    this.texturesMap = [];
  }

  removeActorTiles() {
    for (let x = 0; x < this._map.length; x++)
      for (let y = 0; y < this._map[0].length; y++)
        Engine.removeActorObject(this._tilesObjects[x][y]);
  }
}

module.exports = TerrainGenerator;
