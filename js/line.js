
var JointLine = function (point1, point2, visible) {	
	var self = this;

	this.visible = (typeof visible === "undefined") ? true : visible;
	
	this._onLineChangedCbk = [];

	self._from = point1.point();	
	self._to = point2.point();

	if (this.visible == true) {
		var _path = new Path.Line(self._from, self._to);
		_path.strokeColor = 'black';
		_path.sendToBack();	
	}
	
	this._onPointsMove = function (evt, ctx) {							
		self._from = (ctx == self._from ? evt : self._from);
		self._to = (ctx == self._to ? evt : self._to);

		if (this.visible == true) {
			_path.removeSegments();
			_path.add(self._from);			
			_path.add(self._to);	
		}
		
		for (var cbk in self._onLineChangedCbk) {			
			self._onLineChangedCbk[cbk](self._from, self._to);
		}
	}

	this.onLineChanged = function (cbk) {
		self._onLineChangedCbk.push(cbk);
		cbk(self._from, self._to);
	}

	this.length = function () {		
		return self._from.getDistance(self._to);
	}

	this.horizontalDistance = function () {
		return Math.abs(self._from.x - self._to.x);
	}

	this.verticalDistance = function () {
		return Math.abs(self._from.y - self._to.y);
	}

	self.from = function () {
		return self._from;
	}

	self.to = function () {
		return self._to;
	}

	point1.onMove(function(evt) {		
		self._onPointsMove(evt, self._from);	
	});

	point2.onMove(function(evt) {		
		self._onPointsMove(evt, self._to);
	});
};