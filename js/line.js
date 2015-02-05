
var JointLine = function (point1, point2) {	
	var self = this;
	
	this._onLineChangedCbk = [];

	self._from = point1.point();	
	self._to = point2.point();

	var _path = new Path.Line(self._from, self._to);
	_path.strokeColor = 'black';
	_path.sendToBack();

	this._onPointsMove = function (evt, ctx) {		
		_path.removeSegments();				

		self._from = (ctx == self._from ? evt : self._from);
		self._to = (ctx == self._to ? evt : self._to);

		_path.add(self._from);			
		_path.add(self._to);

		for (var cbk in self._onLineChangedCbk) {			
			self._onLineChangedCbk[cbk](self._from, self._to);
		}
	}

	this.onLineChanged = function (cbk) {
		self._onLineChangedCbk.push(cbk);
		cbk(self._from, self._to);
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