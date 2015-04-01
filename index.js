/**
Tiling Calculator
Forest Tong
**/
//TODO: make busy symbol when calculating

var padding = 1;
var nodeRadius = 7;
var margin = nodeRadius;
var backgroundColor = '#EBE7CC';
var pickedColor = '#A0C4EB';
// var nodeSelectColor = 'rgba(0, 0, 256, 0.2)';
var nodeSelectColor = 'rgba(255, 153, 0, 0.4)';
var tileSelectColor = nodeSelectColor;
var invis = 'rgba(0, 0, 0, 0)';
var l = 100;
var h = 6;
var w = 6;

var tableRects = [];
var tableNodes = [];
var svg = document.getElementById('board');
svg.setAttribute('height', 2*margin + h*(padding + l));
svg.setAttribute('width', 2*margin + w*(padding + l));
var svgNS = svg.namespaceURI;

var selectedNode = null; //only valid when selectingNode
var selectedTile = null; //only valid when selectingTile
var selectingNode = false;
var selectingTile =false;
var nodeKey = 16;
var tileKey = 91;
var nodeKeyDown = false;
var tileKeyDown = false;
var mouseDown = false;

function computeTilings() {
	var table = [];
	for(var i = 0; i < h; i++) {
		var row = [];
		for(var j = 0; j < w; j++) {
			row.push(tableRects[i][j].tiled);
		}
		table.push(row);
	}

	var labels = [];
	for(var i = 0; i < h; i++) {
		var row = [];
		for(var j = 0; j < w; j++) {
			row.push(-1);
		}
		labels.push(row);
	}

	var evenCounter = 0;
	var oddCounter = 0;
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			if(table[i][j] == 1) {
				if((i + j) % 2 == 0) {
					labels[i][j] = evenCounter;
					evenCounter++;
				} else {
					labels[i][j] = oddCounter;
					oddCounter++;
				}
			}
		}
	}

	if(evenCounter == 0 || evenCounter != oddCounter) {
		return 0;
	}

	var K = [];
	for(var i = 0; i < evenCounter; i++) {
		var row = [];
		for(var j = 0; j < evenCounter; j++) {
			row.push(0);
		}
		K.push(row);
	}

	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			var label = labels[i][j];
			if((i + j) % 2 == 0 && label != -1) {
				if(i != 0) {
					var upperLabel = labels[i - 1][j];
					if(upperLabel != -1) K[label][upperLabel] = 1;
				}
				if(i != h - 1) {
					var lowerLabel = labels[i + 1][j];
					if(lowerLabel != -1) K[label][lowerLabel] = 1;
				}
				if(j != 0) {
					var leftLabel = labels[i][j - 1];
					if(leftLabel != -1) K[label][leftLabel] = math.i;
				}
				if(j != w - 1) {
					var rightLabel = labels[i][j + 1];
					if(rightLabel != -1) K[label][rightLabel] = math.i;
				}
			}
		}
	}
	//One of these will be zero
	return Math.abs(math.det(math.matrix(K)).re) + Math.abs(math.det(math.matrix(K)).im);
}

function click(i, j) {
	var rect = tableRects[i][j]
	if(rect.tiled) {
		rect.tiled = 0;
	} else {
		rect.tiled = 1;
	}
	formatColor(rect);
}

function clickDiamond(node1, node2) {
	var p1 = [node1.i, node1.j];
	var p2 = [node2.i, node2.j];
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			if(inDiamond(p1, p2, [i + .5, j + .5])) click(i, j);
		}
	}
}

function clickRect(rect1, rect2) {
	var p1 = [rect1.i + .5, rect1.j + .5];
	var p2 = [rect2.i + .5, rect2.j + .5];
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			if(inRect(p1, p2, [i + .5, j + .5])) click(i, j);
		}
	}
}

//p is within diamond with corners p1 and p2
function inDiamond(p1, p2, p) {
	return inRect(rotateScale(p1), rotateScale(p2), rotateScale(p));
}

function inRect(p1, p2, p) {
	var x1 = p1[0];
	var y1 = p1[1];
	var x2 = p2[0];
	var y2 = p2[1];
	var x = p[0];
	var y = p[1];
	return x <= Math.max(x1, x2) && x >= Math.min(x1, x2) && y <= Math.max(y1, y2) && y >= Math.min(y1, y2);
}

