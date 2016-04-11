// Browser detection for when you get desparate. A measure of last resort.

// http://rog.ie/post/9089341529/html5boilerplatejs
// sample CSS: html[data-useragent*='Chrome/13.0'] { ... }

// Uncomment the below to use:
// var b = document.documentElement;
// b.setAttribute('data-useragent',  navigator.userAgent);
// b.setAttribute('data-platform', navigator.platform);


function initPage(){

	// your functions go here

	var files;

	$("#fileUploads").on("change", prepareUpload);

	//Grab the files and set them to the variable
	function prepareUpload(event)
	{
		files = event.target.files[0];
		console.log(files);
	}

	//When Submit button is pressed, start loading file into FileReader API
	$("#submitFile").click(function(e){

		e.preventDefault();

		var reader = new FileReader();
		reader.readAsText(files);

		reader.onloadstart = function(evt){
			console.log("File "+files[0]+" is being loaded.");
		}
		reader.onprogress = function(evt){
			console.log("File "+files+" upload in progress.");
		}

		reader.onloadend = function(evt){
			console.log("File "+files+" has been uploaded.");

			processFile(reader.result);
		}

	});

	//Process the file in steps
	function processFile(result){

		var _r = result;
		var _lower_r;
		var _matched_r;
		var _split_lr;		//split results
		var _clean_sr; 	//cleaned string of "Line"

		if ( _r != null){

			_lower_r = _r.toLowerCase();
			//_split_lr = splitString(_lower_r);  //Split the string up into an array
			//console.log(_split_lr);

			_matched_r = matchString(_lower_r);
			console.log(_matched_r);
			//_clean_sr = cleanString(_split_lr);
		}else {
			alert("Something isn't right!");
		}


	}

	//actually split the File itself.
	function splitString(str){

		var workingText = str;
		var tempStorage = workingText.split("\n")			//createArrayForFile();



		return tempStorage;
	}

	function matchString(str){

		var workingText = str;
		var matchedArr = workingText.match(/[^>]*?(?=<)/g);
		var listResults = new Array;
		var re = new RegExp("(\d+\/\d+\/\d+)");

		for (i = 0; i < matchedArr.length; i++) {
			if (matchedArr[i].length > 1 && matchedArr[i] != "report a problem"){
				if (re.test(matchedArr[i])) {
					
				}else{
					listResults.push(matchedArr[i]);
				}
					
				}
		}

		return listResults;
	}

	function cleanString(arr){
		var workingArr = arr;
		var i, j;
		var cleanedArr;

		//things to clean out
		var _cleanTarget = new Array;

		_cleanTarget.push("line");

		for (i = 0; i < workingArr.length; i++) {
			console.log("i = "+i);
			for( j = 0; j < _cleanTarget.length; j++) {
				console.log("j = "+j);
				cleanedArr.push(workingArr[i].search(_cleanTarget[j]));
			}
		}

		console.log(cleanedArr);
	}

};