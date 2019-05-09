
var schemeName = prompt('Enter the scheme name', 'ide', function (newVal) {
	if (!newVal) {
		return true;
	}
	return /^\w+$/.test(newVal);
});

var registry = Registry(0x80000002);
var idePath = suggestIdePath(registry);
idePath = prompt('Enter IDE binary path', idePath);

var ideArgs = prompt('Enter IDE CLI arguments', '--line {line} {file}');

var aliasFrom = aliasTo = '';
if (prompt('Set path mapping?', 'N/y') === 'y') {
	aliasFrom = prompt('Enter remote alias', '');
	aliasTo = prompt('Enter local alias', '');
}

WScript.StdOut.WriteBlankLines(1);
WScript.StdOut.WriteLine('Scheme name: ' + schemeName);
WScript.StdOut.WriteLine('IDE binary path: ' + idePath);
WScript.StdOut.WriteLine('IDE CLI arguments: ' + ideArgs);
if (aliasFrom && aliasTo) {
	WScript.StdOut.WriteLine('Remote path mapping alias: ' + aliasFrom);
	WScript.StdOut.WriteLine('Local path mapping alias: ' + aliasTo);
}
WScript.StdOut.WriteBlankLines(1);

prompt('Press Enter to continue');

var handler = WScript.ScriptFullName.replace(new RegExp(WScript.ScriptName + '$'), '') + 'handle.js';
var command = 'wscript "' + handler + '"'
	 + ' -ideBinary="' + idePath + '"'
	 + ' -ideArguments="' + ideArgs + '"'
	 + ' -aliasFrom="' + aliasFrom + '"'
	 + ' -aliasTo="' + aliasTo + '" "%1"'

var path = 'SOFTWARE\\Classes\\' + schemeName;
registry.CreateKey(path);
registry.SetStringValue(path, 'URL Protocol', '');

path += '\\shell\\open\\command';
registry.CreateKey(path);
registry.SetStringValue(path, null, command);

function Registry(hDefKey)
{
	var ro = GetObject('winmgmts://./root/default:StdRegProv');

	function callMethod(methodName, args)
	{
		var method = ro.Methods_.Item(methodName),
			params = method.InParameters.SpawnInstance_();

		params.hDefKey = hDefKey;
		for (var key in args)
		{
			if (args.hasOwnProperty(key)) {
				params[key] = args[key];
			}
		}

		return ro.ExecMethod_(method.Name, params);
	}

	return {
		CreateKey: function (path) {
			return callMethod('CreateKey', {
				sSubKeyName: path
			});
		},
		EnumKey: function (path) {
			var result = callMethod('EnumKey', {
				sSubKeyName: path
			});
			if (result.sNames !== null) {
				return result.sNames.toArray();
			}
			return null;
		},
		GetStringValue: function (path, name) {
			var result = callMethod('GetStringValue', {
				sSubKeyName: path,
				sValueName: name
			});
			return result.sValue;
		},
		SetStringValue: function (path, valueName, value) {
			return callMethod('SetStringValue', {
				sSubKeyName: path,
				sValueName: valueName,
				sValue: value
			});
		}
	};
}

function suggestIdePath(registry)
{
	var keys = ['SOFTWARE\\JetBrains\\PhpStorm', 'SOFTWARE\\WOW6432Node\\JetBrains\\PhpStorm'];
	var regPath = null;
	do {
		var path = keys.shift();
		var list = registry.EnumKey(path);
		if (list === null) {
			continue;
		}
		regPath = path + '\\' + list.pop();
	} while (keys.length);

	if (regPath === null) {
		return '';
	}

	var result = registry.GetStringValue(regPath, '');
	if (result === null) {
		return '';
	}

	var x64 = regPath.indexOf('WOW6432Node') >= 0;
	result += '\\bin\\phpstorm' + (x64 ? '64' : '') + '.exe';
	return result;
}

function prompt(text, defaultValue, check)
{
	var result;
	do {
		WScript.StdOut.Write(text + (defaultValue ? ' [' + defaultValue + ']' : '') + ': ');
		result = WScript.StdIn.ReadLine();
	} while (check && !check(result));
	return result ? result.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') : defaultValue;
}