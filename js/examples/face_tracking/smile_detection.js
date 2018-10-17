var smileFactor;
var face;

(function exampleCode() {
	"use strict";

	brfv4Example.initCurrentExample = function(brfManager, resolution) {
		brfManager.init(resolution, resolution, brfv4Example.appId);
	};

	brfv4Example.updateCurrentExample = function(brfManager, imageData, draw) {

		brfManager.update(imageData);

		draw.clear();

		// Face detection results: a rough rectangle used to start the face tracking.

		draw.drawRects(brfManager.getAllDetectedFaces(),	false, 1.0, 0x00a1ff, 0.5);
		draw.drawRects(brfManager.getMergedDetectedFaces(),	false, 2.0, 0xffd200, 1.0);

		var faces = brfManager.getFaces(); // default: one face, only one element in that array.

		for(var i = 0; i < faces.length; i++) {

			face = faces[i];

			if(		face.state === brfv4.BRFState.FACE_TRACKING_START ||
					face.state === brfv4.BRFState.FACE_TRACKING) {

				// Smile Detection

				setPoint(face.vertices, 48, p0); // mouth corner left
				setPoint(face.vertices, 54, p1); // mouth corner right
				//console.log(face.vertices);

				var mouthWidth = calcDistance(p0, p1);

				setPoint(face.vertices, 39, p1); // left eye inner corner
				setPoint(face.vertices, 42, p0); // right eye outer corner

				var eyeDist = calcDistance(p0, p1);
				smileFactor = mouthWidth / eyeDist;

				smileFactor -= 1.40; // 1.40 - neutral, 1.70 smiling

				if(smileFactor > 0.25) smileFactor = 0.25;
				if(smileFactor < 0.00) smileFactor = 0.00;

				smileFactor *= 4.0;

				if(smileFactor < 0.0) { smileFactor = 0.0; }
				if(smileFactor > 1.0) { smileFactor = 1.0; }

				//console.log(smileFactor);
				// Let the color show you how much you are smiling.

				var color =
					(((0xff * (1.0 - smileFactor) & 0xff) << 16)) +
					(((0xff * smileFactor) & 0xff) << 8);

				// Face Tracking results: 68 facial feature points.

				draw.drawTriangles(	face.vertices, face.triangles, false, 1.0, color, 0.4);
				draw.drawVertices(	face.vertices, 2.0, false, color, 0.4);

				brfv4Example.dom.updateHeadline((smileFactor * 100).toFixed(0) + "%");
			}
		}
	};

	var p0				= new brfv4.Point();
	var p1				= new brfv4.Point();

	var setPoint		= brfv4.BRFv4PointUtils.setPoint;
	var calcDistance	= brfv4.BRFv4PointUtils.calcDistance;
})();

var canvas;
var status = false;
var dom = false;
var value = 0;
var textDiv;
var word;
var count = 1;
var input;
var overlay = document. getElementById("overlay");

setTimeout(function(){ if (status == true) {setup()}}, 3000);

// loading p5
$.getScript("js/shaders/p5.js", function(data, textStatus, jqxhr) {
	console.log("loading...");
	console.log('Load was performed.');
	status = true
});

// checking for input in div
$(document).on('change keydown keypress input', 'div[data-placeholder]', function() {
  if (this.textContent) {
    this.dataset.divPlaceholderContent = 'true';
  } else {
    delete(this.dataset.divPlaceholderContent);
  }
});

// enabling submit button once users enters more than one letter
$("#box").bind("input", function (event) {
  let content = $('#box').text().length;

  if (content > 1) {
    $('#enter').prop('disabled', false);
  }else {
    $('#enter').prop('disabled', true);
  }
});

// changing word displayed on page once user hits submit
$('#enter').click(function(e) {
	e.preventDefault();
	let content = $('#box').text()
	word.textContent = content;
});

// shuffle button to toggle font
$('#shuffle').click(function(e) {
	e.preventDefault();
  var id = word.id;

	if (id == "txt1") {
		word.id = 'txt2';
		count = 2;
	} else if (id = 'txt2') {
		word.id = 'txt1';
		count = 1;
	} else {}
});

