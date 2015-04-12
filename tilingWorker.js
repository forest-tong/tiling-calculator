function calculateTilings(table) {
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

self.addEventListener("message", function(e) {
	tilings = calculateTilings(e.data);
	postMessage(tilings);
});