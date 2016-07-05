var JointsAngle = function (line1, line2, name) {
	var self = this;

	var pointL11 = line1.from();
	var pointL12 = line1.to();

	var pointL21 = line2.from();
	var pointL22 = line2.to();

	var center = new Point(0, 0);
	var path = new Path([center, center, center]);
	project.activeLayer.insertChild(1, path);

	var defaultRangeFillColor = 'green';
	
	path.opacity = 0.6;
	path.strokeColor = 'black';	
	
	var angleCurrentValue = new Text(center);
	angleCurrentValue.curvature = 0.7;

	var angleRangeLabel = new Text(center);	
	var angleRangeLabelCurrent = new Text(center);

	var textColor = 'white';

	angleRangeLabel.setStyle({'fontFamily' : 'RobotoBold', 'fillColor' : textColor});
	angleRangeLabelCurrent.setStyle({'fontFamily' : 'RobotoBold', 'fillColor' : textColor});

	angleRangeLabelCurrent.setText("Current angle: ");

	var angleRangesValue = new Text(center);
	angleRangesValue.setStyle({'fontFamily' : 'RobotoBold', 'fillColor' : textColor});
	angleCurrentValue.setStyle({'fontFamily' : 'RobotoBold', 'fillColor' : textColor});

	this.followLine = new Path();
	this.followLine.strokeColor = 'black';
	project.activeLayer.insertChild(1, this.followLine);
	this.ranges = undefined;

	this._onAngleChangedCbk = [];
	this._currentAngle = 0;
	this._name = name;

	this.onAngleChanged = function (cbk) {		
		self._onAngleChangedCbk.push(cbk);
		cbk(this._currentAngle, this._name);

		return this;
	}

	this.remove = function () {		
		path.remove();
		angleCurrentValue.remove();			
		angleRangeLabel.remove();
		angleRangesValue.remove();
		angleRangeLabelCurrent.remove();

		this.followLine.remove();
		this.background.remove();
	}

	this.hasRanges = function () {
		return this.ranges != undefined;
	}

	function findCommonPoint() {
		var m1 = [pointL11, pointL12];
		var m2 = [pointL21, pointL22];
		
		for (var i = 0; i < 2; i++) {
			for (var j = 0; j < 2; j++) {
				var p1 = m1[i];
				var p2 = m2[j];
		
				if (p1.x == p2.x && p1.y == p2.y) {				
					return p1;
				}
			}
		}	
	}

	function diff(v1, v2) {
		var xDiff = v1.x - v2.x;
		var yDiff = v1.y - v2.y;

		return new Point(xDiff, yDiff);
	}

	function len(v) {
		return Math.sqrt(v.x * v.x + v.y * v.y);
	}

	this.opacity = function (value) {
		path.opacity = value;
		return this;
	}

	this.setRanges = function (ranges) {
		this.ranges = ranges;

		if (this.ranges !== undefined) {
			angleRangeLabel.setText("Range: ");						
			this.drawAngle();		
		}			

		return this;
	}

	this.drawAngle = function () {
		var common = findCommonPoint();

		if (common == undefined)
			return;

		var destination1 = pointL12;
		var destination2 = pointL22;

		if (common.x == pointL12.x && common.y == pointL12.y)
			destination1 = pointL11;

		if (common.x == pointL22.x && common.y == pointL22.y)
			destination2 = pointL22;
		
		var diff = common.subtract(destination1);
		var v1 = diff.divide(2).multiply(-1);//.add(destination1);

		var diff2 = destination2.subtract(common);
		var v2 = diff2.divide(2);//.add(common);

		var cos = (v1.x * v2.x + v1.y * v2.y) / (Math.sqrt(v1.x * v1.x + v1.y * v1.y) * Math.sqrt(v2.x * v2.x + v2.y * v2.y));		
		
		path.removeSegments();		

		var y1 = diff.divide(2).add(destination1);
		var y2 = diff2.divide(2).add(common);

		path.add(y1);		
		path.add(common);
		path.add(y2);			
		
		var mid = new Point((y1.x + y2.x) / 2 + 100, (y1.y + y2.y) / 2 + 10);											
		var angle = Math.acos(cos) * 180 / Math.PI;						
		
		var textStart = common.clone();
		textStart.x += 60; textStart.y -= 50;
		textStart.y += angleCurrentValue.bounds().height;

		var horizItems = this.hasRanges() ? 2 : 1;
		var maxLabelWidth = Math.max(angleRangeLabel.bounds().width + angleRangesValue.bounds().width, angleRangeLabelCurrent.bounds().width + angleCurrentValue.bounds().width);		
		
		if (this.background != undefined) 
			this.background.remove();

		this.background = new Path.Rectangle([textStart.x -5, textStart.y -angleCurrentValue.bounds().height], [maxLabelWidth +10, angleCurrentValue.bounds().height * horizItems +5]);
		this.background.fillColor = '#3868B9';
		this.background.strokeColor = 'black';
		this.background.strokeWidth = 0.8;
		this.background.opacity = 0.7;
		project.activeLayer.insertChild(1, this.background);

		this.followLine.removeSegments();
		this.followLine.add(common);
		this.followLine.add([textStart.x -25, textStart.y +2]);
		this.followLine.add([textStart.x -5, textStart.y +2]);

		// Range:
		angleRangeLabel.setPoint(textStart);
		// 90-180		
		angleRangesValue.setPosition(textStart.x + angleRangeLabel.bounds().width, textStart.y);

		// Current:				
		angleRangeLabelCurrent.setPosition(textStart.x, textStart.y + angleRangeLabel.bounds().height);		
		// XX
		this._currentAngle = angle.toFixed(1);
		angleCurrentValue.setText(this._currentAngle + "°");
		angleCurrentValue.setPosition(textStart.x + angleRangeLabelCurrent.bounds().width, textStart.y + angleRangeLabel.bounds().height);		
 		
 		// Notify angle changed
		for (var cbk in self._onAngleChangedCbk) {							
			self._onAngleChangedCbk[cbk](this._currentAngle, this._name);
		}
	
		path.fillColor = defaultRangeFillColor;
		project.activeLayer.insertChild(1, path);
		for (var i in this.ranges) {
			var range = this.ranges[i];				
			angleRangesValue.setText(range['range'][0] + "°" + '-' + range['range'][1] + "°");
			if (angle >= range['range'][0] && angle <= range['range'][1]) {
				path.fillColor = range['color'];																		
				break;
			} else {
				path.fillColor = 'red';
			}
		}		
	}

	line1.onLineChanged(function(from, to) {
		pointL11 = from;
		pointL12 = to;
		
		self.drawAngle();
	});

	line2.onLineChanged(function(from, to) {
		pointL21 = from;
		pointL22 = to;

		self.drawAngle();
	});

	this.drawAngle();
}