//setting up p5 canvas
function setup() {
	// canvas
  canvas = createCanvas(window.innerWidth,window.innerHeight);

	// parametric word displayed on screen
	textDiv = document.createElement("div");
	textDiv.setAttribute('id', 'textDiv');

	word = document.createElement("p");
	word.textContent = "hello";
	word.setAttribute('id', 'txt1');
	textDiv.appendChild(word);

	document.body.appendChild(textDiv);

	animate();
	status = false;
}
var strokeValue = 3;
function animate() {
  background('rgb(48,66,154)');

	var face_Pts = [];

	// if user smiles, then change variable axes of font based on how much user is smiling
	if (smileFactor) {
		value = (smileFactor * 100).toFixed(0);
		if (count == 1) {
			let n = map(value,0,100,0,190);
			word.setAttribute("style","font-variation-settings: 'wght' " + n);
		} else if  (count == 2) {
			let n1 = map(value,0,100,2,100);
			let n2 = map(value,0,100,0,100);
			word.setAttribute("style","font-variation-settings: 'wght' " + n1 + ", 'wdth' " + n2);
		} else {}
		strokeValue = map(value,0,100,3,15);
	}

	// reorganize face point list into dictionary with point objects
	if (face) {
		for(let i=0;i<face.vertices.length-2;i+=2) {
			var point = {};
			point['x'] = face.vertices[i];
			point['y'] = face.vertices[i+1];
			face_Pts.push(point);
		}
		// drawing circles at face points
		noStroke();
		fill('#EB5D4A');
		for(let j=0;j<face_Pts.length;j++){
			ellipse(face_Pts[j].x, face_Pts[j].y, 8);
		}

		// drawing face
		push();
		stroke('#EB5D4A');
		strokeWeight(strokeValue);
		noFill();

		// EDGES OF FACE

		line(face_Pts[0].x,face_Pts[0].y,face_Pts[4].x,face_Pts[4].y);
		line(face_Pts[5].x,face_Pts[5].y,face_Pts[8].x,face_Pts[8].y);
		line(face_Pts[8].x,face_Pts[8].y,face_Pts[11].x,face_Pts[11].y);
		line(face_Pts[12].x,face_Pts[12].y,face_Pts[16].x,face_Pts[16].y);

		// EYEBROWS

		line(face_Pts[0].x,face_Pts[0].y,face_Pts[18].x,face_Pts[18].y);
		line(face_Pts[19].x,face_Pts[19].y,face_Pts[21].x,face_Pts[21].y);
		line(face_Pts[22].x,face_Pts[22].y,face_Pts[24].x,face_Pts[24].y);
		line(face_Pts[16].x,face_Pts[16].y,face_Pts[25].x,face_Pts[25].y);

		// NOSE

		line(face_Pts[27].x,face_Pts[27].y,face_Pts[30].x,face_Pts[30].y);
		line(face_Pts[31].x,face_Pts[31].y,face_Pts[33].x,face_Pts[33].y);
		line(face_Pts[33].x,face_Pts[33].y,face_Pts[35].x,face_Pts[35].y);

		// LEFT EYE

		curve(face_Pts[36].x,face_Pts[36].y,face_Pts[37].x,face_Pts[37].y,face_Pts[38].x,face_Pts[38].y,face_Pts[39].x,face_Pts[39].y,face_Pts[40].x,face_Pts[40].y,face_Pts[41].x,face_Pts[41].y);

		// RIGHT EYE

		curve(face_Pts[42].x,face_Pts[42].y,face_Pts[43].x,face_Pts[43].y,face_Pts[44].x,face_Pts[44].y,face_Pts[45].x,face_Pts[45].y,face_Pts[46].x,face_Pts[46].y,face_Pts[47].x,face_Pts[47].y);

		// MOUTH

		line(face_Pts[48].x,face_Pts[48].y,face_Pts[50].x,face_Pts[50].y);
		line(face_Pts[51].x,face_Pts[51].y,face_Pts[52].x,face_Pts[52].y);
		line(face_Pts[50].x,face_Pts[50].y,face_Pts[51].x,face_Pts[51].y);
		line(face_Pts[52].x,face_Pts[52].y,face_Pts[54].x,face_Pts[54].y);
		line(face_Pts[54].x,face_Pts[54].y,face_Pts[57].x,face_Pts[57].y);
		line(face_Pts[57].x,face_Pts[57].y,face_Pts[48].x,face_Pts[48].y);
		line(face_Pts[48].x,face_Pts[48].y,face_Pts[62].x, face_Pts[62].y);
		line(face_Pts[62].x,face_Pts[62].y,face_Pts[54].x, face_Pts[54].y);
		line(face_Pts[48].x,face_Pts[48].y,face_Pts[66].x, face_Pts[66].y);
		line(face_Pts[66].x,face_Pts[66].y,face_Pts[54].x, face_Pts[54].y);

		pop();
	}

	requestAnimationFrame(animate);
}

// resizing canvas based on window dimensions

function resize() {
	var cv = document. getElementById("defaultCanvas0");
	// cv.width = '10vw';
	// cv.height = '10vw';
	//cv.setAttribute("width", '20vw');
	//cv.setAttribute("height", '20vw');
	//console.log(cv);
}

window.addEventListener('resize', resize, false);
