/**
Tiling Calculator
Forest Tong
**/
//TODO:
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

Grid.prototype.calculateTilings = function() {
	var table = this.returnTiled();

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

var showTilingCalculation = function() {
	var tilings = grid.calculateTilings();
	document.getElementById("result").innerHTML = "<font size='3px'><b>Number of Tilings: " + tilings + "</b></font>";
}

$(document).ready(function() {
	//Order is important! The nodes must remain clickable above the mouseDiamond
	grid = new Grid(h, w);
	addGridRects(grid);
	mouseDiamond = document.createElementNS(svgNS,'rect');
	mouseDiamond.setAttribute('fill', nodeSelectColor);
	mouseDiamond.setAttribute('visibility', 'hidden');
	svg.appendChild(mouseDiamond);
	addGridNodes(grid);
	document.body.appendChild(svg);

	$('#calculator').click(function() {
		(function(callback) {
			document.getElementById("result").innerHTML = "<font size='3px'><b>Number of Tilings: </b></font>";
			$.ajax({complete: showTilingCalculation});
		})(showTilingCalculation);
	});
	$('#clear').click(function() {
		grid.clear();
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
			(function(callback) {
				document.getElementById("result").innerHTML = "Number of Tilings: ";
				$.ajax({complete: showTilingCalculation});
			})(showTilingCalculation);
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
