jQuery.noConflict();

StateMachineApp = function() {
	this.width = StateMachineApp.Width;
	this.height = StateMachineApp.Height;


	this.state0 = new State('0', this.width *  1 / 6, this.height / 2);
	this.state1 = new State('1', this.width / 2, this.height / 2);
	this.state2 = new State('2', this.width  * 5 / 6, this.height / 2);

	this.strip = new Strip(78);
	this.stepIndex = 0;

};

StateMachineApp.Width = 600;
StateMachineApp.Height = 400;

StateMachineApp.prototype.start = function(canvasId) {
	var me = this;

	var canvas = document.getElementById(canvasId);
	canvas.width = this.width;
	canvas.height = this.height;
	paper.setup(canvas);

	var tool = new paper.Tool();

	tool.onMouseDown = function(event) {
	}

	tool.onMouseMove = function(event) {
	}

	jQuery('#step').click(function() {
		me.step();
	})

	jQuery('#restart').click(function() {
		me.restart();
	})

	jQuery('#number-input').change(function(event) {
		me.loadValue();
	});

	this.loadValue();
	this.render();
};

StateMachineApp.prototype.loadValue = function(value) {
	var value = jQuery('#number-input').val();

	value = parseInt(value);
	
	if (value && value > 0 && value <= 255*255) {
		this.restart(value);
	} else {
		alert("Vous devez entrer un nombre entier strictement positif et inférieur à 65025!");
	}
};

StateMachineApp.prototype.restart = function(value) {
	this.strip.selectedIndex = -1;
	this.selectState(null);

	if (value) {
		value = value < 1 ? 1 : value;
		value = value > 255*255 ? 255*255 : value;

		jQuery('#number-input').val(value);
		this.strip.generate(value);
	}
	this.render();
};

StateMachineApp.prototype.step = function() {

	if (!this.currentState) {
		this.selectState(this.state0);
		this.strip.selectedIndex = 0;
		this.render();
		return;
	}

	var value = this.strip.getValue();

	if (this.currentState == this.state0) {
		if (value == 1) {
			this.selectState(this.state1);
		}
	} else if (this.currentState == this.state1) {
		if (value == 1) {
			this.selectState(this.state0);
		} else {
			this.selectState(this.state2);
		}
	} else if (this.currentState == this.state2) {
		if (value == 0) {
			this.selectState(this.state1);
		}
	}

	this.strip.selectedIndex += 1;

	if (this.strip.selectedIndex == this.strip.stripArray.length) {
		this.finish();
		return;
	}

	this.render();

};

StateMachineApp.prototype.finish = function() {

	if (this.currentState == this.state0) {
		this.currentState.selected = 'green';
		this.render();
		alert('Votre nombre est multiple de trois.');
	} else {
		this.currentState.selected = 'red';
		this.render();
		alert('Votre nombre n\'est pas multiple de trois.');

	}
};

StateMachineApp.prototype.selectState = function(state) {
	this.state0.selected = false;
	this.state1.selected = false;
	this.state2.selected = false;

	if (state) {
		state.selected = 'orange';
	}
	this.currentState = state;
}

StateMachineApp.prototype.render = function(highighIndex) {
	paper.project.activeLayer.removeChildren();

	var left = new paper.Point([-this.state0.radius - 5, 0]);
	var right = left.multiply(-1);
	var left2 = left.multiply(0.7);
	var right2 = right.multiply(0.7);

	var line1 = createArrow("1", this.state0.position.add(right), this.state1.position.add(left));
	var line2 = createArrow("0", this.state1.position.add(right), this.state2.position.add(left));
	var line3 = createArrow("1", this.state1.position.add(left), this.state0.position.add(right));
	var line4 = createArrow("0", this.state2.position.add(left), this.state1.position.add(right));
	var line5 = createArrow("1", this.state2.position.add(left2), this.state2.position.add(right2), [0, 20], {
		circle : true
	});
	var line6 = createArrow("0", this.state0.position.add(right2), this.state0.position.add(left2), [0, -20], {
		circle : true
	});

	var startLine = createArrow(null, this.state0.position.add(left.multiply(3)), this.state0.position.add(left), [0, 0], {
		line : true
	});


	this.state0.render(true);
	this.state1.render();
	this.state2.render();

	this.strip.render();

	paper.view.draw();
};

