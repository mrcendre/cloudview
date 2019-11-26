function BSPoint(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

BSPoint.prototype.debugDescription = function() {
		return "("+x+","+y+","+z+")";
};


function makeSVG(tag, attrs) {
    var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}


function BSLineLayer(x1, y1, x2, y2, index, canvas, cloudSize) { // draw a line connecting elements

  this.cloudSize = cloudSize;
  this.canvas = canvas;
  this.index = index;

  if (this.canvas != undefined) {
    //TODO : Replace index by nodeId
    this.element = makeSVG("line", {style:"stroke:rgb(255,255,255); stroke-width:1px;", id:"line"+index});

  }

}

BSLineLayer.prototype.setPoints = function(startPoint, endPoint, index) {


  let x1 = startPoint.x;
  let y1 = startPoint.y;
  let x2 = endPoint.x;
  let y2 = endPoint.y;

  if (!endPoint.x.isNan && !endPoint.y.isNaN) {

    var thickness = 1;

    var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
    // center
    var cx = ((x1 + x2) / 2) - (length / 2);
    var cy = ((y1 + y2) / 2) - (thickness / 2);
    // angle
    var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);

    if (this.element != undefined) {
      $("#line"+index).attr("x1", x1.toFixed(2));
      $("#line"+index).attr("y1", y1.toFixed(2));
      $("#line"+index).attr("x2", x2.toFixed(2));
      $("#line"+index).attr("y2", y2.toFixed(2));

    } else { console.log("Error : line's element is undefined"); }


  }

};

BSLineLayer.prototype.drawIn = function(parent) {

  parent.attr("viewBox", "0 0 " + this.cloudSize + " " + this.cloudSize);
  this.canvas = parent;

  parent.append(this.element);

};


BSLineLayer.prototype.getOffset = function( el ) {
  var rect = el.getBoundingClientRect();
  return {
      left: rect.left + window.pageXOffset,
      top: rect.top + window.pageYOffset,
      width: rect.width || el.offsetWidth,
      height: rect.height || el.offsetHeight
  };
};










