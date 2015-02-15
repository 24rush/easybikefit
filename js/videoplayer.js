
var VideoPlayer = function (videoId) {
	var self = this;

	self._video = $('#'+ videoId);
	self._isPaused = false;

	var onStatusChanged = [];

	self.onStatusChanged = function (cbk) {
		onStatusChanged.push(cbk);
	}

	self.reportStatus = function () {
		onStatusChanged.forEach(function (cbk) {
			cbk({ 'playbackStatus' : self._isPaused});
		});
	}

	self.togglePlayPause = function() {
		self._isPaused == true ? self.play() : self.pause();		
	}

	self.pause = function () {
		self._isPaused = true;
		self._video[0].pause();

		self.reportStatus();
	}

	self.play = function () {
		self._isPaused = false;
		self._video[0].play();

		self.reportStatus();
	}

	self.advance = function (value) {
		if (self._isPaused == false) 
			return;

		self._video[0].currentTime += value;
	}

	self.canPlay = function (type) {
		return self._video[0].canPlayType(type) !== '';
	}

	self.height = function (value) {
		self._video.height(value);
	}

	self.show = function (value) {
		console.log(value + ' ' + self._video);
		value == true ?	self._video.show() : self._video.hide();
	}

	self.setSource = function (src) {
		self._video[0].src = src;
		self._isPaused = false;
		self.reportStatus();
	}
};