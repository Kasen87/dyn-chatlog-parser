// Browser detection for when you get desparate. A measure of last resort.

// http://rog.ie/post/9089341529/html5boilerplatejs
// sample CSS: html[data-useragent*='Chrome/13.0'] { ... }

// Uncomment the below to use:
// var b = document.documentElement;
// b.setAttribute('data-useragent',  navigator.userAgent);
// b.setAttribute('data-platform', navigator.platform);

	
function initPage(){
	var files;
	$("#fileUploads").on("change", function(event){files = event.target.files[0];});
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
			processFile(reader.result); //Start Processing the File
		}
	});

	function processFile(result){
		var showData = [];
		var showAssessment = [];
		var showHeaders = [];

		var r = result;
		lines = r.split('\r');

		lines.forEach(function(element) {
			showData.push(element.split(','));
		})

		showData.forEach(function(element){
			if(element == showData[0]){
				showHeaders = showData[0];
				console.log(showHeaders.length);
			}else{
				var tempObj = {}
				for(i = 0; i < showHeaders.length; i++){
					tempObj[ showHeaders[i] ] = element[i];
				}
				showAssessment.push(tempObj);
				//Next step is to process the true/false ratio and return a value
				//Then populate a selection box with the show titles to choose from
			}
		})
	}
};