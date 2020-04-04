window.ObserverPointMover = function() {
  const mousePos = [];
  const triggerMargins = [100, 100];

  document.onmousemove = handleMouseMove;
  setInterval(getMousePosition, 200);

  function handleMouseMove(event) {
    mousePos[0] = event.clientX;
    mousePos[1] = event.clientY;
  }

  function getMousePosition() {
    if (mousePos.length > 0) {
      const [x, y] = mousePos;
      const [mX, mY] = triggerMargins;

      const translateVector = Vector3();

      if (x < mX)
        // mouse on left side
        translateVector.copy(translateVector.add([-1, -1, 0]));
      else if (x > document.body.clientWidth - mX)
        // mouse on right side
        translateVector.copy(translateVector.add([1, 1, 0]));

      if (y < mY)
        // mouse on top side
        translateVector.copy(translateVector.add([-1, 1, 0]));
      else if (y > document.body.clientHeight - mY)
        // mouse on bottom side
        translateVector.copy(translateVector.add([1, -1, 0]));

      const newObserverPoint = Engine.observerPoint.add(
        translateVector.multiply(1 / Viewport.getZoom())
      );

      if (terrain && terrain.map) {
        if (newObserverPoint.x < 0) newObserverPoint.x = 0;
        else if (newObserverPoint.x > terrain.map.length - 1)
          newObserverPoint.x = terrain.map.length - 1;

        if (newObserverPoint.y < 0) newObserverPoint.y = 0;
        else if (newObserverPoint.y > terrain.map[0].length - 1)
          newObserverPoint.y = terrain.map[0].length - 1;

        // newObserverPoint.z = terrain.map[newObserverPoint.x][newObserverPoint.y];
      }

      Engine.observerPoint.copy(newObserverPoint);
    }
  }

  // contraint for moving
  let terrain = null;

  return {
    setTerrain: value => (terrain = value)
  };
};
