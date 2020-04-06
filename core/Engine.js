const PIXI = require('pixi.js');
const d3 = require('d3');

const Vector3 = require('./Vector3');
const Vector2 = require('./Vector2');

const Viewport = (function() {
  // Unit of the world correspond to TOT px of the canvas viewport at zoomLevel 1
  const baseUnit = Vector3(80, 40, 40);

  // Unit of the world
  const unit = baseUnit.clone();

  // Size of the viewport in PX
  const size = Vector2();

  // The observing point of the world that correspondes to the center of canvas
  // It will be setted on canvas' resize
  const origin = Vector2();

  // How much after last zoom event for calling zoom-end ?
  const zoomEndTimeoutMilliseconds = 500;

  let zoom = 1,
    zoomEndTimeout = null,
    zoomEndValue = 1;

  // Min and max for zoom
  const zoomLimits = [0.5, 2];

  /**
   * Set zoom for viewport
   * @param level {Number}
   */
  function setZoom(level) {
    // Zoom start
    if (zoom == zoomEndValue) Viewport.invoke('zoom-start');

    zoom = level;
    unit.copy(baseUnit.multiply(level));

    // Invoke zoom changed event
    Viewport.invoke('zoom', zoom);

    if (zoomEndTimeout) clearTimeout(zoomEndTimeout);
    zoomEndTimeout = setTimeout(() => {
      zoomEndValue = level;
      // If for 100 milliseconds no zoom is done, then invoke the event
      // Recalculations on sprite must be executed here
      Viewport.invoke('zoom-end');
    }, zoomEndTimeoutMilliseconds);
  }

  function getZoom() {
    return zoom;
  }

  /**
   * Viewport's events
   */
  const events = {
    'zoom-start': [],
    'zoom-end': [],
    zoom: []
  };

  /**
   * Add callback for viewport event
   * @param {String} event
   * @param {Function} callback
   */
  function on(event, callback) {
    events[event].push(callback);
  }

  /**
   * Remove callback for viewport event
   * @param {String} event
   * @param {Function} callback
   */
  function off(event, callback) {
    const index = events[event].indexOf(callback);
    if (index > -1) events[event].splice(index, 1);
  }

  function invoke(event, ...args) {
    for (let callback of events[event]) callback(...args);
  }

  return {
    unit,
    size,
    origin,
    setZoom,
    getZoom,
    zoomLimits,
    on,
    off,
    invoke
  };
})();

