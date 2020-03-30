window.Viewport = (function() {
  // Unit of the world correspond to TOT px of the canvas viewport at zoomLevel 1
  const baseUnit = new Vector3(80, 40, 40);

  // Unit of the world
  const unit = baseUnit.clone();

  // Size of the viewport in PX
  const size = Vector2.zero;

  // Margin of the Viewport from start rendering in PX
  const renderingOffset = new Vector2(0, 0);

  // The observing point of the world that correspondes to the center of canvas
  // It will be setted on canvas' resize
  const origin = Vector2.zero;

  // Bounds of rendering on the viewport
  const bounds = [];

  let zoom = 1;

  /**
   * Set zoom for viewport
   * @param level {Number}
   */
  function setZoom(level) {
    zoom = level;
    unit.copy(baseUnit.multiply(level));
  }

  function getZoom() {
    return zoom;
  }

  return {
    unit,
    size,
    renderingOffset,
    origin,
    bounds,
    setZoom,
    getZoom
  };
})();

window.Engine = (function() {
  let debug = false;

  /**
   * @type {CanvasRenderingContext2D}
   */
  let canvasContext = null;
  let canvas = null;

  // All renderizable entities of the world
  let actors = [];

  // The point from which the observer is watching the world
  const observerPoint = Vector3.zero;

  /**
   * Convert world's point to a viewport point
   * @param {Vector3} point
   * @returns {Vector2}
   */
  function worldPointToViewportPoint(point) {
    point = point.sum(observerPoint.multiply(-1));

    return (
      Viewport.origin
        // + Y Unit Vector * point.y
        .sum(
          new Vector2(Viewport.unit.x / 2, -Viewport.unit.y / 2).multiply(
            point.y
          )
        )
        // + X Unit Vector * point.x
        .sum(
          new Vector2(Viewport.unit.x / 2, Viewport.unit.y / 2).multiply(
            point.x
          )
        )
        // + Z Unit Vector * point.z
        .sum(new Vector2(0, -Viewport.unit.z).multiply(point.z))
    );
  }

  /**
   * Draw an empty tile
   * For debug
   * @param {Vector3} position
   */
  function drawEmptyTile(position, color) {
    // Draw line to halfs of the bounding rect
    canvasContext.beginPath();

    position = position.sum([-0.5, -0.5, 0]);

    const first = worldPointToViewportPoint(position).let(({ x, y }) =>
      canvasContext.moveTo(x, y)
    );

    worldPointToViewportPoint(position.sum([0, 1, 0])).let(({ x, y }) =>
      canvasContext.lineTo(x, y)
    );

    worldPointToViewportPoint(position.sum([1, 1, 0])).let(({ x, y }) =>
      canvasContext.lineTo(x, y)
    );

    worldPointToViewportPoint(position.sum([1, 0, 0])).let(({ x, y }) =>
      canvasContext.lineTo(x, y)
    );

    canvasContext.lineTo(first.x, first.y);
    canvasContext.strokeStyle = color || "rgba(0,0,0,0.5)";
    canvasContext.stroke();

    canvasContext.fillStyle = color || "rgba(0,0,0,0.5)";
    worldPointToViewportPoint(position.sum([0.5, 0.25, 0])).let(({ x, y }) =>
      canvasContext.fillText(`${position.x + 0.5}, ${position.y + 0.5}`, x, y)
    );
  }

  /**
   * Draw grid at z = 0 level
   * For debug
   */
  function drawGrid() {
    const [upLeft, upRight, downLeft, downRight] = Viewport.bounds.map(bound =>
      bound.worldPointAtZ(0)
    );

    upLeft.let(b => {
      b.x = Math.floor(b.x);
      b.y = Math.floor(b.y);
      drawEmptyTile(b, "red");
    });
    upRight.let(b => {
      b.x = Math.ceil(b.x);
      b.y = Math.ceil(b.y);
      drawEmptyTile(b, "red");
    });
    downLeft.let(b => {
      b.x = Math.floor(b.x);
      b.y = Math.floor(b.y);
      drawEmptyTile(b, "red");
    });
    downRight.let(b => {
      b.x = Math.ceil(b.x);
      b.y = Math.ceil(b.y);
      drawEmptyTile(b, "red");
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
        drawEmptyTile(new Vector3(x, y, 0));
        x++;
        y++;
      }

      y0 -= 1;

      x = x0 + 1;
      y = y0 + 1;

      while (x < x1 || y < y1) {
        drawEmptyTile(new Vector3(x, y, 0));
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
      drawEmptyTile(new Vector3(x, y, 0));
      x++;
      y++;
    }
  }

  let lastTime = 0;
  /**
   * This function draw the world
   * @param {Number} time
   */
  function render(time) {
    // This is difference in ms between frames rendering
    const deltaTime = time - lastTime;
    lastTime = time;

    // Clear the canvas
    canvasContext.clearRect(0, 0, Viewport.size.x, Viewport.size.y);

    if (debug)
      // Draw grid for test purpouse
      drawGrid();

    for (let actor of actors) {
      actor.update(time, deltaTime);
      if (actor.isVisible()) actor.render(canvasContext);
    }

    requestAnimationFrame(render);
  }

  /**
   * On Element resize, adapt canvas and viewport
   * @param {Element} element
   */
  function onCanvasResize(element) {
    // on window resize, the element size can change
    canvas.style.width = element.clientWidth;
    canvas.style.height = element.clientHeight;

    canvas.width = element.clientWidth;
    canvas.height = element.clientHeight;

    Viewport.size.x = canvas.width;
    Viewport.size.y = canvas.height;

    Viewport.origin.x = element.clientWidth / 2;
    Viewport.origin.y = element.clientHeight / 2;

    // up left
    Viewport.bounds[0] = new Raycast(
      new Vector2(Viewport.renderingOffset.x, Viewport.renderingOffset.y)
    );

    // up right
    Viewport.bounds[1] = new Raycast(
      new Vector2(
        Viewport.size.x - Viewport.renderingOffset.x,
        Viewport.renderingOffset.y
      )
    );

    // down left
    Viewport.bounds[2] = new Raycast(
      new Vector2(
        Viewport.renderingOffset.x,
        Viewport.size.y - Viewport.renderingOffset.y
      )
    );

    // down rights
    Viewport.bounds[3] = new Raycast(
      new Vector2(
        Viewport.size.x - Viewport.renderingOffset.x,
        Viewport.size.y - Viewport.renderingOffset.y
      )
    );
  }

  /**
   * Element to which append the engine's canvas
   * @param {Element} element
   */
  function createCanvas(element) {
    canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;

    onCanvasResize(element);
    window.addEventListener("resize", onCanvasResize.bind(this, element));

    element.appendChild(canvas);
    canvasContext = canvas.getContext("2d");

    element.addEventListener("click", function({ clientX, clientY }) {
      console.log(clientX, clientY);
      console.log(new Raycast(new Vector2(clientX, clientY)).worldPointAtZ(0));
    });
  }

  /**
   * Element to which append the engine's canvas
   * @param {Element} element
   * @returns {Engine}
   */
  function setup(element) {
    createCanvas(element);

    return this;
  }

  /**
   * Make the engine start rendering the world
   */
  function start(element) {
    render(0);
  }

  function addActor(actor) {
    actors.push(actor);
  }

  return {
    setDebug: v => {
      debug = v;
    },

    observerPoint,
    worldPointToViewportPoint,
    setup,
    start,
    addActor
  };
})();
