// Browser detection for when you get desparate. A measure of last resort.

// http://rog.ie/post/9089341529/html5boilerplatejs
// sample CSS: html[data-useragent*='Chrome/13.0'] { ... }

// Uncomment the below to use:
// var b = document.documentElement;
// b.setAttribute('data-useragent',  navigator.userAgent);
// b.setAttribute('data-platform', navigator.platform);

	
function initPage(){

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

		var _r = result; 	//register incoming FileReader Results
		var _lower_r;		//converted to Lower case
		var _split_lr = new Array();		//split the lines of the result into an array
		var _sorted_slr;		//sorted and matched sections of the original array


		if ( _r != null){

			_lower_r = _r.toLowerCase();  //Convert the string to lowercase
			_split_lr = splitString(_lower_r);  //Split the string up into an array
			console.log("Split Array:", _split_lr)
			_sorted_slr = sortArray(_split_lr);
			console.log("Sorted Array:", _sorted_slr)

			console.log(_sorted_slr);
			console.log("Sending to CSV");

			JSONToCSVConvertor(_sorted_slr.chatLogItem, "ChatLog_Parse", true);

		}else {

			alert("Something isn't right!");

		}
	}

	function sortArray(arr){
		var raw_arr = arr;
		var obj = {
			chatLogItem: []
		};

		console.log("Starting Sort");
		
		for ( var i = 0; i < raw_arr.length; i++){
			matchString(raw_arr[i], obj);  //send in one line of the array (a string)
		}

		console.log("Finished");

		return obj;


	}

	//actually split the File itself.
	function splitString(str){

		var workingText = str;
		var splitEnds = new RegExp('\\n', 'g')
		var tempStorage = workingText.split(splitEnds)			//createArrayForFile();

		return tempStorage;
	}

	function matchString(str, obj){
		var raw_str = str;
							var tempItem = new Object;
							var temp_o = new Object;
		var o = obj;	//json object created and passed in
		var withinBrackets_re = new RegExp('[^\\b\\s](?!\\[)(.*?)\](?!\\]:)', 'g');	//gather everything in brackets
		var testTime_re = new RegExp('(\\d+\\:\\d+\\:\\d+)','g');

		while ((m = withinBrackets_re.exec(raw_str)) !== null) {

			console.log("This is M:", m);

			if( testTime_re.exec(m[1]) !== null) {
				tempItem.time = (m[1]);
			}

			if (m[1].match("authenticator")){
				tempItem.user= "Hidden";
				tempItem.type = "User Authentication"; //Type of Event
				tempItem.details = "Hidden";
				//console.log("Temp:"+tempItem.user)
				break;
			} else if (m[1].match("server thread/info")) {
				temp_o = matchDetails(raw_str);
				if (temp_o != null) {
					tempItem.user = temp_o.user;
					tempItem.type = temp_o.type;
					tempItem.details = temp_o.details;
					break;

					console.log("Type:"+tempItem.type);
				} else{	
					console.log("Error Parsing Details");
					break;
				}

			} else if (m[1].match("server thread/warn")) {
				tempItem.user = "Server";
				tempItem.type = "Warning";
	
				var afterColon_re = new RegExp('\]:\(\.\+\)','g'); 		//gather everything after the colon
				
				if ((d = afterColon_re.exec(raw_str)) !== null) {
					var test_str = d[1];
					tempItem.details = test_str;
					break;
				}else{
					tempItem.details = "No Match to RegExp:: Parse Error";
					break;
				}		
			} else{
				tempItem.user = "Parse Error";
				tempItem.details = m[1];
			}
			
			if (m.index === withinBrackets_re.lastIndex){
				withinBrackets_re.lastIndex++;
			}


		}

		if (tempItem.user !== undefined && tempItem.user !== 'null'){
			o.chatLogItem.push({
			"Server Time" : tempItem.time,
			"User": tempItem.user,
			"Event Type" : tempItem.type,
			"Event Details" : tempItem.details
			})
		}

		console.log(o.chatLogItem);

	}



	function matchDetails(str){
		var s = str;
		var obj = new Object;
		var afterColon_re = new RegExp('\]:\(\.\+\)','g'); 		//gather everything after the colon
		var speaking_re = new RegExp('\[\^:\]<\(\.\*\?\)>', 'g')			//Check for Speaking
		var spoken_re = new RegExp('>\(\.\+\)', 'g')
		var userAchieve_re = new RegExp('\(\.\*\?\[\^\\w\]\)\(\?=\(\?:has just earned the achievement\)\)','g')
		var achieve_re = new RegExp('\(\?=\(\?:has just earned the achievement\)\)\.\*\\\[\(\.\*\?\)\\\]', 'g')

		if ((d = afterColon_re.exec(s)) !== null) {
			var test_str = d[1];
			var speaker = speaking_re.exec(test_str);

			//Check to see if it was a person speaking first
			if (speaker !== null){					
				var words = spoken_re.exec(test_str);
				obj.user = speaker[1].trim();
				obj.type = "Talking";
				obj.details = words[1].trim();
			} else {
				var det = test_str.trim();

				//console.log("Det :"+det)
				
				//If it wasn't a person speaking, see which other type of server info it was
				//Achievement get?
				if ( i = det.match("earned the achievement") !== null ) {

					var cur_User = userAchieve_re.exec(det);
					var cur_Achieve = achieve_re.exec(det);

					obj.user = cur_User[1].trim(); //Grabs user name of achievement earned!
					obj.type = "Achievement";
					obj.details = cur_Achieve[1].trim();
				}
			}
		} else	{
			console.log("Error in Details: "+d)
			return null;
		}
		return obj; //send back the array of text items

	}

	//Function from jsFiddle 
	//Convert JSON to CSV

	function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    //CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



};


//Scratch Pad

/*
	
	function escapeRegExp(str) {
  		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

				if (m[1].match("authenticator")){  
				continue;
			}
			else if (m[1].match("server thread/info")) {
				console.log(m[1]); //Works
			}
			else	

	function createJSON(){
		var chatJSON = {
			chatlogData: []
		}

		return chatJSON;
	}



var employees = {
    accounting: []
};

for(var i in someData) {

    var item = someData[i];

    employees.accounting.push({ 
        "firstName" : item.firstName,
        "lastName"  : item.lastName,
        "age"       : item.age 
    });
} 



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

		return listResults;*/