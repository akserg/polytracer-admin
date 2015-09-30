angular.module('admin')
.factory('MapDrawing', ['$log',  
  function($log) {

    $log.debug('MapDrawing');

    var drawingManager = null;
    var selectedShape;
    var shapes = [];
    var _onShapeCreated, _onShapeUpdated, _onShapeDeleted, _onShapeSelected;

    function init() {
      $log.debug('Init DrawingManager');
      drawingManager = new google.maps.drawing.DrawingManager({
//        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
          drawingModes: [
            google.maps.drawing.OverlayType.CIRCLE,
            google.maps.drawing.OverlayType.RECTANGLE,
            // google.maps.drawing.OverlayType.POLYGON
          ]
        },
        circleOptions: {
          fillColor: '#ff0',
          fillOpacity: 0.1,
          strokeWeight: 1,
          draggable: true,
          clickable: true,
          editable: true,
          zIndex: 1
        },
        rectangleOptions: {
          fillColor: '#0ff',
          fillOpacity: 0.1,
          strokeWeight: 1,
          draggable: true,
          clickable: true,
          editable: true,
          zIndex: 2
        },
      });

      google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        // Switch back to non-drawing mode after drawing a shape.
        drawingManager.setDrawingMode(null);

        // Add an event listener that selects the newly-drawn shape when the user
        // mouses down on it.
        var newShape = e.overlay;
        newShape.type = e.type;
        google.maps.event.addListener(newShape, 'click', function() {
          setSelection(newShape);
        });
        setSelection(newShape);
        shapes.push(newShape);
        if (_onShapeCreated) {
          _onShapeCreated(newShape);
        }
        if (_onShapeUpdated) {
          if (newShape.type === google.maps.drawing.OverlayType.CIRCLE) {
            newShape.addListener('center_changed', function() {
              _onShapeUpdated(newShape);
            });
            newShape.addListener('radius_changed', function() {
              _onShapeUpdated(newShape);
            });
          } else if (newShape.type === google.maps.drawing.OverlayType.RECTANGLE) {
            newShape.addListener('bounds_changed', function() {
              _onShapeUpdated(newShape);
            });
          }
        }
      });

      // Clear the current selection when the drawing mode is changed, or when the
      // map is clicked.
      google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
      google.maps.event.addListener(map, 'click', clearSelection);
    }

    function clearSelection() {
      if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape = null;
        _onShapeSelected(selectedShape);
      }
    }

    function setSelection(shape) {
      clearSelection();
      selectedShape = shape;
      _onShapeSelected(selectedShape);
      shape.setEditable(true);
      //selectColor(shape.get('fillColor') || shape.get('strokeColor'));
    }

    function deleteSelectedShape(callback) {
      if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape.setMap(null);
        if (callback) {
          callback(selectedShape);
        }
        selectedShape = null;
        _onShapeSelected(selectedShape);
      }
    }

    function deleteAllShape(callback) {
      if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape.setMap(null);
        selectedShape = null;
        _onShapeSelected(selectedShape);
      }
      for (var i = 0; i < shapes.length; i++) {
        shapes[i].setMap(null);
        if (callback) {
          callback(shapes[i]);
        }
      }
      shapes = [];
    }

    function show(map) {
      if (!drawingManager) {
        init();
      }
      $log.debug('Show DrawingManager');
      drawingManager.setMap(map);
    }

    function hide() {
      $log.debug('Hide DrawingManager');
      clearSelection();
      drawingManager.setMap(null);
    }

    function onShapeCreated(listener) {
      _onShapeCreated = listener;
    }

    function onShapeUpdated(listener) {
      _onShapeUpdated = listener;
    }

    function onShapeSelected(listener) {
      _onShapeSelected = listener;
    }

    function add(shape) {
      var _shape = shape;
      google.maps.event.addListener(shape, 'click', function() {
        if (drawingManager && drawingManager.getMap()) {
          setSelection(_shape);
        }
      });
      if (_shape.type === google.maps.drawing.OverlayType.CIRCLE) {
        _shape.addListener('center_changed', function() {
          _onShapeUpdated(_shape);
        });
        _shape.addListener('radius_changed', function() {
          _onShapeUpdated(_shape);
        });
      } else if (_shape.type === google.maps.drawing.OverlayType.RECTANGLE) {
        _shape.addListener('bounds_changed', function() {
          _onShapeUpdated(_shape);
        });
      }
      shapes.push(shape);
    }

    return {
      show: show,
      hide: hide,
      onShapeCreated: onShapeCreated, 
      onShapeUpdated: onShapeUpdated, 
      onShapeSelected: onShapeSelected,
      deleteSelectedShape: deleteSelectedShape,
      deleteAllShape: deleteAllShape,

      add: add
    };

}]);
