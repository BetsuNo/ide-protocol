// URL format ide://open?url=file:///mnt/d/projects/zengram/zengram-advanced/legacy/components/routes/Filter.php&line=26
// wscript handle.js -ideBinary="c:\Program Files\JetBrains\PhpStorm 2017.3.2\bin\phpstorm64.exe" -ideArguments="--line {line} {file}" -aliasFrom=/mnt/d -aliasTo=D: "ide://open?url=file:///mnt/d/projects/zengram/zengram-advanced/legacy/components/routes/Filter.php&line=26"

try {
	var env = getArguments();
	if (!env.ideBinary || !env.ideArguments) {
		throw new Error('IDE binary path or command line arguments is not set');
	}

	var url = parseURL(env.url);
	if (!url.query.url || !url.query.line) {
		throw new Error('Bad url format');
	}

	var path = parseURL(url.query.url).path;
	if (env.aliasFrom && env.aliasTo) {
		path = path.replace(new RegExp('^' + env.aliasFrom), env.aliasTo);
	}

	var command = '"' + env.ideBinary + '" ' + env.ideArguments
			.replace('{file}', '"' + path.replace(/\//g, '\\') + '"')
			.replace('{line}', url.query.line);

	var	shell = new ActiveXObject('WScript.Shell');
	shell.Exec(command);
	shell.AppActivate('IDE Protocol Handler');
} catch (e) {
	try {
		WScript.StdErr.WriteLine(e.name + ': ' + e.message);
	} catch (_e) {
		WScript.Echo(e.name + ': ' + e.message);
	}
}

function getArguments()
{
	var args = WScript.Arguments,
		data = {
			url: '',
			ideBinary: '',
			ideArguments: '',
			aliasFrom: '',
			aliasTo: ''
		};

	for (var i = 0; i < args.length - 1; i++)
	{
		var res = /^-(\w+)=(.*)$/.exec(args(i));
		if (res === null) {
			throw new Error('Wrong argument format "' + args(i) + '"');
		}
		var name = res[1],
			value = res[2];
		if (!data.hasOwnProperty(name)) {
			throw new Error('Unknown property "' + name + '"');
		}
		data[name] = String(value);
	}
	data.url = args(args.length - 1);

	return data;
}

function parseURL(string)
{
	var parts = /^(\w+):\/\/([\w\.-]+)?((?:(?:\/+[\w\.%_ -]+)+)?)\/*(?:\?([^#]+))?(?:#(.+))?$/.exec(string);
	if (parts === null) {
		throw new Error('Bad URL string: "' + string + '"');
	}

	for (var i = 1; i <= 5; i++)
	{
		parts[i] = parts[i] || '';
	}

	var queryParts = parts[4].split('&');
	var query = [];
	for (i = 0;  i < queryParts.length; i++)
	{
		var part = queryParts[i].split('=');
		query[decodeURI(part[0])] = decodeURI(part[1]);
	}

	return {
		scheme: parts[1],
		host: parts[2],
		path: parts[3],
		query: query,
		hash: parts[5]
	};
}