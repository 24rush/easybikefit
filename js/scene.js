var Scene = function (paperScope, width, height) {
	var self = this;
	console.log(width, height);

	this.tbStartLeft = width;
	this.tbStartTop = 40;

	this.paddingRight = 14;
	this.textHeight = 6;
	this.rowPadding = 25;

	this.circles = [];
	this.view = paper.View._viewsById[paperScope];

	this.animationDuration = 600;
	this.animationStart = undefined;
	this.animationEnded = false;

	var backImgSize = [775, 775];

	this.height = height;
	this.width = width;	

	this.backImgScaling = backImgSize[0] / backImgSize[1];

	this.scalingX = ((this.width - this.height * this.backImgScaling) / 2 + this.height * this.backImgScaling) / 987.5;				
	this.scalingY = this.height / 775;

	// this.jointsAngles = [12, 20, 20 , 28, 31, 43];
	// this.jointLengths = [660, 740, 850, 528, 714, 811];
	
	this.Xx = [647, 703, 794, 476, 615, 597];
	this.Yy = [140, 246, 291, 261, 370, 541];
	
	console.log(this.scalingX + ' '+ this.scalingY);
	
	for (var i = 0; i < this.Xx.length; i++) {
		this.Xx[i] *= this.scalingX;
		this.Yy[i] *= this.scalingY;
	}

	$('.toolbox').css('left', 50);
	$('.toolbox').css('top', this.tbStartTop);

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

		if (self.animationStart + self.animationDuration < event.time * 1000) {	
			this.drawLines();

			this.animationEnded = true;																	
			return;
		}

		for (var i = 0; i < self.Xx.length; i++) {
			var oldPos = self.circles[i].point();

			var progress = (event.time * 1000 - self.animationStart) / self.animationDuration;
			console.log(oldPos + ' ' + progress);
			oldPos.x = this.Xx[i] * progress;
			oldPos.y = this.Yy[i] * progress;	

			//oldPos.length = self.jointLengths[i] * progress;
			//oldPos.angle = self.jointsAngles[i];

			self.circles[i].setMoved({'point': oldPos});		
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

		var line1 = new JointLine(circles[0], circles[1]);
		var line2 = new JointLine(circles[1], circles[2]);
		var line3 = new JointLine(circles[3], circles[4]);
		var line4 = new JointLine(circles[4], circles[5]);
		var line5 = new JointLine(circles[0], circles[3]);		
		
		var armsAngle = new JointsAngle(line1, line2);
		var ranges = [{'range' : [0, 90], 'color' : 'red'}, {'range' : [90, 135], 'color' : 'green'}, {'range' : [135, 180], 'color' : 'red'}];
		armsAngle.setRanges(ranges);

		var lineHip = new JointLine(kneePoint, new DependantPoint([hipPoint, kneePoint], function () {				
			return kneePoint.point().subtract(hipPoint.point()).add(kneePoint.point());
		}));

		line3.onLineChanged(function (f, t) { $('#thighLength').text(f.getDistance(t) * refDistanceCMPerPixel)});

		// Legs			
		new JointsAngle(line1, line2).onAngleChanged(function (newAngle) { $('#elbowAngle').text(newAngle);});
		new JointsAngle(line3, line4).onAngleChanged(function (newAngle) { $('#hipKneeAngle').text(newAngle);});		
		new JointsAngle(line4, lineHip).onAngleChanged(function (newAngle) { $('#kneeAngleExtension').text(newAngle);});	
		new JointsAngle(line5, line3).onAngleChanged(function (newAngle) { $('#hipAngleOpen').text(newAngle);});
		new JointsAngle(line5, line1).onAngleChanged(function (newAngle) { $('#shoulderElbowAngle').text(newAngle);});			
	}

	this.onRefDistanceParamsChanged = function (newDistanceInCM, newDistanceInPixels) {
		console.log('on ref ' + newDistanceInCM + ' ' + newDistanceInPixels);
		refDistanceInPixels = newDistanceInPixels != undefined ? newDistanceInPixels : refDistanceInPixels;
		refDistanceCMPerPixel  = newDistanceInCM != undefined ? newDistanceInCM / refDistanceInPixels : refDistanceCMPerPixel;

		$('#thighLength').text(refDistanceInPixels * refDistanceCMPerPixel);
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

		// Vertical reference				
		new Text(this.getTextPoint(0)).setText('Length reference').registerOnTextSelect(onTextSelect, 1);
		var startPoint = new JointPoint(this.getTextPoint(1));
		circles.push(startPoint);

		var endPoint = new JointPoint(this.getTextPoint(1));
		endPoint.point().x += 130;
		circles.push(endPoint);

		var lengthRefLine = new JointLine(startPoint, endPoint);
		lengthRefLine.onLineChanged(function (from, to) {
			refDistanceInPixels = from.getDistance(to);
			self.onRefDistanceParamsChanged(refDistanceInPixels, undefined);		
		});

		new Text(this.getTextPoint(3)).setText('Vertical reference').registerOnTextSelect(onTextSelect, 0);				

		$('#btnDump').click(function () {
			for (var i = 0; i < circles.length; i++)
				console.log('dump' + circles[i].point().x + ' ' + circles[i].point().y);
		});			
	}

	return this;
}		