const Engine = (function() {
  let debug = false;

  /**
   * @type {PIXI.Application}
   */
  let app = null;

  // All renderizable entities of the world
  const actors = [],
    actorsObjects = [];

  // The point from which the observer is watching the world
  const observerPoint = Vector3();

  /**
   * Measure a size on viewport knowing the length on 3d Z axis and return the size in the 3d world
   * @param {Vector2} size
   * @param {Number} z
   * @returns {Vector3}
   */
  function measureViewportToWorld(size, z) {
    return Vector3(
      size.x / Viewport.unit.x + (size.y + Viewport.unit.z * z) / Viewport.unit.y,
      size.x / Viewport.unit.x - (size.y + Viewport.unit.z * z) / Viewport.unit.y,
      z
    );
  }

  /**
   * Measure a size in the 3d world and return the size on viewport
   * @param {Vector3} size
   * @returns {Vector2}
   */
  function measureWorldToViewport(size) {
    return new Vector2(
      (Viewport.unit.x / 2) * (size.y + size.x),
      (Viewport.unit.y / 2) * (size.y - size.x) - Viewport.unit.z * size.z
    );
  }

  /**
   * Convert world's point to a viewport point
   * @param {Vector3} point
   * @returns {Vector2}
   */
  function worldToViewport(point) {
    // This is the same code:
    // point = point.add(observerPoint.multiply(-1));

    // return (
    //   Viewport.origin
    //     // + Y Unit Vector * point.y
    //     .add(new Vector2(Viewport.unit.x / 2, -Viewport.unit.y / 2).multiply(point.y))
    //     // + X Unit Vector * point.x
    //     .add(new Vector2(Viewport.unit.x / 2, Viewport.unit.y / 2).multiply(point.x))
    //     // + Z Unit Vector * point.z
    //     .add(new Vector2(0, -Viewport.unit.z).multiply(point.z))
    // );

    // But in this way, is faster (less calculations):
    const pointY = point.x - observerPoint.x;
    const pointX = point.y - observerPoint.y;
    const pointZ = point.z - observerPoint.z;

    return new Vector2(
      Viewport.origin.x + (Viewport.unit.x / 2) * (pointY + pointX),
      Viewport.origin.y + (Viewport.unit.y / 2) * (pointY - pointX) - Viewport.unit.z * pointZ
    );
  }

  let lastTime = 0;

  /**
   * This function update the world
   * @param {Number} time
   */
  function update(deltaTime) {
    for (let actor of actors) actor.update(deltaTime);

    let count = 0,
      visibleCount = 0;
    for (let actor of actorsObjects) {
      count++;
      actor.update(deltaTime);
      actor.entity.visible = actor.isVisible();
      //actor.entity.zIndex = actor.zIndex();
      if (actor.entity.visible) {
        visibleCount++;
        // Update entity position (the viewport has been translated or zoomed?)
        actor.entity.position.set(actor.viewportPosition.x, actor.viewportPosition.y);
      }
    }

    document.getElementById('label').textContent = `${visibleCount}/${count}`;
  }

  /**
   * On Element resize, adapt canvas and viewport
   * @param {Element} element
   */
  function onResize(element) {
    const w = element.clientWidth;
    const h = element.clientHeight;

    app.view.style.width = w + 'px';
    app.view.style.height = h + 'px';
    app.view.width = w;
    app.view.height = h;

    app.renderer.resize(w, h);

    // on window resize, the element size can change
    Viewport.size.x = w;
    Viewport.size.y = h;

    Viewport.origin.x = w / 2;
    Viewport.origin.y = h / 2;
  }

  /**
   * Element to which append the engine's canvas
   * @param {Element} element
   */
  function createApp(element) {
    //Create a Pixi Application
    app = new PIXI.Application();
    app.renderer.autoResize = true;

    onResize(element);
    window.addEventListener('resize', onResize.bind(this, element));

    element.appendChild(app.view);

    app.view.addEventListener('click', function({ clientX, clientY }) {
      function getPosition(el) {
        var xPosition = 0;
        var yPosition = 0;

        while (el) {
          if (el.tagName == 'BODY') {
            // deal with browser quirks with body/window/document and page scroll
            var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
            var yScrollPos = el.scrollTop || document.documentElement.scrollTop;

            xPosition += el.offsetLeft - xScrollPos + el.clientLeft;
            yPosition += el.offsetTop - yScrollPos + el.clientTop;
          } else {
            xPosition += el.offsetLeft - el.scrollLeft + el.clientLeft;
            yPosition += el.offsetTop - el.scrollTop + el.clientTop;
          }

          el = el.offsetParent;
        }
        return {
          x: xPosition,
          y: yPosition
        };
      }

      // new Raycast(
      //   new Vector2(clientX - getPosition(element).x, clientY - getPosition(element).y)
      // ).worldPointAtZ(0);
    });

    /**
     * Zoom control variables
     */
    const zoom = {
      lastOnEnd: 1,
      endTimeout: null
    };

    /**
     * Handle viewport's zoom
     */
    d3.select(app.view).call(
      d3
        .zoom()
        .scaleExtent(Viewport.zoomLimits)
        .on('zoom', () => Viewport.setZoom(d3.event.transform.k))
    );
  }

  /**
   * Element to which append the engine's canvas
   * @param {Element} element
   * @returns {Engine}
   */
  function setup(element) {
    createApp(element);

    return this;
  }

  /**
   * Make the engine start rendering the world
   */
  function start(element) {
    app.ticker.add(update);
  }

  /**
   * @param {Actor} actor
   */
  function addActor(actor) {
    actors.push(actor);
  }

  /**
   * This will be handled in a different way than Actor (has position and visibility)
   * @param {ActorObject} actor
   */
  function addActorObject(actor) {
    actorsObjects.push(actor);
    app.stage.addChild(actor.entity);
  }

  /**
   * @param {Actor} actor
   */
  function removeActor(actor) {
    const index = actors.indexOf(actor);
    if (index > -1) actors.splice(index, 1);
  }

  /**
   * @param {Actor} actor
   */
  function removeActorObject(actor) {
    const index = actorsObjects.indexOf(actor);
    app.stage.removeChild(actor.entity);
    if (index > -1) actorsObjects.splice(index, 1);
  }

  return {
    getApp: () => app,
    setDebug: v => {
      debug = v;

      if (v) DebugGrid.addGrid();
      else DebugGrid.removeGrid();
    },
    getDebug: v => debug,

    observerPoint,
    measureViewportToWorld,
    measureWorldToViewport,
    worldToViewport,
    setup,
    start,
    addActor,
    addActorObject,
    removeActor,
    removeActorObject
  };
})();

module.exports = { Engine, Viewport };
