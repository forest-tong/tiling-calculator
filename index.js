/**
Tiling Calculator
Forest Tong
**/
//TODO: adjust grid size
//button for stopping calculation
//Some way of recording numbers
//Explanation of how to use it
//better way of showing busy

var padding = 1;
var nodeRadius = 7;
var margin = nodeRadius;
var backgroundColor = '#EBE7CC';
var pickedColor = '#A0C4EB';
// var nodeSelectColor = 'rgba(0, 0, 256, 0.2)';
var nodeSelectColor = 'rgba(255, 153, 0, 0.4)';
var tileSelectColor = nodeSelectColor;
var invis = 'rgba(0, 0, 0, 0)';
var boardWidth = 1010;
var boardHeight = boardWidth;
var h = 10;
var w = 10;
var l = (boardWidth - w*padding)/w;

var tableRects = [];
var tableNodes = [];
var svg = document.getElementById('board');
svg.setAttribute('height', 2*margin + boardHeight);
svg.setAttribute('width', 2*margin + boardWidth);
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

	var numTilings = math.det(math.matrix(K));
	if(typeof numTilings == "number") {
		return numTilings;
	} else {
		//One of these will be zero
		return Math.abs(numTilings.re) + Math.abs(numTilings.im);
	}

}

function click(i, j) {
	var rect = tableRects[i][j];
	if(!rect.tiled) {
		rect.tiled = 1;
		formatColorRect(rect);
	}
}

function toggleClick(i, j) {
	var rect = tableRects[i][j];
	if(rect.tiled) {
		rect.tiled = 0;
	} else {
		rect.tiled = 1;
	}
	formatColorRect(rect);
}

function clickDiamond(node1, node2) {
	var p1 = [node1.i, node1.j];
	var p2 = [node2.i, node2.j];
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			if(inDiamond(p1, p2, [i + .5, j + .5])) {
				click(i, j);
			}
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
			formatColorRect(tableRects[i][j]);
		}
	}
}

function formatColorRect(rect) {
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

function formatColorNode(node) {
	if(node.highlighted || node.clicked) {
		node.setAttribute('fill', nodeSelectColor);
	} else {
		node.setAttribute('fill', invis);
	}
}

function generateSVG() {
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
			formatColorRect(rect);
			rect.onmouseover = function(e) {
				// if(tileKeyDown) {
				// 	e.target.toTile = true;
				// 	formatColorRect(e.target);
				// }
			};
			rect.onmouseout = function(e) {
				// if(tileKeyDown) {
				// 	e.target.toTile = false;
				// 	formatColorRect(e.target);
				// }
			};
			rect.onclick = (function handleClick(i, j) {
				return function(e) {
					l = 50;
					if(tileKeyDown) {
						if(!selectingTile) {
							selectingTile = true;
							selectedTile = e.target;
							selectedTile.toTile = true;
							formatColorRect(selectedTile);
						} else {
							selectingTile = false;
							selectedTile.toTile = false;
							clickRect(selectedTile, e.target);
						}
					} else {
						toggleClick(i, j);
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
			node.setAttribute('cx', margin + j*(l + padding));
			node.setAttribute('cy', margin + i*(l + padding));
			node.setAttribute('r', nodeRadius);
			node.setAttribute('fill', invis);
			node.i = i;
			node.j = j;
			node.highlighted = false;
			node.clicked = false;
			node.onmouseover = function(e) {
				if(nodeKeyDown) {
					e.target.highlighted = true;
					formatColorNode(e.target);
				}
			};
			node.onmouseout = function(e) {
				if(e.target.highlighted) {
					e.target.highlighted = false;
					formatColorNode(e.target);
				}
			};
			node.onclick = function(e) {
				if(nodeKeyDown) {
					if(!selectingNode) {
						selectingNode = true;
						selectedNode = e.target;
						selectedNode.clicked = true;
						formatColorNode(selectedNode);
					} else {
						selectingNode = false;
						selectedNode.clicked = false;
						formatColorNode(selectedNode);
						clickDiamond(selectedNode, e.target);
					}
				}
			}
			svg.appendChild(node);
			rowNodes.push(node);
		}
		tableNodes.push(rowNodes);
	}

	document.body.appendChild(svg);
}

$(document).ready(function() {
	generateSVG();

	var calculateTilings = function() {
		var tilings = computeTilings();
		document.getElementById("result").innerHTML = "Number of Tilings: " + tilings;
	}
	$('#calculator').click(function() {
		(function(callback) {
			document.getElementById("result").innerHTML = "Number of Tilings: ";
			$.ajax({complete: calculateTilings});
		})(calculateTilings);
	});
	$('#clear').click(clear);

	$(document).keydown(function(e) {
		if(e.which == nodeKey) nodeKeyDown = true;
		if(e.which == tileKey) tileKeyDown = true;
	})
	$(document).keyup(function(e) {
		if(e.which == nodeKey) {
			if(selectedNode) {
				selectingNode = false;
				selectedNode.clicked = false;
				formatColorNode(selectedNode);
			}
			nodeKeyDown = false;
		}
		if(e.which == tileKey) {
			if(selectedTile) {
				selectedTile.toTile = false;
				selectingTile = false;
				formatColorRect(selectedTile);
			}
			tileKeyDown = false;
		}
	})

	$(document).mousemove(function(e) {
		// if(mouseDown) console.log(e);
	})
});
