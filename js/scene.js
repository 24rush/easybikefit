var SceneUtils = {
	KnownLines : {
		DISTANCE_REF_LINE : 'distanceRefLine',
		HORIZONTAL_REF_LINE : 'horizontalRefLine',
		VERTICAL_REF_LINE : 'verticalRefLine',

		THIGH_LINE : 'thighLine',
		SHIN_LINE : 'shinLine',
		BACK_LINE : 'backLine',
		HIP_TO_WRIST : 'hipToWrist',
		CUSTOM_LINE : 'customTool'
	}
}

var Scene =  function (paperScope, width, height) {
	var self = this;
	console.log(width, height);

	this.tbStartLeft = 35;
	this.tbStartTop = 35;

	this.paddingRight = 14;
	this.textHeight = 6;
	this.rowPadding = 25;

	this.circles = [];
	this.circlesByName = {};

	this.lines = [];
	this.linesByName = {};

	this.lineChangedCbks = [];

	this.view = paper.View._viewsById[paperScope];

	this.animationDuration = 500;
	this.animationStart = undefined;
	this.animationEnded = false;

	var backImgSize = [775, 775];

	this.height = height;
	this.width = width;	

	this.backImgScaling = backImgSize[0] / backImgSize[1];

	this.originalPaddingLeft = 212;
	this.scalingX = this.height * this.backImgScaling / 775;				
	this.scalingY = this.height / 775;

	$('.toolbox').css('left', 25);
	$('.toolbox').css('top', this.tbStartTop);

	this.getLine = function(name) {
		return self.linesByName[name];
	}

	this.storeLine = function (line, name) {
		self.linesByName[name] = line;
		self.lines.push(line);
	}

	this.getJointPoint = function (index) {			
		var point = new Point(0, 0);

		point.x = self.Xx[index];
		point.y = self.Yy[index];

		return point;	
	}

	this.animateJoints = function (event) {
		if (this.animationEnded == true) {
			return;
		}			

		if (self.animationStart == undefined) {
			self.animationStart = event.time * 1000;
			return;
		}

		for (var i = 0; i < self.Xx.length; i++) {
			var oldPos = self.circles[i].point();

			var progress = (event.time * 1000 - self.animationStart) / self.animationDuration;

			if (progress > 1) {
				progress = 1;
				this.animationEnded = true
			}

			oldPos.x = this.Xx[i] * progress;
			oldPos.y = this.Yy[i] * progress;	

			self.circles[i].opacity(progress);
			self.circles[i].setMoved({'point': oldPos});		
		}

		if (this.animationEnded == true) {
			this.drawLines();
		}		
	};

	this.getTextPoint = function (index) {			
		return new Point(this.tbStartLeft + this.paddingRight, this.tbStartTop + index * this.rowPadding);
	}

	this.update = function () {
		for (var i = 0; i < self.circles.length; i++) {
			self.circles[i].setMoved({'point' :self.circles[i].point()});
		}
	}

	this.drawLines = function () {
		this.view._project.activate();

		var circles = self.circles;

		var hipPoint = circles[3];
		var kneePoint = circles[4];

		var line1 = new JointLine(circles[0], circles[1]);self.storeLine(line1);
		var line2 = new JointLine(circles[1], circles[2]);self.storeLine(line2);
		var line3 = new JointLine(circles[3], circles[4]);self.storeLine(line3, SceneUtils.KnownLines.THIGH_LINE);
		var line4 = new JointLine(circles[4], circles[5]);self.storeLine(line4, SceneUtils.KnownLines.SHIN_LINE);
		var line5 = new JointLine(circles[0], circles[3]);self.storeLine(line5, SceneUtils.KnownLines.BACK_LINE);
		var line6 = new JointLine(circles[3], circles[2], false);self.storeLine(line6, SceneUtils.KnownLines.HIP_TO_WRIST);		

		var lineHip = new JointLine(kneePoint, new DependantPoint([hipPoint, kneePoint], function () {				
			return kneePoint.point().subtract(hipPoint.point()).add(kneePoint.point());
		}));

		new JointsAngle(line1, line2).setRanges([{'range' : [150, 170], 'color' : 'green'}]).onAngleChanged(function (newAngle) { $('#elbowAngle').text(newAngle);});
		new JointsAngle(line3, line4).setRanges([{'range' : [140, 145], 'color' : 'green'}]).onAngleChanged(function (newAngle) { $('#hipKneeAngle').text(newAngle);});		
		new JointsAngle(line4, lineHip).setRanges([{'range' : [35, 40], 'color' : 'green'}]).onAngleChanged(function (newAngle) { $('#kneeAngleExtension').text(newAngle);});	
		new JointsAngle(line5, line3).onAngleChanged(function (newAngle) { $('#hipAngleOpen').text(newAngle);});
		new JointsAngle(line5, line1).setRanges([{'range' : [80, 90], 'color' : 'green'}]).onAngleChanged(function (newAngle) { $('#shoulderElbowAngle').text(newAngle);});

		// Register line changed callbacks
		for (var lineName in self.lineChangedCbks) {
			if (self.lineChangedCbks[lineName] == undefined)
				continue;

			for (var j = 0; j < self.lineChangedCbks[lineName].length; j++) {
				self.getLine(lineName).onLineChanged(self.lineChangedCbks[lineName][j]);
			}
		}		
	}

	this.onLineLengthChanged = function (cbk, lineName) {
		if (self.getLine(lineName) != undefined) {
			self.getLine(lineName).onLineChanged(cbk);
			return;
		}

		if (self.lineChangedCbks[lineName] == undefined)
			self.lineChangedCbks[lineName] = [];

		self.lineChangedCbks[lineName].push(cbk);
	}	

	this.applyScaling = function (point) {
		point.x -= this.originalPaddingLeft;
		point.x *= this.scalingX;
		point.x += (this.width - this.height) / 2;

		point.y *= this.scalingY;

		return point;
	}

	this.applyUnscaling = function (point) {
		point.y /= this.scalingY;

		point.x -= (this.width - this.height) / 2;
		point.x /= this.scalingX;
		point.x += this.originalPaddingLeft;

		return point;
	}

	this.loadToolbox = function (points) {
		var self = this;					
		var circles = self.circles;

		this.view._project.activate();

		this.Xx = points['X'];
		this.Yy = points['Y'];
		this.scale = points['scale'];

		for (var i = 0; i < this.Xx.length; i++) {
			if (this.scale[i] == false)
				continue;

			var scaledPoint = new Point(this.Xx[i], this.Yy[i]);
			this.applyScaling(scaledPoint)

			this.Xx[i] = scaledPoint.x;						
			this.Yy[i] = scaledPoint.y;
		}


		function onTextSelect(target, ctx, state) {
			if (state == true) {
				circles[ctx].enlarge();
				target.setStyle({'fontWeight' : 'bold'});
			}
			else {
				circles[ctx].reduce();
				target.setStyle({'fontWeight' : 'normal'});
			}
		};

		// Arms
		circles.push(new JointPoint(this.getJointPoint(0)).label('C'));				
		circles.push(new JointPoint(this.getJointPoint(1)).label('B'));
		circles.push(new JointPoint(this.getJointPoint(2)).label('A'));	

		// Legs						
		circles.push(new JointPoint(this.getJointPoint(3)).label('D'));							
		circles.push(new JointPoint(this.getJointPoint(4)).label('E'));				
		circles.push(new JointPoint(this.getJointPoint(5)).label('F'));

		circles.push(new JointPoint(this.getJointPoint(6)).label('M'));
		circles.push(new JointPoint(this.getJointPoint(7)).label('N'));	

		function unscaledPosition(index) {
			return new Point(points['X'][index], points['Y'][index]);
		};

		// Custom measurement tool
		new Text(this.getTextPoint(0)).setText('Custom tool');
		
		circles.push(new JointPoint(this.getJointPoint(8)).label('G'));
		circles.push(new JointPoint(this.getJointPoint(9)).label('H'));
		
		self.storeLine(new JointLine(circles[8], circles[9]), SceneUtils.KnownLines.CUSTOM_LINE);	

		// Length reference				
		new Text(this.getTextPoint(3)).setText('Length reference');		

		circles.push(new JointPoint(this.getJointPoint(10)).label('I'));
		circles.push(new JointPoint(this.getJointPoint(11)).label('J'));

		self.storeLine(new JointLine(circles[10], circles[11]), SceneUtils.KnownLines.DISTANCE_REF_LINE);		

		// Horizontal reference
		new Text(this.getTextPoint(6)).setText('Vertical reference');
		
		circles.push(new JointPoint(this.getJointPoint(12)).label('K'));
		circles.push(new JointPoint(this.getJointPoint(13)).label('L'));
		
		self.storeLine(new JointLine(circles[12], circles[13]), SceneUtils.KnownLines.VERTICAL_REF_LINE);	

		$('#btnDump').click(function () {
			for (var i = 0; i < circles.length; i++)
				console.log('dump ' + circles[i].point().x + ' ' + circles[i].point().y);
		});			
	}

	return this;
}		