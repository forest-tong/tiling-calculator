/**
Tiling Calculator
Forest Tong
**/
//TODO:
//Some way of recording numbers?
//make Aztec rectangle work in other directions of selection
//option to apply checkerboard coloring

var padding = 1;
var nodeRadius = 7;
var margin = nodeRadius;
var backgroundColor = '#EBE7CC';
var pickedColor = '#A0C4EB';
// var nodeSelectColor = 'rgba(0, 0, 256, 0.2)';
var nodeSelectColor = 'rgba(255, 153, 0, 0.4)';
var tileSelectColor = nodeSelectColor;
var invis = 'rgba(0, 0, 0, 0)';
var boardWidth = 810;
var boardHeight = boardWidth;
var h = 10;
var w = 10;

var grid;

var svg = document.getElementById('board');
svg.setAttribute('height', 2*margin + boardHeight);
svg.setAttribute('width', 2*margin + boardWidth);
var svgNS = svg.namespaceURI;

var selectedNode = null; //only valid when selectingNode
var selectedTile = null; //only valid when selectingTile
var selectingNode = false;
var selectingTile =false;
var mouseDiamond = null;
// var nodeKey = 68;
// var tileKey = 82;
var nodeKey = 91;
var tileKey = 16;
var calculateKey = 13;
var nodeKeyDown = false;
var tileKeyDown = false;
var mouseDown = false;

var Grid = function(h, w) {
	this.h = h;
	this.w = w;
	this.tableRects = [];
	this.tableNodes = [];
	for(var i = 0; i < h; i++) {
		var rowRects = [];
		for(var j = 0; j < w; j++) {
			var l = (boardWidth - w*padding)/w;
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
			this.formatColorRect(rect);
			rect.onclick = (function(grid) {
				return function(e) {
					if(tileKeyDown) {
						if(!selectingTile) {
							selectingTile = true;
							selectedTile = e.target;
							selectedTile.toTile = true;
							grid.formatColorRect(selectedTile);
						} else {
							selectingTile = false;
							selectedTile.toTile = false;
							grid.formatColorRect(selectedTile);
							grid.clickRect(selectedTile, e.target);
						}
					} else {
						grid.toggleClick(e.target);
					}
				};
			})(this);
			rowRects.push(rect);
		}
		this.tableRects.push(rowRects);
	}

	for(var i = 0; i < h + 1; i++) {
		var rowNodes = [];
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
			node.onmouseover = (function(grid) {
				return function(e) {
					if(nodeKeyDown) {
						e.target.highlighted = true;
						grid.formatColorNode(e.target);
					}
				};
			})(this);
			node.onmouseout = (function(grid) {
				return function(e) {
					if(e.target.highlighted) {
						e.target.highlighted = false;
						grid.formatColorNode(e.target);
					}
				};
			})(this);
			node.onclick = (function(grid) {
				return function(e) {
					if(nodeKeyDown) {
						if(!selectingNode) {
							selectingNode = true;
							selectedNode = e.target;
							selectedNode.clicked = true;
							grid.formatColorNode(selectedNode);
						} else {
							selectingNode = false;
							selectedNode.clicked = false;
							grid.formatColorNode(selectedNode);
							grid.clickDiamond(selectedNode, e.target);
							mouseDiamond.setAttribute('visibility', 'hidden');
						}
					}
				};
			})(this);
			rowNodes.push(node);
		}
		this.tableNodes.push(rowNodes);
	}
}

Grid.prototype.formatColorRect = function(rect) {
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

Grid.prototype.formatColorNode = function(node) {
	if(node.highlighted || node.clicked) {
		node.setAttribute('fill', nodeSelectColor);
	} else {
		node.setAttribute('fill', invis);
	}
}

Grid.prototype.click = function(rect) {
	if(!rect.tiled) {
		rect.tiled = 1;
		this.formatColorRect(rect);
	}
}

Grid.prototype.toggleClick = function(rect) {
	if(rect.tiled) {
		rect.tiled = 0;
	} else {
		rect.tiled = 1;
	}
	this.formatColorRect(rect);
}

Grid.prototype.clear = function() {
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			this.tableRects[i][j].tiled = 0;
			this.formatColorRect(this.tableRects[i][j]);
		}
	}
}

