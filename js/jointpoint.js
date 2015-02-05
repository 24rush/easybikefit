
var JointPoint = function(point) {
	var self = this;

	var _radius = 6;

	var _circle = new Path.Circle({
		center: point,
		radius: _radius,
		fillColor: '#C83A3A',
		strokeColor: 'white',
		strokeWidth: 2
	});

	var _upScaling = 1.8;
	var _downScaling = 1 / _upScaling;

	var _isDragging = false;
	var _currentScale = -1;

	var _center = point;
	var _onMoveCbk = [];

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
}