Strip = function(value) {
	this.generate(value);

	this.radius = 15;
	this.selectedIndex = -1;
};

Strip.prototype.generate = function(value) {
	this.stripArray = []; // order weak weight bit to strong weight bit

	while (value >= 1) {
		this.stripArray.push(value % 2);
		value -= value % 2;
		value /= 2;
	}
}

Strip.prototype.getValue = function() {
	return this.stripArray[this.selectedIndex];
}

Strip.prototype.render = function() {
	var center = new paper.Point([StateMachineApp.Width / 2, 80]);
	var start = center.add([this.radius * this.stripArray.length, 0]);
	var offset = new paper.Point([-this.radius * 2, 0]);

	for (var i = 0; i < this.stripArray.length; i++) {
		if (i == this.selectedIndex) {
			this.renderCase(this.stripArray[i], start.add(offset.multiply(i)), 'orange');
		} else {
			this.renderCase(this.stripArray[i], start.add(offset.multiply(i)));
		}
	}
};

Strip.prototype.renderCase = function(value, center, color) {
	var path = new paper.Path.Rectangle(center.x-this.radius, center.y-this.radius, 2 * this.radius, 2 * this.radius);
	path.strokeColor = 'black';
	if (color) {
		path.fillColor = color;
	}

	var text = new paper.PointText(center.add([-5, 6]));
	text.content = value;
	text.characterStyle = {
		fontSize: 14,
	    fillColor: 'black',
	};

	return path;
};


State = function(name, x, y) {
	this.position = new paper.Point(x, y);
	this.name = name;
	this.radius = 20;
	this.selected = false;
};

State.prototype.render = function(isStart) {
	var path = new paper.Path.Circle(this.position, this.radius);
	path.strokeColor = 'black';
	if (this.selected) {
		path.fillColor = this.selected;
	}
	if (isStart) {
		var path2 = new paper.Path.Circle(this.position, this.radius - 3);
		path2.strokeColor = 'black';
	}
	var text = new paper.PointText(this.position.add([-5, 6]));
	text.content = this.name;
	text.characterStyle = {
		fontSize: 14,
	    fillColor: 'black',
	};

	return path;
}

var createArrow = function(value, p1, p2, midOffset, options) {
	var normal = p2.subtract(p1).normalize(15);
		normal = new paper.Point(normal.y, normal.x);
	var offset = new paper.Point(normal);
	var body = new paper.Path;
	var angleOffset = 0;

	p1 = p1.add(offset);
	p2 = p2.add(offset);
	var middlePoint = p1.add(p2).divide(2);
	if (midOffset) {
		middlePoint = middlePoint.add(midOffset);
	}

	body.add(p1);
	if (options && options.circle) {
		body.arcTo(middlePoint.add(normal), p2);
		angleOffset = -40;
	} else if (options && options.line) {
		body.lineTo(p2);
		angleOffset = 45;
	} else {
		body.curveTo(middlePoint.add(normal), p2);
	}
	body.strokeColor = 'black';

	if (value) {
		var text = new paper.PointText(middlePoint.add(normal.multiply(1.7)).add([-5, 6]));
		text.content = value;
		text.characterStyle = {
			fontSize: 11,
		    fillColor: 'black',
		};
	}

	var vector = p2.subtract(middlePoint.add(normal.add(normal))).normalize(10);
	var arrow = new paper.Path([p2.add(vector.rotate(155+angleOffset)), p2, p2.add(vector.rotate(-145+angleOffset))]);
	arrow.strokeColor = 'black';
	arrow.fillColor = 'black';
	arrow.closed = true;
	arrow.strokeWidth = 1;
	return body;
}