Grid.prototype.inRect = function(p1, p2, p) {
	var x1 = p1[0];
	var y1 = p1[1];
	var x2 = p2[0];
	var y2 = p2[1];
	var x = p[0];
	var y = p[1];
	return x <= Math.max(x1, x2) && x >= Math.min(x1, x2) 
	&& y <= Math.max(y1, y2) && y >= Math.min(y1, y2);
}

//p is within diamond with corners p1 and p2
Grid.prototype.inDiamond = function(p1, p2, p) {
	return this.inRect(this.rotateScale(p1), this.rotateScale(p2), this.rotateScale(p));
}

//Rotates by 45 and scales
Grid.prototype.rotateScale = function(p) {
	var qx = p[0] + p[1];
	var qy = -p[0] + p[1];
	return [qx, qy];
}

Grid.prototype.clickRect = function(rect1, rect2) {
	var p1 = [rect1.i + .5, rect1.j + .5];
	var p2 = [rect2.i + .5, rect2.j + .5];
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			if(this.inRect(p1, p2, [i + .5, j + .5])) this.click(this.tableRects[i][j]);
		}
	}
}

Grid.prototype.clickDiamond = function(node1, node2) {
	var p1 = [node1.i, node1.j];
	var p2 = [node2.i, node2.j];
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			if(this.inDiamond(p1, p2, [i + .5, j + .5])) {
				this.click(this.tableRects[i][j]);
			}
		}
	}
}

Grid.prototype.returnTiled = function() {
	var table = [];
	for(var i = 0; i < h; i++) {
		var row = [];
		for(var j = 0; j < w; j++) {
			row.push(this.tableRects[i][j].tiled);
		}
		table.push(row);
	}
	return table;
}

function addGridRects(grid) {
	for(var i = 0; i < grid.tableRects.length; i++) {
		for(var j = 0; j < grid.tableRects[0].length; j++) {
			svg.appendChild(grid.tableRects[i][j]);
		}
	}
}

function addGridNodes(grid) {
	for(var i = 0; i < grid.tableNodes.length; i++) {
		for(var j = 0; j < grid.tableNodes[0].length; j++) {
			svg.appendChild(grid.tableNodes[i][j]);
		}
	}
}

function removeGrid(grid) {
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			svg.removeChild(grid.tableRects[i][j]);
		}
	}
	for(var i = 0; i < h + 1; i++) {
		for(var j = 0; j < w + 1; j++) {
			svg.removeChild(grid.tableNodes[i][j]);
		}
	}
}

