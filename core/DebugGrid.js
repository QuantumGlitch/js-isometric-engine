window.DebugGrid = (function() {
  let grid = null;
  let tileTexture = null;

  function generateEmptyTileTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = Viewport.unit.x;
    canvas.height = Viewport.unit.y;
    const canvasContext = canvas.getContext('2d');

    canvasContext.beginPath();
    // Draw line to halfs of the bounding rect
    canvasContext.moveTo(0, Viewport.unit.y / 2);
    canvasContext.lineTo(Viewport.unit.x / 2, 0);
    canvasContext.lineTo(Viewport.unit.x, Viewport.unit.y / 2);
    canvasContext.lineTo(Viewport.unit.x / 2, Viewport.unit.y);
    canvasContext.lineTo(0, Viewport.unit.y / 2);

    canvasContext.strokeStyle = 'white';
    canvasContext.stroke();

    return new PIXI.Texture(new PIXI.BaseTexture.fromCanvas(canvas));
  }

  /**
   * Draw an empty tile
   * For debug
   * @param {Vector3} position
   */
  function updateTile(position, color) {
    const viewportPosition = Engine.worldToViewport(position);

    // Centering tile
    viewportPosition.x -= Viewport.unit.x / 2;
    viewportPosition.y -= Viewport.unit.y / 2;

    const tile = new PIXI.Sprite(tileTexture);
    tile.position.set(viewportPosition.x, viewportPosition.y);

    grid.addChild(tile);

    if (position.x == 0 && position.y == 0) {
      let circle = new PIXI.Graphics();
      circle.beginFill(0x00ff00);
      circle.drawCircle(
        Engine.worldToViewport(Vector3()).x,
        Engine.worldToViewport(Vector3()).y,
        5
      );
      circle.endFill();
      grid.addChild(circle);
    }
  }

  /**
   * Draw grid at z = 0 level
   * For debug
   */
  function addGrid() {
    removeGrid();
    grid = new PIXI.Container();
    tileTexture = generateEmptyTileTexture();

    /**
     * Mark halfs of viewport
     */

    let line = new PIXI.Graphics();
    line.lineStyle(1, 0xff0000, 1);
    line.moveTo(Viewport.size.x / 2, 0);
    line.lineTo(Viewport.size.x / 2, Viewport.size.y);
    line.x = 0;
    line.y = 0;
    grid.addChild(line);

    line = new PIXI.Graphics();
    line.lineStyle(1, 0xff0000, 1);
    line.moveTo(0, Viewport.size.y / 2);
    line.lineTo(Viewport.size.x, Viewport.size.y / 2);
    line.x = 0;
    line.y = 0;
    grid.addChild(line);

    const [upLeft, upRight, downLeft, downRight] = Viewport.bounds.map(bound =>
      bound.worldPointAtZ(0)
    );

    upLeft.x = Math.floor(upLeft.x) - Engine.observerPoint.x;
    upLeft.y = Math.floor(upLeft.y) - Engine.observerPoint.y;
    updateTile(upLeft, 'red');

    upRight.x = Math.ceil(upRight.x) - Engine.observerPoint.x;
    upRight.y = Math.ceil(upRight.y) - Engine.observerPoint.y;
    updateTile(upRight, 'red');

    downRight.x = Math.ceil(downRight.x) - Engine.observerPoint.x;
    downRight.y = Math.ceil(downRight.y) - Engine.observerPoint.y;
    updateTile(downRight, 'red');

    const startTile = upLeft.clone();
    const endTile = upRight.clone();

    while (endTile.x <= downRight.x + 1) {
      const originalStartTile = startTile.clone();

      do {
        updateTile(startTile);
        startTile.copy(startTile.add([1, 1, 0]));
      } while (!startTile.equals(endTile.add([1, 1, 0])));

      endTile.copy(endTile.add([1, 0, 0]));
      startTile.copy(originalStartTile.add([1, 0, 0]));

      do {
        updateTile(startTile);
        startTile.copy(startTile.add([1, 1, 0]));
      } while (!startTile.equals(endTile.add([1, 1, 0])));

      endTile.copy(endTile.add([0, -1, 0]));
      startTile.copy(originalStartTile.add([1, -1, 0]));
    }

    Engine.getApp().stage.addChild(grid);
    console.log('added');
  }

  function removeGrid() {
    if (grid) Engine.getApp().stage.removeChild(grid);
  }

  return { addGrid, removeGrid };
})();