//Rotates by 45 and scales
function rotateScale(p) {
	var qx = p[0] + p[1];
	var qy = -p[0] + p[1];
	return [qx, qy];
}

function clear() {
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			tableRects[i][j].tiled = 0;
			formatColor(tableRects[i][j]);
		}
	}
}

function formatColor(rect) {
	if(rect.toTile) {
		rect.setAttribute('fill', tileSelectColor);
	} else {
		if(rect.tiled) {
			rect.setAttribute('fill', pickedColor);
		} else {
			rect.setAttribute('fill', backgroundColor);
		}
	}
}

$(document).ready(function() {
	for(var i = 0; i < h; i++) {
		rowRects = [];
		for(var j = 0; j < w; j++) {
			var rect = document.createElementNS(svgNS,'rect');
			rect.setAttribute('x', margin + j*(l + padding));
			rect.setAttribute('y', margin + i*(l + padding));
			rect.setAttribute('width', l);
			rect.setAttribute('height', l);
			rect.i = i;
			rect.j = j;
			//Toggles upon click
			rect.tiled = 0;
			//Toggles upon click when selectingTile
			rect.toTile = false;
			formatColor(rect);
			rect.onmouseover = function(e) {
				if(nodeKeyDown)
					rect.toTile = true;
					formatColor(rect);
			};
			rect.onmouseout = function(e) {
				if(nodeKeyDown) {
					rect.toTile = false;
					formatColor(rect);
				}
			};
			rect.onclick = (function handleClick(i, j) {
				return function(e) {
					if(tileKeyDown) {
						if(!selectingTile) {
							selectingTile = true;
							selectedTile = e.target;
							selectedTile.toTile = true;
							formatColor(selectedTile);
						} else {
							selectingTile = false;
							selectedTile.toTile = false;
							clickRect(selectedTile, e.target);
						}
					} else {
						click(i, j);
					}
				};
			})(i, j);
			svg.appendChild(rect);
			rowRects.push(rect);
		}
		tableRects.push(rowRects);
	}

	for(var i = 0; i < h + 1; i++) {
		rowNodes = [];
		for(var j = 0; j < w + 1; j++) {
			var node = document.createElementNS(svgNS, 'circle');
			node.setAttribute('i', i);
			node.setAttribute('j', j);
			node.setAttribute('cx', margin + j*(l + padding));
			node.setAttribute('cy', margin + i*(l + padding));
			node.setAttribute('r', nodeRadius);
			node.setAttribute('fill', invis);
			node.onmouseover = function(e) {if(nodeKeyDown) e.target.setAttribute('fill', nodeSelectColor);};
			node.onmouseout = function(e) {
				if(e.target != selectedNode) e.target.setAttribute('fill', invis);
			};
			node.onclick = function(e) {
				if(nodeKeyDown) {
					if(!selectingNode) {
						selectingNode = true;
						selectedNode = e.target;
					} else {
						selectingNode = false;
						clickDiamond(selectedNode, e.target);
						selectedNode.setAttribute('fill', invis);
						selectedNode = null;
					}
				}
			}
			svg.appendChild(node);
			rowNodes.push(node);
		}
		tableNodes.push(rowNodes);
	}

	document.body.appendChild(svg);
	$('#calculator').click(function() {
		var tilings = computeTilings();  
		document.getElementById("result").innerHTML = "Number of Tilings: " + tilings;
	});
	$('#clear').click(clear);

	$(document).keydown(function(e) {
		if(e.which == nodeKey) nodeKeyDown = true;
		if(e.which == tileKey) tileKeyDown = true;
	})
	$(document).keyup(function(e) {
		if(e.which == nodeKey) {
			if(selectedNode) {
				selectedNode.setAttribute('fill', invis);
				selectedNode = null;
				selectingNode = false;
			}
			nodeKeyDown = false;
		}
		if(e.which == tileKey) {
			if(selectedTile) {
				selectedTile.toTile = false;
				selectingTile = false;
				formatColor(selectedTile);
			}
			tileKeyDown = false;
		}
	})

	$(document).mousemove(function(e) {
		// if(mouseDown) console.log(e);
	})
});