$(document).ready(function() {
	var webWorker;
	var factorizeWorker;
	var numTilings;
	//Order is important! The nodes must remain clickable above the mouseDiamond
	grid = new Grid(h, w);
	addGridRects(grid);
	mouseDiamond = document.createElementNS(svgNS,'rect');
	mouseDiamond.setAttribute('fill', nodeSelectColor);
	mouseDiamond.setAttribute('visibility', 'hidden');
	svg.appendChild(mouseDiamond);
	addGridNodes(grid);
	document.body.appendChild(svg);

	function startTilingCalculation() {
		if(typeof(Worker) !== "undefined") {
			if(typeof(webWorker) === "undefined") {
				document.getElementById("result").innerHTML = "Number of Tilings: Calculating...";
				webWorker = new Worker("tilingWorker.js");
				webWorker.onmessage = function(event) {
					document.getElementById("result").innerHTML = "Number of Tilings: " + event.data;
					numTilings = event.data;
					webWorker.terminate();
					webWorker = undefined;
				};
				webWorker.postMessage(grid.returnTiled());
			} else {
				console.log("Calculation already started");
			}
		} else {
			document.getElementById("result").innerHTML = "Sorry! No Web Worker support.";
		}
	}

	function stopTilingCalculation() {
		if(typeof(Worker) !== "undefined") {
			if(typeof(webWorker) !== "undefined") {
				document.getElementById("result").innerHTML = "Number of Tilings: ";
				webWorker.terminate();
				webWorker = undefined;
			}
		} else {
			document.getElementById("result").innerHTML = "Sorry! No Web Worker support.";
		}
	}

	function startFactorization() {
		if(typeof(Worker) !== "undefined") {
			if(numTilings !== null) {
				if(typeof(factorizeWorker) === "undefined") {
					// document.getElementById("result").innerHTML = "Number of Tilings: " + numTilings + " = Factorizing..."
					factorizeWorker = new Worker("factorizeWorker.js");
					factorizeWorker.onmessage = function(event) {
						document.getElementById("result").innerHTML = "Number of Tilings: " + numTilings + " = " + event.data;
						factorizeWorker.terminate();
						factorizeWorker = undefined;
					};
					factorizeWorker.postMessage(numTilings);
				} else {
					console.log("Factorization already started");
				}
			} else {
				console.log("Region has not been defined");
			}
		} else {
			document.getElementById("result").innerHTML = "Sorry! No Web Worker support.";
		}
	}

	function stopFactorization() {
		if(typeof(Worker) !== "undefined") {
			if(typeof(factorizeWorker) !== "undefined") {
				document.getElementById("result").innerHTML = "Number of Tilings: " + numTilings;
				factorizeWorker.terminate();
				factorizeWorker = undefined;
			}
		} else {
			document.getElementById("result").innerHTML = "Sorry! No Web Worker support.";
		}
	}
	$('#factorize').click(function() {
		startFactorization();
	})
	$('#calculator').click(function() {
		startTilingCalculation();
	});
	$('#stop').click(function() {
		stopTilingCalculation();
		stopFactorization();
	})
	$('#clear').click(function() {
		grid.clear();
		document.getElementById("result").innerHTML = "Number of Tilings: ";
		numTilings = null;
	});

	$('#increase').click(function() {
		removeGrid(grid);
		svg.removeChild(mouseDiamond);

		var table = grid.returnTiled();
		h++; w++;
		grid = new Grid(h, w);
		for(var i = 0; i < h - 1; i++) {
			for(var j = 0; j < w - 1; j++) {
				grid.tableRects[i][j].tiled = table[i][j];
				grid.formatColorRect(grid.tableRects[i][j]);
			}
		}
		
		addGridRects(grid);
		svg.appendChild(mouseDiamond);
		addGridNodes(grid);
	})
	$('#decrease').click(function() {
		if(h > 1 && w > 1) {
			removeGrid(grid);
			svg.removeChild(mouseDiamond);

			var table = grid.returnTiled();
			h--; w--;
			grid = new Grid(h, w);
			for(var i = 0; i < h; i++) {
				for(var j = 0; j < w; j++) {
					grid.tableRects[i][j].tiled = table[i][j];
					grid.formatColorRect(grid.tableRects[i][j]);
				}
			}

			addGridRects(grid);
			svg.appendChild(mouseDiamond);
			addGridNodes(grid);
		}
	})

	$(document).keydown(function(e) {
		if(e.which == nodeKey) nodeKeyDown = true;
		if(e.which == tileKey) tileKeyDown = true;
		if(e.which == calculateKey) {
			startTilingCalculation();
		}
	})
	$(document).keyup(function(e) {
		if(e.which == nodeKey) {
			if(selectedNode) {
				selectingNode = false;
				selectedNode.clicked = false;
				grid.formatColorNode(selectedNode);
				mouseDiamond.setAttribute('visibility', 'hidden');
			}
			nodeKeyDown = false;
		}
		if(e.which == tileKey) {
			if(selectedTile) {
				selectedTile.toTile = false;
				selectingTile = false;
				grid.formatColorRect(selectedTile);
			}
			tileKeyDown = false;
		}
	})

	$(document).mousemove(function(e) {
		if(nodeKeyDown && selectingNode) {
			var x = e.pageX - $('#board').offset().left;
			var y = e.pageY - $('#board').offset().top;
			var cx = parseInt(selectedNode.getAttribute('cx'));
			var cy = parseInt(selectedNode.getAttribute('cy'));

			var width = ((y - cy) + (x - cx))/Math.SQRT2;
			var height = ((y - cy) - (x - cx))/Math.SQRT2;

			if(mouseDiamond.getAttribute('visibility') == 'hidden') {
				mouseDiamond.setAttribute('visibility', 'visible');
				mouseDiamond.setAttribute('transform', 'rotate(45 ' + cx + ' ' + cy + ')');
			}

			mouseDiamond.setAttribute('x', cx);
			mouseDiamond.setAttribute('y', cy);

			if(width > 0 && height > 0) {
				mouseDiamond.setAttribute('width', width);
				mouseDiamond.setAttribute('height', height);
			}
		}
	})
});
