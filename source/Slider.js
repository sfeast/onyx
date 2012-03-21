/**
A control that presents a range of selection options in the form of a horizontal
slider with a control knob that can be tapped and dragged to the desired
location.

	{kind: "onyx.Slider", min: 10, max: 50, value: 30}

The onChanging event is fired when dragging the control knob. The onChange
event is fired when the position is set, either by finishing a drag or by
tapping the bar.
*/
enyo.kind({
	name: "onyx.Slider",
	kind: "onyx.ProgressBar",
	classes: "onyx-slider",
	published: {
		value: 0,
		lockBar: true
	},
	events: {
		onChange: "",
		onChanging: "",
		onAnimateFinish: ""
	},
	showStripes: false,
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	moreComponents: [
		{kind: "Animator", onStep: "animatorStep", onEnd: "animatorComplete"},
		{name: "knob", classes: "onyx-slider-knob"}
	],
	create: function() {
		this.inherited(arguments);
		this.createComponents(this.moreComponents);
		this.valueChanged();
	},
	valueChanged: function() {
		this.value = this.clampValue(this.min, this.max, this.value);
		var p = this.calcPercent(this.value);
		this.updateKnobPosition(p);
		if (this.lockBar) {
			this.setProgress(this.value);
		}
	},
	updateKnobPosition: function(inPercent) {
		this.$.knob.applyStyle("left", inPercent + "%");
	},
	calcKnobPosition: function(inEvent) {
		var x = inEvent.clientX - this.hasNode().getBoundingClientRect().left;
		return (x / this.getBounds().width) * (this.max - this.min) + this.min;
	},
	dragstart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			inEvent.preventNativeDefault();
			this.dragging = true;
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			var v = this.calcKnobPosition(inEvent);
			this.setValue(v);
			this.doChanging({value: this.value});
			return true;
		}
	},
	dragfinish: function(inSender, inEvent) {
		this.dragging = false;
		inEvent.preventTap();
		this.doChange({value: this.value});
		return true;
	},
	tap: function(inSender, inEvent) {
		var v = this.calcKnobPosition(inEvent);
		this.tapped = true;
		this.animateTo(v);
		return true;
	},
	animateTo: function(inValue) {
		this.$.animator.play({
			startValue: this.value,
			endValue: inValue,
			node: this.hasNode()
		});
	},
	animatorStep: function(inSender) {
		this.setValue(inSender.value);
		return true;
	},
	animatorComplete: function(inSender) {
		if (this.tapped) {
			this.tapped = false;
			this.doChange({value: this.value});
		}
		this.doAnimateFinish(inSender);
		return true;
	}
});