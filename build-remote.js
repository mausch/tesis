var clsiFile = WScript.Arguments(0); // e.g. tesis.clsi.xml
var baseName = clsiFile.split('.')[0];

var clsiUrl = 'http://clsi.scribtex.com/clsi/compile';

var fso = WScript.CreateObject('Scripting.FileSystemObject');

function print(s) { WScript.Echo(s); }

function post(filename) {
	var request = new ActiveXObject('MSXML2.XMLHTTP.3.0');
	request.open('POST', clsiUrl, false);
	print(filename);
	var file = fso.OpenTextFile(filename, 1);
	var content = file.ReadAll();
	file.Close();
	request.send(content);
	return request.responseXML;
}

function get(url) {
	print("GETting " + url);
	var request = new ActiveXObject('MSXML2.XMLHTTP.3.0');
	request.open('GET', url, false);
	request.send();
	return request.responseBody;
}

function writeToFile(file, content) {
	var str = WScript.CreateObject("ADODB.Stream");
	str.mode = 3;
	str.type = 1;
	str.open();
	str.write(content);
	str.saveToFile(file, 2);
}

function saveToFile(url, filename) {
	var log = get(url);
	if (!filename) {
		filename = url.split('/');
		filename = filename[filename.length-1];
	}
	writeToFile(filename, log);
}

function saveLog(response) {
	var urlNode = response.selectSingleNode("//logs/file");
	if (urlNode == null)
		return;
	var url = urlNode.getAttribute('url');
	saveToFile(url, baseName + '.log');
}

var response = post(clsiFile);
saveLog(response);

var status = response.selectSingleNode("//status").text;
if (status != 'success') {
	var error = response.selectSingleNode("//error");
	var errorType = error.selectSingleNode("type").text;
	var errorMessage = error.selectSingleNode("message").text;
	print("Error compiling LaTeX: ");
	print(errorType);
	print(errorMessage);
	WScript.Quit(1);
}
var outputUrl = response.selectSingleNode("//output/file").getAttribute('url');
saveToFile(outputUrl, baseName + '.pdf');