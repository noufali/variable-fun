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

				// brfv4Example.dom.updateHeadline("BRFv4 - intermediate - face tracking - simple " +
				// 	"smile detection.\nDetects how much someone is smiling. smile factor: " +
				// 	(smileFactor * 100).toFixed(0) + "%");
				brfv4Example.dom.updateHeadline((smileFactor * 100).toFixed(0) + "%");
			}
		}
	};

	var p0				= new brfv4.Point();
	var p1				= new brfv4.Point();

	var setPoint		= brfv4.BRFv4PointUtils.setPoint;
	var calcDistance	= brfv4.BRFv4PointUtils.calcDistance;

	// brfv4Example.dom.updateHeadline("BRFv4 - intermediate - face tracking - simple smile " +
	// 	"detection.\nDetects how much someone is smiling.");
	//
	// brfv4Example.dom.updateCodeSnippet(exampleCode + "");
})();

var status = false;
var dom = false;
var value = 0;
var textDiv;
var txt;
var input;
var overlay = document. getElementById("overlay");

setTimeout(function(){ if (status == true) {setup()}}, 3000);

// loading p5
$.getScript("js/shaders/p5.js", function(data, textStatus, jqxhr) {
	console.log("loading...");
	console.log('Load was performed.');
	status = true
});

$(document).on('change keydown keypress input', 'div[data-placeholder]', function() {
  if (this.textContent) {
    this.dataset.divPlaceholderContent = 'true';
  } else {
    delete(this.dataset.divPlaceholderContent);
  }
});

$("#box").bind("input", function (event) {
  let content = $('#box').text().length;
	console.log(content);

  if (content > 1) {
    $('#button').prop('disabled', false);
  }else {
    $('#button').prop('disabled', true);
  }
});

$('#button').click(function() {
	console.log("clicked");
	let content = $('#box').text()
	txt.textContent = content;
});

	function setup() {
		// canvas
		console.log("hola from p5");
	  canvas = createCanvas(1280,720);

		// parametric word
		textDiv = document.createElement("div");
		textDiv.setAttribute('id', 'textDiv');

		txt = document.createElement("p");
		txt.textContent += "hello";
		txt.setAttribute('id', 'txt');
  	textDiv.appendChild(txt);

  	document.body.appendChild(textDiv);

		animate();
		status = false;
	}

	function animate() {
	  background('rgb(48,66,154)');

		var face_Pts = [];

		if (smileFactor) {
			value = (smileFactor * 100).toFixed(0);
			let n1 = map(value,0,100,0,190);
			//console.log(n);
			txt.setAttribute("style","font-variation-settings: 'wght' " + n1);
			var css = $("#txt").css("font-variation-settings")
			// console.log(css);
		}

		//reorganize list into dictionary with point objects
		if (face) {
			for(let i=0;i<face.vertices.length-2;i+=2) {
				var point = {};
				point['x'] = face.vertices[i];
				point['y'] = face.vertices[i+1];
				face_Pts.push(point);
			}

			noStroke();
			fill('#EB5D4A');
			for(let j=0;j<face_Pts.length;j++){
				ellipse(face_Pts[j].x, face_Pts[j].y, 8);
			}
			//console.log(face_Pts);

			push();
			stroke('#EB5D4A');
			strokeWeight(3);
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