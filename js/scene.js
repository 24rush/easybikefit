var SceneUtils = {
    KnownLines : {
    	DISTANCE_REF_LINE : 'distanceRefLine',
    	HORIZONTAL_REF_LINE : 'horizontalRefLine',

		THIGH_LINE : 'thighLine',
		SHIN_LINE : 'shinLine',
	}
}

var Scene =  function (paperScope, width, height) {
	var self = this;
	console.log(width, height);

	this.tbStartLeft = 100;
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

	this.animationDuration = 600;
	this.animationStart = undefined;
	this.animationEnded = false;

	var backImgSize = [775, 775];

	this.height = height;
	this.width = width;	

	this.backImgScaling = backImgSize[0] / backImgSize[1];

	this.originalPaddingLeft = 212;
	this.scalingX = this.height * this.backImgScaling / 775;				
	this.scalingY = this.height / 775;

	// this.jointsAngles = [12, 20, 20 , 28, 31, 43];
	// this.jointLengths = [660, 740, 850, 528, 714, 811];
	
	this.Xx = [647, 703, 794, 476, 615, 597];
	this.Yy = [140, 246, 291, 261, 370, 541];
	
	//console.log(this.scalingX + ' '+ this.scalingY);
	
	for (var i = 0; i < this.Xx.length; i++) {
		this.Xx[i] -= this.originalPaddingLeft;
		this.Xx[i] *= this.scalingX;
		this.Xx[i] += (this.width - this.height) / 2;

		this.Yy[i] *= this.scalingY;
	}

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

		//point.angle = self.jointsAngles[index];
		//point.length = 0;
		point.x = self.Xx[index];
		point.y = self.Yy[index];

		return point;
		//return new Point(this.tbStartLeft, this.tbStartTop + index * this.rowPadding - this.textHeight);
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

			///console.log(oldPos + ' ' + progress);
			oldPos.x = this.Xx[i] * progress;
			oldPos.y = this.Yy[i] * progress;	

			//oldPos.length = self.jointLengths[i] * progress;
			//oldPos.angle = self.jointsAngles[i];

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
		var line5 = new JointLine(circles[0], circles[3]);self.storeLine(line5);	
		
		var armsAngle = new JointsAngle(line1, line2);
		var ranges = [{'range' : [0, 90], 'color' : 'red'}, {'range' : [90, 135], 'color' : 'green'}, {'range' : [135, 180], 'color' : 'red'}];
		armsAngle.setRanges(ranges);

		var lineHip = new JointLine(kneePoint, new DependantPoint([hipPoint, kneePoint], function () {				
			return kneePoint.point().subtract(hipPoint.point()).add(kneePoint.point());
		}));

		// Legs			
		new JointsAngle(line1, line2).onAngleChanged(function (newAngle) { $('#elbowAngle').text(newAngle);});
		new JointsAngle(line3, line4).onAngleChanged(function (newAngle) { $('#hipKneeAngle').text(newAngle);});		
		new JointsAngle(line4, lineHip).onAngleChanged(function (newAngle) { $('#kneeAngleExtension').text(newAngle);});	
		new JointsAngle(line5, line3).onAngleChanged(function (newAngle) { $('#hipAngleOpen').text(newAngle);});
		new JointsAngle(line5, line1).onAngleChanged(function (newAngle) { $('#shoulderElbowAngle').text(newAngle);});

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

	this.loadToolbox = function () {
		var self = this;					
		var circles = self.circles;

		this.view._project.activate();

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
		circles.push(new JointPoint(this.getJointPoint(0)));				
		circles.push(new JointPoint(this.getJointPoint(1)));
		circles.push(new JointPoint(this.getJointPoint(2)));	

		// Legs						
		circles.push(new JointPoint(this.getJointPoint(3)));							
		circles.push(new JointPoint(this.getJointPoint(4)));				
		circles.push(new JointPoint(this.getJointPoint(5)));

		// Length reference				
		new Text(this.getTextPoint(0)).setText('Length reference').registerOnTextSelect(onTextSelect, 1);
		var startPoint = new JointPoint(this.getTextPoint(1));		
		var endPoint = new JointPoint(this.getTextPoint(1));
		endPoint.point().x += 130;
		
		circles.push(startPoint);
		circles.push(endPoint);

		self.storeLine(new JointLine(startPoint, endPoint), SceneUtils.KnownLines.DISTANCE_REF_LINE);		

		// Horizontal reference
		new Text(this.getTextPoint(3)).setText('Horizontal reference').registerOnTextSelect(onTextSelect, 0);
		startPoint = new JointPoint(this.getTextPoint(4));		
		endPoint = new JointPoint(this.getTextPoint(4));
		endPoint.point().x += 130;
		
		circles.push(startPoint);
		circles.push(endPoint);
		
		self.storeLine(new JointLine(startPoint, endPoint), SceneUtils.KnownLines.HORIZONTAL_REF_LINE);		

		$('#btnDump').click(function () {
			for (var i = 0; i < circles.length; i++)
				console.log('dump' + circles[i].point().x + ' ' + circles[i].point().y);
		});			
	}

	return this;
}		