function BSCloudView(container) {


    this.isDragging = false;

    this.tags = [];
    this.tagViews = [];
    this.lineLayers = [];
    this.coordinate = [];
    this.normalDirection = new BSPoint(0, 0, 0);
    this.last = [0,0];

    this.velocity  = 0.0;

    this.timer = null;
    this.inertia = null;

    this.shouldBeFlat = false;

    this.intervalFramerate = 1000/24;

    this.cloudSize = container.outerHeight();
    this.container = container;

    this.lastGestureTime = new Date();

};



 BSCloudView.prototype.setCloudTags = function(array) {

    this.tagViews = [];
    this.tags = array;
    this.lineLayers = [];
    for (var i = 0; i<array.length; i++) {

				var view = $("<div id=\"node"+i+"\" class=\"element\" unselectable=\"on\" onselectstart=\"return false;\"  onmousedown=\"return false;\">" + rootWords[i] + "</div>"); // TODO : Add nodeId
        this.tagViews[i] = view;
        this.container.append(view);

        //let view = this.tags[i];
    }
    let p1 = Math.PI * (3 - Math.sqrt(5));
    let p2 = 2.0 / this.tags.length;


    let linesCanvas = this.container.find(".lines-canvas").first();

    for (var i = 0; i<this.tags.length; i++) {
        let y = i * p2 - 1 + (p2 / 2);
        let r  = Math.sqrt(1 - y * y);
        let p3  = i * p1;
        let x  = Math.cos(p3) * r;
        let z  = Math.sin(p3) * r;

        let point = new BSPoint(x, y, z);

        this.coordinate.push(point);

        let lineLayer = new BSLineLayer(this.cloudSize/2, this.cloudSize/2, x, y, i, linesCanvas, this.cloudSize);
        lineLayer.targetPoint = point;
        lineLayer.drawIn(linesCanvas);
        this.lineLayers.push(lineLayer);

        this.setTagOf(point, i);
    }

    let a = Math.floor(Math.random() * 10) - 5;
    let b = Math.floor(Math.random() * 10) - 5;
    this.normalDirection = new BSPoint(a, b, 0);
    this.timerStart();

  };

  BSCloudView.prototype.timerStart = function() {
      setInterval(this.autoTurnRotation.bind(this), this.intervalFramerate);
  };

  BSCloudView.prototype.timerStop = function() {
      this.isPaused = true;
  };

  BSCloudView.prototype.setIsDragging = function(isDragging) {
    this.isDragging = isDragging;
    this.last = undefined;
  };

  BSCloudView.prototype.getIsDragging = function() {
    return this.isDragging;
  };

  BSCloudView.prototype.setup = function() {

      let scopedHandlePanGesture = this.handlePanGesture.bind(this);
      let scopedTimerStop = this.timerStop.bind(this);
      let scopedInertiaStop = this.inertiaStop.bind(this);
      let scopedSetIsDragging = this.setIsDragging.bind(this);
      let scopedGetIsDragging = this.getIsDragging.bind(this);

      this.container.mousedown(function() {
        scopedSetIsDragging(true);
        scopedTimerStop();
        scopedInertiaStop();

      })
        .mousemove(function(event) {
          //this.isDragging = true;

          if (scopedGetIsDragging() == true) {
          let mouseX = event.clientX;
          let mouseY = event.clientY;

          scopedHandlePanGesture(mouseX, mouseY);
        }

      })
        .mouseup(function() {
          var wasDragging = scopedGetIsDragging();
          scopedSetIsDragging(false);
          if (!wasDragging) {

          }
      })
        .mouseleave(function() {
          console.log("Mouse leave");
          scopedSetIsDragging(false);
      });

      setInterval(this.inertiaStep.bind(this), this.intervalFramerate);
      setInterval(this.autoTurnRotation.bind(this), this.intervalFramerate);

  };

  BSCloudView.prototype.percentStep = function() {
      return 1/this.tags.length;
  };

  BSCloudView.prototype.updateFrameOfPoint = function(index, direction, angle ) {
      let point = this.coordinate[index];

      let rPoint = BSCloudView.prototype.BSPointMakeRotation(point, direction, angle);
      if (isNaN(rPoint.x)) {
        rPoint = point;
      }
      this.coordinate[index] = rPoint;

      this.setTagOf(rPoint, index);

  };


  BSCloudView.prototype.setTagOf = function(point, index) {

      let x = (point.x + 1) * (this.cloudSize / 2.0);
      let y = (point.y + 1) * (this.cloudSize / 2.0);

      let view = this.tagViews[index];
      let lineLayer = this.lineLayers[index];

      lineLayer.setPoints(new BSPoint(this.cloudSize/2, this.cloudSize/2, 0), new BSPoint(x, y, point.z), index);

      let transform  = (point.z + 2) / 3;

      var transformExpression = "translateX(" + (x.toFixed(2) - (view.outerWidth()/2)) + "px) translateY(" + (y.toFixed(2) - (view.outerHeight()/2)) + "px) scale(" + transform + ", " + transform + ")";
      $("#line" + index).css("opacity", transform);

      view.css({"transform" : transformExpression,
                "opacity" : transform});

    };

    BSCloudView.prototype.autoTurnRotation = function() {
      if (!this.isDragging) {
        for (var i = 0; i<this.tags.length; i++) {
          this.updateFrameOfPoint(i, this.normalDirection, 0.0005);
        }
      }
  };

  BSCloudView.prototype.inertiaStart = function() {
    this.timerStop();
  };

  BSCloudView.prototype.inertiaStop = function() {
    this.timerStart()
  };

  BSCloudView.prototype.inertiaStep = function() {
    if (this.velocity <= 0) {
      this.inertiaStop();
    }
    else {
      this.velocity -= 70.0;
      var angle  = this.velocity / this.cloudSize * 2.0 * (1/24);

      for (var i = 0; i<this.tags.length; i++) {
        this.updateFrameOfPoint(i, /*direction:*/ this.normalDirection, /*andAngle:*/ this.angle);
      }
    }
  };

  BSCloudView.prototype.handlePanGesture = function(mouseX, mouseY) {

    if (this.isDragging) {

      let current = new BSPoint(mouseX, mouseY, 0);
      if (this.last == undefined) { this.last = current; }

      let direction = new BSPoint(this.last.y - current.y, current.x - this.last.x, 0);
      let distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
      let angle = distance / (this.cloudSize/2);


      for (var i = 0; i <this.tags.length; i++) {
        this.updateFrameOfPoint(i, direction, angle);
      }
      this.normalDirection = direction;
      this.last = current;

      }

  };

  BSCloudView.prototype.BSPointMakeRotation = function(point /*BSPoint*/, direction /*BSPoint*/, angle ) /*-> BSPoint*/ {


      if (angle == 0) {
          return point;
      }


      var result = [[point.x, point.y, point.z, 1], [0,0,0,0], [0,0,0,0], [0,0,0,0]];

      if (direction.z * direction.z + direction.y * direction.y != 0) {
          var cos1 = direction.z / Math.sqrt(direction.z * direction.z + direction.y * direction.y);
          var sin1 = direction.y / Math.sqrt(direction.z * direction.z + direction.y * direction.y);
          var t1 = [[1, 0, 0, 0], [0, cos1, sin1, 0], [0, -sin1, cos1, 0], [0, 0, 0, 1]];
          result = math.multiply(result, t1);
      }

      if (direction.x * direction.x + direction.y * direction.y + direction.z * direction.z != 0) {
          let cos2  = Math.sqrt(direction.y * direction.y + direction.z * direction.z) / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
          let sin2  = -direction.x / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
          let t2 = [[cos2, 0, -sin2, 0], [0, 1, 0, 0], [sin2, 0, cos2, 0], [0, 0, 0, 1]];
          result = math.multiply(result, t2);
      }

      let cos3 = Math.cos(angle);
      let sin3 = Math.sin(angle);
      let t3 = [[cos3, sin3, 0, 0], [-sin3, cos3, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
      result = math.multiply(result, t3);

      if (direction.x * direction.x + direction.y * direction.y + direction.z * direction.z != 0) {
          let cos2  = Math.sqrt(direction.y * direction.y + direction.z * direction.z) / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
          let sin2  = -direction.x / Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
          let t2_ = [[cos2, 0, sin2, 0], [0, 1, 0, 0], [-sin2, 0, cos2, 0], [0, 0, 0, 1]];

          result = math.multiply(result, t2_);
      }

      if (direction.z * direction.z + direction.y * direction.y != 0) {
          let cos1  = direction.z / Math.sqrt(direction.z * direction.z + direction.y * direction.y);
          let sin1  = direction.y / Math.sqrt(direction.z * direction.z + direction.y * direction.y);
          let t1_ = [[1, 0, 0, 0], [0, cos1, -sin1, 0], [0, sin1, cos1, 0], [0, 0, 0, 1]];

          result = math.multiply(result, t1_);
      }

      let resultPoint = new BSPoint(result[0][0], result[0][1], result[0][2]);

      return resultPoint;
  };
