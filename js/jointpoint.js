
var JointPoint = function(point) {
	var self = this;

	var _radius = 9;
	var strokeWidth = 2;

	var _circle = new Path.Circle({
		center: point,
		radius: _radius,
		fillColor: '#12335E',
		strokeColor: '#0E812E',
		strokeWidth: strokeWidth
	});

	var _upScaling = 1.6;
	var _downScaling = 1 / _upScaling;

	var _isDragging = false;
	var _currentScale = -1;

	var _center = point;
	var _onMoveCbk = [];

	var _text = new PointText(point);
		
	_text.fillColor = 'white';
	_text.style = {
		font: 'sans-serif',
		fontWeight: 'normal',
		fontSize: 12,
	};	

	_text.bringToFront();

	function centerLabel() {
		var textBounds = _text.bounds;
		_text.position = _circle.position.add(0, 1);
	}

	this.remove = function () {
		_circle.remove();
		_text.remove();
	}

	this.label = function (value) {
		_text.content = value;
		centerLabel();

		return this;
	}

	this.setFinalDestinationPoint = function (point) {
		self.finalDestinationPoint = point;
		return this;
	}

	this.getFinalDestinationPoint = function () {
		return self.finalDestinationPoint;
	}

	this.onMove = function (cbk) {
		_onMoveCbk.push(cbk);
	}

	this.point = function() {
		return _circle.position;
	}

	this.radius = function () {		
		return _radius;
	}

	this.enlarge = function () {
		self.setScale(_upScaling);
	}

	this.reduce = function () {
		self.setScale(_downScaling);
	}

	this.opacity = function (value) {
		_circle.opacity = value;
	}

	this.setScale = function(scale) {
		if (scale == -1 || _currentScale != scale) {
			_circle.scale(scale);
			_currentScale = scale;
		}
	}

	this.setMoved = function (event) {
		_circle.onMouseDrag(event);
	}

	_circle.onMouseDrag = function (event) {			
		_circle.position = event.point;
		centerLabel();

		for (var cbk in _onMoveCbk) {			
			_onMoveCbk[cbk](_circle.position);
		}
	}

	_circle.onMouseEnter = function (event) {	
		if (_isDragging == true)
			return;					

		self.setScale(_upScaling);				
	}

	_circle.onMouseLeave = function (event) {
		if (_isDragging == true)
			return;

		self.setScale(_downScaling);				
	}

	_circle.onMouseDown = function (event) {						
		self.setScale(_downScaling);
		_isDragging = true;				
	}

	_circle.onMouseUp = function (event) {								
		_isDragging = false;				
	}

	_text.onMouseEnter = _circle.onMouseEnter;
	_text.onMouseLeave = _circle.onMouseLeave;
	_text.onMouseUp = _circle.onMouseUp;
	_text.onMouseDown = _circle.onMouseDown;
	_text.onMouseDrag = _circle.onMouseDrag;
}