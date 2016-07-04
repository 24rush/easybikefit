
var JointPoint = function(point) {
	var self = this;

	var _radius = 9;
	var strokeWidth = 1;

	var _circle = new Path.Circle({
		center: point,
		radius: _radius,
		fillColor: '#3868B9',
		strokeColor: '#1DB6FF',
		strokeWidth: strokeWidth
	});

	var _upScaling = 1.6;
	var _downScaling = 1 / _upScaling;

	var _isDragging = false;
	var _currentScale = -1;
	var _isMovable = true;

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

	this.getLabel = function (){
		return _text.content;
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

	this.setMovable = function (movable) {		
		_isMovable = movable;
		return this;
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
		_text.opacity = value;
	}

	this.setScale = function(scale) {
		if (scale == -1 || _currentScale != scale) {
			_circle.scale(scale);
			_currentScale = scale;
		}
	}

	this.setMoved = function (event) {
		oldMovable = _isMovable;

		_isMovable = true;
		_circle.onMouseDrag(event);
		_isMovable = oldMovable;
	}

	_circle.onMouseDrag = function (event) {
		if (_isMovable == false) {
			return;
		}					

		_circle.position = event.point;
		centerLabel();

		for (var cbk in _onMoveCbk) {			
			_onMoveCbk[cbk](_circle.position);
		}
	}

	_circle.onMouseEnter = function (event) {	
		if (_isDragging == true || _isMovable == false)
			return;					

		self.setScale(_upScaling);	
		self.opacity(1);			
	}

	_circle.onMouseLeave = function (event) {
		if (_isDragging == true || _isMovable == false)
			return;

		if (_currentScale == _upScaling) {
			self.setScale(_downScaling);	
		}
		
		self.opacity(1);			
	}

	_circle.onMouseDown = function (event) {
		if (_isMovable == false) {
			return;
		}			

		$('body').bind('touchmove', function(e){e.preventDefault()});

		_currentDraggingPoint = this;

		if (_currentScale == _upScaling) {
			self.setScale(_downScaling);
		}

		self.opacity(0);
		_isDragging = true;				
	}

	_circle.onMouseUp = function (event) {	
		$('body').unbind('touchmove');

		_isDragging = false;
		self.opacity(1);
		_currentDraggingPoint = undefined;				
	}

	this.onMouseUp = function (event) {
		_circle.onMouseUp(event);
	}

	_text.onMouseEnter = _circle.onMouseEnter;
	_text.onMouseLeave = _circle.onMouseLeave;
	_text.onMouseUp = _circle.onMouseUp;
	_text.onMouseDown = _circle.onMouseDown;
	_text.onMouseDrag = _circle.onMouseDrag;
}

var _currentDraggingPoint = undefined;

var _tool = new paper.Tool();
_tool.onMouseUp = function (event) {
	if (_currentDraggingPoint !== undefined)
		_currentDraggingPoint.onMouseUp(event);
}