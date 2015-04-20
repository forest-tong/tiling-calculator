// Based off the code at http://www.nayuki.io/res/calculate-prime-factorization-javascript.js

function primeFactorList(n) {
	if(n < 1) throw "Argument error";
	var result = [];
	while(n != 1) {
		var factor = smallestFactor(n);
		result.push(factor);
		n /= factor;
	}
	return result;
}

function smallestFactor(n) {
	if(n < 2) throw "Argument error";
	if(n % 2 == 0) return 2;
	var end = Math.floor(Math.sqrt(n));
	for(var i = 3; i <= end; i += 2) {
		if(n % i == 0) return i;
	}
	return n;
}

function toFactorPowerList(factors) {
	if(factors.length == 0) throw "Argument error";
	var result = [];
	var factor = factors[0];
	var count = 1;
	for(var i = 1; i < factors.length; i++) {
		if(factors[i] == factor) {
			count++;
		} else {
			result.push([factor, count]);
			factor = factors[i];
			count = 1;
		}
	}
	result.push([factor, count]);
	return result;
}

function factorize(numTilings) {
	if(numTilings == 0) {
		return "0";
	} else if(numTilings == 1) {
		return "1";
	} else if(numTilings >= 9007199254740992) {
		return "Number must be less than 2<sup>53</sup>";
	} else {
		var factors = primeFactorList(numTilings);
		var factorPowers = toFactorPowerList(factors);
		var factorization = "";
		for(var i = 0; i < factorPowers.length; i++) {
			factorization += factorPowers[i][0];
			if(factorPowers[i][1] > 1) {
				factorization += "<sup>" + factorPowers[i][1] + "</sup>";
			}
			if(i < factorPowers.length - 1) {
				factorization += " \u00D7 "
			}
		}
		return factorization;
	}
}

self.addEventListener("message", function(e) {
	factorization = factorize(e.data);
	postMessage(factorization);
});