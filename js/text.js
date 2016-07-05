var Text = function (point) {
	var self = this;
	var _text = new PointText(point);
		
	_text.fillColor = 'black';
	_text.style = {
		font: 'sans-serif',
		fontWeight: 'normal',
		fontFamily: 'Arial',
		fontSize: 13,		
		justification: 'left'
	};	

	if ('justification' in _text.style) {
		_text.justification = _text.style['justification'];
	}
	this._onTextSelect = [];

	project.activeLayer.insertChild(1, _text);

	_text.onMouseEnter = function (evt) {		
		for (var i in self._onTextSelect) {
			var context = self._onTextSelect[i];
			context['f'](this, context['ctx'], true);
		}
	}

	_text.onMouseLeave = function (evt) {		
		for (var i in self._onTextSelect) {
			var context = self._onTextSelect[i];
			context['f'](this, context['ctx'], false);
		}
	}

	this.remove = function () {
		_text.remove();
	}

	this.bounds = function () {
		return _text.bounds;
	}

	this.registerOnTextSelect = function (func, ctx) {
		self._onTextSelect.push({'f' : func, 'ctx' : ctx});
	}

	this.setPosition = function(x, y) {
		_text.point = [x, y];
	}

	this.setPoint = function(point) {
		_text.point = point;
	}

	this.setText = function(value) {
		_text.content = value;
		return self;
	}

	this.setStyle = function (style) {		
		for (sKey in style) {			
			_text.style[sKey] = style[sKey];
		}
	}
}