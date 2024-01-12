/*
http://www.JSON.org/json2.js
2010-03-20

Public Domain.Testing

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

See http://www.JSON.org/js.html


This code should be minified before deployment.
See http://javascript.crockford.com/jsmin.html

USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
NOT CONTROL.


This file creates a global JSON object containing two methods: stringify
and parse.

JSON.stringify(value, replacer, space)
value       any JavaScript value, usually an object or array.

replacer    an optional parameter that determines how object
values are stringified for objects. It can be a
function or an array of strings.

space       an optional parameter that specifies the indentation
of nested structures. If it is omitted, the text will
be packed without extra whitespace. If it is a number,
it will specify the number of spaces to indent at each
level. If it is a string (such as '\t' or '&nbsp;'),
it contains the characters used to indent at each level.

This method produces a JSON text from a JavaScript value.

When an object value is found, if the object contains a toJSON
method, its toJSON method will be called and the result will be
stringified. A toJSON method does not serialize: it returns the
value represented by the name/value pair that should be serialized,
or undefined if nothing should be serialized. The toJSON method
will be passed the key associated with the value, and this will be
bound to the value

For example, this would serialize Dates as ISO strings.

Date.prototype.toJSON = function (key) {
function f(n) {
// Format integers to have at least two digits.
return n < 10 ? '0' + n : n;
}

return this.getUTCFullYear()   + '-' +
f(this.getUTCMonth() + 1) + '-' +
f(this.getUTCDate())      + 'T' +
f(this.getUTCHours())     + ':' +
f(this.getUTCMinutes())   + ':' +
f(this.getUTCSeconds())   + 'Z';
};

You can provide an optional replacer method. It will be passed the
key and value of each member, with this bound to the containing
object. The value that is returned from your method will be
serialized. If your method returns undefined, then the member will
be excluded from the serialization.

If the replacer parameter is an array of strings, then it will be
used to select the members to be serialized. It filters the results
such that only members with keys listed in the replacer array are
stringified.

Values that do not have JSON representations, such as undefined or
functions, will not be serialized. Such values in objects will be
dropped; in arrays they will be replaced with null. You can use
a replacer function to replace those with JSON values.
JSON.stringify(undefined) returns undefined.

The optional space parameter produces a stringification of the
value that is filled with line breaks and indentation to make it
easier to read.

If the space parameter is a non-empty string, then that string will
be used for indentation. If the space parameter is a number, then
the indentation will be that many spaces.

Example:

text = JSON.stringify(['e', {pluribus: 'unum'}]);
// text is '["e",{"pluribus":"unum"}]'


text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
// text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

text = JSON.stringify([new Date()], function (key, value) {
return this[key] instanceof Date ?
'Date(' + this[key] + ')' : value;
});
// text is '["Date(---current time---)"]'


JSON.parse(text, reviver)
This method parses a JSON text to produce an object or array.
It can throw a SyntaxError exception.

The optional reviver parameter is a function that can filter and
transform the results. It receives each of the keys and values,
and its return value is used instead of the original value.
If it returns what it received, then the structure is not modified.
If it returns undefined then the member is deleted.

Example:

// Parse the text. Values that look like ISO date strings will
// be converted to Date objects.

myData = JSON.parse(text, function (key, value) {
var a;
if (typeof value === 'string') {
a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
if (a) {
return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
+a[5], +a[6]));
}
}
return value;
});

myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
var d;
if (typeof value === 'string' &&
value.slice(0, 5) === 'Date(' &&
value.slice(-1) === ')') {
d = new Date(value.slice(5, -1));
if (d) {
return d;
}
}
return value;
});


This is a reference implementation. You are free to copy, modify, or
redistribute.
 */

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
lastIndex, length, parse, prototype, push, replace, slice, stringify,
test, toJSON, toString, valueOf
 */

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
	this.JSON = {};
}

(function () {

	function f(n) {
		// Format integers to have at least two digits.
		return n < 10 ? '0' + n : n;
	}

	if (typeof Date.prototype.toJSON !== 'function') {

		Date.prototype.toJSON = function (key) {

			return isFinite(this.valueOf()) ?
			this.getUTCFullYear() + '-' +
			f(this.getUTCMonth() + 1) + '-' +
			f(this.getUTCDate()) + 'T' +
			f(this.getUTCHours()) + ':' +
			f(this.getUTCMinutes()) + ':' +
			f(this.getUTCSeconds()) + 'Z' : null;
		};

		String.prototype.toJSON =
			Number.prototype.toJSON =
			Boolean.prototype.toJSON = function (key) {
			return this.valueOf();
		};
	}

	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	gap,
	indent,
	meta = { // table of character substitutions
		'\b' : '\\b',
		'\t' : '\\t',
		'\n' : '\\n',
		'\f' : '\\f',
		'\r' : '\\r',
		'"' : '\\"',
		'\\' : '\\\\'
	},
	rep;

	function quote(string) {

		// If the string contains no control characters, no quote characters, and no
		// backslash characters, then we can safely slap some quotes around it.
		// Otherwise we must also replace the offending characters with safe escape
		// sequences.

		escapable.lastIndex = 0;
		return escapable.test(string) ?
		'"' + string.replace(escapable, function (a) {
			var c = meta[a];
			return typeof c === 'string' ? c :
			'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' :
		'"' + string + '"';
	}

	function str(key, holder) {

		// Produce a string from holder[key].

		var i, // The loop counter.
		k, // The member key.
		v, // The member value.
		length,
		mind = gap,
		partial,
		value = holder[key];

		// If the value has a toJSON method, call it to obtain a replacement value.

		if (value && typeof value === 'object' &&
			typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}

		// If we were called with a replacer function, then call the replacer to
		// obtain a replacement value.

		if (typeof rep === 'function') {
			value = rep.call(holder, key, value);
		}

		// What happens next depends on the value's type.

		switch (typeof value) {
		case 'string':
			return quote(value);

		case 'number':

			// JSON numbers must be finite. Encode non-finite numbers as null.

			return isFinite(value) ? String(value) : 'null';

		case 'boolean':
		case 'null':

			// If the value is a boolean or null, convert it to a string. Note:
			// typeof null does not produce 'null'. The case is included here in
			// the remote chance that this gets fixed someday.

			return String(value);

			// If the type is 'object', we might be dealing with an object or an array or
			// null.

		case 'object':

			// Due to a specification blunder in ECMAScript, typeof null is 'object',
			// so watch out for that case.

			if (!value) {
				return 'null';
			}

			// Make an array to hold the partial results of stringifying this object value.

			gap += indent;
			partial = [];

			// Is the value an array?

			if (Object.prototype.toString.apply(value) === '[object Array]') {

				// The value is an array. Stringify every element. Use null as a placeholder
				// for non-JSON values.

				length = value.length;
				for (i = 0; i < length; i += 1) {
					partial[i] = str(i, value) || 'null';
				}

				// Join all of the elements together, separated with commas, and wrap them in
				// brackets.

				v = partial.length === 0 ? '[]' :
					gap ? '[\n' + gap +
					partial.join(',\n' + gap) + '\n' +
					mind + ']' :
					'[' + partial.join(',') + ']';
				gap = mind;
				return v;
			}

			// If the replacer is an array, use it to select the members to be stringified.

			if (rep && typeof rep === 'object') {
				length = rep.length;
				for (i = 0; i < length; i += 1) {
					k = rep[i];
					if (typeof k === 'string') {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			} else {

				// Otherwise, iterate through all of the keys in the object.

				for (k in value) {
					if (Object.hasOwnProperty.call(value, k)) {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			}

			// Join all of the member texts together, separated with commas,
			// and wrap them in braces.

			v = partial.length === 0 ? '{}' :
				gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
				mind + '}' : '{' + partial.join(',') + '}';
			gap = mind;
			return v;
		}
	}

	// If the JSON object does not yet have a stringify method, give it one.

	if (typeof JSON.stringify !== 'function') {
		JSON.stringify = function (value, replacer, space) {

			// The stringify method takes a value and an optional replacer, and an optional
			// space parameter, and returns a JSON text. The replacer can be a function
			// that can replace values, or an array of strings that will select the keys.
			// A default replacer method can be provided. Use of the space parameter can
			// produce text that is more easily readable.

			var i;
			gap = '';
			indent = '';

			// If the space parameter is a number, make an indent string containing that
			// many spaces.

			if (typeof space === 'number') {
				for (i = 0; i < space; i += 1) {
					indent += ' ';
				}

				// If the space parameter is a string, it will be used as the indent string.

			} else if (typeof space === 'string') {
				indent = space;
			}

			// If there is a replacer, it must be a function or an array.
			// Otherwise, throw an error.

			rep = replacer;
			if (replacer && typeof replacer !== 'function' &&
				(typeof replacer !== 'object' ||
					typeof replacer.length !== 'number')) {
				throw new Error('JSON.stringify');
			}

			// Make a fake root object containing our value under the key of ''.
			// Return the result of stringifying the value.

			return str('', {
				'' : value
			});
		};
	}

	// If the JSON object does not yet have a parse method, give it one.

	if (typeof JSON.parse !== 'function') {
		JSON.parse = function (text, reviver) {

			// The parse method takes a text and an optional reviver function, and returns
			// a JavaScript value if the text is a valid JSON text.

			var j;

			function walk(holder, key) {

				// The walk method is used to recursively walk the resulting structure so
				// that modifications can be made.

				var k,
				v,
				value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}

			// Parsing happens in four stages. In the first stage, we replace certain
			// Unicode characters with escape sequences. JavaScript handles many characters
			// incorrectly, either silently deleting them, or treating them as line endings.

			text = String(text);
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function (a) {
						return '\\u' +
						('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
			}

			// In the second stage, we run the text against regular expressions that look
			// for non-JSON patterns. We are especially concerned with '()' and 'new'
			// because they can cause invocation, and '=' because it can cause mutation.
			// But just to be safe, we want to reject all unexpected forms.

			// We split the second stage into 4 regexp operations in order to work around
			// crippling inefficiencies in IE's and Safari's regexp engines. First we
			// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
			// replace all simple value tokens with ']' characters. Third, we delete all
			// open brackets that follow a colon or comma or that begin the text. Finally,
			// we look to see that the remaining characters are only whitespace or ']' or
			// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

			if (/^[\],:{}\s]*$/.
				test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
					replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
					replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

				// In the third stage we use the eval function to compile the text into a
				// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
				// in JavaScript: it can begin a block or an object literal. We wrap the text
				// in parens to eliminate the ambiguity.

				j = eval('(' + text + ')');

				// In the optional fourth stage, we recursively walk the new structure, passing
				// each name/value pair to a reviver function for possible transformation.

				return typeof reviver === 'function' ?
				walk({
					'' : j
				}, '') : j;
			}

			// If the text is not JSON parseable, then a SyntaxError is thrown.

			throw new SyntaxError('JSON.parse');
		};
	}
}
	());

/*! jQuery v2.2.4 | (c) jQuery Foundation | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=a.document,e=c.slice,f=c.concat,g=c.push,h=c.indexOf,i={},j=i.toString,k=i.hasOwnProperty,l={},m="2.2.4",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return e.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:e.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a){return n.each(this,a)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(e.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:g,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=a&&a.toString();return!n.isArray(a)&&b-parseFloat(b)+1>=0},isPlainObject:function(a){var b;if("object"!==n.type(a)||a.nodeType||n.isWindow(a))return!1;if(a.constructor&&!k.call(a,"constructor")&&!k.call(a.constructor.prototype||{},"isPrototypeOf"))return!1;for(b in a);return void 0===b||k.call(a,b)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?i[j.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=d.createElement("script"),b.text=a,d.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(s(a)){for(c=a.length;c>d;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):g.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:h.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,g=0,h=[];if(s(a))for(d=a.length;d>g;g++)e=b(a[g],g,c),null!=e&&h.push(e);else for(g in a)e=b(a[g],g,c),null!=e&&h.push(e);return f.apply([],h)},guid:1,proxy:function(a,b){var c,d,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(d=e.call(arguments,2),f=function(){return a.apply(b||this,d.concat(e.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:l}),"function"==typeof Symbol&&(n.fn[Symbol.iterator]=c[Symbol.iterator]),n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){i["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=!!a&&"length"in a&&a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ga(),z=ga(),A=ga(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp(L+"+","g"),Q=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),R=new RegExp("^"+L+"*,"+L+"*"),S=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),T=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),U=new RegExp(O),V=new RegExp("^"+M+"$"),W={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},X=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,_=/[+~]/,aa=/'|\\/g,ba=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),ca=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},da=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(ea){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fa(a,b,d,e){var f,h,j,k,l,o,r,s,w=b&&b.ownerDocument,x=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==x&&9!==x&&11!==x)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==x&&(o=$.exec(a)))if(f=o[1]){if(9===x){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(w&&(j=w.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(o[2])return H.apply(d,b.getElementsByTagName(a)),d;if((f=o[3])&&c.getElementsByClassName&&b.getElementsByClassName)return H.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==x)w=b,s=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(aa,"\\$&"):b.setAttribute("id",k=u),r=g(a),h=r.length,l=V.test(k)?"#"+k:"[id='"+k+"']";while(h--)r[h]=l+" "+qa(r[h]);s=r.join(","),w=_.test(a)&&oa(b.parentNode)||b}if(s)try{return H.apply(d,w.querySelectorAll(s)),d}catch(y){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(Q,"$1"),b,d,e)}function ga(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ha(a){return a[u]=!0,a}function ia(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ja(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function ka(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function la(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function na(a){return ha(function(b){return b=+b,ha(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function oa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=fa.support={},f=fa.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fa.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ia(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ia(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Z.test(n.getElementsByClassName),c.getById=ia(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return"undefined"!=typeof b.getElementsByClassName&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=Z.test(n.querySelectorAll))&&(ia(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ia(function(a){var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ia(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return ka(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?ka(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},fa.matches=function(a,b){return fa(a,null,null,b)},fa.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(T,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fa(b,n,null,[a]).length>0},fa.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fa.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fa.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fa.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fa.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fa.selectors={cacheLength:50,createPseudo:ha,match:W,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ba,ca),a[3]=(a[3]||a[4]||a[5]||"").replace(ba,ca),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fa.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fa.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&U.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ba,ca).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fa.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(P," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fa.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ha(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ha(function(a){var b=[],c=[],d=h(a.replace(Q,"$1"));return d[u]?ha(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ha(function(a){return function(b){return fa(a,b).length>0}}),contains:ha(function(a){return a=a.replace(ba,ca),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ha(function(a){return V.test(a||"")||fa.error("unsupported lang: "+a),a=a.replace(ba,ca).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:na(function(){return[0]}),last:na(function(a,b){return[b-1]}),eq:na(function(a,b,c){return[0>c?c+b:c]}),even:na(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:na(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:na(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:na(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=la(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=ma(b);function pa(){}pa.prototype=d.filters=d.pseudos,d.setFilters=new pa,g=fa.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=R.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(Q," ")}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fa.error(a):z(a,i).slice(0)};function qa(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function ra(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(j=b[u]||(b[u]={}),i=j[b.uniqueID]||(j[b.uniqueID]={}),(h=i[d])&&h[0]===w&&h[1]===f)return k[2]=h[2];if(i[d]=k,k[2]=a(b,c,g))return!0}}}function sa(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ta(a,b,c){for(var d=0,e=b.length;e>d;d++)fa(a,b[d],c);return c}function ua(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function va(a,b,c,d,e,f){return d&&!d[u]&&(d=va(d)),e&&!e[u]&&(e=va(e,f)),ha(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ta(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ua(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ua(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ua(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ra(function(a){return a===b},h,!0),l=ra(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[ra(sa(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return va(i>1&&sa(m),i>1&&qa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(Q,"$1"),c,e>i&&wa(a.slice(i,e)),f>e&&wa(a=a.slice(e)),f>e&&qa(a))}m.push(c)}return sa(m)}function xa(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=F.call(i));u=ua(u)}H.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&fa.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ha(f):f}return h=fa.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xa(e,d)),f.selector=a}return f},i=fa.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ba,ca),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ba,ca),_.test(j[0].type)&&oa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qa(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||_.test(a)&&oa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ia(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ia(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ja("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ia(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ja("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ia(function(a){return null==a.getAttribute("disabled")})||ja(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fa}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.uniqueSort=n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},v=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},w=n.expr.match.needsContext,x=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,y=/^.[^:#\[\.,]*$/;function z(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(y.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return h.call(b,a)>-1!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(z(this,a||[],!1))},not:function(a){return this.pushStack(z(this,a||[],!0))},is:function(a){return!!z(this,"string"==typeof a&&w.test(a)?n(a):a||[],!1).length}});var A,B=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=n.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||A,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:B.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),x.test(e[1])&&n.isPlainObject(b))for(e in b)n.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&f.parentNode&&(this.length=1,this[0]=f),this.context=d,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?void 0!==c.ready?c.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};C.prototype=n.fn,A=n(d);var D=/^(?:parents|prev(?:Until|All))/,E={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=w.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?h.call(n(a),this[0]):h.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function F(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return u(a,"parentNode")},parentsUntil:function(a,b,c){return u(a,"parentNode",c)},next:function(a){return F(a,"nextSibling")},prev:function(a){return F(a,"previousSibling")},nextAll:function(a){return u(a,"nextSibling")},prevAll:function(a){return u(a,"previousSibling")},nextUntil:function(a,b,c){return u(a,"nextSibling",c)},prevUntil:function(a,b,c){return u(a,"previousSibling",c)},siblings:function(a){return v((a.parentNode||{}).firstChild,a)},children:function(a){return v(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(E[a]||n.uniqueSort(e),D.test(a)&&e.reverse()),this.pushStack(e)}});var G=/\S+/g;function H(a){var b={};return n.each(a.match(G)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?H(a):n.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){n.each(b,function(b,c){n.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==n.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return n.each(arguments,function(a,b){var c;while((c=n.inArray(b,f,c))>-1)f.splice(c,1),h>=c&&h--}),this},has:function(a){return a?n.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().progress(c.notify).done(c.resolve).fail(c.reject):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=e.call(arguments),d=c.length,f=1!==d||a&&n.isFunction(a.promise)?d:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?e.call(arguments):d,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(d>1)for(i=new Array(d),j=new Array(d),k=new Array(d);d>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().progress(h(b,j,i)).done(h(b,k,c)).fail(g.reject):--f;return f||g.resolveWith(k,c),g.promise()}});var I;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(I.resolveWith(d,[n]),n.fn.triggerHandler&&(n(d).triggerHandler("ready"),n(d).off("ready"))))}});function J(){d.removeEventListener("DOMContentLoaded",J),a.removeEventListener("load",J),n.ready()}n.ready.promise=function(b){return I||(I=n.Deferred(),"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(n.ready):(d.addEventListener("DOMContentLoaded",J),a.addEventListener("load",J))),I.promise(b)},n.ready.promise();var K=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)K(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},L=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function M(){this.expando=n.expando+M.uid++}M.uid=1,M.prototype={register:function(a,b){var c=b||{};return a.nodeType?a[this.expando]=c:Object.defineProperty(a,this.expando,{value:c,writable:!0,configurable:!0}),a[this.expando]},cache:function(a){if(!L(a))return{};var b=a[this.expando];return b||(b={},L(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[b]=c;else for(d in b)e[d]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=a[this.expando];if(void 0!==f){if(void 0===b)this.register(a);else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in f?d=[b,e]:(d=e,d=d in f?[d]:d.match(G)||[])),c=d.length;while(c--)delete f[d[c]]}(void 0===b||n.isEmptyObject(f))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!n.isEmptyObject(b)}};var N=new M,O=new M,P=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Q=/[A-Z]/g;function R(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Q,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:P.test(c)?n.parseJSON(c):c;
}catch(e){}O.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return O.hasData(a)||N.hasData(a)},data:function(a,b,c){return O.access(a,b,c)},removeData:function(a,b){O.remove(a,b)},_data:function(a,b,c){return N.access(a,b,c)},_removeData:function(a,b){N.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=O.get(f),1===f.nodeType&&!N.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),R(f,d,e[d])));N.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){O.set(this,a)}):K(this,function(b){var c,d;if(f&&void 0===b){if(c=O.get(f,a)||O.get(f,a.replace(Q,"-$&").toLowerCase()),void 0!==c)return c;if(d=n.camelCase(a),c=O.get(f,d),void 0!==c)return c;if(c=R(f,d,void 0),void 0!==c)return c}else d=n.camelCase(a),this.each(function(){var c=O.get(this,d);O.set(this,d,b),a.indexOf("-")>-1&&void 0!==c&&O.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){O.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=N.get(a,b),c&&(!d||n.isArray(c)?d=N.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return N.get(a,c)||N.access(a,c,{empty:n.Callbacks("once memory").add(function(){N.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=N.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),U=["Top","Right","Bottom","Left"],V=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)};function W(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return n.css(a,b,"")},i=h(),j=c&&c[3]||(n.cssNumber[b]?"":"px"),k=(n.cssNumber[b]||"px"!==j&&+i)&&T.exec(n.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,n.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var X=/^(?:checkbox|radio)$/i,Y=/<([\w:-]+)/,Z=/^$|\/(?:java|ecma)script/i,$={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};$.optgroup=$.option,$.tbody=$.tfoot=$.colgroup=$.caption=$.thead,$.th=$.td;function _(a,b){var c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function aa(a,b){for(var c=0,d=a.length;d>c;c++)N.set(a[c],"globalEval",!b||N.get(b[c],"globalEval"))}var ba=/<|&#?\w+;/;function ca(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],o=0,p=a.length;p>o;o++)if(f=a[o],f||0===f)if("object"===n.type(f))n.merge(m,f.nodeType?[f]:f);else if(ba.test(f)){g=g||l.appendChild(b.createElement("div")),h=(Y.exec(f)||["",""])[1].toLowerCase(),i=$[h]||$._default,g.innerHTML=i[1]+n.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;n.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",o=0;while(f=m[o++])if(d&&n.inArray(f,d)>-1)e&&e.push(f);else if(j=n.contains(f.ownerDocument,f),g=_(l.appendChild(f),"script"),j&&aa(g),c){k=0;while(f=g[k++])Z.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var da=/^key/,ea=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,fa=/^([^.]*)(?:\.(.+)|)/;function ga(){return!0}function ha(){return!1}function ia(){try{return d.activeElement}catch(a){}}function ja(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ja(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=ha;else if(!e)return a;return 1===f&&(g=e,e=function(a){return n().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=n.guid++)),a.each(function(){n.event.add(this,b,e,d,c)})}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return"undefined"!=typeof n&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(G)||[""],j=b.length;while(j--)h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.hasData(a)&&N.get(a);if(r&&(i=r.events)){b=(b||"").match(G)||[""],j=b.length;while(j--)if(h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&N.remove(a,"handle events")}},dispatch:function(a){a=n.event.fix(a);var b,c,d,f,g,h=[],i=e.call(arguments),j=(N.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())a.rnamespace&&!a.rnamespace.test(g.namespace)||(a.handleObj=g,a.data=g.data,d=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==d&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&("click"!==a.type||isNaN(a.button)||a.button<1))for(;i!==this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>-1:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,e,f,g=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||d,e=c.documentElement,f=c.body,a.pageX=b.clientX+(e&&e.scrollLeft||f&&f.scrollLeft||0)-(e&&e.clientLeft||f&&f.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||f&&f.scrollTop||0)-(e&&e.clientTop||f&&f.clientTop||0)),a.which||void 0===g||(a.which=1&g?1:2&g?3:4&g?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,e,f=a.type,g=a,h=this.fixHooks[f];h||(this.fixHooks[f]=h=ea.test(f)?this.mouseHooks:da.test(f)?this.keyHooks:{}),e=h.props?this.props.concat(h.props):this.props,a=new n.Event(g),b=e.length;while(b--)c=e[b],a[c]=g[c];return a.target||(a.target=d),3===a.target.nodeType&&(a.target=a.target.parentNode),h.filter?h.filter(a,g):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==ia()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===ia()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ga:ha):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={constructor:n.Event,isDefaultPrevented:ha,isPropagationStopped:ha,isImmediatePropagationStopped:ha,isSimulated:!1,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ga,a&&!this.isSimulated&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ga,a&&!this.isSimulated&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ga,a&&!this.isSimulated&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||n.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),n.fn.extend({on:function(a,b,c,d){return ja(this,a,b,c,d)},one:function(a,b,c,d){return ja(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=ha),this.each(function(){n.event.remove(this,a,c,b)})}});var ka=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,la=/<script|<style|<link/i,ma=/checked\s*(?:[^=]|=\s*.checked.)/i,na=/^true\/(.*)/,oa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function pa(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function qa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function ra(a){var b=na.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function sa(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(N.hasData(a)&&(f=N.access(a),g=N.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}O.hasData(a)&&(h=O.access(a),i=n.extend({},h),O.set(b,i))}}function ta(a,b){var c=b.nodeName.toLowerCase();"input"===c&&X.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function ua(a,b,c,d){b=f.apply([],b);var e,g,h,i,j,k,m=0,o=a.length,p=o-1,q=b[0],r=n.isFunction(q);if(r||o>1&&"string"==typeof q&&!l.checkClone&&ma.test(q))return a.each(function(e){var f=a.eq(e);r&&(b[0]=q.call(this,e,f.html())),ua(f,b,c,d)});if(o&&(e=ca(b,a[0].ownerDocument,!1,a,d),g=e.firstChild,1===e.childNodes.length&&(e=g),g||d)){for(h=n.map(_(e,"script"),qa),i=h.length;o>m;m++)j=e,m!==p&&(j=n.clone(j,!0,!0),i&&n.merge(h,_(j,"script"))),c.call(a[m],j,m);if(i)for(k=h[h.length-1].ownerDocument,n.map(h,ra),m=0;i>m;m++)j=h[m],Z.test(j.type||"")&&!N.access(j,"globalEval")&&n.contains(k,j)&&(j.src?n._evalUrl&&n._evalUrl(j.src):n.globalEval(j.textContent.replace(oa,"")))}return a}function va(a,b,c){for(var d,e=b?n.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||n.cleanData(_(d)),d.parentNode&&(c&&n.contains(d.ownerDocument,d)&&aa(_(d,"script")),d.parentNode.removeChild(d));return a}n.extend({htmlPrefilter:function(a){return a.replace(ka,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=_(h),f=_(a),d=0,e=f.length;e>d;d++)ta(f[d],g[d]);if(b)if(c)for(f=f||_(a),g=g||_(h),d=0,e=f.length;e>d;d++)sa(f[d],g[d]);else sa(a,h);return g=_(h,"script"),g.length>0&&aa(g,!i&&_(a,"script")),h},cleanData:function(a){for(var b,c,d,e=n.event.special,f=0;void 0!==(c=a[f]);f++)if(L(c)){if(b=c[N.expando]){if(b.events)for(d in b.events)e[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);c[N.expando]=void 0}c[O.expando]&&(c[O.expando]=void 0)}}}),n.fn.extend({domManip:ua,detach:function(a){return va(this,a,!0)},remove:function(a){return va(this,a)},text:function(a){return K(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.appendChild(a)}})},prepend:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(_(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return K(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!la.test(a)&&!$[(Y.exec(a)||["",""])[1].toLowerCase()]){a=n.htmlPrefilter(a);try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(_(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return ua(this,arguments,function(b){var c=this.parentNode;n.inArray(this,a)<0&&(n.cleanData(_(this)),c&&c.replaceChild(b,this))},a)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),f=e.length-1,h=0;f>=h;h++)c=h===f?this:this.clone(!0),n(e[h])[b](c),g.apply(d,c.get());return this.pushStack(d)}});var wa,xa={HTML:"block",BODY:"block"};function ya(a,b){var c=n(b.createElement(a)).appendTo(b.body),d=n.css(c[0],"display");return c.detach(),d}function za(a){var b=d,c=xa[a];return c||(c=ya(a,b),"none"!==c&&c||(wa=(wa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=wa[0].contentDocument,b.write(),b.close(),c=ya(a,b),wa.detach()),xa[a]=c),c}var Aa=/^margin/,Ba=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ca=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)},Da=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e},Ea=d.documentElement;!function(){var b,c,e,f,g=d.createElement("div"),h=d.createElement("div");if(h.style){h.style.backgroundClip="content-box",h.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===h.style.backgroundClip,g.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",g.appendChild(h);function i(){h.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",h.innerHTML="",Ea.appendChild(g);var d=a.getComputedStyle(h);b="1%"!==d.top,f="2px"===d.marginLeft,c="4px"===d.width,h.style.marginRight="50%",e="4px"===d.marginRight,Ea.removeChild(g)}n.extend(l,{pixelPosition:function(){return i(),b},boxSizingReliable:function(){return null==c&&i(),c},pixelMarginRight:function(){return null==c&&i(),e},reliableMarginLeft:function(){return null==c&&i(),f},reliableMarginRight:function(){var b,c=h.appendChild(d.createElement("div"));return c.style.cssText=h.style.cssText="-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",h.style.width="1px",Ea.appendChild(g),b=!parseFloat(a.getComputedStyle(c).marginRight),Ea.removeChild(g),h.removeChild(c),b}})}}();function Fa(a,b,c){var d,e,f,g,h=a.style;return c=c||Ca(a),g=c?c.getPropertyValue(b)||c[b]:void 0,""!==g&&void 0!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),c&&!l.pixelMarginRight()&&Ba.test(g)&&Aa.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f),void 0!==g?g+"":g}function Ga(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Ha=/^(none|table(?!-c[ea]).+)/,Ia={position:"absolute",visibility:"hidden",display:"block"},Ja={letterSpacing:"0",fontWeight:"400"},Ka=["Webkit","O","Moz","ms"],La=d.createElement("div").style;function Ma(a){if(a in La)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ka.length;while(c--)if(a=Ka[c]+b,a in La)return a}function Na(a,b,c){var d=T.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Oa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+U[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+U[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+U[f]+"Width",!0,e))):(g+=n.css(a,"padding"+U[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+U[f]+"Width",!0,e)));return g}function Pa(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Ca(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=Fa(a,b,f),(0>e||null==e)&&(e=a.style[b]),Ba.test(e))return e;d=g&&(l.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Oa(a,b,c||(g?"border":"content"),d,f)+"px"}function Qa(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=N.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&V(d)&&(f[g]=N.access(d,"olddisplay",za(d.nodeName)))):(e=V(d),"none"===c&&e||N.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Fa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=T.exec(c))&&e[1]&&(c=W(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(n.cssNumber[h]?"":"px")),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Fa(a,b,d)),"normal"===e&&b in Ja&&(e=Ja[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?Ha.test(n.css(a,"display"))&&0===a.offsetWidth?Da(a,Ia,function(){return Pa(a,b,d)}):Pa(a,b,d):void 0},set:function(a,c,d){var e,f=d&&Ca(a),g=d&&Oa(a,b,d,"border-box"===n.css(a,"boxSizing",!1,f),f);return g&&(e=T.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=n.css(a,b)),Na(a,c,g)}}}),n.cssHooks.marginLeft=Ga(l.reliableMarginLeft,function(a,b){return b?(parseFloat(Fa(a,"marginLeft"))||a.getBoundingClientRect().left-Da(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px":void 0}),n.cssHooks.marginRight=Ga(l.reliableMarginRight,function(a,b){return b?Da(a,{display:"inline-block"},Fa,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+U[d]+b]=f[d]||f[d-2]||f[0];return e}},Aa.test(a)||(n.cssHooks[a+b].set=Na)}),n.fn.extend({css:function(a,b){return K(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=Ca(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Qa(this,!0)},hide:function(){return Qa(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){V(this)?n(this).show():n(this).hide()})}});function Ra(a,b,c,d,e){return new Ra.prototype.init(a,b,c,d,e)}n.Tween=Ra,Ra.prototype={constructor:Ra,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||n.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ra.propHooks[this.prop];return a&&a.get?a.get(this):Ra.propHooks._default.get(this)},run:function(a){var b,c=Ra.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ra.propHooks._default.set(this),this}},Ra.prototype.init.prototype=Ra.prototype,Ra.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[n.cssProps[a.prop]]&&!n.cssHooks[a.prop]?a.elem[a.prop]=a.now:n.style(a.elem,a.prop,a.now+a.unit)}}},Ra.propHooks.scrollTop=Ra.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},n.fx=Ra.prototype.init,n.fx.step={};var Sa,Ta,Ua=/^(?:toggle|show|hide)$/,Va=/queueHooks$/;function Wa(){return a.setTimeout(function(){Sa=void 0}),Sa=n.now()}function Xa(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=U[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ya(a,b,c){for(var d,e=(_a.tweeners[b]||[]).concat(_a.tweeners["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Za(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&V(a),q=N.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?N.get(a,"olddisplay")||za(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Ua.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?za(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=N.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;N.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ya(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function $a(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function _a(a,b,c){var d,e,f=0,g=_a.prefilters.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Sa||Wa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},c),originalProperties:b,originalOptions:c,startTime:Sa||Wa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for($a(k,j.opts.specialEasing);g>f;f++)if(d=_a.prefilters[f].call(j,a,k,j.opts))return n.isFunction(d.stop)&&(n._queueHooks(j.elem,j.opts.queue).stop=n.proxy(d.stop,d)),d;return n.map(k,Ya,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(_a,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return W(c.elem,a,T.exec(b),c),c}]},tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.match(G);for(var c,d=0,e=a.length;e>d;d++)c=a[d],_a.tweeners[c]=_a.tweeners[c]||[],_a.tweeners[c].unshift(b)},prefilters:[Za],prefilter:function(a,b){b?_a.prefilters.unshift(a):_a.prefilters.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(V).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=_a(this,n.extend({},a),f);(e||N.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=N.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Va.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=N.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Xa(b,!0),a,d,e)}}),n.each({slideDown:Xa("show"),slideUp:Xa("hide"),slideToggle:Xa("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Sa=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Sa=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ta||(Ta=a.setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){a.clearInterval(Ta),Ta=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(b,c){return b=n.fx?n.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=d.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var ab,bb=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return K(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),e=n.attrHooks[b]||(n.expr.match.bool.test(b)?ab:void 0)),void 0!==c?null===c?void n.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=n.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(G);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)}}),ab={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=bb[b]||n.find.attr;bb[b]=function(a,b,d){var e,f;return d||(f=bb[b],bb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,bb[b]=f),e}});var cb=/^(?:input|select|textarea|button)$/i,db=/^(?:a|area)$/i;n.fn.extend({prop:function(a,b){return K(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&n.isXMLDoc(a)||(b=n.propFix[b]||b,e=n.propHooks[b]),
void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=n.find.attr(a,"tabindex");return b?parseInt(b,10):cb.test(a.nodeName)||db.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),l.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var eb=/[\t\r\n\f]/g;function fb(a){return a.getAttribute&&a.getAttribute("class")||""}n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,fb(this)))});if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,fb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):n.isFunction(a)?this.each(function(c){n(this).toggleClass(a.call(this,c,fb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=n(this),f=a.match(G)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=fb(this),b&&N.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":N.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+fb(c)+" ").replace(eb," ").indexOf(b)>-1)return!0;return!1}});var gb=/\r/g,hb=/[\x20\t\r\n\f]+/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(gb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a)).replace(hb," ")}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],(c.selected||i===e)&&(l.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentNode.disabled||!n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(n.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>-1:void 0}},l.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var ib=/^(?:focusinfocus|focusoutblur)$/;n.extend(n.event,{trigger:function(b,c,e,f){var g,h,i,j,l,m,o,p=[e||d],q=k.call(b,"type")?b.type:b,r=k.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!ib.test(q+n.event.triggered)&&(q.indexOf(".")>-1&&(r=q.split("."),q=r.shift(),r.sort()),l=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=r.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},f||!o.trigger||o.trigger.apply(e,c)!==!1)){if(!f&&!o.noBubble&&!n.isWindow(e)){for(j=o.delegateType||q,ib.test(j+q)||(h=h.parentNode);h;h=h.parentNode)p.push(h),i=h;i===(e.ownerDocument||d)&&p.push(i.defaultView||i.parentWindow||a)}g=0;while((h=p[g++])&&!b.isPropagationStopped())b.type=g>1?j:o.bindType||q,m=(N.get(h,"events")||{})[b.type]&&N.get(h,"handle"),m&&m.apply(h,c),m=l&&h[l],m&&m.apply&&L(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=q,f||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!L(e)||l&&n.isFunction(e[q])&&!n.isWindow(e)&&(i=e[l],i&&(e[l]=null),n.event.triggered=q,e[q](),n.event.triggered=void 0,i&&(e[l]=i)),b.result}},simulate:function(a,b,c){var d=n.extend(new n.Event,c,{type:a,isSimulated:!0});n.event.trigger(d,null,b)}}),n.fn.extend({trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),l.focusin="onfocusin"in a,l.focusin||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a))};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=N.access(d,b);e||d.addEventListener(a,c,!0),N.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=N.access(d,b)-1;e?N.access(d,b,e):(d.removeEventListener(a,c,!0),N.remove(d,b))}}});var jb=a.location,kb=n.now(),lb=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||n.error("Invalid XML: "+b),c};var mb=/#.*$/,nb=/([?&])_=[^&]*/,ob=/^(.*?):[ \t]*([^\r\n]*)$/gm,pb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,qb=/^(?:GET|HEAD)$/,rb=/^\/\//,sb={},tb={},ub="*/".concat("*"),vb=d.createElement("a");vb.href=jb.href;function wb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(G)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function xb(a,b,c,d){var e={},f=a===tb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function yb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function zb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Ab(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:jb.href,type:"GET",isLocal:pb.test(jb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":ub,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?yb(yb(a,n.ajaxSettings),b):yb(n.ajaxSettings,a)},ajaxPrefilter:wb(sb),ajaxTransport:wb(tb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m=n.ajaxSetup({},c),o=m.context||m,p=m.context&&(o.nodeType||o.jquery)?n(o):n.event,q=n.Deferred(),r=n.Callbacks("once memory"),s=m.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,getResponseHeader:function(a){var b;if(2===v){if(!h){h={};while(b=ob.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===v?g:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return v||(a=u[c]=u[c]||a,t[a]=b),this},overrideMimeType:function(a){return v||(m.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>v)for(b in a)s[b]=[s[b],a[b]];else x.always(a[x.status]);return this},abort:function(a){var b=a||w;return e&&e.abort(b),z(0,b),this}};if(q.promise(x).complete=r.add,x.success=x.done,x.error=x.fail,m.url=((b||m.url||jb.href)+"").replace(mb,"").replace(rb,jb.protocol+"//"),m.type=c.method||c.type||m.method||m.type,m.dataTypes=n.trim(m.dataType||"*").toLowerCase().match(G)||[""],null==m.crossDomain){j=d.createElement("a");try{j.href=m.url,j.href=j.href,m.crossDomain=vb.protocol+"//"+vb.host!=j.protocol+"//"+j.host}catch(y){m.crossDomain=!0}}if(m.data&&m.processData&&"string"!=typeof m.data&&(m.data=n.param(m.data,m.traditional)),xb(sb,m,c,x),2===v)return x;k=n.event&&m.global,k&&0===n.active++&&n.event.trigger("ajaxStart"),m.type=m.type.toUpperCase(),m.hasContent=!qb.test(m.type),f=m.url,m.hasContent||(m.data&&(f=m.url+=(lb.test(f)?"&":"?")+m.data,delete m.data),m.cache===!1&&(m.url=nb.test(f)?f.replace(nb,"$1_="+kb++):f+(lb.test(f)?"&":"?")+"_="+kb++)),m.ifModified&&(n.lastModified[f]&&x.setRequestHeader("If-Modified-Since",n.lastModified[f]),n.etag[f]&&x.setRequestHeader("If-None-Match",n.etag[f])),(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",m.contentType),x.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+ub+"; q=0.01":""):m.accepts["*"]);for(l in m.headers)x.setRequestHeader(l,m.headers[l]);if(m.beforeSend&&(m.beforeSend.call(o,x,m)===!1||2===v))return x.abort();w="abort";for(l in{success:1,error:1,complete:1})x[l](m[l]);if(e=xb(tb,m,c,x)){if(x.readyState=1,k&&p.trigger("ajaxSend",[x,m]),2===v)return x;m.async&&m.timeout>0&&(i=a.setTimeout(function(){x.abort("timeout")},m.timeout));try{v=1,e.send(t,z)}catch(y){if(!(2>v))throw y;z(-1,y)}}else z(-1,"No Transport");function z(b,c,d,h){var j,l,t,u,w,y=c;2!==v&&(v=2,i&&a.clearTimeout(i),e=void 0,g=h||"",x.readyState=b>0?4:0,j=b>=200&&300>b||304===b,d&&(u=zb(m,x,d)),u=Ab(m,u,x,j),j?(m.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(n.lastModified[f]=w),w=x.getResponseHeader("etag"),w&&(n.etag[f]=w)),204===b||"HEAD"===m.type?y="nocontent":304===b?y="notmodified":(y=u.state,l=u.data,t=u.error,j=!t)):(t=y,!b&&y||(y="error",0>b&&(b=0))),x.status=b,x.statusText=(c||y)+"",j?q.resolveWith(o,[l,y,x]):q.rejectWith(o,[x,y,t]),x.statusCode(s),s=void 0,k&&p.trigger(j?"ajaxSuccess":"ajaxError",[x,m,j?l:t]),r.fireWith(o,[x,y]),k&&(p.trigger("ajaxComplete",[x,m]),--n.active||n.event.trigger("ajaxStop")))}return x},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax(n.extend({url:a,type:b,dataType:e,data:c,success:d},n.isPlainObject(a)&&a))}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return n.isFunction(a)?this.each(function(b){n(this).wrapInner(a.call(this,b))}):this.each(function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return!n.expr.filters.visible(a)},n.expr.filters.visible=function(a){return a.offsetWidth>0||a.offsetHeight>0||a.getClientRects().length>0};var Bb=/%20/g,Cb=/\[\]$/,Db=/\r?\n/g,Eb=/^(?:submit|button|image|reset|file)$/i,Fb=/^(?:input|select|textarea|keygen)/i;function Gb(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||Cb.test(a)?d(a,e):Gb(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Gb(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Gb(c,a[c],b,e);return d.join("&").replace(Bb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Fb.test(this.nodeName)&&!Eb.test(a)&&(this.checked||!X.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(Db,"\r\n")}}):{name:b.name,value:c.replace(Db,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Hb={0:200,1223:204},Ib=n.ajaxSettings.xhr();l.cors=!!Ib&&"withCredentials"in Ib,l.ajax=Ib=!!Ib,n.ajaxTransport(function(b){var c,d;return l.cors||Ib&&!b.crossDomain?{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Hb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=n("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Jb=[],Kb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Jb.pop()||n.expando+"_"+kb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Kb.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Kb.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Kb,"$1"+e):b.jsonp!==!1&&(b.url+=(lb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?n(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Jb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||d;var e=x.exec(a),f=!c&&[];return e?[b.createElement(e[1])]:(e=ca([a],b,f),f&&f.length&&n(f).remove(),n.merge([],e.childNodes))};var Lb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Lb)return Lb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};function Mb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,n.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(e=d.getBoundingClientRect(),c=Mb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ea})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;n.fn[a]=function(d){return K(this,function(a,d,e){var f=Mb(a);return void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=Ga(l.pixelPosition,function(a,c){return c?(c=Fa(a,b),Ba.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return K(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},size:function(){return this.length}}),n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Nb=a.jQuery,Ob=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Ob),b&&a.jQuery===n&&(a.jQuery=Nb),n},b||(a.jQuery=a.$=n),n});
/*! jQuery UI - v1.11.4 - 2015-06-21
 * http://jqueryui.com
 * Includes: core.js, widget.js, mouse.js, position.js, draggable.js, droppable.js, resizable.js, selectable.js, sortable.js, accordion.js, autocomplete.js, button.js, datepicker.js, dialog.js, menu.js, progressbar.js, selectmenu.js, slider.js, spinner.js, tabs.js, tooltip.js, effect.js, effect-blind.js, effect-bounce.js, effect-clip.js, effect-drop.js, effect-explode.js, effect-fade.js, effect-fold.js, effect-highlight.js, effect-puff.js, effect-pulsate.js, effect-scale.js, effect-shake.js, effect-size.js, effect-slide.js, effect-transfer.js
 * Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

(function (e) {
	"function" == typeof define && define.amd ? define(["jquery"], e) : e(jQuery)
})(function (e) {
	function t(t, s) {
		var a,
		n,
		r,
		o = t.nodeName.toLowerCase();
		return "area" === o ? (a = t.parentNode, n = a.name, t.href && n && "map" === a.nodeName.toLowerCase() ? (r = e("img[usemap='#" + n + "']")[0], !!r && i(r)) : !1) : (/^(input|select|textarea|button|object)$/.test(o) ? !t.disabled : "a" === o ? t.href || s : s) && i(t)
	}
	function i(t) {
		return e.expr.filters.visible(t) && !e(t).parents().addBack().filter(function () {
			return "hidden" === e.css(this, "visibility")
		}).length
	}
	function s(e) {
		for (var t, i; e.length && e[0] !== document; ) {
			if (t = e.css("position"), ("absolute" === t || "relative" === t || "fixed" === t) && (i = parseInt(e.css("zIndex"), 10), !isNaN(i) && 0 !== i))
				return i;
			e = e.parent()
		}
		return 0
	}
	function a() {
		this._curInst = null,
		this._keyEvent = !1,
		this._disabledInputs = [],
		this._datepickerShowing = !1,
		this._inDialog = !1,
		this._mainDivId = "ui-datepicker-div",
		this._inlineClass = "ui-datepicker-inline",
		this._appendClass = "ui-datepicker-append",
		this._triggerClass = "ui-datepicker-trigger",
		this._dialogClass = "ui-datepicker-dialog",
		this._disableClass = "ui-datepicker-disabled",
		this._unselectableClass = "ui-datepicker-unselectable",
		this._currentClass = "ui-datepicker-current-day",
		this._dayOverClass = "ui-datepicker-days-cell-over",
		this.regional = [],
		this.regional[""] = {
			closeText : "Done",
			prevText : "Prev",
			nextText : "Next",
			currentText : "Today",
			monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthNamesShort : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			dayNames : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			dayNamesShort : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			dayNamesMin : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
			weekHeader : "Wk",
			dateFormat : "mm/dd/yy",
			firstDay : 0,
			isRTL : !1,
			showMonthAfterYear : !1,
			yearSuffix : ""
		},
		this._defaults = {
			showOn : "focus",
			showAnim : "fadeIn",
			showOptions : {},
			defaultDate : null,
			appendText : "",
			buttonText : "...",
			buttonImage : "",
			buttonImageOnly : !1,
			hideIfNoPrevNext : !1,
			navigationAsDateFormat : !1,
			gotoCurrent : !1,
			changeMonth : !1,
			changeYear : !1,
			yearRange : "c-10:c+10",
			showOtherMonths : !1,
			selectOtherMonths : !1,
			showWeek : !1,
			calculateWeek : this.iso8601Week,
			shortYearCutoff : "+10",
			minDate : null,
			maxDate : null,
			duration : "fast",
			beforeShowDay : null,
			beforeShow : null,
			onSelect : null,
			onChangeMonthYear : null,
			onClose : null,
			numberOfMonths : 1,
			showCurrentAtPos : 0,
			stepMonths : 1,
			stepBigMonths : 12,
			altField : "",
			altFormat : "",
			constrainInput : !0,
			showButtonPanel : !1,
			autoSize : !1,
			disabled : !1
		},
		e.extend(this._defaults, this.regional[""]),
		this.regional.en = e.extend(!0, {}, this.regional[""]),
		this.regional["en-US"] = e.extend(!0, {}, this.regional.en),
		this.dpDiv = n(e("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))
	}
	function n(t) {
		var i = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";
		return t.delegate(i, "mouseout", function () {
			e(this).removeClass("ui-state-hover"),
			-1 !== this.className.indexOf("ui-datepicker-prev") && e(this).removeClass("ui-datepicker-prev-hover"),
			-1 !== this.className.indexOf("ui-datepicker-next") && e(this).removeClass("ui-datepicker-next-hover")
		}).delegate(i, "mouseover", r)
	}
	function r() {
		e.datepicker._isDisabledDatepicker(v.inline ? v.dpDiv.parent()[0] : v.input[0]) || (e(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"), e(this).addClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && e(this).addClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && e(this).addClass("ui-datepicker-next-hover"))
	}
	function o(t, i) {
		e.extend(t, i);
		for (var s in i)
			null == i[s] && (t[s] = i[s]);
		return t
	}
	function h(e) {
		return function () {
			var t = this.element.val();
			e.apply(this, arguments),
			this._refresh(),
			t !== this.element.val() && this._trigger("change")
		}
	}
	e.ui = e.ui || {},
	e.extend(e.ui, {
		version : "1.11.4",
		keyCode : {
			BACKSPACE : 8,
			COMMA : 188,
			DELETE : 46,
			DOWN : 40,
			END : 35,
			ENTER : 13,
			ESCAPE : 27,
			HOME : 36,
			LEFT : 37,
			PAGE_DOWN : 34,
			PAGE_UP : 33,
			PERIOD : 190,
			RIGHT : 39,
			SPACE : 32,
			TAB : 9,
			UP : 38
		}
	}),
	e.fn.extend({
		scrollParent : function (t) {
			var i = this.css("position"),
			s = "absolute" === i,
			a = t ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			n = this.parents().filter(function () {
					var t = e(this);
					return s && "static" === t.css("position") ? !1 : a.test(t.css("overflow") + t.css("overflow-y") + t.css("overflow-x"))
				}).eq(0);
			return "fixed" !== i && n.length ? n : e(this[0].ownerDocument || document)
		},
		uniqueId : function () {
			var e = 0;
			return function () {
				return this.each(function () {
					this.id || (this.id = "ui-id-" + ++e)
				})
			}
		}
		(),
		removeUniqueId : function () {
			return this.each(function () {
				/^ui-id-\d+$/.test(this.id) && e(this).removeAttr("id")
			})
		}
	}),
	e.extend(e.expr[":"], {
		data : e.expr.createPseudo ? e.expr.createPseudo(function (t) {
			return function (i) {
				return !!e.data(i, t)
			}
		}) : function (t, i, s) {
			return !!e.data(t, s[3])
		},
		focusable : function (i) {
			return t(i, !isNaN(e.attr(i, "tabindex")))
		},
		tabbable : function (i) {
			var s = e.attr(i, "tabindex"),
			a = isNaN(s);
			return (a || s >= 0) && t(i, !a)
		}
	}),
	e("<a>").outerWidth(1).jquery || e.each(["Width", "Height"], function (t, i) {
		function s(t, i, s, n) {
			return e.each(a, function () {
				i -= parseFloat(e.css(t, "padding" + this)) || 0,
				s && (i -= parseFloat(e.css(t, "border" + this + "Width")) || 0),
				n && (i -= parseFloat(e.css(t, "margin" + this)) || 0)
			}),
			i
		}
		var a = "Width" === i ? ["Left", "Right"] : ["Top", "Bottom"],
		n = i.toLowerCase(),
		r = {
			innerWidth : e.fn.innerWidth,
			innerHeight : e.fn.innerHeight,
			outerWidth : e.fn.outerWidth,
			outerHeight : e.fn.outerHeight
		};
		e.fn["inner" + i] = function (t) {
			return void 0 === t ? r["inner" + i].call(this) : this.each(function () {
				e(this).css(n, s(this, t) + "px")
			})
		},
		e.fn["outer" + i] = function (t, a) {
			return "number" != typeof t ? r["outer" + i].call(this, t) : this.each(function () {
				e(this).css(n, s(this, t, !0, a) + "px")
			})
		}
	}),
	e.fn.addBack || (e.fn.addBack = function (e) {
		return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
	}),
	e("<a>").data("a-b", "a").removeData("a-b").data("a-b") && (e.fn.removeData = function (t) {
		return function (i) {
			return arguments.length ? t.call(this, e.camelCase(i)) : t.call(this)
		}
	}
		(e.fn.removeData)),
	e.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),
	e.fn.extend({
		focus : function (t) {
			return function (i, s) {
				return "number" == typeof i ? this.each(function () {
					var t = this;
					setTimeout(function () {
						e(t).focus(),
						s && s.call(t)
					}, i)
				}) : t.apply(this, arguments)
			}
		}
		(e.fn.focus),
		disableSelection : function () {
			var e = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown";
			return function () {
				return this.bind(e + ".ui-disableSelection", function (e) {
					e.preventDefault()
				})
			}
		}
		(),
		enableSelection : function () {
			return this.unbind(".ui-disableSelection")
		},
		zIndex : function (t) {
			if (void 0 !== t)
				return this.css("zIndex", t);
			if (this.length)
				for (var i, s, a = e(this[0]); a.length && a[0] !== document; ) {
					if (i = a.css("position"), ("absolute" === i || "relative" === i || "fixed" === i) && (s = parseInt(a.css("zIndex"), 10), !isNaN(s) && 0 !== s))
						return s;
					a = a.parent()
				}
			return 0
		}
	}),
	e.ui.plugin = {
		add : function (t, i, s) {
			var a,
			n = e.ui[t].prototype;
			for (a in s)
				n.plugins[a] = n.plugins[a] || [], n.plugins[a].push([i, s[a]])
		},
		call : function (e, t, i, s) {
			var a,
			n = e.plugins[t];
			if (n && (s || e.element[0].parentNode && 11 !== e.element[0].parentNode.nodeType))
				for (a = 0; n.length > a; a++)
					e.options[n[a][0]] && n[a][1].apply(e.element, i)
		}
	};
	var l = 0,
	u = Array.prototype.slice;
	e.cleanData = function (t) {
		return function (i) {
			var s,
			a,
			n;
			for (n = 0; null != (a = i[n]); n++)
				try {
					s = e._data(a, "events"),
					s && s.remove && e(a).triggerHandler("remove")
				} catch (r) {}

			t(i)
		}
	}
	(e.cleanData),
	e.widget = function (t, i, s) {
		var a,
		n,
		r,
		o,
		h = {},
		l = t.split(".")[0];
		return t = t.split(".")[1],
		a = l + "-" + t,
		s || (s = i, i = e.Widget),
		e.expr[":"][a.toLowerCase()] = function (t) {
			return !!e.data(t, a)
		},
		e[l] = e[l] || {},
		n = e[l][t],
		r = e[l][t] = function (e, t) {
			return this._createWidget ? (arguments.length && this._createWidget(e, t), void 0) : new r(e, t)
		},
		e.extend(r, n, {
			version : s.version,
			_proto : e.extend({}, s),
			_childConstructors : []
		}),
		o = new i,
		o.options = e.widget.extend({}, o.options),
		e.each(s, function (t, s) {
			return e.isFunction(s) ? (h[t] = function () {
				var e = function () {
					return i.prototype[t].apply(this, arguments)
				},
				a = function (e) {
					return i.prototype[t].apply(this, e)
				};
				return function () {
					var t,
					i = this._super,
					n = this._superApply;
					return this._super = e,
					this._superApply = a,
					t = s.apply(this, arguments),
					this._super = i,
					this._superApply = n,
					t
				}
			}
				(), void 0) : (h[t] = s, void 0)
		}),
		r.prototype = e.widget.extend(o, {
				widgetEventPrefix : n ? o.widgetEventPrefix || t : t
			}, h, {
				constructor : r,
				namespace : l,
				widgetName : t,
				widgetFullName : a
			}),
		n ? (e.each(n._childConstructors, function (t, i) {
				var s = i.prototype;
				e.widget(s.namespace + "." + s.widgetName, r, i._proto)
			}), delete n._childConstructors) : i._childConstructors.push(r),
		e.widget.bridge(t, r),
		r
	},
	e.widget.extend = function (t) {
		for (var i, s, a = u.call(arguments, 1), n = 0, r = a.length; r > n; n++)
			for (i in a[n])
				s = a[n][i], a[n].hasOwnProperty(i) && void 0 !== s && (t[i] = e.isPlainObject(s) ? e.isPlainObject(t[i]) ? e.widget.extend({}, t[i], s) : e.widget.extend({}, s) : s);
		return t
	},
	e.widget.bridge = function (t, i) {
		var s = i.prototype.widgetFullName || t;
		e.fn[t] = function (a) {
			var n = "string" == typeof a,
			r = u.call(arguments, 1),
			o = this;
			return n ? this.each(function () {
				var i,
				n = e.data(this, s);
				return "instance" === a ? (o = n, !1) : n ? e.isFunction(n[a]) && "_" !== a.charAt(0) ? (i = n[a].apply(n, r), i !== n && void 0 !== i ? (o = i && i.jquery ? o.pushStack(i.get()) : i, !1) : void 0) : e.error("no such method '" + a + "' for " + t + " widget instance") : e.error("cannot call methods on " + t + " prior to initialization; " + "attempted to call method '" + a + "'")
			}) : (r.length && (a = e.widget.extend.apply(null, [a].concat(r))), this.each(function () {
					var t = e.data(this, s);
					t ? (t.option(a || {}), t._init && t._init()) : e.data(this, s, new i(a, this))
				})),
			o
		}
	},
	e.Widget = function () {},
	e.Widget._childConstructors = [],
	e.Widget.prototype = {
		widgetName : "widget",
		widgetEventPrefix : "",
		defaultElement : "<div>",
		options : {
			disabled : !1,
			create : null
		},
		_createWidget : function (t, i) {
			i = e(i || this.defaultElement || this)[0],
			this.element = e(i),
			this.uuid = l++,
			this.eventNamespace = "." + this.widgetName + this.uuid,
			this.bindings = e(),
			this.hoverable = e(),
			this.focusable = e(),
			i !== this && (e.data(i, this.widgetFullName, this), this._on(!0, this.element, {
					remove : function (e) {
						e.target === i && this.destroy()
					}
				}), this.document = e(i.style ? i.ownerDocument : i.document || i), this.window = e(this.document[0].defaultView || this.document[0].parentWindow)),
			this.options = e.widget.extend({}, this.options, this._getCreateOptions(), t),
			this._create(),
			this._trigger("create", null, this._getCreateEventData()),
			this._init()
		},
		_getCreateOptions : e.noop,
		_getCreateEventData : e.noop,
		_create : e.noop,
		_init : e.noop,
		destroy : function () {
			this._destroy(),
			this.element.unbind(this.eventNamespace).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),
			this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled"),
			this.bindings.unbind(this.eventNamespace),
			this.hoverable.removeClass("ui-state-hover"),
			this.focusable.removeClass("ui-state-focus")
		},
		_destroy : e.noop,
		widget : function () {
			return this.element
		},
		option : function (t, i) {
			var s,
			a,
			n,
			r = t;
			if (0 === arguments.length)
				return e.widget.extend({}, this.options);
			if ("string" == typeof t)
				if (r = {}, s = t.split("."), t = s.shift(), s.length) {
					for (a = r[t] = e.widget.extend({}, this.options[t]), n = 0; s.length - 1 > n; n++)
						a[s[n]] = a[s[n]] || {},
					a = a[s[n]];
					if (t = s.pop(), 1 === arguments.length)
						return void 0 === a[t] ? null : a[t];
					a[t] = i
				} else {
					if (1 === arguments.length)
						return void 0 === this.options[t] ? null : this.options[t];
					r[t] = i
				}
			return this._setOptions(r),
			this
		},
		_setOptions : function (e) {
			var t;
			for (t in e)
				this._setOption(t, e[t]);
			return this
		},
		_setOption : function (e, t) {
			return this.options[e] = t,
			"disabled" === e && (this.widget().toggleClass(this.widgetFullName + "-disabled", !!t), t && (this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus"))),
			this
		},
		enable : function () {
			return this._setOptions({
				disabled : !1
			})
		},
		disable : function () {
			return this._setOptions({
				disabled : !0
			})
		},
		_on : function (t, i, s) {
			var a,
			n = this;
			"boolean" != typeof t && (s = i, i = t, t = !1),
			s ? (i = a = e(i), this.bindings = this.bindings.add(i)) : (s = i, i = this.element, a = this.widget()),
			e.each(s, function (s, r) {
				function o() {
					return t || n.options.disabled !== !0 && !e(this).hasClass("ui-state-disabled") ? ("string" == typeof r ? n[r] : r).apply(n, arguments) : void 0
				}
				"string" != typeof r && (o.guid = r.guid = r.guid || o.guid || e.guid++);
				var h = s.match(/^([\w:-]*)\s*(.*)$/),
				l = h[1] + n.eventNamespace,
				u = h[2];
				u ? a.delegate(u, l, o) : i.bind(l, o)
			})
		},
		_off : function (t, i) {
			i = (i || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace,
			t.unbind(i).undelegate(i),
			this.bindings = e(this.bindings.not(t).get()),
			this.focusable = e(this.focusable.not(t).get()),
			this.hoverable = e(this.hoverable.not(t).get())
		},
		_delay : function (e, t) {
			function i() {
				return ("string" == typeof e ? s[e] : e).apply(s, arguments)
			}
			var s = this;
			return setTimeout(i, t || 0)
		},
		_hoverable : function (t) {
			this.hoverable = this.hoverable.add(t),
			this._on(t, {
				mouseenter : function (t) {
					e(t.currentTarget).addClass("ui-state-hover")
				},
				mouseleave : function (t) {
					e(t.currentTarget).removeClass("ui-state-hover")
				}
			})
		},
		_focusable : function (t) {
			this.focusable = this.focusable.add(t),
			this._on(t, {
				focusin : function (t) {
					e(t.currentTarget).addClass("ui-state-focus")
				},
				focusout : function (t) {
					e(t.currentTarget).removeClass("ui-state-focus")
				}
			})
		},
		_trigger : function (t, i, s) {
			var a,
			n,
			r = this.options[t];
			if (s = s || {}, i = e.Event(i), i.type = (t === this.widgetEventPrefix ? t : this.widgetEventPrefix + t).toLowerCase(), i.target = this.element[0], n = i.originalEvent)
				for (a in n)
					a in i || (i[a] = n[a]);
			return this.element.trigger(i, s),
			!(e.isFunction(r) && r.apply(this.element[0], [i].concat(s)) === !1 || i.isDefaultPrevented())
		}
	},
	e.each({
		show : "fadeIn",
		hide : "fadeOut"
	}, function (t, i) {
		e.Widget.prototype["_" + t] = function (s, a, n) {
			"string" == typeof a && (a = {
					effect : a
				});
			var r,
			o = a ? a === !0 || "number" == typeof a ? i : a.effect || i : t;
			a = a || {},
			"number" == typeof a && (a = {
					duration : a
				}),
			r = !e.isEmptyObject(a),
			a.complete = n,
			a.delay && s.delay(a.delay),
			r && e.effects && e.effects.effect[o] ? s[t](a) : o !== t && s[o] ? s[o](a.duration, a.easing, n) : s.queue(function (i) {
				e(this)[t](),
				n && n.call(s[0]),
				i()
			})
		}
	}),
	e.widget;
	var d = !1;
	e(document).mouseup(function () {
		d = !1
	}),
	e.widget("ui.mouse", {
		version : "1.11.4",
		options : {
			cancel : "input,textarea,button,select,option",
			distance : 1,
			delay : 0
		},
		_mouseInit : function () {
			var t = this;
			this.element.bind("mousedown." + this.widgetName, function (e) {
				return t._mouseDown(e)
			}).bind("click." + this.widgetName, function (i) {
				return !0 === e.data(i.target, t.widgetName + ".preventClickEvent") ? (e.removeData(i.target, t.widgetName + ".preventClickEvent"), i.stopImmediatePropagation(), !1) : void 0
			}),
			this.started = !1
		},
		_mouseDestroy : function () {
			this.element.unbind("." + this.widgetName),
			this._mouseMoveDelegate && this.document.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate)
		},
		_mouseDown : function (t) {
			if (!d) {
				this._mouseMoved = !1,
				this._mouseStarted && this._mouseUp(t),
				this._mouseDownEvent = t;
				var i = this,
				s = 1 === t.which,
				a = "string" == typeof this.options.cancel && t.target.nodeName ? e(t.target).closest(this.options.cancel).length : !1;
				return s && !a && this._mouseCapture(t) ? (this.mouseDelayMet = !this.options.delay, this.mouseDelayMet || (this._mouseDelayTimer = setTimeout(function () {
								i.mouseDelayMet = !0
							}, this.options.delay)), this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(t) !== !1, !this._mouseStarted) ? (t.preventDefault(), !0) : (!0 === e.data(t.target, this.widgetName + ".preventClickEvent") && e.removeData(t.target, this.widgetName + ".preventClickEvent"), this._mouseMoveDelegate = function (e) {
						return i._mouseMove(e)
					}, this._mouseUpDelegate = function (e) {
						return i._mouseUp(e)
					}, this.document.bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate), t.preventDefault(), d = !0, !0)) : !0
			}
		},
		_mouseMove : function (t) {
			if (this._mouseMoved) {
				if (e.ui.ie && (!document.documentMode || 9 > document.documentMode) && !t.button)
					return this._mouseUp(t);
				if (!t.which)
					return this._mouseUp(t)
			}
			return (t.which || t.button) && (this._mouseMoved = !0),
			this._mouseStarted ? (this._mouseDrag(t), t.preventDefault()) : (this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(this._mouseDownEvent, t) !== !1, this._mouseStarted ? this._mouseDrag(t) : this._mouseUp(t)), !this._mouseStarted)
		},
		_mouseUp : function (t) {
			return this.document.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate),
			this._mouseStarted && (this._mouseStarted = !1, t.target === this._mouseDownEvent.target && e.data(t.target, this.widgetName + ".preventClickEvent", !0), this._mouseStop(t)),
			d = !1,
			!1
		},
		_mouseDistanceMet : function (e) {
			return Math.max(Math.abs(this._mouseDownEvent.pageX - e.pageX), Math.abs(this._mouseDownEvent.pageY - e.pageY)) >= this.options.distance
		},
		_mouseDelayMet : function () {
			return this.mouseDelayMet
		},
		_mouseStart : function () {},
		_mouseDrag : function () {},
		_mouseStop : function () {},
		_mouseCapture : function () {
			return !0
		}
	}),
	function () {
		function t(e, t, i) {
			return [parseFloat(e[0]) * (p.test(e[0]) ? t / 100 : 1), parseFloat(e[1]) * (p.test(e[1]) ? i / 100 : 1)]
		}
		function i(t, i) {
			return parseInt(e.css(t, i), 10) || 0
		}
		function s(t) {
			var i = t[0];
			return 9 === i.nodeType ? {
				width : t.width(),
				height : t.height(),
				offset : {
					top : 0,
					left : 0
				}
			}
			 : e.isWindow(i) ? {
				width : t.width(),
				height : t.height(),
				offset : {
					top : t.scrollTop(),
					left : t.scrollLeft()
				}
			}
			 : i.preventDefault ? {
				width : 0,
				height : 0,
				offset : {
					top : i.pageY,
					left : i.pageX
				}
			}
			 : {
				width : t.outerWidth(),
				height : t.outerHeight(),
				offset : t.offset()
			}
		}
		e.ui = e.ui || {};
		var a,
		n,
		r = Math.max,
		o = Math.abs,
		h = Math.round,
		l = /left|center|right/,
		u = /top|center|bottom/,
		d = /[\+\-]\d+(\.[\d]+)?%?/,
		c = /^\w+/,
		p = /%$/,
		f = e.fn.position;
		e.position = {
			scrollbarWidth : function () {
				if (void 0 !== a)
					return a;
				var t,
				i,
				s = e("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
				n = s.children()[0];
				return e("body").append(s),
				t = n.offsetWidth,
				s.css("overflow", "scroll"),
				i = n.offsetWidth,
				t === i && (i = s[0].clientWidth),
				s.remove(),
				a = t - i
			},
			getScrollInfo : function (t) {
				var i = t.isWindow || t.isDocument ? "" : t.element.css("overflow-x"),
				s = t.isWindow || t.isDocument ? "" : t.element.css("overflow-y"),
				a = "scroll" === i || "auto" === i && t.width < t.element[0].scrollWidth,
				n = "scroll" === s || "auto" === s && t.height < t.element[0].scrollHeight;
				return {
					width : n ? e.position.scrollbarWidth() : 0,
					height : a ? e.position.scrollbarWidth() : 0
				}
			},
			getWithinInfo : function (t) {
				var i = e(t || window),
				s = e.isWindow(i[0]),
				a = !!i[0] && 9 === i[0].nodeType;
				return {
					element : i,
					isWindow : s,
					isDocument : a,
					offset : i.offset() || {
						left : 0,
						top : 0
					},
					scrollLeft : i.scrollLeft(),
					scrollTop : i.scrollTop(),
					width : s || a ? i.width() : i.outerWidth(),
					height : s || a ? i.height() : i.outerHeight()
				}
			}
		},
		e.fn.position = function (a) {
			if (!a || !a.of)
				return f.apply(this, arguments);
			a = e.extend({}, a);
			var p,
			m,
			g,
			v,
			y,
			b,
			_ = e(a.of),
			x = e.position.getWithinInfo(a.within),
			k = e.position.getScrollInfo(x),
			w = (a.collision || "flip").split(" "),
			T = {};
			return b = s(_),
			_[0].preventDefault && (a.at = "left top"),
			m = b.width,
			g = b.height,
			v = b.offset,
			y = e.extend({}, v),
			e.each(["my", "at"], function () {
				var e,
				t,
				i = (a[this] || "").split(" ");
				1 === i.length && (i = l.test(i[0]) ? i.concat(["center"]) : u.test(i[0]) ? ["center"].concat(i) : ["center", "center"]),
				i[0] = l.test(i[0]) ? i[0] : "center",
				i[1] = u.test(i[1]) ? i[1] : "center",
				e = d.exec(i[0]),
				t = d.exec(i[1]),
				T[this] = [e ? e[0] : 0, t ? t[0] : 0],
				a[this] = [c.exec(i[0])[0], c.exec(i[1])[0]]
			}),
			1 === w.length && (w[1] = w[0]),
			"right" === a.at[0] ? y.left += m : "center" === a.at[0] && (y.left += m / 2),
			"bottom" === a.at[1] ? y.top += g : "center" === a.at[1] && (y.top += g / 2),
			p = t(T.at, m, g),
			y.left += p[0],
			y.top += p[1],
			this.each(function () {
				var s,
				l,
				u = e(this),
				d = u.outerWidth(),
				c = u.outerHeight(),
				f = i(this, "marginLeft"),
				b = i(this, "marginTop"),
				D = d + f + i(this, "marginRight") + k.width,
				S = c + b + i(this, "marginBottom") + k.height,
				M = e.extend({}, y),
				N = t(T.my, u.outerWidth(), u.outerHeight());
				"right" === a.my[0] ? M.left -= d : "center" === a.my[0] && (M.left -= d / 2),
				"bottom" === a.my[1] ? M.top -= c : "center" === a.my[1] && (M.top -= c / 2),
				M.left += N[0],
				M.top += N[1],
				n || (M.left = h(M.left), M.top = h(M.top)),
				s = {
					marginLeft : f,
					marginTop : b
				},
				e.each(["left", "top"], function (t, i) {
					e.ui.position[w[t]] && e.ui.position[w[t]][i](M, {
						targetWidth : m,
						targetHeight : g,
						elemWidth : d,
						elemHeight : c,
						collisionPosition : s,
						collisionWidth : D,
						collisionHeight : S,
						offset : [p[0] + N[0], p[1] + N[1]],
						my : a.my,
						at : a.at,
						within : x,
						elem : u
					})
				}),
				a.using && (l = function (e) {
					var t = v.left - M.left,
					i = t + m - d,
					s = v.top - M.top,
					n = s + g - c,
					h = {
						target : {
							element : _,
							left : v.left,
							top : v.top,
							width : m,
							height : g
						},
						element : {
							element : u,
							left : M.left,
							top : M.top,
							width : d,
							height : c
						},
						horizontal : 0 > i ? "left" : t > 0 ? "right" : "center",
						vertical : 0 > n ? "top" : s > 0 ? "bottom" : "middle"
					};
					d > m && m > o(t + i) && (h.horizontal = "center"),
					c > g && g > o(s + n) && (h.vertical = "middle"),
					h.important = r(o(t), o(i)) > r(o(s), o(n)) ? "horizontal" : "vertical",
					a.using.call(this, e, h)
				}),
				u.offset(e.extend(M, {
						using : l
					}))
			})
		},
		e.ui.position = {
			fit : {
				left : function (e, t) {
					var i,
					s = t.within,
					a = s.isWindow ? s.scrollLeft : s.offset.left,
					n = s.width,
					o = e.left - t.collisionPosition.marginLeft,
					h = a - o,
					l = o + t.collisionWidth - n - a;
					t.collisionWidth > n ? h > 0 && 0 >= l ? (i = e.left + h + t.collisionWidth - n - a, e.left += h - i) : e.left = l > 0 && 0 >= h ? a : h > l ? a + n - t.collisionWidth : a : h > 0 ? e.left += h : l > 0 ? e.left -= l : e.left = r(e.left - o, e.left)
				},
				top : function (e, t) {
					var i,
					s = t.within,
					a = s.isWindow ? s.scrollTop : s.offset.top,
					n = t.within.height,
					o = e.top - t.collisionPosition.marginTop,
					h = a - o,
					l = o + t.collisionHeight - n - a;
					t.collisionHeight > n ? h > 0 && 0 >= l ? (i = e.top + h + t.collisionHeight - n - a, e.top += h - i) : e.top = l > 0 && 0 >= h ? a : h > l ? a + n - t.collisionHeight : a : h > 0 ? e.top += h : l > 0 ? e.top -= l : e.top = r(e.top - o, e.top)
				}
			},
			flip : {
				left : function (e, t) {
					var i,
					s,
					a = t.within,
					n = a.offset.left + a.scrollLeft,
					r = a.width,
					h = a.isWindow ? a.scrollLeft : a.offset.left,
					l = e.left - t.collisionPosition.marginLeft,
					u = l - h,
					d = l + t.collisionWidth - r - h,
					c = "left" === t.my[0] ? -t.elemWidth : "right" === t.my[0] ? t.elemWidth : 0,
					p = "left" === t.at[0] ? t.targetWidth : "right" === t.at[0] ? -t.targetWidth : 0,
					f = -2 * t.offset[0];
					0 > u ? (i = e.left + c + p + f + t.collisionWidth - r - n, (0 > i || o(u) > i) && (e.left += c + p + f)) : d > 0 && (s = e.left - t.collisionPosition.marginLeft + c + p + f - h, (s > 0 || d > o(s)) && (e.left += c + p + f))
				},
				top : function (e, t) {
					var i,
					s,
					a = t.within,
					n = a.offset.top + a.scrollTop,
					r = a.height,
					h = a.isWindow ? a.scrollTop : a.offset.top,
					l = e.top - t.collisionPosition.marginTop,
					u = l - h,
					d = l + t.collisionHeight - r - h,
					c = "top" === t.my[1],
					p = c ? -t.elemHeight : "bottom" === t.my[1] ? t.elemHeight : 0,
					f = "top" === t.at[1] ? t.targetHeight : "bottom" === t.at[1] ? -t.targetHeight : 0,
					m = -2 * t.offset[1];
					0 > u ? (s = e.top + p + f + m + t.collisionHeight - r - n, (0 > s || o(u) > s) && (e.top += p + f + m)) : d > 0 && (i = e.top - t.collisionPosition.marginTop + p + f + m - h, (i > 0 || d > o(i)) && (e.top += p + f + m))
				}
			},
			flipfit : {
				left : function () {
					e.ui.position.flip.left.apply(this, arguments),
					e.ui.position.fit.left.apply(this, arguments)
				},
				top : function () {
					e.ui.position.flip.top.apply(this, arguments),
					e.ui.position.fit.top.apply(this, arguments)
				}
			}
		},
		function () {
			var t,
			i,
			s,
			a,
			r,
			o = document.getElementsByTagName("body")[0],
			h = document.createElement("div");
			t = document.createElement(o ? "div" : "body"),
			s = {
				visibility : "hidden",
				width : 0,
				height : 0,
				border : 0,
				margin : 0,
				background : "none"
			},
			o && e.extend(s, {
				position : "absolute",
				left : "-1000px",
				top : "-1000px"
			});
			for (r in s)
				t.style[r] = s[r];
			t.appendChild(h),
			i = o || document.documentElement,
			i.insertBefore(t, i.firstChild),
			h.style.cssText = "position: absolute; left: 10.7432222px;",
			a = e(h).offset().left,
			n = a > 10 && 11 > a,
			t.innerHTML = "",
			i.removeChild(t)
		}
		()
	}
	(),
	e.ui.position,
	e.widget("ui.draggable", e.ui.mouse, {
		version : "1.11.4",
		widgetEventPrefix : "drag",
		options : {
			addClasses : !0,
			appendTo : "parent",
			axis : !1,
			connectToSortable : !1,
			containment : !1,
			cursor : "auto",
			cursorAt : !1,
			grid : !1,
			handle : !1,
			helper : "original",
			iframeFix : !1,
			opacity : !1,
			refreshPositions : !1,
			revert : !1,
			revertDuration : 500,
			scope : "default",
			scroll : !0,
			scrollSensitivity : 20,
			scrollSpeed : 20,
			snap : !1,
			snapMode : "both",
			snapTolerance : 20,
			stack : !1,
			zIndex : !1,
			drag : null,
			start : null,
			stop : null
		},
		_create : function () {
			"original" === this.options.helper && this._setPositionRelative(),
			this.options.addClasses && this.element.addClass("ui-draggable"),
			this.options.disabled && this.element.addClass("ui-draggable-disabled"),
			this._setHandleClassName(),
			this._mouseInit()
		},
		_setOption : function (e, t) {
			this._super(e, t),
			"handle" === e && (this._removeHandleClassName(), this._setHandleClassName())
		},
		_destroy : function () {
			return (this.helper || this.element).is(".ui-draggable-dragging") ? (this.destroyOnClear = !0, void 0) : (this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"), this._removeHandleClassName(), this._mouseDestroy(), void 0)
		},
		_mouseCapture : function (t) {
			var i = this.options;
			return this._blurActiveElement(t),
			this.helper || i.disabled || e(t.target).closest(".ui-resizable-handle").length > 0 ? !1 : (this.handle = this._getHandle(t), this.handle ? (this._blockFrames(i.iframeFix === !0 ? "iframe" : i.iframeFix), !0) : !1)
		},
		_blockFrames : function (t) {
			this.iframeBlocks = this.document.find(t).map(function () {
					var t = e(this);
					return e("<div>").css("position", "absolute").appendTo(t.parent()).outerWidth(t.outerWidth()).outerHeight(t.outerHeight()).offset(t.offset())[0]
				})
		},
		_unblockFrames : function () {
			this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks)
		},
		_blurActiveElement : function (t) {
			var i = this.document[0];
			if (this.handleElement.is(t.target))
				try {
					i.activeElement && "body" !== i.activeElement.nodeName.toLowerCase() && e(i.activeElement).blur()
				} catch (s) {}

		},
		_mouseStart : function (t) {
			var i = this.options;
			return this.helper = this._createHelper(t),
			this.helper.addClass("ui-draggable-dragging"),
			this._cacheHelperProportions(),
			e.ui.ddmanager && (e.ui.ddmanager.current = this),
			this._cacheMargins(),
			this.cssPosition = this.helper.css("position"),
			this.scrollParent = this.helper.scrollParent(!0),
			this.offsetParent = this.helper.offsetParent(),
			this.hasFixedAncestor = this.helper.parents().filter(function () {
					return "fixed" === e(this).css("position")
				}).length > 0,
			this.positionAbs = this.element.offset(),
			this._refreshOffsets(t),
			this.originalPosition = this.position = this._generatePosition(t, !1),
			this.originalPageX = t.pageX,
			this.originalPageY = t.pageY,
			i.cursorAt && this._adjustOffsetFromHelper(i.cursorAt),
			this._setContainment(),
			this._trigger("start", t) === !1 ? (this._clear(), !1) : (this._cacheHelperProportions(), e.ui.ddmanager && !i.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t), this._normalizeRightBottom(), this._mouseDrag(t, !0), e.ui.ddmanager && e.ui.ddmanager.dragStart(this, t), !0)
		},
		_refreshOffsets : function (e) {
			this.offset = {
				top : this.positionAbs.top - this.margins.top,
				left : this.positionAbs.left - this.margins.left,
				scroll : !1,
				parent : this._getParentOffset(),
				relative : this._getRelativeOffset()
			},
			this.offset.click = {
				left : e.pageX - this.offset.left,
				top : e.pageY - this.offset.top
			}
		},
		_mouseDrag : function (t, i) {
			if (this.hasFixedAncestor && (this.offset.parent = this._getParentOffset()), this.position = this._generatePosition(t, !0), this.positionAbs = this._convertPositionTo("absolute"), !i) {
				var s = this._uiHash();
				if (this._trigger("drag", t, s) === !1)
					return this._mouseUp({}), !1;
				this.position = s.position
			}
			return this.helper[0].style.left = this.position.left + "px",
			this.helper[0].style.top = this.position.top + "px",
			e.ui.ddmanager && e.ui.ddmanager.drag(this, t),
			!1
		},
		_mouseStop : function (t) {
			var i = this,
			s = !1;
			return e.ui.ddmanager && !this.options.dropBehaviour && (s = e.ui.ddmanager.drop(this, t)),
			this.dropped && (s = this.dropped, this.dropped = !1),
			"invalid" === this.options.revert && !s || "valid" === this.options.revert && s || this.options.revert === !0 || e.isFunction(this.options.revert) && this.options.revert.call(this.element, s) ? e(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function () {
				i._trigger("stop", t) !== !1 && i._clear()
			}) : this._trigger("stop", t) !== !1 && this._clear(),
			!1
		},
		_mouseUp : function (t) {
			return this._unblockFrames(),
			e.ui.ddmanager && e.ui.ddmanager.dragStop(this, t),
			this.handleElement.is(t.target) && this.element.focus(),
			e.ui.mouse.prototype._mouseUp.call(this, t)
		},
		cancel : function () {
			return this.helper.is(".ui-draggable-dragging") ? this._mouseUp({}) : this._clear(),
			this
		},
		_getHandle : function (t) {
			return this.options.handle ? !!e(t.target).closest(this.element.find(this.options.handle)).length : !0
		},
		_setHandleClassName : function () {
			this.handleElement = this.options.handle ? this.element.find(this.options.handle) : this.element,
			this.handleElement.addClass("ui-draggable-handle")
		},
		_removeHandleClassName : function () {
			this.handleElement.removeClass("ui-draggable-handle")
		},
		_createHelper : function (t) {
			var i = this.options,
			s = e.isFunction(i.helper),
			a = s ? e(i.helper.apply(this.element[0], [t])) : "clone" === i.helper ? this.element.clone().removeAttr("id") : this.element;
			return a.parents("body").length || a.appendTo("parent" === i.appendTo ? this.element[0].parentNode : i.appendTo),
			s && a[0] === this.element[0] && this._setPositionRelative(),
			a[0] === this.element[0] || /(fixed|absolute)/.test(a.css("position")) || a.css("position", "absolute"),
			a
		},
		_setPositionRelative : function () {
			/^(?:r|a|f)/.test(this.element.css("position")) || (this.element[0].style.position = "relative")
		},
		_adjustOffsetFromHelper : function (t) {
			"string" == typeof t && (t = t.split(" ")),
			e.isArray(t) && (t = {
					left : +t[0],
					top : +t[1] || 0
				}),
			"left" in t && (this.offset.click.left = t.left + this.margins.left),
			"right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left),
			"top" in t && (this.offset.click.top = t.top + this.margins.top),
			"bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top)
		},
		_isRootNode : function (e) {
			return /(html|body)/i.test(e.tagName) || e === this.document[0]
		},
		_getParentOffset : function () {
			var t = this.offsetParent.offset(),
			i = this.document[0];
			return "absolute" === this.cssPosition && this.scrollParent[0] !== i && e.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()),
			this._isRootNode(this.offsetParent[0]) && (t = {
					top : 0,
					left : 0
				}), {
				top : t.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
				left : t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
			}
		},
		_getRelativeOffset : function () {
			if ("relative" !== this.cssPosition)
				return {
					top : 0,
					left : 0
				};
			var e = this.element.position(),
			t = this._isRootNode(this.scrollParent[0]);
			return {
				top : e.top - (parseInt(this.helper.css("top"), 10) || 0) + (t ? 0 : this.scrollParent.scrollTop()),
				left : e.left - (parseInt(this.helper.css("left"), 10) || 0) + (t ? 0 : this.scrollParent.scrollLeft())
			}
		},
		_cacheMargins : function () {
			this.margins = {
				left : parseInt(this.element.css("marginLeft"), 10) || 0,
				top : parseInt(this.element.css("marginTop"), 10) || 0,
				right : parseInt(this.element.css("marginRight"), 10) || 0,
				bottom : parseInt(this.element.css("marginBottom"), 10) || 0
			}
		},
		_cacheHelperProportions : function () {
			this.helperProportions = {
				width : this.helper.outerWidth(),
				height : this.helper.outerHeight()
			}
		},
		_setContainment : function () {
			var t,
			i,
			s,
			a = this.options,
			n = this.document[0];
			return this.relativeContainer = null,
			a.containment ? "window" === a.containment ? (this.containment = [e(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, e(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, e(window).scrollLeft() + e(window).width() - this.helperProportions.width - this.margins.left, e(window).scrollTop() + (e(window).height() || n.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : "document" === a.containment ? (this.containment = [0, 0, e(n).width() - this.helperProportions.width - this.margins.left, (e(n).height() || n.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : a.containment.constructor === Array ? (this.containment = a.containment, void 0) : ("parent" === a.containment && (a.containment = this.helper[0].parentNode), i = e(a.containment), s = i[0], s && (t = /(scroll|auto)/.test(i.css("overflow")), this.containment = [(parseInt(i.css("borderLeftWidth"), 10) || 0) + (parseInt(i.css("paddingLeft"), 10) || 0), (parseInt(i.css("borderTopWidth"), 10) || 0) + (parseInt(i.css("paddingTop"), 10) || 0), (t ? Math.max(s.scrollWidth, s.offsetWidth) : s.offsetWidth) - (parseInt(i.css("borderRightWidth"), 10) || 0) - (parseInt(i.css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right, (t ? Math.max(s.scrollHeight, s.offsetHeight) : s.offsetHeight) - (parseInt(i.css("borderBottomWidth"), 10) || 0) - (parseInt(i.css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom], this.relativeContainer = i), void 0) : (this.containment = null, void 0)
		},
		_convertPositionTo : function (e, t) {
			t || (t = this.position);
			var i = "absolute" === e ? 1 : -1,
			s = this._isRootNode(this.scrollParent[0]);
			return {
				top : t.top + this.offset.relative.top * i + this.offset.parent.top * i - ("fixed" === this.cssPosition ? -this.offset.scroll.top : s ? 0 : this.offset.scroll.top) * i,
				left : t.left + this.offset.relative.left * i + this.offset.parent.left * i - ("fixed" === this.cssPosition ? -this.offset.scroll.left : s ? 0 : this.offset.scroll.left) * i
			}
		},
		_generatePosition : function (e, t) {
			var i,
			s,
			a,
			n,
			r = this.options,
			o = this._isRootNode(this.scrollParent[0]),
			h = e.pageX,
			l = e.pageY;
			return o && this.offset.scroll || (this.offset.scroll = {
					top : this.scrollParent.scrollTop(),
					left : this.scrollParent.scrollLeft()
				}),
			t && (this.containment && (this.relativeContainer ? (s = this.relativeContainer.offset(), i = [this.containment[0] + s.left, this.containment[1] + s.top, this.containment[2] + s.left, this.containment[3] + s.top]) : i = this.containment, e.pageX - this.offset.click.left < i[0] && (h = i[0] + this.offset.click.left), e.pageY - this.offset.click.top < i[1] && (l = i[1] + this.offset.click.top), e.pageX - this.offset.click.left > i[2] && (h = i[2] + this.offset.click.left), e.pageY - this.offset.click.top > i[3] && (l = i[3] + this.offset.click.top)), r.grid && (a = r.grid[1] ? this.originalPageY + Math.round((l - this.originalPageY) / r.grid[1]) * r.grid[1] : this.originalPageY, l = i ? a - this.offset.click.top >= i[1] || a - this.offset.click.top > i[3] ? a : a - this.offset.click.top >= i[1] ? a - r.grid[1] : a + r.grid[1] : a, n = r.grid[0] ? this.originalPageX + Math.round((h - this.originalPageX) / r.grid[0]) * r.grid[0] : this.originalPageX, h = i ? n - this.offset.click.left >= i[0] || n - this.offset.click.left > i[2] ? n : n - this.offset.click.left >= i[0] ? n - r.grid[0] : n + r.grid[0] : n), "y" === r.axis && (h = this.originalPageX), "x" === r.axis && (l = this.originalPageY)), {
				top : l - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.offset.scroll.top : o ? 0 : this.offset.scroll.top),
				left : h - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.offset.scroll.left : o ? 0 : this.offset.scroll.left)
			}
		},
		_clear : function () {
			this.helper.removeClass("ui-draggable-dragging"),
			this.helper[0] === this.element[0] || this.cancelHelperRemoval || this.helper.remove(),
			this.helper = null,
			this.cancelHelperRemoval = !1,
			this.destroyOnClear && this.destroy()
		},
		_normalizeRightBottom : function () {
			"y" !== this.options.axis && "auto" !== this.helper.css("right") && (this.helper.width(this.helper.width()), this.helper.css("right", "auto")),
			"x" !== this.options.axis && "auto" !== this.helper.css("bottom") && (this.helper.height(this.helper.height()), this.helper.css("bottom", "auto"))
		},
		_trigger : function (t, i, s) {
			return s = s || this._uiHash(),
			e.ui.plugin.call(this, t, [i, s, this], !0),
			/^(drag|start|stop)/.test(t) && (this.positionAbs = this._convertPositionTo("absolute"), s.offset = this.positionAbs),
			e.Widget.prototype._trigger.call(this, t, i, s)
		},
		plugins : {},
		_uiHash : function () {
			return {
				helper : this.helper,
				position : this.position,
				originalPosition : this.originalPosition,
				offset : this.positionAbs
			}
		}
	}),
	e.ui.plugin.add("draggable", "connectToSortable", {
		start : function (t, i, s) {
			var a = e.extend({}, i, {
					item : s.element
				});
			s.sortables = [],
			e(s.options.connectToSortable).each(function () {
				var i = e(this).sortable("instance");
				i && !i.options.disabled && (s.sortables.push(i), i.refreshPositions(), i._trigger("activate", t, a))
			})
		},
		stop : function (t, i, s) {
			var a = e.extend({}, i, {
					item : s.element
				});
			s.cancelHelperRemoval = !1,
			e.each(s.sortables, function () {
				var e = this;
				e.isOver ? (e.isOver = 0, s.cancelHelperRemoval = !0, e.cancelHelperRemoval = !1, e._storedCSS = {
						position : e.placeholder.css("position"),
						top : e.placeholder.css("top"),
						left : e.placeholder.css("left")
					}, e._mouseStop(t), e.options.helper = e.options._helper) : (e.cancelHelperRemoval = !0, e._trigger("deactivate", t, a))
			})
		},
		drag : function (t, i, s) {
			e.each(s.sortables, function () {
				var a = !1,
				n = this;
				n.positionAbs = s.positionAbs,
				n.helperProportions = s.helperProportions,
				n.offset.click = s.offset.click,
				n._intersectsWith(n.containerCache) && (a = !0, e.each(s.sortables, function () {
						return this.positionAbs = s.positionAbs,
						this.helperProportions = s.helperProportions,
						this.offset.click = s.offset.click,
						this !== n && this._intersectsWith(this.containerCache) && e.contains(n.element[0], this.element[0]) && (a = !1),
						a
					})),
				a ? (n.isOver || (n.isOver = 1, s._parent = i.helper.parent(), n.currentItem = i.helper.appendTo(n.element).data("ui-sortable-item", !0), n.options._helper = n.options.helper, n.options.helper = function () {
						return i.helper[0]
					}, t.target = n.currentItem[0], n._mouseCapture(t, !0), n._mouseStart(t, !0, !0), n.offset.click.top = s.offset.click.top, n.offset.click.left = s.offset.click.left, n.offset.parent.left -= s.offset.parent.left - n.offset.parent.left, n.offset.parent.top -= s.offset.parent.top - n.offset.parent.top, s._trigger("toSortable", t), s.dropped = n.element, e.each(s.sortables, function () {
							this.refreshPositions()
						}), s.currentItem = s.element, n.fromOutside = s), n.currentItem && (n._mouseDrag(t), i.position = n.position)) : n.isOver && (n.isOver = 0, n.cancelHelperRemoval = !0, n.options._revert = n.options.revert, n.options.revert = !1, n._trigger("out", t, n._uiHash(n)), n._mouseStop(t, !0), n.options.revert = n.options._revert, n.options.helper = n.options._helper, n.placeholder && n.placeholder.remove(), i.helper.appendTo(s._parent), s._refreshOffsets(t), i.position = s._generatePosition(t, !0), s._trigger("fromSortable", t), s.dropped = !1, e.each(s.sortables, function () {
						this.refreshPositions()
					}))
			})
		}
	}),
	e.ui.plugin.add("draggable", "cursor", {
		start : function (t, i, s) {
			var a = e("body"),
			n = s.options;
			a.css("cursor") && (n._cursor = a.css("cursor")),
			a.css("cursor", n.cursor)
		},
		stop : function (t, i, s) {
			var a = s.options;
			a._cursor && e("body").css("cursor", a._cursor)
		}
	}),
	e.ui.plugin.add("draggable", "opacity", {
		start : function (t, i, s) {
			var a = e(i.helper),
			n = s.options;
			a.css("opacity") && (n._opacity = a.css("opacity")),
			a.css("opacity", n.opacity)
		},
		stop : function (t, i, s) {
			var a = s.options;
			a._opacity && e(i.helper).css("opacity", a._opacity)
		}
	}),
	e.ui.plugin.add("draggable", "scroll", {
		start : function (e, t, i) {
			i.scrollParentNotHidden || (i.scrollParentNotHidden = i.helper.scrollParent(!1)),
			i.scrollParentNotHidden[0] !== i.document[0] && "HTML" !== i.scrollParentNotHidden[0].tagName && (i.overflowOffset = i.scrollParentNotHidden.offset())
		},
		drag : function (t, i, s) {
			var a = s.options,
			n = !1,
			r = s.scrollParentNotHidden[0],
			o = s.document[0];
			r !== o && "HTML" !== r.tagName ? (a.axis && "x" === a.axis || (s.overflowOffset.top + r.offsetHeight - t.pageY < a.scrollSensitivity ? r.scrollTop = n = r.scrollTop + a.scrollSpeed : t.pageY - s.overflowOffset.top < a.scrollSensitivity && (r.scrollTop = n = r.scrollTop - a.scrollSpeed)), a.axis && "y" === a.axis || (s.overflowOffset.left + r.offsetWidth - t.pageX < a.scrollSensitivity ? r.scrollLeft = n = r.scrollLeft + a.scrollSpeed : t.pageX - s.overflowOffset.left < a.scrollSensitivity && (r.scrollLeft = n = r.scrollLeft - a.scrollSpeed))) : (a.axis && "x" === a.axis || (t.pageY - e(o).scrollTop() < a.scrollSensitivity ? n = e(o).scrollTop(e(o).scrollTop() - a.scrollSpeed) : e(window).height() - (t.pageY - e(o).scrollTop()) < a.scrollSensitivity && (n = e(o).scrollTop(e(o).scrollTop() + a.scrollSpeed))), a.axis && "y" === a.axis || (t.pageX - e(o).scrollLeft() < a.scrollSensitivity ? n = e(o).scrollLeft(e(o).scrollLeft() - a.scrollSpeed) : e(window).width() - (t.pageX - e(o).scrollLeft()) < a.scrollSensitivity && (n = e(o).scrollLeft(e(o).scrollLeft() + a.scrollSpeed)))),
			n !== !1 && e.ui.ddmanager && !a.dropBehaviour && e.ui.ddmanager.prepareOffsets(s, t)
		}
	}),
	e.ui.plugin.add("draggable", "snap", {
		start : function (t, i, s) {
			var a = s.options;
			s.snapElements = [],
			e(a.snap.constructor !== String ? a.snap.items || ":data(ui-draggable)" : a.snap).each(function () {
				var t = e(this),
				i = t.offset();
				this !== s.element[0] && s.snapElements.push({
					item : this,
					width : t.outerWidth(),
					height : t.outerHeight(),
					top : i.top,
					left : i.left
				})
			})
		},
		drag : function (t, i, s) {
			var a,
			n,
			r,
			o,
			h,
			l,
			u,
			d,
			c,
			p,
			f = s.options,
			m = f.snapTolerance,
			g = i.offset.left,
			v = g + s.helperProportions.width,
			y = i.offset.top,
			b = y + s.helperProportions.height;
			for (c = s.snapElements.length - 1; c >= 0; c--)
				h = s.snapElements[c].left - s.margins.left, l = h + s.snapElements[c].width, u = s.snapElements[c].top - s.margins.top, d = u + s.snapElements[c].height, h - m > v || g > l + m || u - m > b || y > d + m || !e.contains(s.snapElements[c].item.ownerDocument, s.snapElements[c].item) ? (s.snapElements[c].snapping && s.options.snap.release && s.options.snap.release.call(s.element, t, e.extend(s._uiHash(), {
							snapItem : s.snapElements[c].item
						})), s.snapElements[c].snapping = !1) : ("inner" !== f.snapMode && (a = m >= Math.abs(u - b), n = m >= Math.abs(d - y), r = m >= Math.abs(h - v), o = m >= Math.abs(l - g), a && (i.position.top = s._convertPositionTo("relative", {
									top : u - s.helperProportions.height,
									left : 0
								}).top), n && (i.position.top = s._convertPositionTo("relative", {
									top : d,
									left : 0
								}).top), r && (i.position.left = s._convertPositionTo("relative", {
									top : 0,
									left : h - s.helperProportions.width
								}).left), o && (i.position.left = s._convertPositionTo("relative", {
									top : 0,
									left : l
								}).left)), p = a || n || r || o, "outer" !== f.snapMode && (a = m >= Math.abs(u - y), n = m >= Math.abs(d - b), r = m >= Math.abs(h - g), o = m >= Math.abs(l - v), a && (i.position.top = s._convertPositionTo("relative", {
									top : u,
									left : 0
								}).top), n && (i.position.top = s._convertPositionTo("relative", {
									top : d - s.helperProportions.height,
									left : 0
								}).top), r && (i.position.left = s._convertPositionTo("relative", {
									top : 0,
									left : h
								}).left), o && (i.position.left = s._convertPositionTo("relative", {
									top : 0,
									left : l - s.helperProportions.width
								}).left)), !s.snapElements[c].snapping && (a || n || r || o || p) && s.options.snap.snap && s.options.snap.snap.call(s.element, t, e.extend(s._uiHash(), {
							snapItem : s.snapElements[c].item
						})), s.snapElements[c].snapping = a || n || r || o || p)
		}
	}),
	e.ui.plugin.add("draggable", "stack", {
		start : function (t, i, s) {
			var a,
			n = s.options,
			r = e.makeArray(e(n.stack)).sort(function (t, i) {
					return (parseInt(e(t).css("zIndex"), 10) || 0) - (parseInt(e(i).css("zIndex"), 10) || 0)
				});
			r.length && (a = parseInt(e(r[0]).css("zIndex"), 10) || 0, e(r).each(function (t) {
					e(this).css("zIndex", a + t)
				}), this.css("zIndex", a + r.length))
		}
	}),
	e.ui.plugin.add("draggable", "zIndex", {
		start : function (t, i, s) {
			var a = e(i.helper),
			n = s.options;
			a.css("zIndex") && (n._zIndex = a.css("zIndex")),
			a.css("zIndex", n.zIndex)
		},
		stop : function (t, i, s) {
			var a = s.options;
			a._zIndex && e(i.helper).css("zIndex", a._zIndex)
		}
	}),
	e.ui.draggable,
	e.widget("ui.droppable", {
		version : "1.11.4",
		widgetEventPrefix : "drop",
		options : {
			accept : "*",
			activeClass : !1,
			addClasses : !0,
			greedy : !1,
			hoverClass : !1,
			scope : "default",
			tolerance : "intersect",
			activate : null,
			deactivate : null,
			drop : null,
			out : null,
			over : null
		},
		_create : function () {
			var t,
			i = this.options,
			s = i.accept;
			this.isover = !1,
			this.isout = !0,
			this.accept = e.isFunction(s) ? s : function (e) {
				return e.is(s)
			},
			this.proportions = function () {
				return arguments.length ? (t = arguments[0], void 0) : t ? t : t = {
					width : this.element[0].offsetWidth,
					height : this.element[0].offsetHeight
				}
			},
			this._addToManager(i.scope),
			i.addClasses && this.element.addClass("ui-droppable")
		},
		_addToManager : function (t) {
			e.ui.ddmanager.droppables[t] = e.ui.ddmanager.droppables[t] || [],
			e.ui.ddmanager.droppables[t].push(this)
		},
		_splice : function (e) {
			for (var t = 0; e.length > t; t++)
				e[t] === this && e.splice(t, 1)
		},
		_destroy : function () {
			var t = e.ui.ddmanager.droppables[this.options.scope];
			this._splice(t),
			this.element.removeClass("ui-droppable ui-droppable-disabled")
		},
		_setOption : function (t, i) {
			if ("accept" === t)
				this.accept = e.isFunction(i) ? i : function (e) {
					return e.is(i)
				};
			else if ("scope" === t) {
				var s = e.ui.ddmanager.droppables[this.options.scope];
				this._splice(s),
				this._addToManager(i)
			}
			this._super(t, i)
		},
		_activate : function (t) {
			var i = e.ui.ddmanager.current;
			this.options.activeClass && this.element.addClass(this.options.activeClass),
			i && this._trigger("activate", t, this.ui(i))
		},
		_deactivate : function (t) {
			var i = e.ui.ddmanager.current;
			this.options.activeClass && this.element.removeClass(this.options.activeClass),
			i && this._trigger("deactivate", t, this.ui(i))
		},
		_over : function (t) {
			var i = e.ui.ddmanager.current;
			i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this.options.hoverClass && this.element.addClass(this.options.hoverClass), this._trigger("over", t, this.ui(i)))
		},
		_out : function (t) {
			var i = e.ui.ddmanager.current;
			i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this.options.hoverClass && this.element.removeClass(this.options.hoverClass), this._trigger("out", t, this.ui(i)))
		},
		_drop : function (t, i) {
			var s = i || e.ui.ddmanager.current,
			a = !1;
			return s && (s.currentItem || s.element)[0] !== this.element[0] ? (this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function () {
					var i = e(this).droppable("instance");
					return i.options.greedy && !i.options.disabled && i.options.scope === s.options.scope && i.accept.call(i.element[0], s.currentItem || s.element) && e.ui.intersect(s, e.extend(i, {
							offset : i.element.offset()
						}), i.options.tolerance, t) ? (a = !0, !1) : void 0
				}), a ? !1 : this.accept.call(this.element[0], s.currentItem || s.element) ? (this.options.activeClass && this.element.removeClass(this.options.activeClass), this.options.hoverClass && this.element.removeClass(this.options.hoverClass), this._trigger("drop", t, this.ui(s)), this.element) : !1) : !1
		},
		ui : function (e) {
			return {
				draggable : e.currentItem || e.element,
				helper : e.helper,
				position : e.position,
				offset : e.positionAbs
			}
		}
	}),
	e.ui.intersect = function () {
		function e(e, t, i) {
			return e >= t && t + i > e
		}
		return function (t, i, s, a) {
			if (!i.offset)
				return !1;
			var n = (t.positionAbs || t.position.absolute).left + t.margins.left,
			r = (t.positionAbs || t.position.absolute).top + t.margins.top,
			o = n + t.helperProportions.width,
			h = r + t.helperProportions.height,
			l = i.offset.left,
			u = i.offset.top,
			d = l + i.proportions().width,
			c = u + i.proportions().height;
			switch (s) {
			case "fit":
				return n >= l && d >= o && r >= u && c >= h;
			case "intersect":
				return n + t.helperProportions.width / 2 > l && d > o - t.helperProportions.width / 2 && r + t.helperProportions.height / 2 > u && c > h - t.helperProportions.height / 2;
			case "pointer":
				return e(a.pageY, u, i.proportions().height) && e(a.pageX, l, i.proportions().width);
			case "touch":
				return (r >= u && c >= r || h >= u && c >= h || u > r && h > c) && (n >= l && d >= n || o >= l && d >= o || l > n && o > d);
			default:
				return !1
			}
		}
	}
	(),
	e.ui.ddmanager = {
		current : null,
		droppables : {
			"default" : []
		},
		prepareOffsets : function (t, i) {
			var s,
			a,
			n = e.ui.ddmanager.droppables[t.options.scope] || [],
			r = i ? i.type : null,
			o = (t.currentItem || t.element).find(":data(ui-droppable)").addBack();
			e : for (s = 0; n.length > s; s++)
				if (!(n[s].options.disabled || t && !n[s].accept.call(n[s].element[0], t.currentItem || t.element))) {
					for (a = 0; o.length > a; a++)
						if (o[a] === n[s].element[0]) {
							n[s].proportions().height = 0;
							continue e
						}
					n[s].visible = "none" !== n[s].element.css("display"),
					n[s].visible && ("mousedown" === r && n[s]._activate.call(n[s], i), n[s].offset = n[s].element.offset(), n[s].proportions({
							width : n[s].element[0].offsetWidth,
							height : n[s].element[0].offsetHeight
						}))
				}
		},
		drop : function (t, i) {
			var s = !1;
			return e.each((e.ui.ddmanager.droppables[t.options.scope] || []).slice(), function () {
				this.options && (!this.options.disabled && this.visible && e.ui.intersect(t, this, this.options.tolerance, i) && (s = this._drop.call(this, i) || s), !this.options.disabled && this.visible && this.accept.call(this.element[0], t.currentItem || t.element) && (this.isout = !0, this.isover = !1, this._deactivate.call(this, i)))
			}),
			s
		},
		dragStart : function (t, i) {
			t.element.parentsUntil("body").bind("scroll.droppable", function () {
				t.options.refreshPositions || e.ui.ddmanager.prepareOffsets(t, i)
			})
		},
		drag : function (t, i) {
			t.options.refreshPositions && e.ui.ddmanager.prepareOffsets(t, i),
			e.each(e.ui.ddmanager.droppables[t.options.scope] || [], function () {
				if (!this.options.disabled && !this.greedyChild && this.visible) {
					var s,
					a,
					n,
					r = e.ui.intersect(t, this, this.options.tolerance, i),
					o = !r && this.isover ? "isout" : r && !this.isover ? "isover" : null;
					o && (this.options.greedy && (a = this.options.scope, n = this.element.parents(":data(ui-droppable)").filter(function () {
									return e(this).droppable("instance").options.scope === a
								}), n.length && (s = e(n[0]).droppable("instance"), s.greedyChild = "isover" === o)), s && "isover" === o && (s.isover = !1, s.isout = !0, s._out.call(s, i)), this[o] = !0, this["isout" === o ? "isover" : "isout"] = !1, this["isover" === o ? "_over" : "_out"].call(this, i), s && "isout" === o && (s.isout = !1, s.isover = !0, s._over.call(s, i)))
				}
			})
		},
		dragStop : function (t, i) {
			t.element.parentsUntil("body").unbind("scroll.droppable"),
			t.options.refreshPositions || e.ui.ddmanager.prepareOffsets(t, i)
		}
	},
	e.ui.droppable,
	e.widget("ui.resizable", e.ui.mouse, {
		version : "1.11.4",
		widgetEventPrefix : "resize",
		options : {
			alsoResize : !1,
			animate : !1,
			animateDuration : "slow",
			animateEasing : "swing",
			aspectRatio : !1,
			autoHide : !1,
			containment : !1,
			ghost : !1,
			grid : !1,
			handles : "e,s,se",
			helper : !1,
			maxHeight : null,
			maxWidth : null,
			minHeight : 10,
			minWidth : 10,
			zIndex : 90,
			resize : null,
			start : null,
			stop : null
		},
		_num : function (e) {
			return parseInt(e, 10) || 0
		},
		_isNumber : function (e) {
			return !isNaN(parseInt(e, 10))
		},
		_hasScroll : function (t, i) {
			if ("hidden" === e(t).css("overflow"))
				return !1;
			var s = i && "left" === i ? "scrollLeft" : "scrollTop",
			a = !1;
			return t[s] > 0 ? !0 : (t[s] = 1, a = t[s] > 0, t[s] = 0, a)
		},
		_create : function () {
			var t,
			i,
			s,
			a,
			n,
			r = this,
			o = this.options;
			if (this.element.addClass("ui-resizable"), e.extend(this, {
					_aspectRatio : !!o.aspectRatio,
					aspectRatio : o.aspectRatio,
					originalElement : this.element,
					_proportionallyResizeElements : [],
					_helper : o.helper || o.ghost || o.animate ? o.helper || "ui-resizable-helper" : null
				}), this.element[0].nodeName.match(/^(canvas|textarea|input|select|button|img)$/i) && (this.element.wrap(e("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({
							position : this.element.css("position"),
							width : this.element.outerWidth(),
							height : this.element.outerHeight(),
							top : this.element.css("top"),
							left : this.element.css("left")
						})), this.element = this.element.parent().data("ui-resizable", this.element.resizable("instance")), this.elementIsWrapper = !0, this.element.css({
						marginLeft : this.originalElement.css("marginLeft"),
						marginTop : this.originalElement.css("marginTop"),
						marginRight : this.originalElement.css("marginRight"),
						marginBottom : this.originalElement.css("marginBottom")
					}), this.originalElement.css({
						marginLeft : 0,
						marginTop : 0,
						marginRight : 0,
						marginBottom : 0
					}), this.originalResizeStyle = this.originalElement.css("resize"), this.originalElement.css("resize", "none"), this._proportionallyResizeElements.push(this.originalElement.css({
							position : "static",
							zoom : 1,
							display : "block"
						})), this.originalElement.css({
						margin : this.originalElement.css("margin")
					}), this._proportionallyResize()), this.handles = o.handles || (e(".ui-resizable-handle", this.element).length ? {
						n : ".ui-resizable-n",
						e : ".ui-resizable-e",
						s : ".ui-resizable-s",
						w : ".ui-resizable-w",
						se : ".ui-resizable-se",
						sw : ".ui-resizable-sw",
						ne : ".ui-resizable-ne",
						nw : ".ui-resizable-nw"
					}
						 : "e,s,se"), this._handles = e(), this.handles.constructor === String)
				for ("all" === this.handles && (this.handles = "n,e,s,w,se,sw,ne,nw"), t = this.handles.split(","), this.handles = {}, i = 0; t.length > i; i++)
					s = e.trim(t[i]), n = "ui-resizable-" + s, a = e("<div class='ui-resizable-handle " + n + "'></div>"), a.css({
						zIndex : o.zIndex
					}), "se" === s && a.addClass("ui-icon ui-icon-gripsmall-diagonal-se"), this.handles[s] = ".ui-resizable-" + s, this.element.append(a);
			this._renderAxis = function (t) {
				var i,
				s,
				a,
				n;
				t = t || this.element;
				for (i in this.handles)
					this.handles[i].constructor === String ? this.handles[i] = this.element.children(this.handles[i]).first().show() : (this.handles[i].jquery || this.handles[i].nodeType) && (this.handles[i] = e(this.handles[i]), this._on(this.handles[i], {
								mousedown : r._mouseDown
							})), this.elementIsWrapper && this.originalElement[0].nodeName.match(/^(textarea|input|select|button)$/i) && (s = e(this.handles[i], this.element), n = /sw|ne|nw|se|n|s/.test(i) ? s.outerHeight() : s.outerWidth(), a = ["padding", /ne|nw|n/.test(i) ? "Top" : /se|sw|s/.test(i) ? "Bottom" : /^e$/.test(i) ? "Right" : "Left"].join(""), t.css(a, n), this._proportionallyResize()), this._handles = this._handles.add(this.handles[i])
			},
			this._renderAxis(this.element),
			this._handles = this._handles.add(this.element.find(".ui-resizable-handle")),
			this._handles.disableSelection(),
			this._handles.mouseover(function () {
				r.resizing || (this.className && (a = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)), r.axis = a && a[1] ? a[1] : "se")
			}),
			o.autoHide && (this._handles.hide(), e(this.element).addClass("ui-resizable-autohide").mouseenter(function () {
					o.disabled || (e(this).removeClass("ui-resizable-autohide"), r._handles.show())
				}).mouseleave(function () {
					o.disabled || r.resizing || (e(this).addClass("ui-resizable-autohide"), r._handles.hide())
				})),
			this._mouseInit()
		},
		_destroy : function () {
			this._mouseDestroy();
			var t,
			i = function (t) {
				e(t).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove()
			};
			return this.elementIsWrapper && (i(this.element), t = this.element, this.originalElement.css({
					position : t.css("position"),
					width : t.outerWidth(),
					height : t.outerHeight(),
					top : t.css("top"),
					left : t.css("left")
				}).insertAfter(t), t.remove()),
			this.originalElement.css("resize", this.originalResizeStyle),
			i(this.originalElement),
			this
		},
		_mouseCapture : function (t) {
			var i,
			s,
			a = !1;
			for (i in this.handles)
				s = e(this.handles[i])[0], (s === t.target || e.contains(s, t.target)) && (a = !0);
			return !this.options.disabled && a
		},
		_mouseStart : function (t) {
			var i,
			s,
			a,
			n = this.options,
			r = this.element;
			return this.resizing = !0,
			this._renderProxy(),
			i = this._num(this.helper.css("left")),
			s = this._num(this.helper.css("top")),
			n.containment && (i += e(n.containment).scrollLeft() || 0, s += e(n.containment).scrollTop() || 0),
			this.offset = this.helper.offset(),
			this.position = {
				left : i,
				top : s
			},
			this.size = this._helper ? {
				width : this.helper.width(),
				height : this.helper.height()
			}
			 : {
				width : r.width(),
				height : r.height()
			},
			this.originalSize = this._helper ? {
				width : r.outerWidth(),
				height : r.outerHeight()
			}
			 : {
				width : r.width(),
				height : r.height()
			},
			this.sizeDiff = {
				width : r.outerWidth() - r.width(),
				height : r.outerHeight() - r.height()
			},
			this.originalPosition = {
				left : i,
				top : s
			},
			this.originalMousePosition = {
				left : t.pageX,
				top : t.pageY
			},
			this.aspectRatio = "number" == typeof n.aspectRatio ? n.aspectRatio : this.originalSize.width / this.originalSize.height || 1,
			a = e(".ui-resizable-" + this.axis).css("cursor"),
			e("body").css("cursor", "auto" === a ? this.axis + "-resize" : a),
			r.addClass("ui-resizable-resizing"),
			this._propagate("start", t),
			!0
		},
		_mouseDrag : function (t) {
			var i,
			s,
			a = this.originalMousePosition,
			n = this.axis,
			r = t.pageX - a.left || 0,
			o = t.pageY - a.top || 0,
			h = this._change[n];
			return this._updatePrevProperties(),
			h ? (i = h.apply(this, [t, r, o]), this._updateVirtualBoundaries(t.shiftKey), (this._aspectRatio || t.shiftKey) && (i = this._updateRatio(i, t)), i = this._respectSize(i, t), this._updateCache(i), this._propagate("resize", t), s = this._applyChanges(), !this._helper && this._proportionallyResizeElements.length && this._proportionallyResize(), e.isEmptyObject(s) || (this._updatePrevProperties(), this._trigger("resize", t, this.ui()), this._applyChanges()), !1) : !1
		},
		_mouseStop : function (t) {
			this.resizing = !1;
			var i,
			s,
			a,
			n,
			r,
			o,
			h,
			l = this.options,
			u = this;
			return this._helper && (i = this._proportionallyResizeElements, s = i.length && /textarea/i.test(i[0].nodeName), a = s && this._hasScroll(i[0], "left") ? 0 : u.sizeDiff.height, n = s ? 0 : u.sizeDiff.width, r = {
					width : u.helper.width() - n,
					height : u.helper.height() - a
				}, o = parseInt(u.element.css("left"), 10) + (u.position.left - u.originalPosition.left) || null, h = parseInt(u.element.css("top"), 10) + (u.position.top - u.originalPosition.top) || null, l.animate || this.element.css(e.extend(r, {
						top : h,
						left : o
					})), u.helper.height(u.size.height), u.helper.width(u.size.width), this._helper && !l.animate && this._proportionallyResize()),
			e("body").css("cursor", "auto"),
			this.element.removeClass("ui-resizable-resizing"),
			this._propagate("stop", t),
			this._helper && this.helper.remove(),
			!1
		},
		_updatePrevProperties : function () {
			this.prevPosition = {
				top : this.position.top,
				left : this.position.left
			},
			this.prevSize = {
				width : this.size.width,
				height : this.size.height
			}
		},
		_applyChanges : function () {
			var e = {};
			return this.position.top !== this.prevPosition.top && (e.top = this.position.top + "px"),
			this.position.left !== this.prevPosition.left && (e.left = this.position.left + "px"),
			this.size.width !== this.prevSize.width && (e.width = this.size.width + "px"),
			this.size.height !== this.prevSize.height && (e.height = this.size.height + "px"),
			this.helper.css(e),
			e
		},
		_updateVirtualBoundaries : function (e) {
			var t,
			i,
			s,
			a,
			n,
			r = this.options;
			n = {
				minWidth : this._isNumber(r.minWidth) ? r.minWidth : 0,
				maxWidth : this._isNumber(r.maxWidth) ? r.maxWidth : 1 / 0,
				minHeight : this._isNumber(r.minHeight) ? r.minHeight : 0,
				maxHeight : this._isNumber(r.maxHeight) ? r.maxHeight : 1 / 0
			},
			(this._aspectRatio || e) && (t = n.minHeight * this.aspectRatio, s = n.minWidth / this.aspectRatio, i = n.maxHeight * this.aspectRatio, a = n.maxWidth / this.aspectRatio, t > n.minWidth && (n.minWidth = t), s > n.minHeight && (n.minHeight = s), n.maxWidth > i && (n.maxWidth = i), n.maxHeight > a && (n.maxHeight = a)),
			this._vBoundaries = n
		},
		_updateCache : function (e) {
			this.offset = this.helper.offset(),
			this._isNumber(e.left) && (this.position.left = e.left),
			this._isNumber(e.top) && (this.position.top = e.top),
			this._isNumber(e.height) && (this.size.height = e.height),
			this._isNumber(e.width) && (this.size.width = e.width)
		},
		_updateRatio : function (e) {
			var t = this.position,
			i = this.size,
			s = this.axis;
			return this._isNumber(e.height) ? e.width = e.height * this.aspectRatio : this._isNumber(e.width) && (e.height = e.width / this.aspectRatio),
			"sw" === s && (e.left = t.left + (i.width - e.width), e.top = null),
			"nw" === s && (e.top = t.top + (i.height - e.height), e.left = t.left + (i.width - e.width)),
			e
		},
		_respectSize : function (e) {
			var t = this._vBoundaries,
			i = this.axis,
			s = this._isNumber(e.width) && t.maxWidth && t.maxWidth < e.width,
			a = this._isNumber(e.height) && t.maxHeight && t.maxHeight < e.height,
			n = this._isNumber(e.width) && t.minWidth && t.minWidth > e.width,
			r = this._isNumber(e.height) && t.minHeight && t.minHeight > e.height,
			o = this.originalPosition.left + this.originalSize.width,
			h = this.position.top + this.size.height,
			l = /sw|nw|w/.test(i),
			u = /nw|ne|n/.test(i);
			return n && (e.width = t.minWidth),
			r && (e.height = t.minHeight),
			s && (e.width = t.maxWidth),
			a && (e.height = t.maxHeight),
			n && l && (e.left = o - t.minWidth),
			s && l && (e.left = o - t.maxWidth),
			r && u && (e.top = h - t.minHeight),
			a && u && (e.top = h - t.maxHeight),
			e.width || e.height || e.left || !e.top ? e.width || e.height || e.top || !e.left || (e.left = null) : e.top = null,
			e
		},
		_getPaddingPlusBorderDimensions : function (e) {
			for (var t = 0, i = [], s = [e.css("borderTopWidth"), e.css("borderRightWidth"), e.css("borderBottomWidth"), e.css("borderLeftWidth")], a = [e.css("paddingTop"), e.css("paddingRight"), e.css("paddingBottom"), e.css("paddingLeft")]; 4 > t; t++)
				i[t] = parseInt(s[t], 10) || 0, i[t] += parseInt(a[t], 10) || 0;
			return {
				height : i[0] + i[2],
				width : i[1] + i[3]
			}
		},
		_proportionallyResize : function () {
			if (this._proportionallyResizeElements.length)
				for (var e, t = 0, i = this.helper || this.element; this._proportionallyResizeElements.length > t; t++)
					e = this._proportionallyResizeElements[t], this.outerDimensions || (this.outerDimensions = this._getPaddingPlusBorderDimensions(e)), e.css({
						height : i.height() - this.outerDimensions.height || 0,
						width : i.width() - this.outerDimensions.width || 0
					})
		},
		_renderProxy : function () {
			var t = this.element,
			i = this.options;
			this.elementOffset = t.offset(),
			this._helper ? (this.helper = this.helper || e("<div style='overflow:hidden;'></div>"), this.helper.addClass(this._helper).css({
					width : this.element.outerWidth() - 1,
					height : this.element.outerHeight() - 1,
					position : "absolute",
					left : this.elementOffset.left + "px",
					top : this.elementOffset.top + "px",
					zIndex : ++i.zIndex
				}), this.helper.appendTo("body").disableSelection()) : this.helper = this.element
		},
		_change : {
			e : function (e, t) {
				return {
					width : this.originalSize.width + t
				}
			},
			w : function (e, t) {
				var i = this.originalSize,
				s = this.originalPosition;
				return {
					left : s.left + t,
					width : i.width - t
				}
			},
			n : function (e, t, i) {
				var s = this.originalSize,
				a = this.originalPosition;
				return {
					top : a.top + i,
					height : s.height - i
				}
			},
			s : function (e, t, i) {
				return {
					height : this.originalSize.height + i
				}
			},
			se : function (t, i, s) {
				return e.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [t, i, s]))
			},
			sw : function (t, i, s) {
				return e.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [t, i, s]))
			},
			ne : function (t, i, s) {
				return e.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [t, i, s]))
			},
			nw : function (t, i, s) {
				return e.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [t, i, s]))
			}
		},
		_propagate : function (t, i) {
			e.ui.plugin.call(this, t, [i, this.ui()]),
			"resize" !== t && this._trigger(t, i, this.ui())
		},
		plugins : {},
		ui : function () {
			return {
				originalElement : this.originalElement,
				element : this.element,
				helper : this.helper,
				position : this.position,
				size : this.size,
				originalSize : this.originalSize,
				originalPosition : this.originalPosition
			}
		}
	}),
	e.ui.plugin.add("resizable", "animate", {
		stop : function (t) {
			var i = e(this).resizable("instance"),
			s = i.options,
			a = i._proportionallyResizeElements,
			n = a.length && /textarea/i.test(a[0].nodeName),
			r = n && i._hasScroll(a[0], "left") ? 0 : i.sizeDiff.height,
			o = n ? 0 : i.sizeDiff.width,
			h = {
				width : i.size.width - o,
				height : i.size.height - r
			},
			l = parseInt(i.element.css("left"), 10) + (i.position.left - i.originalPosition.left) || null,
			u = parseInt(i.element.css("top"), 10) + (i.position.top - i.originalPosition.top) || null;
			i.element.animate(e.extend(h, u && l ? {
					top : u,
					left : l
				}
					 : {}), {
				duration : s.animateDuration,
				easing : s.animateEasing,
				step : function () {
					var s = {
						width : parseInt(i.element.css("width"), 10),
						height : parseInt(i.element.css("height"), 10),
						top : parseInt(i.element.css("top"), 10),
						left : parseInt(i.element.css("left"), 10)
					};
					a && a.length && e(a[0]).css({
						width : s.width,
						height : s.height
					}),
					i._updateCache(s),
					i._propagate("resize", t)
				}
			})
		}
	}),
	e.ui.plugin.add("resizable", "containment", {
		start : function () {
			var t,
			i,
			s,
			a,
			n,
			r,
			o,
			h = e(this).resizable("instance"),
			l = h.options,
			u = h.element,
			d = l.containment,
			c = d instanceof e ? d.get(0) : /parent/.test(d) ? u.parent().get(0) : d;
			c && (h.containerElement = e(c), /document/.test(d) || d === document ? (h.containerOffset = {
						left : 0,
						top : 0
					}, h.containerPosition = {
						left : 0,
						top : 0
					}, h.parentData = {
						element : e(document),
						left : 0,
						top : 0,
						width : e(document).width(),
						height : e(document).height() || document.body.parentNode.scrollHeight
					}) : (t = e(c), i = [], e(["Top", "Right", "Left", "Bottom"]).each(function (e, s) {
						i[e] = h._num(t.css("padding" + s))
					}), h.containerOffset = t.offset(), h.containerPosition = t.position(), h.containerSize = {
						height : t.innerHeight() - i[3],
						width : t.innerWidth() - i[1]
					}, s = h.containerOffset, a = h.containerSize.height, n = h.containerSize.width, r = h._hasScroll(c, "left") ? c.scrollWidth : n, o = h._hasScroll(c) ? c.scrollHeight : a, h.parentData = {
						element : c,
						left : s.left,
						top : s.top,
						width : r,
						height : o
					}))
		},
		resize : function (t) {
			var i,
			s,
			a,
			n,
			r = e(this).resizable("instance"),
			o = r.options,
			h = r.containerOffset,
			l = r.position,
			u = r._aspectRatio || t.shiftKey,
			d = {
				top : 0,
				left : 0
			},
			c = r.containerElement,
			p = !0;
			c[0] !== document && /static/.test(c.css("position")) && (d = h),
			l.left < (r._helper ? h.left : 0) && (r.size.width = r.size.width + (r._helper ? r.position.left - h.left : r.position.left - d.left), u && (r.size.height = r.size.width / r.aspectRatio, p = !1), r.position.left = o.helper ? h.left : 0),
			l.top < (r._helper ? h.top : 0) && (r.size.height = r.size.height + (r._helper ? r.position.top - h.top : r.position.top), u && (r.size.width = r.size.height * r.aspectRatio, p = !1), r.position.top = r._helper ? h.top : 0),
			a = r.containerElement.get(0) === r.element.parent().get(0),
			n = /relative|absolute/.test(r.containerElement.css("position")),
			a && n ? (r.offset.left = r.parentData.left + r.position.left, r.offset.top = r.parentData.top + r.position.top) : (r.offset.left = r.element.offset().left, r.offset.top = r.element.offset().top),
			i = Math.abs(r.sizeDiff.width + (r._helper ? r.offset.left - d.left : r.offset.left - h.left)),
			s = Math.abs(r.sizeDiff.height + (r._helper ? r.offset.top - d.top : r.offset.top - h.top)),
			i + r.size.width >= r.parentData.width && (r.size.width = r.parentData.width - i, u && (r.size.height = r.size.width / r.aspectRatio, p = !1)),
			s + r.size.height >= r.parentData.height && (r.size.height = r.parentData.height - s, u && (r.size.width = r.size.height * r.aspectRatio, p = !1)),
			p || (r.position.left = r.prevPosition.left, r.position.top = r.prevPosition.top, r.size.width = r.prevSize.width, r.size.height = r.prevSize.height)
		},
		stop : function () {
			var t = e(this).resizable("instance"),
			i = t.options,
			s = t.containerOffset,
			a = t.containerPosition,
			n = t.containerElement,
			r = e(t.helper),
			o = r.offset(),
			h = r.outerWidth() - t.sizeDiff.width,
			l = r.outerHeight() - t.sizeDiff.height;
			t._helper && !i.animate && /relative/.test(n.css("position")) && e(this).css({
				left : o.left - a.left - s.left,
				width : h,
				height : l
			}),
			t._helper && !i.animate && /static/.test(n.css("position")) && e(this).css({
				left : o.left - a.left - s.left,
				width : h,
				height : l
			})
		}
	}),
	e.ui.plugin.add("resizable", "alsoResize", {
		start : function () {
			var t = e(this).resizable("instance"),
			i = t.options;
			e(i.alsoResize).each(function () {
				var t = e(this);
				t.data("ui-resizable-alsoresize", {
					width : parseInt(t.width(), 10),
					height : parseInt(t.height(), 10),
					left : parseInt(t.css("left"), 10),
					top : parseInt(t.css("top"), 10)
				})
			})
		},
		resize : function (t, i) {
			var s = e(this).resizable("instance"),
			a = s.options,
			n = s.originalSize,
			r = s.originalPosition,
			o = {
				height : s.size.height - n.height || 0,
				width : s.size.width - n.width || 0,
				top : s.position.top - r.top || 0,
				left : s.position.left - r.left || 0
			};
			e(a.alsoResize).each(function () {
				var t = e(this),
				s = e(this).data("ui-resizable-alsoresize"),
				a = {},
				n = t.parents(i.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];
				e.each(n, function (e, t) {
					var i = (s[t] || 0) + (o[t] || 0);
					i && i >= 0 && (a[t] = i || null)
				}),
				t.css(a)
			})
		},
		stop : function () {
			e(this).removeData("resizable-alsoresize")
		}
	}),
	e.ui.plugin.add("resizable", "ghost", {
		start : function () {
			var t = e(this).resizable("instance"),
			i = t.options,
			s = t.size;
			t.ghost = t.originalElement.clone(),
			t.ghost.css({
				opacity : .25,
				display : "block",
				position : "relative",
				height : s.height,
				width : s.width,
				margin : 0,
				left : 0,
				top : 0
			}).addClass("ui-resizable-ghost").addClass("string" == typeof i.ghost ? i.ghost : ""),
			t.ghost.appendTo(t.helper)
		},
		resize : function () {
			var t = e(this).resizable("instance");
			t.ghost && t.ghost.css({
				position : "relative",
				height : t.size.height,
				width : t.size.width
			})
		},
		stop : function () {
			var t = e(this).resizable("instance");
			t.ghost && t.helper && t.helper.get(0).removeChild(t.ghost.get(0))
		}
	}),
	e.ui.plugin.add("resizable", "grid", {
		resize : function () {
			var t,
			i = e(this).resizable("instance"),
			s = i.options,
			a = i.size,
			n = i.originalSize,
			r = i.originalPosition,
			o = i.axis,
			h = "number" == typeof s.grid ? [s.grid, s.grid] : s.grid,
			l = h[0] || 1,
			u = h[1] || 1,
			d = Math.round((a.width - n.width) / l) * l,
			c = Math.round((a.height - n.height) / u) * u,
			p = n.width + d,
			f = n.height + c,
			m = s.maxWidth && p > s.maxWidth,
			g = s.maxHeight && f > s.maxHeight,
			v = s.minWidth && s.minWidth > p,
			y = s.minHeight && s.minHeight > f;
			s.grid = h,
			v && (p += l),
			y && (f += u),
			m && (p -= l),
			g && (f -= u),
			/^(se|s|e)$/.test(o) ? (i.size.width = p, i.size.height = f) : /^(ne)$/.test(o) ? (i.size.width = p, i.size.height = f, i.position.top = r.top - c) : /^(sw)$/.test(o) ? (i.size.width = p, i.size.height = f, i.position.left = r.left - d) : ((0 >= f - u || 0 >= p - l) && (t = i._getPaddingPlusBorderDimensions(this)), f - u > 0 ? (i.size.height = f, i.position.top = r.top - c) : (f = u - t.height, i.size.height = f, i.position.top = r.top + n.height - f), p - l > 0 ? (i.size.width = p, i.position.left = r.left - d) : (p = l - t.width, i.size.width = p, i.position.left = r.left + n.width - p))
		}
	}),
	e.ui.resizable,
	e.widget("ui.selectable", e.ui.mouse, {
		version : "1.11.4",
		options : {
			appendTo : "body",
			autoRefresh : !0,
			distance : 0,
			filter : "*",
			tolerance : "touch",
			selected : null,
			selecting : null,
			start : null,
			stop : null,
			unselected : null,
			unselecting : null
		},
		_create : function () {
			var t,
			i = this;
			this.element.addClass("ui-selectable"),
			this.dragged = !1,
			this.refresh = function () {
				t = e(i.options.filter, i.element[0]),
				t.addClass("ui-selectee"),
				t.each(function () {
					var t = e(this),
					i = t.offset();
					e.data(this, "selectable-item", {
						element : this,
						$element : t,
						left : i.left,
						top : i.top,
						right : i.left + t.outerWidth(),
						bottom : i.top + t.outerHeight(),
						startselected : !1,
						selected : t.hasClass("ui-selected"),
						selecting : t.hasClass("ui-selecting"),
						unselecting : t.hasClass("ui-unselecting")
					})
				})
			},
			this.refresh(),
			this.selectees = t.addClass("ui-selectee"),
			this._mouseInit(),
			this.helper = e("<div class='ui-selectable-helper'></div>")
		},
		_destroy : function () {
			this.selectees.removeClass("ui-selectee").removeData("selectable-item"),
			this.element.removeClass("ui-selectable ui-selectable-disabled"),
			this._mouseDestroy()
		},
		_mouseStart : function (t) {
			var i = this,
			s = this.options;
			this.opos = [t.pageX, t.pageY],
			this.options.disabled || (this.selectees = e(s.filter, this.element[0]), this._trigger("start", t), e(s.appendTo).append(this.helper), this.helper.css({
					left : t.pageX,
					top : t.pageY,
					width : 0,
					height : 0
				}), s.autoRefresh && this.refresh(), this.selectees.filter(".ui-selected").each(function () {
					var s = e.data(this, "selectable-item");
					s.startselected = !0,
					t.metaKey || t.ctrlKey || (s.$element.removeClass("ui-selected"), s.selected = !1, s.$element.addClass("ui-unselecting"), s.unselecting = !0, i._trigger("unselecting", t, {
							unselecting : s.element
						}))
				}), e(t.target).parents().addBack().each(function () {
					var s,
					a = e.data(this, "selectable-item");
					return a ? (s = !t.metaKey && !t.ctrlKey || !a.$element.hasClass("ui-selected"), a.$element.removeClass(s ? "ui-unselecting" : "ui-selected").addClass(s ? "ui-selecting" : "ui-unselecting"), a.unselecting = !s, a.selecting = s, a.selected = s, s ? i._trigger("selecting", t, {
							selecting : a.element
						}) : i._trigger("unselecting", t, {
							unselecting : a.element
						}), !1) : void 0
				}))
		},
		_mouseDrag : function (t) {
			if (this.dragged = !0, !this.options.disabled) {
				var i,
				s = this,
				a = this.options,
				n = this.opos[0],
				r = this.opos[1],
				o = t.pageX,
				h = t.pageY;
				return n > o && (i = o, o = n, n = i),
				r > h && (i = h, h = r, r = i),
				this.helper.css({
					left : n,
					top : r,
					width : o - n,
					height : h - r
				}),
				this.selectees.each(function () {
					var i = e.data(this, "selectable-item"),
					l = !1;
					i && i.element !== s.element[0] && ("touch" === a.tolerance ? l = !(i.left > o || n > i.right || i.top > h || r > i.bottom) : "fit" === a.tolerance && (l = i.left > n && o > i.right && i.top > r && h > i.bottom), l ? (i.selected && (i.$element.removeClass("ui-selected"), i.selected = !1), i.unselecting && (i.$element.removeClass("ui-unselecting"), i.unselecting = !1), i.selecting || (i.$element.addClass("ui-selecting"), i.selecting = !0, s._trigger("selecting", t, {
									selecting : i.element
								}))) : (i.selecting && ((t.metaKey || t.ctrlKey) && i.startselected ? (i.$element.removeClass("ui-selecting"), i.selecting = !1, i.$element.addClass("ui-selected"), i.selected = !0) : (i.$element.removeClass("ui-selecting"), i.selecting = !1, i.startselected && (i.$element.addClass("ui-unselecting"), i.unselecting = !0), s._trigger("unselecting", t, {
										unselecting : i.element
									}))), i.selected && (t.metaKey || t.ctrlKey || i.startselected || (i.$element.removeClass("ui-selected"), i.selected = !1, i.$element.addClass("ui-unselecting"), i.unselecting = !0, s._trigger("unselecting", t, {
										unselecting : i.element
									})))))
				}),
				!1
			}
		},
		_mouseStop : function (t) {
			var i = this;
			return this.dragged = !1,
			e(".ui-unselecting", this.element[0]).each(function () {
				var s = e.data(this, "selectable-item");
				s.$element.removeClass("ui-unselecting"),
				s.unselecting = !1,
				s.startselected = !1,
				i._trigger("unselected", t, {
					unselected : s.element
				})
			}),
			e(".ui-selecting", this.element[0]).each(function () {
				var s = e.data(this, "selectable-item");
				s.$element.removeClass("ui-selecting").addClass("ui-selected"),
				s.selecting = !1,
				s.selected = !0,
				s.startselected = !0,
				i._trigger("selected", t, {
					selected : s.element
				})
			}),
			this._trigger("stop", t),
			this.helper.remove(),
			!1
		}
	}),
	e.widget("ui.sortable", e.ui.mouse, {
		version : "1.11.4",
		widgetEventPrefix : "sort",
		ready : !1,
		options : {
			appendTo : "parent",
			axis : !1,
			connectWith : !1,
			containment : !1,
			cursor : "auto",
			cursorAt : !1,
			dropOnEmpty : !0,
			forcePlaceholderSize : !1,
			forceHelperSize : !1,
			grid : !1,
			handle : !1,
			helper : "original",
			items : "> *",
			opacity : !1,
			placeholder : !1,
			revert : !1,
			scroll : !0,
			scrollSensitivity : 20,
			scrollSpeed : 20,
			scope : "default",
			tolerance : "intersect",
			zIndex : 1e3,
			activate : null,
			beforeStop : null,
			change : null,
			deactivate : null,
			out : null,
			over : null,
			receive : null,
			remove : null,
			sort : null,
			start : null,
			stop : null,
			update : null
		},
		_isOverAxis : function (e, t, i) {
			return e >= t && t + i > e
		},
		_isFloating : function (e) {
			return /left|right/.test(e.css("float")) || /inline|table-cell/.test(e.css("display"))
		},
		_create : function () {
			this.containerCache = {},
			this.element.addClass("ui-sortable"),
			this.refresh(),
			this.offset = this.element.offset(),
			this._mouseInit(),
			this._setHandleClassName(),
			this.ready = !0
		},
		_setOption : function (e, t) {
			this._super(e, t),
			"handle" === e && this._setHandleClassName()
		},
		_setHandleClassName : function () {
			this.element.find(".ui-sortable-handle").removeClass("ui-sortable-handle"),
			e.each(this.items, function () {
				(this.instance.options.handle ? this.item.find(this.instance.options.handle) : this.item).addClass("ui-sortable-handle")
			})
		},
		_destroy : function () {
			this.element.removeClass("ui-sortable ui-sortable-disabled").find(".ui-sortable-handle").removeClass("ui-sortable-handle"),
			this._mouseDestroy();
			for (var e = this.items.length - 1; e >= 0; e--)
				this.items[e].item.removeData(this.widgetName + "-item");
			return this
		},
		_mouseCapture : function (t, i) {
			var s = null,
			a = !1,
			n = this;
			return this.reverting ? !1 : this.options.disabled || "static" === this.options.type ? !1 : (this._refreshItems(t), e(t.target).parents().each(function () {
					return e.data(this, n.widgetName + "-item") === n ? (s = e(this), !1) : void 0
				}), e.data(t.target, n.widgetName + "-item") === n && (s = e(t.target)), s ? !this.options.handle || i || (e(this.options.handle, s).find("*").addBack().each(function () {
						this === t.target && (a = !0)
					}), a) ? (this.currentItem = s, this._removeCurrentsFromItems(), !0) : !1 : !1)
		},
		_mouseStart : function (t, i, s) {
			var a,
			n,
			r = this.options;
			if (this.currentContainer = this, this.refreshPositions(), this.helper = this._createHelper(t), this._cacheHelperProportions(), this._cacheMargins(), this.scrollParent = this.helper.scrollParent(), this.offset = this.currentItem.offset(), this.offset = {
					top : this.offset.top - this.margins.top,
					left : this.offset.left - this.margins.left
				}, e.extend(this.offset, {
					click : {
						left : t.pageX - this.offset.left,
						top : t.pageY - this.offset.top
					},
					parent : this._getParentOffset(),
					relative : this._getRelativeOffset()
				}), this.helper.css("position", "absolute"), this.cssPosition = this.helper.css("position"), this.originalPosition = this._generatePosition(t), this.originalPageX = t.pageX, this.originalPageY = t.pageY, r.cursorAt && this._adjustOffsetFromHelper(r.cursorAt), this.domPosition = {
					prev : this.currentItem.prev()[0],
					parent : this.currentItem.parent()[0]
				}, this.helper[0] !== this.currentItem[0] && this.currentItem.hide(), this._createPlaceholder(), r.containment && this._setContainment(), r.cursor && "auto" !== r.cursor && (n = this.document.find("body"), this.storedCursor = n.css("cursor"), n.css("cursor", r.cursor), this.storedStylesheet = e("<style>*{ cursor: " + r.cursor + " !important; }</style>").appendTo(n)), r.opacity && (this.helper.css("opacity") && (this._storedOpacity = this.helper.css("opacity")), this.helper.css("opacity", r.opacity)), r.zIndex && (this.helper.css("zIndex") && (this._storedZIndex = this.helper.css("zIndex")), this.helper.css("zIndex", r.zIndex)), this.scrollParent[0] !== this.document[0] && "HTML" !== this.scrollParent[0].tagName && (this.overflowOffset = this.scrollParent.offset()), this._trigger("start", t, this._uiHash()), this._preserveHelperProportions || this._cacheHelperProportions(), !s)
				for (a = this.containers.length - 1; a >= 0; a--)
					this.containers[a]._trigger("activate", t, this._uiHash(this));
			return e.ui.ddmanager && (e.ui.ddmanager.current = this),
			e.ui.ddmanager && !r.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t),
			this.dragging = !0,
			this.helper.addClass("ui-sortable-helper"),
			this._mouseDrag(t),
			!0
		},
		_mouseDrag : function (t) {
			var i,
			s,
			a,
			n,
			r = this.options,
			o = !1;
			for (this.position = this._generatePosition(t), this.positionAbs = this._convertPositionTo("absolute"), this.lastPositionAbs || (this.lastPositionAbs = this.positionAbs), this.options.scroll && (this.scrollParent[0] !== this.document[0] && "HTML" !== this.scrollParent[0].tagName ? (this.overflowOffset.top + this.scrollParent[0].offsetHeight - t.pageY < r.scrollSensitivity ? this.scrollParent[0].scrollTop = o = this.scrollParent[0].scrollTop + r.scrollSpeed : t.pageY - this.overflowOffset.top < r.scrollSensitivity && (this.scrollParent[0].scrollTop = o = this.scrollParent[0].scrollTop - r.scrollSpeed), this.overflowOffset.left + this.scrollParent[0].offsetWidth - t.pageX < r.scrollSensitivity ? this.scrollParent[0].scrollLeft = o = this.scrollParent[0].scrollLeft + r.scrollSpeed : t.pageX - this.overflowOffset.left < r.scrollSensitivity && (this.scrollParent[0].scrollLeft = o = this.scrollParent[0].scrollLeft - r.scrollSpeed)) : (t.pageY - this.document.scrollTop() < r.scrollSensitivity ? o = this.document.scrollTop(this.document.scrollTop() - r.scrollSpeed) : this.window.height() - (t.pageY - this.document.scrollTop()) < r.scrollSensitivity && (o = this.document.scrollTop(this.document.scrollTop() + r.scrollSpeed)), t.pageX - this.document.scrollLeft() < r.scrollSensitivity ? o = this.document.scrollLeft(this.document.scrollLeft() - r.scrollSpeed) : this.window.width() - (t.pageX - this.document.scrollLeft()) < r.scrollSensitivity && (o = this.document.scrollLeft(this.document.scrollLeft() + r.scrollSpeed))), o !== !1 && e.ui.ddmanager && !r.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t)), this.positionAbs = this._convertPositionTo("absolute"), this.options.axis && "y" === this.options.axis || (this.helper[0].style.left = this.position.left + "px"), this.options.axis && "x" === this.options.axis || (this.helper[0].style.top = this.position.top + "px"), i = this.items.length - 1; i >= 0; i--)
				if (s = this.items[i], a = s.item[0], n = this._intersectsWithPointer(s), n && s.instance === this.currentContainer && a !== this.currentItem[0] && this.placeholder[1 === n ? "next" : "prev"]()[0] !== a && !e.contains(this.placeholder[0], a) && ("semi-dynamic" === this.options.type ? !e.contains(this.element[0], a) : !0)) {
					if (this.direction = 1 === n ? "down" : "up", "pointer" !== this.options.tolerance && !this._intersectsWithSides(s))
						break;
					this._rearrange(t, s),
					this._trigger("change", t, this._uiHash());
					break
				}
			return this._contactContainers(t),
			e.ui.ddmanager && e.ui.ddmanager.drag(this, t),
			this._trigger("sort", t, this._uiHash()),
			this.lastPositionAbs = this.positionAbs,
			!1
		},
		_mouseStop : function (t, i) {
			if (t) {
				if (e.ui.ddmanager && !this.options.dropBehaviour && e.ui.ddmanager.drop(this, t), this.options.revert) {
					var s = this,
					a = this.placeholder.offset(),
					n = this.options.axis,
					r = {};
					n && "x" !== n || (r.left = a.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollLeft)),
					n && "y" !== n || (r.top = a.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollTop)),
					this.reverting = !0,
					e(this.helper).animate(r, parseInt(this.options.revert, 10) || 500, function () {
						s._clear(t)
					})
				} else
					this._clear(t, i);
				return !1
			}
		},
		cancel : function () {
			if (this.dragging) {
				this._mouseUp({
					target : null
				}),
				"original" === this.options.helper ? this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper") : this.currentItem.show();
				for (var t = this.containers.length - 1; t >= 0; t--)
					this.containers[t]._trigger("deactivate", null, this._uiHash(this)), this.containers[t].containerCache.over && (this.containers[t]._trigger("out", null, this._uiHash(this)), this.containers[t].containerCache.over = 0)
			}
			return this.placeholder && (this.placeholder[0].parentNode && this.placeholder[0].parentNode.removeChild(this.placeholder[0]), "original" !== this.options.helper && this.helper && this.helper[0].parentNode && this.helper.remove(), e.extend(this, {
					helper : null,
					dragging : !1,
					reverting : !1,
					_noFinalSort : null
				}), this.domPosition.prev ? e(this.domPosition.prev).after(this.currentItem) : e(this.domPosition.parent).prepend(this.currentItem)),
			this
		},
		serialize : function (t) {
			var i = this._getItemsAsjQuery(t && t.connected),
			s = [];
			return t = t || {},
			e(i).each(function () {
				var i = (e(t.item || this).attr(t.attribute || "id") || "").match(t.expression || /(.+)[\-=_](.+)/);
				i && s.push((t.key || i[1] + "[]") + "=" + (t.key && t.expression ? i[1] : i[2]))
			}),
			!s.length && t.key && s.push(t.key + "="),
			s.join("&")
		},
		toArray : function (t) {
			var i = this._getItemsAsjQuery(t && t.connected),
			s = [];
			return t = t || {},
			i.each(function () {
				s.push(e(t.item || this).attr(t.attribute || "id") || "")
			}),
			s
		},
		_intersectsWith : function (e) {
			var t = this.positionAbs.left,
			i = t + this.helperProportions.width,
			s = this.positionAbs.top,
			a = s + this.helperProportions.height,
			n = e.left,
			r = n + e.width,
			o = e.top,
			h = o + e.height,
			l = this.offset.click.top,
			u = this.offset.click.left,
			d = "x" === this.options.axis || s + l > o && h > s + l,
			c = "y" === this.options.axis || t + u > n && r > t + u,
			p = d && c;
			return "pointer" === this.options.tolerance || this.options.forcePointerForContainers || "pointer" !== this.options.tolerance && this.helperProportions[this.floating ? "width" : "height"] > e[this.floating ? "width" : "height"] ? p : t + this.helperProportions.width / 2 > n && r > i - this.helperProportions.width / 2 && s + this.helperProportions.height / 2 > o && h > a - this.helperProportions.height / 2
		},
		_intersectsWithPointer : function (e) {
			var t = "x" === this.options.axis || this._isOverAxis(this.positionAbs.top + this.offset.click.top, e.top, e.height),
			i = "y" === this.options.axis || this._isOverAxis(this.positionAbs.left + this.offset.click.left, e.left, e.width),
			s = t && i,
			a = this._getDragVerticalDirection(),
			n = this._getDragHorizontalDirection();
			return s ? this.floating ? n && "right" === n || "down" === a ? 2 : 1 : a && ("down" === a ? 2 : 1) : !1
		},
		_intersectsWithSides : function (e) {
			var t = this._isOverAxis(this.positionAbs.top + this.offset.click.top, e.top + e.height / 2, e.height),
			i = this._isOverAxis(this.positionAbs.left + this.offset.click.left, e.left + e.width / 2, e.width),
			s = this._getDragVerticalDirection(),
			a = this._getDragHorizontalDirection();
			return this.floating && a ? "right" === a && i || "left" === a && !i : s && ("down" === s && t || "up" === s && !t)
		},
		_getDragVerticalDirection : function () {
			var e = this.positionAbs.top - this.lastPositionAbs.top;
			return 0 !== e && (e > 0 ? "down" : "up")
		},
		_getDragHorizontalDirection : function () {
			var e = this.positionAbs.left - this.lastPositionAbs.left;
			return 0 !== e && (e > 0 ? "right" : "left")
		},
		refresh : function (e) {
			return this._refreshItems(e),
			this._setHandleClassName(),
			this.refreshPositions(),
			this
		},
		_connectWith : function () {
			var e = this.options;
			return e.connectWith.constructor === String ? [e.connectWith] : e.connectWith
		},
		_getItemsAsjQuery : function (t) {
			function i() {
				o.push(this)
			}
			var s,
			a,
			n,
			r,
			o = [],
			h = [],
			l = this._connectWith();
			if (l && t)
				for (s = l.length - 1; s >= 0; s--)
					for (n = e(l[s], this.document[0]), a = n.length - 1; a >= 0; a--)
						r = e.data(n[a], this.widgetFullName), r && r !== this && !r.options.disabled && h.push([e.isFunction(r.options.items) ? r.options.items.call(r.element) : e(r.options.items, r.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), r]);
			for (h.push([e.isFunction(this.options.items) ? this.options.items.call(this.element, null, {
							options : this.options,
							item : this.currentItem
						}) : e(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]), s = h.length - 1; s >= 0; s--)
				h[s][0].each(i);
			return e(o)
		},
		_removeCurrentsFromItems : function () {
			var t = this.currentItem.find(":data(" + this.widgetName + "-item)");
			this.items = e.grep(this.items, function (e) {
					for (var i = 0; t.length > i; i++)
						if (t[i] === e.item[0])
							return !1;
					return !0
				})
		},
		_refreshItems : function (t) {
			this.items = [],
			this.containers = [this];
			var i,
			s,
			a,
			n,
			r,
			o,
			h,
			l,
			u = this.items,
			d = [[e.isFunction(this.options.items) ? this.options.items.call(this.element[0], t, {
						item : this.currentItem
					}) : e(this.options.items, this.element), this]],
			c = this._connectWith();
			if (c && this.ready)
				for (i = c.length - 1; i >= 0; i--)
					for (a = e(c[i], this.document[0]), s = a.length - 1; s >= 0; s--)
						n = e.data(a[s], this.widgetFullName), n && n !== this && !n.options.disabled && (d.push([e.isFunction(n.options.items) ? n.options.items.call(n.element[0], t, {
										item : this.currentItem
									}) : e(n.options.items, n.element), n]), this.containers.push(n));
			for (i = d.length - 1; i >= 0; i--)
				for (r = d[i][1], o = d[i][0], s = 0, l = o.length; l > s; s++)
					h = e(o[s]), h.data(this.widgetName + "-item", r), u.push({
						item : h,
						instance : r,
						width : 0,
						height : 0,
						left : 0,
						top : 0
					})
		},
		refreshPositions : function (t) {
			this.floating = this.items.length ? "x" === this.options.axis || this._isFloating(this.items[0].item) : !1,
			this.offsetParent && this.helper && (this.offset.parent = this._getParentOffset());
			var i,
			s,
			a,
			n;
			for (i = this.items.length - 1; i >= 0; i--)
				s = this.items[i], s.instance !== this.currentContainer && this.currentContainer && s.item[0] !== this.currentItem[0] || (a = this.options.toleranceElement ? e(this.options.toleranceElement, s.item) : s.item, t || (s.width = a.outerWidth(), s.height = a.outerHeight()), n = a.offset(), s.left = n.left, s.top = n.top);
			if (this.options.custom && this.options.custom.refreshContainers)
				this.options.custom.refreshContainers.call(this);
			else
				for (i = this.containers.length - 1; i >= 0; i--)
					n = this.containers[i].element.offset(), this.containers[i].containerCache.left = n.left, this.containers[i].containerCache.top = n.top, this.containers[i].containerCache.width = this.containers[i].element.outerWidth(), this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			return this
		},
		_createPlaceholder : function (t) {
			t = t || this;
			var i,
			s = t.options;
			s.placeholder && s.placeholder.constructor !== String || (i = s.placeholder, s.placeholder = {
					element : function () {
						var s = t.currentItem[0].nodeName.toLowerCase(),
						a = e("<" + s + ">", t.document[0]).addClass(i || t.currentItem[0].className + " ui-sortable-placeholder").removeClass("ui-sortable-helper");
						return "tbody" === s ? t._createTrPlaceholder(t.currentItem.find("tr").eq(0), e("<tr>", t.document[0]).appendTo(a)) : "tr" === s ? t._createTrPlaceholder(t.currentItem, a) : "img" === s && a.attr("src", t.currentItem.attr("src")),
						i || a.css("visibility", "hidden"),
						a
					},
					update : function (e, a) {
						(!i || s.forcePlaceholderSize) && (a.height() || a.height(t.currentItem.innerHeight() - parseInt(t.currentItem.css("paddingTop") || 0, 10) - parseInt(t.currentItem.css("paddingBottom") || 0, 10)), a.width() || a.width(t.currentItem.innerWidth() - parseInt(t.currentItem.css("paddingLeft") || 0, 10) - parseInt(t.currentItem.css("paddingRight") || 0, 10)))
					}
				}),
			t.placeholder = e(s.placeholder.element.call(t.element, t.currentItem)),
			t.currentItem.after(t.placeholder),
			s.placeholder.update(t, t.placeholder)
		},
		_createTrPlaceholder : function (t, i) {
			var s = this;
			t.children().each(function () {
				e("<td>&#160;</td>", s.document[0]).attr("colspan", e(this).attr("colspan") || 1).appendTo(i)
			})
		},
		_contactContainers : function (t) {
			var i,
			s,
			a,
			n,
			r,
			o,
			h,
			l,
			u,
			d,
			c = null,
			p = null;
			for (i = this.containers.length - 1; i >= 0; i--)
				if (!e.contains(this.currentItem[0], this.containers[i].element[0]))
					if (this._intersectsWith(this.containers[i].containerCache)) {
						if (c && e.contains(this.containers[i].element[0], c.element[0]))
							continue;
						c = this.containers[i],
						p = i
					} else
						this.containers[i].containerCache.over && (this.containers[i]._trigger("out", t, this._uiHash(this)), this.containers[i].containerCache.over = 0);
			if (c)
				if (1 === this.containers.length)
					this.containers[p].containerCache.over || (this.containers[p]._trigger("over", t, this._uiHash(this)), this.containers[p].containerCache.over = 1);
				else {
					for (a = 1e4, n = null, u = c.floating || this._isFloating(this.currentItem), r = u ? "left" : "top", o = u ? "width" : "height", d = u ? "clientX" : "clientY", s = this.items.length - 1; s >= 0; s--)
						e.contains(this.containers[p].element[0], this.items[s].item[0]) && this.items[s].item[0] !== this.currentItem[0] && (h = this.items[s].item.offset()[r], l = !1, t[d] - h > this.items[s][o] / 2 && (l = !0), a > Math.abs(t[d] - h) && (a = Math.abs(t[d] - h), n = this.items[s], this.direction = l ? "up" : "down"));
					if (!n && !this.options.dropOnEmpty)
						return;
					if (this.currentContainer === this.containers[p])
						return this.currentContainer.containerCache.over || (this.containers[p]._trigger("over", t, this._uiHash()), this.currentContainer.containerCache.over = 1), void 0;
					n ? this._rearrange(t, n, null, !0) : this._rearrange(t, null, this.containers[p].element, !0),
					this._trigger("change", t, this._uiHash()),
					this.containers[p]._trigger("change", t, this._uiHash(this)),
					this.currentContainer = this.containers[p],
					this.options.placeholder.update(this.currentContainer, this.placeholder),
					this.containers[p]._trigger("over", t, this._uiHash(this)),
					this.containers[p].containerCache.over = 1
				}
		},
		_createHelper : function (t) {
			var i = this.options,
			s = e.isFunction(i.helper) ? e(i.helper.apply(this.element[0], [t, this.currentItem])) : "clone" === i.helper ? this.currentItem.clone() : this.currentItem;
			return s.parents("body").length || e("parent" !== i.appendTo ? i.appendTo : this.currentItem[0].parentNode)[0].appendChild(s[0]),
			s[0] === this.currentItem[0] && (this._storedCSS = {
					width : this.currentItem[0].style.width,
					height : this.currentItem[0].style.height,
					position : this.currentItem.css("position"),
					top : this.currentItem.css("top"),
					left : this.currentItem.css("left")
				}),
			(!s[0].style.width || i.forceHelperSize) && s.width(this.currentItem.width()),
			(!s[0].style.height || i.forceHelperSize) && s.height(this.currentItem.height()),
			s
		},
		_adjustOffsetFromHelper : function (t) {
			"string" == typeof t && (t = t.split(" ")),
			e.isArray(t) && (t = {
					left : +t[0],
					top : +t[1] || 0
				}),
			"left" in t && (this.offset.click.left = t.left + this.margins.left),
			"right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left),
			"top" in t && (this.offset.click.top = t.top + this.margins.top),
			"bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top)
		},
		_getParentOffset : function () {
			this.offsetParent = this.helper.offsetParent();
			var t = this.offsetParent.offset();
			return "absolute" === this.cssPosition && this.scrollParent[0] !== this.document[0] && e.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()),
			(this.offsetParent[0] === this.document[0].body || this.offsetParent[0].tagName && "html" === this.offsetParent[0].tagName.toLowerCase() && e.ui.ie) && (t = {
					top : 0,
					left : 0
				}), {
				top : t.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
				left : t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
			}
		},
		_getRelativeOffset : function () {
			if ("relative" === this.cssPosition) {
				var e = this.currentItem.position();
				return {
					top : e.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
					left : e.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
				}
			}
			return {
				top : 0,
				left : 0
			}
		},
		_cacheMargins : function () {
			this.margins = {
				left : parseInt(this.currentItem.css("marginLeft"), 10) || 0,
				top : parseInt(this.currentItem.css("marginTop"), 10) || 0
			}
		},
		_cacheHelperProportions : function () {
			this.helperProportions = {
				width : this.helper.outerWidth(),
				height : this.helper.outerHeight()
			}
		},
		_setContainment : function () {
			var t,
			i,
			s,
			a = this.options;
			"parent" === a.containment && (a.containment = this.helper[0].parentNode),
			("document" === a.containment || "window" === a.containment) && (this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, "document" === a.containment ? this.document.width() : this.window.width() - this.helperProportions.width - this.margins.left, ("document" === a.containment ? this.document.width() : this.window.height() || this.document[0].body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top]),
			/^(document|window|parent)$/.test(a.containment) || (t = e(a.containment)[0], i = e(a.containment).offset(), s = "hidden" !== e(t).css("overflow"), this.containment = [i.left + (parseInt(e(t).css("borderLeftWidth"), 10) || 0) + (parseInt(e(t).css("paddingLeft"), 10) || 0) - this.margins.left, i.top + (parseInt(e(t).css("borderTopWidth"), 10) || 0) + (parseInt(e(t).css("paddingTop"), 10) || 0) - this.margins.top, i.left + (s ? Math.max(t.scrollWidth, t.offsetWidth) : t.offsetWidth) - (parseInt(e(t).css("borderLeftWidth"), 10) || 0) - (parseInt(e(t).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, i.top + (s ? Math.max(t.scrollHeight, t.offsetHeight) : t.offsetHeight) - (parseInt(e(t).css("borderTopWidth"), 10) || 0) - (parseInt(e(t).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top])
		},
		_convertPositionTo : function (t, i) {
			i || (i = this.position);
			var s = "absolute" === t ? 1 : -1,
			a = "absolute" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && e.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent,
			n = /(html|body)/i.test(a[0].tagName);
			return {
				top : i.top + this.offset.relative.top * s + this.offset.parent.top * s - ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : n ? 0 : a.scrollTop()) * s,
				left : i.left + this.offset.relative.left * s + this.offset.parent.left * s - ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : n ? 0 : a.scrollLeft()) * s
			}
		},
		_generatePosition : function (t) {
			var i,
			s,
			a = this.options,
			n = t.pageX,
			r = t.pageY,
			o = "absolute" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && e.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent,
			h = /(html|body)/i.test(o[0].tagName);
			return "relative" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && this.scrollParent[0] !== this.offsetParent[0] || (this.offset.relative = this._getRelativeOffset()),
			this.originalPosition && (this.containment && (t.pageX - this.offset.click.left < this.containment[0] && (n = this.containment[0] + this.offset.click.left), t.pageY - this.offset.click.top < this.containment[1] && (r = this.containment[1] + this.offset.click.top), t.pageX - this.offset.click.left > this.containment[2] && (n = this.containment[2] + this.offset.click.left), t.pageY - this.offset.click.top > this.containment[3] && (r = this.containment[3] + this.offset.click.top)), a.grid && (i = this.originalPageY + Math.round((r - this.originalPageY) / a.grid[1]) * a.grid[1], r = this.containment ? i - this.offset.click.top >= this.containment[1] && i - this.offset.click.top <= this.containment[3] ? i : i - this.offset.click.top >= this.containment[1] ? i - a.grid[1] : i + a.grid[1] : i, s = this.originalPageX + Math.round((n - this.originalPageX) / a.grid[0]) * a.grid[0], n = this.containment ? s - this.offset.click.left >= this.containment[0] && s - this.offset.click.left <= this.containment[2] ? s : s - this.offset.click.left >= this.containment[0] ? s - a.grid[0] : s + a.grid[0] : s)), {
				top : r - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : h ? 0 : o.scrollTop()),
				left : n - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : h ? 0 : o.scrollLeft())
			}
		},
		_rearrange : function (e, t, i, s) {
			i ? i[0].appendChild(this.placeholder[0]) : t.item[0].parentNode.insertBefore(this.placeholder[0], "down" === this.direction ? t.item[0] : t.item[0].nextSibling),
			this.counter = this.counter ? ++this.counter : 1;
			var a = this.counter;
			this._delay(function () {
				a === this.counter && this.refreshPositions(!s)
			})
		},
		_clear : function (e, t) {
			function i(e, t, i) {
				return function (s) {
					i._trigger(e, s, t._uiHash(t))
				}
			}
			this.reverting = !1;
			var s,
			a = [];
			if (!this._noFinalSort && this.currentItem.parent().length && this.placeholder.before(this.currentItem), this._noFinalSort = null, this.helper[0] === this.currentItem[0]) {
				for (s in this._storedCSS)
					("auto" === this._storedCSS[s] || "static" === this._storedCSS[s]) && (this._storedCSS[s] = "");
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")
			} else
				this.currentItem.show();
			for (this.fromOutside && !t && a.push(function (e) {
					this._trigger("receive", e, this._uiHash(this.fromOutside))
				}), !this.fromOutside && this.domPosition.prev === this.currentItem.prev().not(".ui-sortable-helper")[0] && this.domPosition.parent === this.currentItem.parent()[0] || t || a.push(function (e) {
					this._trigger("update", e, this._uiHash())
				}), this !== this.currentContainer && (t || (a.push(function (e) {
							this._trigger("remove", e, this._uiHash())
						}), a.push(function (e) {
							return function (t) {
								e._trigger("receive", t, this._uiHash(this))
							}
						}
							.call(this, this.currentContainer)), a.push(function (e) {
							return function (t) {
								e._trigger("update", t, this._uiHash(this))
							}
						}
							.call(this, this.currentContainer)))), s = this.containers.length - 1; s >= 0; s--)
				t || a.push(i("deactivate", this, this.containers[s])), this.containers[s].containerCache.over && (a.push(i("out", this, this.containers[s])), this.containers[s].containerCache.over = 0);
			if (this.storedCursor && (this.document.find("body").css("cursor", this.storedCursor), this.storedStylesheet.remove()), this._storedOpacity && this.helper.css("opacity", this._storedOpacity), this._storedZIndex && this.helper.css("zIndex", "auto" === this._storedZIndex ? "" : this._storedZIndex), this.dragging = !1, t || this._trigger("beforeStop", e, this._uiHash()), this.placeholder[0].parentNode.removeChild(this.placeholder[0]), this.cancelHelperRemoval || (this.helper[0] !== this.currentItem[0] && this.helper.remove(), this.helper = null), !t) {
				for (s = 0; a.length > s; s++)
					a[s].call(this, e);
				this._trigger("stop", e, this._uiHash())
			}
			return this.fromOutside = !1,
			!this.cancelHelperRemoval
		},
		_trigger : function () {
			e.Widget.prototype._trigger.apply(this, arguments) === !1 && this.cancel()
		},
		_uiHash : function (t) {
			var i = t || this;
			return {
				helper : i.helper,
				placeholder : i.placeholder || e([]),
				position : i.position,
				originalPosition : i.originalPosition,
				offset : i.positionAbs,
				item : i.currentItem,
				sender : t ? t.element : null
			}
		}
	}),
	e.widget("ui.accordion", {
		version : "1.11.4",
		options : {
			active : 0,
			animate : {},
			collapsible : !1,
			event : "click",
			header : "> li > :first-child,> :not(li):even",
			heightStyle : "auto",
			icons : {
				activeHeader : "ui-icon-triangle-1-s",
				header : "ui-icon-triangle-1-e"
			},
			activate : null,
			beforeActivate : null
		},
		hideProps : {
			borderTopWidth : "hide",
			borderBottomWidth : "hide",
			paddingTop : "hide",
			paddingBottom : "hide",
			height : "hide"
		},
		showProps : {
			borderTopWidth : "show",
			borderBottomWidth : "show",
			paddingTop : "show",
			paddingBottom : "show",
			height : "show"
		},
		_create : function () {
			var t = this.options;
			this.prevShow = this.prevHide = e(),
			this.element.addClass("ui-accordion ui-widget ui-helper-reset").attr("role", "tablist"),
			t.collapsible || t.active !== !1 && null != t.active || (t.active = 0),
			this._processPanels(),
			0 > t.active && (t.active += this.headers.length),
			this._refresh()
		},
		_getCreateEventData : function () {
			return {
				header : this.active,
				panel : this.active.length ? this.active.next() : e()
			}
		},
		_createIcons : function () {
			var t = this.options.icons;
			t && (e("<span>").addClass("ui-accordion-header-icon ui-icon " + t.header).prependTo(this.headers), this.active.children(".ui-accordion-header-icon").removeClass(t.header).addClass(t.activeHeader), this.headers.addClass("ui-accordion-icons"))
		},
		_destroyIcons : function () {
			this.headers.removeClass("ui-accordion-icons").children(".ui-accordion-header-icon").remove()
		},
		_destroy : function () {
			var e;
			this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role"),
			this.headers.removeClass("ui-accordion-header ui-accordion-header-active ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("aria-selected").removeAttr("aria-controls").removeAttr("tabIndex").removeUniqueId(),
			this._destroyIcons(),
			e = this.headers.next().removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active ui-state-disabled").css("display", "").removeAttr("role").removeAttr("aria-hidden").removeAttr("aria-labelledby").removeUniqueId(),
			"content" !== this.options.heightStyle && e.css("height", "")
		},
		_setOption : function (e, t) {
			return "active" === e ? (this._activate(t), void 0) : ("event" === e && (this.options.event && this._off(this.headers, this.options.event), this._setupEvents(t)), this._super(e, t), "collapsible" !== e || t || this.options.active !== !1 || this._activate(0), "icons" === e && (this._destroyIcons(), t && this._createIcons()), "disabled" === e && (this.element.toggleClass("ui-state-disabled", !!t).attr("aria-disabled", t), this.headers.add(this.headers.next()).toggleClass("ui-state-disabled", !!t)), void 0)
		},
		_keydown : function (t) {
			if (!t.altKey && !t.ctrlKey) {
				var i = e.ui.keyCode,
				s = this.headers.length,
				a = this.headers.index(t.target),
				n = !1;
				switch (t.keyCode) {
				case i.RIGHT:
				case i.DOWN:
					n = this.headers[(a + 1) % s];
					break;
				case i.LEFT:
				case i.UP:
					n = this.headers[(a - 1 + s) % s];
					break;
				case i.SPACE:
				case i.ENTER:
					this._eventHandler(t);
					break;
				case i.HOME:
					n = this.headers[0];
					break;
				case i.END:
					n = this.headers[s - 1]
				}
				n && (e(t.target).attr("tabIndex", -1), e(n).attr("tabIndex", 0), n.focus(), t.preventDefault())
			}
		},
		_panelKeyDown : function (t) {
			t.keyCode === e.ui.keyCode.UP && t.ctrlKey && e(t.currentTarget).prev().focus()
		},
		refresh : function () {
			var t = this.options;
			this._processPanels(),
			t.active === !1 && t.collapsible === !0 || !this.headers.length ? (t.active = !1, this.active = e()) : t.active === !1 ? this._activate(0) : this.active.length && !e.contains(this.element[0], this.active[0]) ? this.headers.length === this.headers.find(".ui-state-disabled").length ? (t.active = !1, this.active = e()) : this._activate(Math.max(0, t.active - 1)) : t.active = this.headers.index(this.active),
			this._destroyIcons(),
			this._refresh()
		},
		_processPanels : function () {
			var e = this.headers,
			t = this.panels;
			this.headers = this.element.find(this.options.header).addClass("ui-accordion-header ui-state-default ui-corner-all"),
			this.panels = this.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom").filter(":not(.ui-accordion-content-active)").hide(),
			t && (this._off(e.not(this.headers)), this._off(t.not(this.panels)))
		},
		_refresh : function () {
			var t,
			i = this.options,
			s = i.heightStyle,
			a = this.element.parent();
			this.active = this._findActive(i.active).addClass("ui-accordion-header-active ui-state-active ui-corner-top").removeClass("ui-corner-all"),
			this.active.next().addClass("ui-accordion-content-active").show(),
			this.headers.attr("role", "tab").each(function () {
				var t = e(this),
				i = t.uniqueId().attr("id"),
				s = t.next(),
				a = s.uniqueId().attr("id");
				t.attr("aria-controls", a),
				s.attr("aria-labelledby", i)
			}).next().attr("role", "tabpanel"),
			this.headers.not(this.active).attr({
				"aria-selected" : "false",
				"aria-expanded" : "false",
				tabIndex : -1
			}).next().attr({
				"aria-hidden" : "true"
			}).hide(),
			this.active.length ? this.active.attr({
				"aria-selected" : "true",
				"aria-expanded" : "true",
				tabIndex : 0
			}).next().attr({
				"aria-hidden" : "false"
			}) : this.headers.eq(0).attr("tabIndex", 0),
			this._createIcons(),
			this._setupEvents(i.event),
			"fill" === s ? (t = a.height(), this.element.siblings(":visible").each(function () {
					var i = e(this),
					s = i.css("position");
					"absolute" !== s && "fixed" !== s && (t -= i.outerHeight(!0))
				}), this.headers.each(function () {
					t -= e(this).outerHeight(!0)
				}), this.headers.next().each(function () {
					e(this).height(Math.max(0, t - e(this).innerHeight() + e(this).height()))
				}).css("overflow", "auto")) : "auto" === s && (t = 0, this.headers.next().each(function () {
					t = Math.max(t, e(this).css("height", "").height())
				}).height(t))
		},
		_activate : function (t) {
			var i = this._findActive(t)[0];
			i !== this.active[0] && (i = i || this.active[0], this._eventHandler({
					target : i,
					currentTarget : i,
					preventDefault : e.noop
				}))
		},
		_findActive : function (t) {
			return "number" == typeof t ? this.headers.eq(t) : e()
		},
		_setupEvents : function (t) {
			var i = {
				keydown : "_keydown"
			};
			t && e.each(t.split(" "), function (e, t) {
				i[t] = "_eventHandler"
			}),
			this._off(this.headers.add(this.headers.next())),
			this._on(this.headers, i),
			this._on(this.headers.next(), {
				keydown : "_panelKeyDown"
			}),
			this._hoverable(this.headers),
			this._focusable(this.headers)
		},
		_eventHandler : function (t) {
			var i = this.options,
			s = this.active,
			a = e(t.currentTarget),
			n = a[0] === s[0],
			r = n && i.collapsible,
			o = r ? e() : a.next(),
			h = s.next(),
			l = {
				oldHeader : s,
				oldPanel : h,
				newHeader : r ? e() : a,
				newPanel : o
			};
			t.preventDefault(),
			n && !i.collapsible || this._trigger("beforeActivate", t, l) === !1 || (i.active = r ? !1 : this.headers.index(a), this.active = n ? e() : a, this._toggle(l), s.removeClass("ui-accordion-header-active ui-state-active"), i.icons && s.children(".ui-accordion-header-icon").removeClass(i.icons.activeHeader).addClass(i.icons.header), n || (a.removeClass("ui-corner-all").addClass("ui-accordion-header-active ui-state-active ui-corner-top"), i.icons && a.children(".ui-accordion-header-icon").removeClass(i.icons.header).addClass(i.icons.activeHeader), a.next().addClass("ui-accordion-content-active")))
		},
		_toggle : function (t) {
			var i = t.newPanel,
			s = this.prevShow.length ? this.prevShow : t.oldPanel;
			this.prevShow.add(this.prevHide).stop(!0, !0),
			this.prevShow = i,
			this.prevHide = s,
			this.options.animate ? this._animate(i, s, t) : (s.hide(), i.show(), this._toggleComplete(t)),
			s.attr({
				"aria-hidden" : "true"
			}),
			s.prev().attr({
				"aria-selected" : "false",
				"aria-expanded" : "false"
			}),
			i.length && s.length ? s.prev().attr({
				tabIndex : -1,
				"aria-expanded" : "false"
			}) : i.length && this.headers.filter(function () {
				return 0 === parseInt(e(this).attr("tabIndex"), 10)
			}).attr("tabIndex", -1),
			i.attr("aria-hidden", "false").prev().attr({
				"aria-selected" : "true",
				"aria-expanded" : "true",
				tabIndex : 0
			})
		},
		_animate : function (e, t, i) {
			var s,
			a,
			n,
			r = this,
			o = 0,
			h = e.css("box-sizing"),
			l = e.length && (!t.length || e.index() < t.index()),
			u = this.options.animate || {},
			d = l && u.down || u,
			c = function () {
				r._toggleComplete(i)
			};
			return "number" == typeof d && (n = d),
			"string" == typeof d && (a = d),
			a = a || d.easing || u.easing,
			n = n || d.duration || u.duration,
			t.length ? e.length ? (s = e.show().outerHeight(), t.animate(this.hideProps, {
					duration : n,
					easing : a,
					step : function (e, t) {
						t.now = Math.round(e)
					}
				}), e.hide().animate(this.showProps, {
					duration : n,
					easing : a,
					complete : c,
					step : function (e, i) {
						i.now = Math.round(e),
						"height" !== i.prop ? "content-box" === h && (o += i.now) : "content" !== r.options.heightStyle && (i.now = Math.round(s - t.outerHeight() - o), o = 0)
					}
				}), void 0) : t.animate(this.hideProps, n, a, c) : e.animate(this.showProps, n, a, c)
		},
		_toggleComplete : function (e) {
			var t = e.oldPanel;
			t.removeClass("ui-accordion-content-active").prev().removeClass("ui-corner-top").addClass("ui-corner-all"),
			t.length && (t.parent()[0].className = t.parent()[0].className),
			this._trigger("activate", null, e)
		}
	}),
	e.widget("ui.menu", {
		version : "1.11.4",
		defaultElement : "<ul>",
		delay : 300,
		options : {
			icons : {
				submenu : "ui-icon-carat-1-e"
			},
			items : "> *",
			menus : "ul",
			position : {
				my : "left-1 top",
				at : "right top"
			},
			role : "menu",
			blur : null,
			focus : null,
			select : null
		},
		_create : function () {
			this.activeMenu = this.element,
			this.mouseHandled = !1,
			this.element.uniqueId().addClass("ui-menu ui-widget ui-widget-content").toggleClass("ui-menu-icons", !!this.element.find(".ui-icon").length).attr({
				role : this.options.role,
				tabIndex : 0
			}),
			this.options.disabled && this.element.addClass("ui-state-disabled").attr("aria-disabled", "true"),
			this._on({
				"mousedown .ui-menu-item" : function (e) {
					e.preventDefault()
				},
				"click .ui-menu-item" : function (t) {
					var i = e(t.target);
					!this.mouseHandled && i.not(".ui-state-disabled").length && (this.select(t), t.isPropagationStopped() || (this.mouseHandled = !0), i.has(".ui-menu").length ? this.expand(t) : !this.element.is(":focus") && e(this.document[0].activeElement).closest(".ui-menu").length && (this.element.trigger("focus", [!0]), this.active && 1 === this.active.parents(".ui-menu").length && clearTimeout(this.timer)))
				},
				"mouseenter .ui-menu-item" : function (t) {
					if (!this.previousFilter) {
						var i = e(t.currentTarget);
						i.siblings(".ui-state-active").removeClass("ui-state-active"),
						this.focus(t, i)
					}
				},
				mouseleave : "collapseAll",
				"mouseleave .ui-menu" : "collapseAll",
				focus : function (e, t) {
					var i = this.active || this.element.find(this.options.items).eq(0);
					t || this.focus(e, i)
				},
				blur : function (t) {
					this._delay(function () {
						e.contains(this.element[0], this.document[0].activeElement) || this.collapseAll(t)
					})
				},
				keydown : "_keydown"
			}),
			this.refresh(),
			this._on(this.document, {
				click : function (e) {
					this._closeOnDocumentClick(e) && this.collapseAll(e),
					this.mouseHandled = !1
				}
			})
		},
		_destroy : function () {
			this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeClass("ui-menu ui-widget ui-widget-content ui-menu-icons ui-front").removeAttr("role").removeAttr("tabIndex").removeAttr("aria-labelledby").removeAttr("aria-expanded").removeAttr("aria-hidden").removeAttr("aria-disabled").removeUniqueId().show(),
			this.element.find(".ui-menu-item").removeClass("ui-menu-item").removeAttr("role").removeAttr("aria-disabled").removeUniqueId().removeClass("ui-state-hover").removeAttr("tabIndex").removeAttr("role").removeAttr("aria-haspopup").children().each(function () {
				var t = e(this);
				t.data("ui-menu-submenu-carat") && t.remove()
			}),
			this.element.find(".ui-menu-divider").removeClass("ui-menu-divider ui-widget-content")
		},
		_keydown : function (t) {
			var i,
			s,
			a,
			n,
			r = !0;
			switch (t.keyCode) {
			case e.ui.keyCode.PAGE_UP:
				this.previousPage(t);
				break;
			case e.ui.keyCode.PAGE_DOWN:
				this.nextPage(t);
				break;
			case e.ui.keyCode.HOME:
				this._move("first", "first", t);
				break;
			case e.ui.keyCode.END:
				this._move("last", "last", t);
				break;
			case e.ui.keyCode.UP:
				this.previous(t);
				break;
			case e.ui.keyCode.DOWN:
				this.next(t);
				break;
			case e.ui.keyCode.LEFT:
				this.collapse(t);
				break;
			case e.ui.keyCode.RIGHT:
				this.active && !this.active.is(".ui-state-disabled") && this.expand(t);
				break;
			case e.ui.keyCode.ENTER:
			case e.ui.keyCode.SPACE:
				this._activate(t);
				break;
			case e.ui.keyCode.ESCAPE:
				this.collapse(t);
				break;
			default:
				r = !1,
				s = this.previousFilter || "",
				a = String.fromCharCode(t.keyCode),
				n = !1,
				clearTimeout(this.filterTimer),
				a === s ? n = !0 : a = s + a,
				i = this._filterMenuItems(a),
				i = n && -1 !== i.index(this.active.next()) ? this.active.nextAll(".ui-menu-item") : i,
				i.length || (a = String.fromCharCode(t.keyCode), i = this._filterMenuItems(a)),
				i.length ? (this.focus(t, i), this.previousFilter = a, this.filterTimer = this._delay(function () {
							delete this.previousFilter
						}, 1e3)) : delete this.previousFilter
			}
			r && t.preventDefault()
		},
		_activate : function (e) {
			this.active.is(".ui-state-disabled") || (this.active.is("[aria-haspopup='true']") ? this.expand(e) : this.select(e))
		},
		refresh : function () {
			var t,
			i,
			s = this,
			a = this.options.icons.submenu,
			n = this.element.find(this.options.menus);
			this.element.toggleClass("ui-menu-icons", !!this.element.find(".ui-icon").length),
			n.filter(":not(.ui-menu)").addClass("ui-menu ui-widget ui-widget-content ui-front").hide().attr({
				role : this.options.role,
				"aria-hidden" : "true",
				"aria-expanded" : "false"
			}).each(function () {
				var t = e(this),
				i = t.parent(),
				s = e("<span>").addClass("ui-menu-icon ui-icon " + a).data("ui-menu-submenu-carat", !0);
				i.attr("aria-haspopup", "true").prepend(s),
				t.attr("aria-labelledby", i.attr("id"))
			}),
			t = n.add(this.element),
			i = t.find(this.options.items),
			i.not(".ui-menu-item").each(function () {
				var t = e(this);
				s._isDivider(t) && t.addClass("ui-widget-content ui-menu-divider")
			}),
			i.not(".ui-menu-item, .ui-menu-divider").addClass("ui-menu-item").uniqueId().attr({
				tabIndex : -1,
				role : this._itemRole()
			}),
			i.filter(".ui-state-disabled").attr("aria-disabled", "true"),
			this.active && !e.contains(this.element[0], this.active[0]) && this.blur()
		},
		_itemRole : function () {
			return {
				menu : "menuitem",
				listbox : "option"
			}
			[this.options.role]
		},
		_setOption : function (e, t) {
			"icons" === e && this.element.find(".ui-menu-icon").removeClass(this.options.icons.submenu).addClass(t.submenu),
			"disabled" === e && this.element.toggleClass("ui-state-disabled", !!t).attr("aria-disabled", t),
			this._super(e, t)
		},
		focus : function (e, t) {
			var i,
			s;
			this.blur(e, e && "focus" === e.type),
			this._scrollIntoView(t),
			this.active = t.first(),
			s = this.active.addClass("ui-state-focus").removeClass("ui-state-active"),
			this.options.role && this.element.attr("aria-activedescendant", s.attr("id")),
			this.active.parent().closest(".ui-menu-item").addClass("ui-state-active"),
			e && "keydown" === e.type ? this._close() : this.timer = this._delay(function () {
					this._close()
				}, this.delay),
			i = t.children(".ui-menu"),
			i.length && e && /^mouse/.test(e.type) && this._startOpening(i),
			this.activeMenu = t.parent(),
			this._trigger("focus", e, {
				item : t
			})
		},
		_scrollIntoView : function (t) {
			var i,
			s,
			a,
			n,
			r,
			o;
			this._hasScroll() && (i = parseFloat(e.css(this.activeMenu[0], "borderTopWidth")) || 0, s = parseFloat(e.css(this.activeMenu[0], "paddingTop")) || 0, a = t.offset().top - this.activeMenu.offset().top - i - s, n = this.activeMenu.scrollTop(), r = this.activeMenu.height(), o = t.outerHeight(), 0 > a ? this.activeMenu.scrollTop(n + a) : a + o > r && this.activeMenu.scrollTop(n + a - r + o))
		},
		blur : function (e, t) {
			t || clearTimeout(this.timer),
			this.active && (this.active.removeClass("ui-state-focus"), this.active = null, this._trigger("blur", e, {
					item : this.active
				}))
		},
		_startOpening : function (e) {
			clearTimeout(this.timer),
			"true" === e.attr("aria-hidden") && (this.timer = this._delay(function () {
						this._close(),
						this._open(e)
					}, this.delay))
		},
		_open : function (t) {
			var i = e.extend({
					of : this.active
				}, this.options.position);
			clearTimeout(this.timer),
			this.element.find(".ui-menu").not(t.parents(".ui-menu")).hide().attr("aria-hidden", "true"),
			t.show().removeAttr("aria-hidden").attr("aria-expanded", "true").position(i)
		},
		collapseAll : function (t, i) {
			clearTimeout(this.timer),
			this.timer = this._delay(function () {
					var s = i ? this.element : e(t && t.target).closest(this.element.find(".ui-menu"));
					s.length || (s = this.element),
					this._close(s),
					this.blur(t),
					this.activeMenu = s
				}, this.delay)
		},
		_close : function (e) {
			e || (e = this.active ? this.active.parent() : this.element),
			e.find(".ui-menu").hide().attr("aria-hidden", "true").attr("aria-expanded", "false").end().find(".ui-state-active").not(".ui-state-focus").removeClass("ui-state-active")
		},
		_closeOnDocumentClick : function (t) {
			return !e(t.target).closest(".ui-menu").length
		},
		_isDivider : function (e) {
			return !/[^\-\u2014\u2013\s]/.test(e.text())
		},
		collapse : function (e) {
			var t = this.active && this.active.parent().closest(".ui-menu-item", this.element);
			t && t.length && (this._close(), this.focus(e, t))
		},
		expand : function (e) {
			var t = this.active && this.active.children(".ui-menu ").find(this.options.items).first();
			t && t.length && (this._open(t.parent()), this._delay(function () {
					this.focus(e, t)
				}))
		},
		next : function (e) {
			this._move("next", "first", e)
		},
		previous : function (e) {
			this._move("prev", "last", e)
		},
		isFirstItem : function () {
			return this.active && !this.active.prevAll(".ui-menu-item").length
		},
		isLastItem : function () {
			return this.active && !this.active.nextAll(".ui-menu-item").length
		},
		_move : function (e, t, i) {
			var s;
			this.active && (s = "first" === e || "last" === e ? this.active["first" === e ? "prevAll" : "nextAll"](".ui-menu-item").eq(-1) : this.active[e + "All"](".ui-menu-item").eq(0)),
			s && s.length && this.active || (s = this.activeMenu.find(this.options.items)[t]()),
			this.focus(i, s)
		},
		nextPage : function (t) {
			var i,
			s,
			a;
			return this.active ? (this.isLastItem() || (this._hasScroll() ? (s = this.active.offset().top, a = this.element.height(), this.active.nextAll(".ui-menu-item").each(function () {
							return i = e(this),
							0 > i.offset().top - s - a
						}), this.focus(t, i)) : this.focus(t, this.activeMenu.find(this.options.items)[this.active ? "last" : "first"]())), void 0) : (this.next(t), void 0)
		},
		previousPage : function (t) {
			var i,
			s,
			a;
			return this.active ? (this.isFirstItem() || (this._hasScroll() ? (s = this.active.offset().top, a = this.element.height(), this.active.prevAll(".ui-menu-item").each(function () {
							return i = e(this),
							i.offset().top - s + a > 0
						}), this.focus(t, i)) : this.focus(t, this.activeMenu.find(this.options.items).first())), void 0) : (this.next(t), void 0)
		},
		_hasScroll : function () {
			return this.element.outerHeight() < this.element.prop("scrollHeight")
		},
		select : function (t) {
			this.active = this.active || e(t.target).closest(".ui-menu-item");
			var i = {
				item : this.active
			};
			this.active.has(".ui-menu").length || this.collapseAll(t, !0),
			this._trigger("select", t, i)
		},
		_filterMenuItems : function (t) {
			var i = t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"),
			s = RegExp("^" + i, "i");
			return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function () {
				return s.test(e.trim(e(this).text()))
			})
		}
	}),
	e.widget("ui.autocomplete", {
		version : "1.11.4",
		defaultElement : "<input>",
		options : {
			appendTo : null,
			autoFocus : !1,
			delay : 300,
			minLength : 1,
			position : {
				my : "left top",
				at : "left bottom",
				collision : "none"
			},
			source : null,
			change : null,
			close : null,
			focus : null,
			open : null,
			response : null,
			search : null,
			select : null
		},
		requestIndex : 0,
		pending : 0,
		_create : function () {
			var t,
			i,
			s,
			a = this.element[0].nodeName.toLowerCase(),
			n = "textarea" === a,
			r = "input" === a;
			this.isMultiLine = n ? !0 : r ? !1 : this.element.prop("isContentEditable"),
			this.valueMethod = this.element[n || r ? "val" : "text"],
			this.isNewMenu = !0,
			this.element.addClass("ui-autocomplete-input").attr("autocomplete", "off"),
			this._on(this.element, {
				keydown : function (a) {
					if (this.element.prop("readOnly"))
						return t = !0, s = !0, i = !0, void 0;
					t = !1,
					s = !1,
					i = !1;
					var n = e.ui.keyCode;
					switch (a.keyCode) {
					case n.PAGE_UP:
						t = !0,
						this._move("previousPage", a);
						break;
					case n.PAGE_DOWN:
						t = !0,
						this._move("nextPage", a);
						break;
					case n.UP:
						t = !0,
						this._keyEvent("previous", a);
						break;
					case n.DOWN:
						t = !0,
						this._keyEvent("next", a);
						break;
					case n.ENTER:
						this.menu.active && (t = !0, a.preventDefault(), this.menu.select(a));
						break;
					case n.TAB:
						this.menu.active && this.menu.select(a);
						break;
					case n.ESCAPE:
						this.menu.element.is(":visible") && (this.isMultiLine || this._value(this.term), this.close(a), a.preventDefault());
						break;
					default:
						i = !0,
						this._searchTimeout(a)
					}
				},
				keypress : function (s) {
					if (t)
						return t = !1, (!this.isMultiLine || this.menu.element.is(":visible")) && s.preventDefault(), void 0;
					if (!i) {
						var a = e.ui.keyCode;
						switch (s.keyCode) {
						case a.PAGE_UP:
							this._move("previousPage", s);
							break;
						case a.PAGE_DOWN:
							this._move("nextPage", s);
							break;
						case a.UP:
							this._keyEvent("previous", s);
							break;
						case a.DOWN:
							this._keyEvent("next", s)
						}
					}
				},
				input : function (e) {
					return s ? (s = !1, e.preventDefault(), void 0) : (this._searchTimeout(e), void 0)
				},
				focus : function () {
					this.selectedItem = null,
					this.previous = this._value()
				},
				blur : function (e) {
					return this.cancelBlur ? (delete this.cancelBlur, void 0) : (clearTimeout(this.searching), this.close(e), this._change(e), void 0)
				}
			}),
			this._initSource(),
			this.menu = e("<ul>").addClass("ui-autocomplete ui-front").appendTo(this._appendTo()).menu({
					role : null
				}).hide().menu("instance"),
			this._on(this.menu.element, {
				mousedown : function (t) {
					t.preventDefault(),
					this.cancelBlur = !0,
					this._delay(function () {
						delete this.cancelBlur
					});
					var i = this.menu.element[0];
					e(t.target).closest(".ui-menu-item").length || this._delay(function () {
						var t = this;
						this.document.one("mousedown", function (s) {
							s.target === t.element[0] || s.target === i || e.contains(i, s.target) || t.close()
						})
					})
				},
				menufocus : function (t, i) {
					var s,
					a;
					return this.isNewMenu && (this.isNewMenu = !1, t.originalEvent && /^mouse/.test(t.originalEvent.type)) ? (this.menu.blur(), this.document.one("mousemove", function () {
							e(t.target).trigger(t.originalEvent)
						}), void 0) : (a = i.item.data("ui-autocomplete-item"), !1 !== this._trigger("focus", t, {
							item : a
						}) && t.originalEvent && /^key/.test(t.originalEvent.type) && this._value(a.value), s = i.item.attr("aria-label") || a.value, s && e.trim(s).length && (this.liveRegion.children().hide(), e("<div>").text(s).appendTo(this.liveRegion)), void 0)
				},
				menuselect : function (e, t) {
					var i = t.item.data("ui-autocomplete-item"),
					s = this.previous;
					this.element[0] !== this.document[0].activeElement && (this.element.focus(), this.previous = s, this._delay(function () {
							this.previous = s,
							this.selectedItem = i
						})),
					!1 !== this._trigger("select", e, {
						item : i
					}) && this._value(i.value),
					this.term = this._value(),
					this.close(e),
					this.selectedItem = i
				}
			}),
			this.liveRegion = e("<span>", {
					role : "status",
					"aria-live" : "assertive",
					"aria-relevant" : "additions"
				}).addClass("ui-helper-hidden-accessible").appendTo(this.document[0].body),
			this._on(this.window, {
				beforeunload : function () {
					this.element.removeAttr("autocomplete")
				}
			})
		},
		_destroy : function () {
			clearTimeout(this.searching),
			this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete"),
			this.menu.element.remove(),
			this.liveRegion.remove()
		},
		_setOption : function (e, t) {
			this._super(e, t),
			"source" === e && this._initSource(),
			"appendTo" === e && this.menu.element.appendTo(this._appendTo()),
			"disabled" === e && t && this.xhr && this.xhr.abort()
		},
		_appendTo : function () {
			var t = this.options.appendTo;
			return t && (t = t.jquery || t.nodeType ? e(t) : this.document.find(t).eq(0)),
			t && t[0] || (t = this.element.closest(".ui-front")),
			t.length || (t = this.document[0].body),
			t
		},
		_initSource : function () {
			var t,
			i,
			s = this;
			e.isArray(this.options.source) ? (t = this.options.source, this.source = function (i, s) {
				s(e.ui.autocomplete.filter(t, i.term))
			}) : "string" == typeof this.options.source ? (i = this.options.source, this.source = function (t, a) {
				s.xhr && s.xhr.abort(),
				s.xhr = e.ajax({
						url : i,
						data : t,
						dataType : "json",
						success : function (e) {
							a(e)
						},
						error : function () {
							a([])
						}
					})
			}) : this.source = this.options.source
		},
		_searchTimeout : function (e) {
			clearTimeout(this.searching),
			this.searching = this._delay(function () {
					var t = this.term === this._value(),
					i = this.menu.element.is(":visible"),
					s = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;
					(!t || t && !i && !s) && (this.selectedItem = null, this.search(null, e))
				}, this.options.delay)
		},
		search : function (e, t) {
			return e = null != e ? e : this._value(),
			this.term = this._value(),
			e.length < this.options.minLength ? this.close(t) : this._trigger("search", t) !== !1 ? this._search(e) : void 0
		},
		_search : function (e) {
			this.pending++,
			this.element.addClass("ui-autocomplete-loading"),
			this.cancelSearch = !1,
			this.source({
				term : e
			}, this._response())
		},
		_response : function () {
			var t = ++this.requestIndex;
			return e.proxy(function (e) {
				t === this.requestIndex && this.__response(e),
				this.pending--,
				this.pending || this.element.removeClass("ui-autocomplete-loading")
			}, this)
		},
		__response : function (e) {
			e && (e = this._normalize(e)),
			this._trigger("response", null, {
				content : e
			}),
			!this.options.disabled && e && e.length && !this.cancelSearch ? (this._suggest(e), this._trigger("open")) : this._close()
		},
		close : function (e) {
			this.cancelSearch = !0,
			this._close(e)
		},
		_close : function (e) {
			this.menu.element.is(":visible") && (this.menu.element.hide(), this.menu.blur(), this.isNewMenu = !0, this._trigger("close", e))
		},
		_change : function (e) {
			this.previous !== this._value() && this._trigger("change", e, {
				item : this.selectedItem
			})
		},
		_normalize : function (t) {
			return t.length && t[0].label && t[0].value ? t : e.map(t, function (t) {
				return "string" == typeof t ? {
					label : t,
					value : t
				}
				 : e.extend({}, t, {
					label : t.label || t.value,
					value : t.value || t.label
				})
			})
		},
		_suggest : function (t) {
			var i = this.menu.element.empty();
			this._renderMenu(i, t),
			this.isNewMenu = !0,
			this.menu.refresh(),
			i.show(),
			this._resizeMenu(),
			i.position(e.extend({
					of : this.element
				}, this.options.position)),
			this.options.autoFocus && this.menu.next()
		},
		_resizeMenu : function () {
			var e = this.menu.element;
			e.outerWidth(Math.max(e.width("").outerWidth() + 1, this.element.outerWidth()))
		},
		_renderMenu : function (t, i) {
			var s = this;
			e.each(i, function (e, i) {
				s._renderItemData(t, i)
			})
		},
		_renderItemData : function (e, t) {
			return this._renderItem(e, t).data("ui-autocomplete-item", t)
		},
		_renderItem : function (t, i) {
			return e("<li>").text(i.label).appendTo(t)
		},
		_move : function (e, t) {
			return this.menu.element.is(":visible") ? this.menu.isFirstItem() && /^previous/.test(e) || this.menu.isLastItem() && /^next/.test(e) ? (this.isMultiLine || this._value(this.term), this.menu.blur(), void 0) : (this.menu[e](t), void 0) : (this.search(null, t), void 0)
		},
		widget : function () {
			return this.menu.element
		},
		_value : function () {
			return this.valueMethod.apply(this.element, arguments)
		},
		_keyEvent : function (e, t) {
			(!this.isMultiLine || this.menu.element.is(":visible")) && (this._move(e, t), t.preventDefault())
		}
	}),
	e.extend(e.ui.autocomplete, {
		escapeRegex : function (e) {
			return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")
		},
		filter : function (t, i) {
			var s = RegExp(e.ui.autocomplete.escapeRegex(i), "i");
			return e.grep(t, function (e) {
				return s.test(e.label || e.value || e)
			})
		}
	}),
	e.widget("ui.autocomplete", e.ui.autocomplete, {
		options : {
			messages : {
				noResults : "No search results.",
				results : function (e) {
					return e + (e > 1 ? " results are" : " result is") + " available, use up and down arrow keys to navigate."
				}
			}
		},
		__response : function (t) {
			var i;
			this._superApply(arguments),
			this.options.disabled || this.cancelSearch || (i = t && t.length ? this.options.messages.results(t.length) : this.options.messages.noResults, this.liveRegion.children().hide(), e("<div>").text(i).appendTo(this.liveRegion))
		}
	}),
	e.ui.autocomplete;
	var c,
	p = "ui-button ui-widget ui-state-default ui-corner-all",
	f = "ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",
	m = function () {
		var t = e(this);
		setTimeout(function () {
			t.find(":ui-button").button("refresh")
		}, 1)
	},
	g = function (t) {
		var i = t.name,
		s = t.form,
		a = e([]);
		return i && (i = i.replace(/'/g, "\\'"), a = s ? e(s).find("[name='" + i + "'][type=radio]") : e("[name='" + i + "'][type=radio]", t.ownerDocument).filter(function () {
					return !this.form
				})),
		a
	};
	e.widget("ui.button", {
		version : "1.11.4",
		defaultElement : "<button>",
		options : {
			disabled : null,
			text : !0,
			label : null,
			icons : {
				primary : null,
				secondary : null
			}
		},
		_create : function () {
			this.element.closest("form").unbind("reset" + this.eventNamespace).bind("reset" + this.eventNamespace, m),
			"boolean" != typeof this.options.disabled ? this.options.disabled = !!this.element.prop("disabled") : this.element.prop("disabled", this.options.disabled),
			this._determineButtonType(),
			this.hasTitle = !!this.buttonElement.attr("title");
			var t = this,
			i = this.options,
			s = "checkbox" === this.type || "radio" === this.type,
			a = s ? "" : "ui-state-active";
			null === i.label && (i.label = "input" === this.type ? this.buttonElement.val() : this.buttonElement.html()),
			this._hoverable(this.buttonElement),
			this.buttonElement.addClass(p).attr("role", "button").bind("mouseenter" + this.eventNamespace, function () {
				i.disabled || this === c && e(this).addClass("ui-state-active")
			}).bind("mouseleave" + this.eventNamespace, function () {
				i.disabled || e(this).removeClass(a)
			}).bind("click" + this.eventNamespace, function (e) {
				i.disabled && (e.preventDefault(), e.stopImmediatePropagation())
			}),
			this._on({
				focus : function () {
					this.buttonElement.addClass("ui-state-focus")
				},
				blur : function () {
					this.buttonElement.removeClass("ui-state-focus")
				}
			}),
			s && this.element.bind("change" + this.eventNamespace, function () {
				t.refresh()
			}),
			"checkbox" === this.type ? this.buttonElement.bind("click" + this.eventNamespace, function () {
				return i.disabled ? !1 : void 0
			}) : "radio" === this.type ? this.buttonElement.bind("click" + this.eventNamespace, function () {
				if (i.disabled)
					return !1;
				e(this).addClass("ui-state-active"),
				t.buttonElement.attr("aria-pressed", "true");
				var s = t.element[0];
				g(s).not(s).map(function () {
					return e(this).button("widget")[0]
				}).removeClass("ui-state-active").attr("aria-pressed", "false")
			}) : (this.buttonElement.bind("mousedown" + this.eventNamespace, function () {
					return i.disabled ? !1 : (e(this).addClass("ui-state-active"), c = this, t.document.one("mouseup", function () {
							c = null
						}), void 0)
				}).bind("mouseup" + this.eventNamespace, function () {
					return i.disabled ? !1 : (e(this).removeClass("ui-state-active"), void 0)
				}).bind("keydown" + this.eventNamespace, function (t) {
					return i.disabled ? !1 : ((t.keyCode === e.ui.keyCode.SPACE || t.keyCode === e.ui.keyCode.ENTER) && e(this).addClass("ui-state-active"), void 0)
				}).bind("keyup" + this.eventNamespace + " blur" + this.eventNamespace, function () {
					e(this).removeClass("ui-state-active")
				}), this.buttonElement.is("a") && this.buttonElement.keyup(function (t) {
					t.keyCode === e.ui.keyCode.SPACE && e(this).click()
				})),
			this._setOption("disabled", i.disabled),
			this._resetButton()
		},
		_determineButtonType : function () {
			var e,
			t,
			i;
			this.type = this.element.is("[type=checkbox]") ? "checkbox" : this.element.is("[type=radio]") ? "radio" : this.element.is("input") ? "input" : "button",
			"checkbox" === this.type || "radio" === this.type ? (e = this.element.parents().last(), t = "label[for='" + this.element.attr("id") + "']", this.buttonElement = e.find(t), this.buttonElement.length || (e = e.length ? e.siblings() : this.element.siblings(), this.buttonElement = e.filter(t), this.buttonElement.length || (this.buttonElement = e.find(t))), this.element.addClass("ui-helper-hidden-accessible"), i = this.element.is(":checked"), i && this.buttonElement.addClass("ui-state-active"), this.buttonElement.prop("aria-pressed", i)) : this.buttonElement = this.element
		},
		widget : function () {
			return this.buttonElement
		},
		_destroy : function () {
			this.element.removeClass("ui-helper-hidden-accessible"),
			this.buttonElement.removeClass(p + " ui-state-active " + f).removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html()),
			this.hasTitle || this.buttonElement.removeAttr("title")
		},
		_setOption : function (e, t) {
			return this._super(e, t),
			"disabled" === e ? (this.widget().toggleClass("ui-state-disabled", !!t), this.element.prop("disabled", !!t), t && ("checkbox" === this.type || "radio" === this.type ? this.buttonElement.removeClass("ui-state-focus") : this.buttonElement.removeClass("ui-state-focus ui-state-active")), void 0) : (this._resetButton(), void 0)
		},
		refresh : function () {
			var t = this.element.is("input, button") ? this.element.is(":disabled") : this.element.hasClass("ui-button-disabled");
			t !== this.options.disabled && this._setOption("disabled", t),
			"radio" === this.type ? g(this.element[0]).each(function () {
				e(this).is(":checked") ? e(this).button("widget").addClass("ui-state-active").attr("aria-pressed", "true") : e(this).button("widget").removeClass("ui-state-active").attr("aria-pressed", "false")
			}) : "checkbox" === this.type && (this.element.is(":checked") ? this.buttonElement.addClass("ui-state-active").attr("aria-pressed", "true") : this.buttonElement.removeClass("ui-state-active").attr("aria-pressed", "false"))
		},
		_resetButton : function () {
			if ("input" === this.type)
				return this.options.label && this.element.val(this.options.label), void 0;
			var t = this.buttonElement.removeClass(f),
			i = e("<span></span>", this.document[0]).addClass("ui-button-text").html(this.options.label).appendTo(t.empty()).text(),
			s = this.options.icons,
			a = s.primary && s.secondary,
			n = [];
			s.primary || s.secondary ? (this.options.text && n.push("ui-button-text-icon" + (a ? "s" : s.primary ? "-primary" : "-secondary")), s.primary && t.prepend("<span class='ui-button-icon-primary ui-icon " + s.primary + "'></span>"), s.secondary && t.append("<span class='ui-button-icon-secondary ui-icon " + s.secondary + "'></span>"), this.options.text || (n.push(a ? "ui-button-icons-only" : "ui-button-icon-only"), this.hasTitle || t.attr("title", e.trim(i)))) : n.push("ui-button-text-only"),
			t.addClass(n.join(" "))
		}
	}),
	e.widget("ui.buttonset", {
		version : "1.11.4",
		options : {
			items : "button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(ui-button)"
		},
		_create : function () {
			this.element.addClass("ui-buttonset")
		},
		_init : function () {
			this.refresh()
		},
		_setOption : function (e, t) {
			"disabled" === e && this.buttons.button("option", e, t),
			this._super(e, t)
		},
		refresh : function () {
			var t = "rtl" === this.element.css("direction"),
			i = this.element.find(this.options.items),
			s = i.filter(":ui-button");
			i.not(":ui-button").button(),
			s.button("refresh"),
			this.buttons = i.map(function () {
					return e(this).button("widget")[0]
				}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(t ? "ui-corner-right" : "ui-corner-left").end().filter(":last").addClass(t ? "ui-corner-left" : "ui-corner-right").end().end()
		},
		_destroy : function () {
			this.element.removeClass("ui-buttonset"),
			this.buttons.map(function () {
				return e(this).button("widget")[0]
			}).removeClass("ui-corner-left ui-corner-right").end().button("destroy")
		}
	}),
	e.ui.button,
	e.extend(e.ui, {
		datepicker : {
			version : "1.11.4"
		}
	});
	var v;
	e.extend(a.prototype, {
		markerClassName : "hasDatepicker",
		maxRows : 4,
		_widgetDatepicker : function () {
			return this.dpDiv
		},
		setDefaults : function (e) {
			return o(this._defaults, e || {}),
			this
		},
		_attachDatepicker : function (t, i) {
			var s,
			a,
			n;
			s = t.nodeName.toLowerCase(),
			a = "div" === s || "span" === s,
			t.id || (this.uuid += 1, t.id = "dp" + this.uuid),
			n = this._newInst(e(t), a),
			n.settings = e.extend({}, i || {}),
			"input" === s ? this._connectDatepicker(t, n) : a && this._inlineDatepicker(t, n)
		},
		_newInst : function (t, i) {
			var s = t[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1");
			return {
				id : s,
				input : t,
				selectedDay : 0,
				selectedMonth : 0,
				selectedYear : 0,
				drawMonth : 0,
				drawYear : 0,
				inline : i,
				dpDiv : i ? n(e("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")) : this.dpDiv
			}
		},
		_connectDatepicker : function (t, i) {
			var s = e(t);
			i.append = e([]),
			i.trigger = e([]),
			s.hasClass(this.markerClassName) || (this._attachments(s, i), s.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp), this._autoSize(i), e.data(t, "datepicker", i), i.settings.disabled && this._disableDatepicker(t))
		},
		_attachments : function (t, i) {
			var s,
			a,
			n,
			r = this._get(i, "appendText"),
			o = this._get(i, "isRTL");
			i.append && i.append.remove(),
			r && (i.append = e("<span class='" + this._appendClass + "'>" + r + "</span>"), t[o ? "before" : "after"](i.append)),
			t.unbind("focus", this._showDatepicker),
			i.trigger && i.trigger.remove(),
			s = this._get(i, "showOn"),
			("focus" === s || "both" === s) && t.focus(this._showDatepicker),
			("button" === s || "both" === s) && (a = this._get(i, "buttonText"), n = this._get(i, "buttonImage"), i.trigger = e(this._get(i, "buttonImageOnly") ? e("<img/>").addClass(this._triggerClass).attr({
							src : n,
							alt : a,
							title : a
						}) : e("<button type='button'></button>").addClass(this._triggerClass).html(n ? e("<img/>").attr({
								src : n,
								alt : a,
								title : a
							}) : a)), t[o ? "before" : "after"](i.trigger), i.trigger.click(function () {
					return e.datepicker._datepickerShowing && e.datepicker._lastInput === t[0] ? e.datepicker._hideDatepicker() : e.datepicker._datepickerShowing && e.datepicker._lastInput !== t[0] ? (e.datepicker._hideDatepicker(), e.datepicker._showDatepicker(t[0])) : e.datepicker._showDatepicker(t[0]),
					!1
				}))
		},
		_autoSize : function (e) {
			if (this._get(e, "autoSize") && !e.inline) {
				var t,
				i,
				s,
				a,
				n = new Date(2009, 11, 20),
				r = this._get(e, "dateFormat");
				r.match(/[DM]/) && (t = function (e) {
					for (i = 0, s = 0, a = 0; e.length > a; a++)
						e[a].length > i && (i = e[a].length, s = a);
					return s
				}, n.setMonth(t(this._get(e, r.match(/MM/) ? "monthNames" : "monthNamesShort"))), n.setDate(t(this._get(e, r.match(/DD/) ? "dayNames" : "dayNamesShort")) + 20 - n.getDay())),
				e.input.attr("size", this._formatDate(e, n).length)
			}
		},
		_inlineDatepicker : function (t, i) {
			var s = e(t);
			s.hasClass(this.markerClassName) || (s.addClass(this.markerClassName).append(i.dpDiv), e.data(t, "datepicker", i), this._setDate(i, this._getDefaultDate(i), !0), this._updateDatepicker(i), this._updateAlternate(i), i.settings.disabled && this._disableDatepicker(t), i.dpDiv.css("display", "block"))
		},
		_dialogDatepicker : function (t, i, s, a, n) {
			var r,
			h,
			l,
			u,
			d,
			c = this._dialogInst;
			return c || (this.uuid += 1, r = "dp" + this.uuid, this._dialogInput = e("<input type='text' id='" + r + "' style='position: absolute; top: -100px; width: 0px;'/>"), this._dialogInput.keydown(this._doKeyDown), e("body").append(this._dialogInput), c = this._dialogInst = this._newInst(this._dialogInput, !1), c.settings = {}, e.data(this._dialogInput[0], "datepicker", c)),
			o(c.settings, a || {}),
			i = i && i.constructor === Date ? this._formatDate(c, i) : i,
			this._dialogInput.val(i),
			this._pos = n ? n.length ? n : [n.pageX, n.pageY] : null,
			this._pos || (h = document.documentElement.clientWidth, l = document.documentElement.clientHeight, u = document.documentElement.scrollLeft || document.body.scrollLeft, d = document.documentElement.scrollTop || document.body.scrollTop, this._pos = [h / 2 - 100 + u, l / 2 - 150 + d]),
			this._dialogInput.css("left", this._pos[0] + 20 + "px").css("top", this._pos[1] + "px"),
			c.settings.onSelect = s,
			this._inDialog = !0,
			this.dpDiv.addClass(this._dialogClass),
			this._showDatepicker(this._dialogInput[0]),
			e.blockUI && e.blockUI(this.dpDiv),
			e.data(this._dialogInput[0], "datepicker", c),
			this
		},
		_destroyDatepicker : function (t) {
			var i,
			s = e(t),
			a = e.data(t, "datepicker");
			s.hasClass(this.markerClassName) && (i = t.nodeName.toLowerCase(), e.removeData(t, "datepicker"), "input" === i ? (a.append.remove(), a.trigger.remove(), s.removeClass(this.markerClassName).unbind("focus", this._showDatepicker).unbind("keydown", this._doKeyDown).unbind("keypress", this._doKeyPress).unbind("keyup", this._doKeyUp)) : ("div" === i || "span" === i) && s.removeClass(this.markerClassName).empty(), v === a && (v = null))
		},
		_enableDatepicker : function (t) {
			var i,
			s,
			a = e(t),
			n = e.data(t, "datepicker");
			a.hasClass(this.markerClassName) && (i = t.nodeName.toLowerCase(), "input" === i ? (t.disabled = !1, n.trigger.filter("button").each(function () {
						this.disabled = !1
					}).end().filter("img").css({
						opacity : "1.0",
						cursor : ""
					})) : ("div" === i || "span" === i) && (s = a.children("." + this._inlineClass), s.children().removeClass("ui-state-disabled"), s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !1)), this._disabledInputs = e.map(this._disabledInputs, function (e) {
						return e === t ? null : e
					}))
		},
		_disableDatepicker : function (t) {
			var i,
			s,
			a = e(t),
			n = e.data(t, "datepicker");
			a.hasClass(this.markerClassName) && (i = t.nodeName.toLowerCase(), "input" === i ? (t.disabled = !0, n.trigger.filter("button").each(function () {
						this.disabled = !0
					}).end().filter("img").css({
						opacity : "0.5",
						cursor : "default"
					})) : ("div" === i || "span" === i) && (s = a.children("." + this._inlineClass), s.children().addClass("ui-state-disabled"), s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !0)), this._disabledInputs = e.map(this._disabledInputs, function (e) {
						return e === t ? null : e
					}), this._disabledInputs[this._disabledInputs.length] = t)
		},
		_isDisabledDatepicker : function (e) {
			if (!e)
				return !1;
			for (var t = 0; this._disabledInputs.length > t; t++)
				if (this._disabledInputs[t] === e)
					return !0;
			return !1
		},
		_getInst : function (t) {
			try {
				return e.data(t, "datepicker")
			} catch (i) {
				throw "Missing instance data for this datepicker"
			}
		},
		_optionDatepicker : function (t, i, s) {
			var a,
			n,
			r,
			h,
			l = this._getInst(t);
			return 2 === arguments.length && "string" == typeof i ? "defaults" === i ? e.extend({}, e.datepicker._defaults) : l ? "all" === i ? e.extend({}, l.settings) : this._get(l, i) : null : (a = i || {}, "string" == typeof i && (a = {}, a[i] = s), l && (this._curInst === l && this._hideDatepicker(), n = this._getDateDatepicker(t, !0), r = this._getMinMaxDate(l, "min"), h = this._getMinMaxDate(l, "max"), o(l.settings, a), null !== r && void 0 !== a.dateFormat && void 0 === a.minDate && (l.settings.minDate = this._formatDate(l, r)), null !== h && void 0 !== a.dateFormat && void 0 === a.maxDate && (l.settings.maxDate = this._formatDate(l, h)), "disabled" in a && (a.disabled ? this._disableDatepicker(t) : this._enableDatepicker(t)), this._attachments(e(t), l), this._autoSize(l), this._setDate(l, n), this._updateAlternate(l), this._updateDatepicker(l)), void 0)
		},
		_changeDatepicker : function (e, t, i) {
			this._optionDatepicker(e, t, i)
		},
		_refreshDatepicker : function (e) {
			var t = this._getInst(e);
			t && this._updateDatepicker(t)
		},
		_setDateDatepicker : function (e, t) {
			var i = this._getInst(e);
			i && (this._setDate(i, t), this._updateDatepicker(i), this._updateAlternate(i))
		},
		_getDateDatepicker : function (e, t) {
			var i = this._getInst(e);
			return i && !i.inline && this._setDateFromField(i, t),
			i ? this._getDate(i) : null
		},
		_doKeyDown : function (t) {
			var i,
			s,
			a,
			n = e.datepicker._getInst(t.target),
			r = !0,
			o = n.dpDiv.is(".ui-datepicker-rtl");
			if (n._keyEvent = !0, e.datepicker._datepickerShowing)
				switch (t.keyCode) {
				case 9:
					e.datepicker._hideDatepicker(),
					r = !1;
					break;
				case 13:
					return a = e("td." + e.datepicker._dayOverClass + ":not(." + e.datepicker._currentClass + ")", n.dpDiv),
					a[0] && e.datepicker._selectDay(t.target, n.selectedMonth, n.selectedYear, a[0]),
					i = e.datepicker._get(n, "onSelect"),
					i ? (s = e.datepicker._formatDate(n), i.apply(n.input ? n.input[0] : null, [s, n])) : e.datepicker._hideDatepicker(),
					!1;
				case 27:
					e.datepicker._hideDatepicker();
					break;
				case 33:
					e.datepicker._adjustDate(t.target, t.ctrlKey ? -e.datepicker._get(n, "stepBigMonths") : -e.datepicker._get(n, "stepMonths"), "M");
					break;
				case 34:
					e.datepicker._adjustDate(t.target, t.ctrlKey ? +e.datepicker._get(n, "stepBigMonths") : +e.datepicker._get(n, "stepMonths"), "M");
					break;
				case 35:
					(t.ctrlKey || t.metaKey) && e.datepicker._clearDate(t.target),
					r = t.ctrlKey || t.metaKey;
					break;
				case 36:
					(t.ctrlKey || t.metaKey) && e.datepicker._gotoToday(t.target),
					r = t.ctrlKey || t.metaKey;
					break;
				case 37:
					(t.ctrlKey || t.metaKey) && e.datepicker._adjustDate(t.target, o ? 1 : -1, "D"),
					r = t.ctrlKey || t.metaKey,
					t.originalEvent.altKey && e.datepicker._adjustDate(t.target, t.ctrlKey ? -e.datepicker._get(n, "stepBigMonths") : -e.datepicker._get(n, "stepMonths"), "M");
					break;
				case 38:
					(t.ctrlKey || t.metaKey) && e.datepicker._adjustDate(t.target, -7, "D"),
					r = t.ctrlKey || t.metaKey;
					break;
				case 39:
					(t.ctrlKey || t.metaKey) && e.datepicker._adjustDate(t.target, o ? -1 : 1, "D"),
					r = t.ctrlKey || t.metaKey,
					t.originalEvent.altKey && e.datepicker._adjustDate(t.target, t.ctrlKey ? +e.datepicker._get(n, "stepBigMonths") : +e.datepicker._get(n, "stepMonths"), "M");
					break;
				case 40:
					(t.ctrlKey || t.metaKey) && e.datepicker._adjustDate(t.target, 7, "D"),
					r = t.ctrlKey || t.metaKey;
					break;
				default:
					r = !1
				}
			else
				36 === t.keyCode && t.ctrlKey ? e.datepicker._showDatepicker(this) : r = !1;
			r && (t.preventDefault(), t.stopPropagation())
		},
		_doKeyPress : function (t) {
			var i,
			s,
			a = e.datepicker._getInst(t.target);
			return e.datepicker._get(a, "constrainInput") ? (i = e.datepicker._possibleChars(e.datepicker._get(a, "dateFormat")), s = String.fromCharCode(null == t.charCode ? t.keyCode : t.charCode), t.ctrlKey || t.metaKey || " " > s || !i || i.indexOf(s) > -1) : void 0
		},
		_doKeyUp : function (t) {
			var i,
			s = e.datepicker._getInst(t.target);
			if (s.input.val() !== s.lastVal)
				try {
					i = e.datepicker.parseDate(e.datepicker._get(s, "dateFormat"), s.input ? s.input.val() : null, e.datepicker._getFormatConfig(s)),
					i && (e.datepicker._setDateFromField(s), e.datepicker._updateAlternate(s), e.datepicker._updateDatepicker(s))
				} catch (a) {}

			return !0
		},
		_showDatepicker : function (t) {
			if (t = t.target || t, "input" !== t.nodeName.toLowerCase() && (t = e("input", t.parentNode)[0]), !e.datepicker._isDisabledDatepicker(t) && e.datepicker._lastInput !== t) {
				var i,
				a,
				n,
				r,
				h,
				l,
				u;
				i = e.datepicker._getInst(t),
				e.datepicker._curInst && e.datepicker._curInst !== i && (e.datepicker._curInst.dpDiv.stop(!0, !0), i && e.datepicker._datepickerShowing && e.datepicker._hideDatepicker(e.datepicker._curInst.input[0])),
				a = e.datepicker._get(i, "beforeShow"),
				n = a ? a.apply(t, [t, i]) : {},
				n !== !1 && (o(i.settings, n), i.lastVal = null, e.datepicker._lastInput = t, e.datepicker._setDateFromField(i), e.datepicker._inDialog && (t.value = ""), e.datepicker._pos || (e.datepicker._pos = e.datepicker._findPos(t), e.datepicker._pos[1] += t.offsetHeight), r = !1, e(t).parents().each(function () {
						return r |= "fixed" === e(this).css("position"),
						!r
					}), h = {
						left : e.datepicker._pos[0],
						top : e.datepicker._pos[1]
					}, e.datepicker._pos = null, i.dpDiv.empty(), i.dpDiv.css({
						position : "absolute",
						display : "block",
						top : "-1000px"
					}), e.datepicker._updateDatepicker(i), h = e.datepicker._checkOffset(i, h, r), i.dpDiv.css({
						position : e.datepicker._inDialog && e.blockUI ? "static" : r ? "fixed" : "absolute",
						display : "none",
						left : h.left + "px",
						top : h.top + "px"
					}), i.inline || (l = e.datepicker._get(i, "showAnim"), u = e.datepicker._get(i, "duration"), i.dpDiv.css("z-index", s(e(t)) + 1), e.datepicker._datepickerShowing = !0, e.effects && e.effects.effect[l] ? i.dpDiv.show(l, e.datepicker._get(i, "showOptions"), u) : i.dpDiv[l || "show"](l ? u : null), e.datepicker._shouldFocusInput(i) && i.input.focus(), e.datepicker._curInst = i))
			}
		},
		_updateDatepicker : function (t) {
			this.maxRows = 4,
			v = t,
			t.dpDiv.empty().append(this._generateHTML(t)),
			this._attachHandlers(t);
			var i,
			s = this._getNumberOfMonths(t),
			a = s[1],
			n = 17,
			o = t.dpDiv.find("." + this._dayOverClass + " a");
			o.length > 0 && r.apply(o.get(0)),
			t.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""),
			a > 1 && t.dpDiv.addClass("ui-datepicker-multi-" + a).css("width", n * a + "em"),
			t.dpDiv[(1 !== s[0] || 1 !== s[1] ? "add" : "remove") + "Class"]("ui-datepicker-multi"),
			t.dpDiv[(this._get(t, "isRTL") ? "add" : "remove") + "Class"]("ui-datepicker-rtl"),
			t === e.datepicker._curInst && e.datepicker._datepickerShowing && e.datepicker._shouldFocusInput(t) && t.input.focus(),
			t.yearshtml && (i = t.yearshtml, setTimeout(function () {
					i === t.yearshtml && t.yearshtml && t.dpDiv.find("select.ui-datepicker-year:first").replaceWith(t.yearshtml),
					i = t.yearshtml = null
				}, 0))
		},
		_shouldFocusInput : function (e) {
			return e.input && e.input.is(":visible") && !e.input.is(":disabled") && !e.input.is(":focus")
		},
		_checkOffset : function (t, i, s) {
			var a = t.dpDiv.outerWidth(),
			n = t.dpDiv.outerHeight(),
			r = t.input ? t.input.outerWidth() : 0,
			o = t.input ? t.input.outerHeight() : 0,
			h = document.documentElement.clientWidth + (s ? 0 : e(document).scrollLeft()),
			l = document.documentElement.clientHeight + (s ? 0 : e(document).scrollTop());
			return i.left -= this._get(t, "isRTL") ? a - r : 0,
			i.left -= s && i.left === t.input.offset().left ? e(document).scrollLeft() : 0,
			i.top -= s && i.top === t.input.offset().top + o ? e(document).scrollTop() : 0,
			i.left -= Math.min(i.left, i.left + a > h && h > a ? Math.abs(i.left + a - h) : 0),
			i.top -= Math.min(i.top, i.top + n > l && l > n ? Math.abs(n + o) : 0),
			i
		},
		_findPos : function (t) {
			for (var i, s = this._getInst(t), a = this._get(s, "isRTL"); t && ("hidden" === t.type || 1 !== t.nodeType || e.expr.filters.hidden(t)); )
				t = t[a ? "previousSibling" : "nextSibling"];
			return i = e(t).offset(),
			[i.left, i.top]
		},
		_hideDatepicker : function (t) {
			var i,
			s,
			a,
			n,
			r = this._curInst;
			!r || t && r !== e.data(t, "datepicker") || this._datepickerShowing && (i = this._get(r, "showAnim"), s = this._get(r, "duration"), a = function () {
				e.datepicker._tidyDialog(r)
			}, e.effects && (e.effects.effect[i] || e.effects[i]) ? r.dpDiv.hide(i, e.datepicker._get(r, "showOptions"), s, a) : r.dpDiv["slideDown" === i ? "slideUp" : "fadeIn" === i ? "fadeOut" : "hide"](i ? s : null, a), i || a(), this._datepickerShowing = !1, n = this._get(r, "onClose"), n && n.apply(r.input ? r.input[0] : null, [r.input ? r.input.val() : "", r]), this._lastInput = null, this._inDialog && (this._dialogInput.css({
						position : "absolute",
						left : "0",
						top : "-100px"
					}), e.blockUI && (e.unblockUI(), e("body").append(this.dpDiv))), this._inDialog = !1)
		},
		_tidyDialog : function (e) {
			e.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")
		},
		_checkExternalClick : function (t) {
			if (e.datepicker._curInst) {
				var i = e(t.target),
				s = e.datepicker._getInst(i[0]);
				(i[0].id !== e.datepicker._mainDivId && 0 === i.parents("#" + e.datepicker._mainDivId).length && !i.hasClass(e.datepicker.markerClassName) && !i.closest("." + e.datepicker._triggerClass).length && e.datepicker._datepickerShowing && (!e.datepicker._inDialog || !e.blockUI) || i.hasClass(e.datepicker.markerClassName) && e.datepicker._curInst !== s) && e.datepicker._hideDatepicker()
			}
		},
		_adjustDate : function (t, i, s) {
			var a = e(t),
			n = this._getInst(a[0]);
			this._isDisabledDatepicker(a[0]) || (this._adjustInstDate(n, i + ("M" === s ? this._get(n, "showCurrentAtPos") : 0), s), this._updateDatepicker(n))
		},
		_gotoToday : function (t) {
			var i,
			s = e(t),
			a = this._getInst(s[0]);
			this._get(a, "gotoCurrent") && a.currentDay ? (a.selectedDay = a.currentDay, a.drawMonth = a.selectedMonth = a.currentMonth, a.drawYear = a.selectedYear = a.currentYear) : (i = new Date, a.selectedDay = i.getDate(), a.drawMonth = a.selectedMonth = i.getMonth(), a.drawYear = a.selectedYear = i.getFullYear()),
			this._notifyChange(a),
			this._adjustDate(s)
		},
		_selectMonthYear : function (t, i, s) {
			var a = e(t),
			n = this._getInst(a[0]);
			n["selected" + ("M" === s ? "Month" : "Year")] = n["draw" + ("M" === s ? "Month" : "Year")] = parseInt(i.options[i.selectedIndex].value, 10),
			this._notifyChange(n),
			this._adjustDate(a)
		},
		_selectDay : function (t, i, s, a) {
			var n,
			r = e(t);
			e(a).hasClass(this._unselectableClass) || this._isDisabledDatepicker(r[0]) || (n = this._getInst(r[0]), n.selectedDay = n.currentDay = e("a", a).html(), n.selectedMonth = n.currentMonth = i, n.selectedYear = n.currentYear = s, this._selectDate(t, this._formatDate(n, n.currentDay, n.currentMonth, n.currentYear)))
		},
		_clearDate : function (t) {
			var i = e(t);
			this._selectDate(i, "")
		},
		_selectDate : function (t, i) {
			var s,
			a = e(t),
			n = this._getInst(a[0]);
			i = null != i ? i : this._formatDate(n),
			n.input && n.input.val(i),
			this._updateAlternate(n),
			s = this._get(n, "onSelect"),
			s ? s.apply(n.input ? n.input[0] : null, [i, n]) : n.input && n.input.trigger("change"),
			n.inline ? this._updateDatepicker(n) : (this._hideDatepicker(), this._lastInput = n.input[0], "object" != typeof n.input[0] && n.input.focus(), this._lastInput = null)
		},
		_updateAlternate : function (t) {
			var i,
			s,
			a,
			n = this._get(t, "altField");
			n && (i = this._get(t, "altFormat") || this._get(t, "dateFormat"), s = this._getDate(t), a = this.formatDate(i, s, this._getFormatConfig(t)), e(n).each(function () {
					e(this).val(a)
				}))
		},
		noWeekends : function (e) {
			var t = e.getDay();
			return [t > 0 && 6 > t, ""]
		},
		iso8601Week : function (e) {
			var t,
			i = new Date(e.getTime());
			return i.setDate(i.getDate() + 4 - (i.getDay() || 7)),
			t = i.getTime(),
			i.setMonth(0),
			i.setDate(1),
			Math.floor(Math.round((t - i) / 864e5) / 7) + 1
		},
		parseDate : function (t, i, s) {
			if (null == t || null == i)
				throw "Invalid arguments";
			if (i = "object" == typeof i ? "" + i : i + "", "" === i)
				return null;
			var a,
			n,
			r,
			o,
			h = 0,
			l = (s ? s.shortYearCutoff : null) || this._defaults.shortYearCutoff,
			u = "string" != typeof l ? l : (new Date).getFullYear() % 100 + parseInt(l, 10),
			d = (s ? s.dayNamesShort : null) || this._defaults.dayNamesShort,
			c = (s ? s.dayNames : null) || this._defaults.dayNames,
			p = (s ? s.monthNamesShort : null) || this._defaults.monthNamesShort,
			f = (s ? s.monthNames : null) || this._defaults.monthNames,
			m = -1,
			g = -1,
			v = -1,
			y = -1,
			b = !1,
			_ = function (e) {
				var i = t.length > a + 1 && t.charAt(a + 1) === e;
				return i && a++,
				i
			},
			x = function (e) {
				var t = _(e),
				s = "@" === e ? 14 : "!" === e ? 20 : "y" === e && t ? 4 : "o" === e ? 3 : 2,
				a = "y" === e ? s : 1,
				n = RegExp("^\\d{" + a + "," + s + "}"),
				r = i.substring(h).match(n);
				if (!r)
					throw "Missing number at position " + h;
				return h += r[0].length,
				parseInt(r[0], 10)
			},
			k = function (t, s, a) {
				var n = -1,
				r = e.map(_(t) ? a : s, function (e, t) {
						return [[t, e]]
					}).sort(function (e, t) {
						return  - (e[1].length - t[1].length)
					});
				if (e.each(r, function (e, t) {
						var s = t[1];
						return i.substr(h, s.length).toLowerCase() === s.toLowerCase() ? (n = t[0], h += s.length, !1) : void 0
					}), -1 !== n)
					return n + 1;
				throw "Unknown name at position " + h
			},
			w = function () {
				if (i.charAt(h) !== t.charAt(a))
					throw "Unexpected literal at position " + h;
				h++
			};
			for (a = 0; t.length > a; a++)
				if (b)
					"'" !== t.charAt(a) || _("'") ? w() : b = !1;
				else
					switch (t.charAt(a)) {
					case "d":
						v = x("d");
						break;
					case "D":
						k("D", d, c);
						break;
					case "o":
						y = x("o");
						break;
					case "m":
						g = x("m");
						break;
					case "M":
						g = k("M", p, f);
						break;
					case "y":
						m = x("y");
						break;
					case "@":
						o = new Date(x("@")),
						m = o.getFullYear(),
						g = o.getMonth() + 1,
						v = o.getDate();
						break;
					case "!":
						o = new Date((x("!") - this._ticksTo1970) / 1e4),
						m = o.getFullYear(),
						g = o.getMonth() + 1,
						v = o.getDate();
						break;
					case "'":
						_("'") ? w() : b = !0;
						break;
					default:
						w()
					}
			if (i.length > h && (r = i.substr(h), !/^\s+/.test(r)))
				throw "Extra/unparsed characters found in date: " + r;
			if (-1 === m ? m = (new Date).getFullYear() : 100 > m && (m += (new Date).getFullYear() - (new Date).getFullYear() % 100 + (u >= m ? 0 : -100)), y > -1)
				for (g = 1, v = y; ; ) {
					if (n = this._getDaysInMonth(m, g - 1), n >= v)
						break;
					g++,
					v -= n
				}
			if (o = this._daylightSavingAdjust(new Date(m, g - 1, v)), o.getFullYear() !== m || o.getMonth() + 1 !== g || o.getDate() !== v)
				throw "Invalid date";
			return o
		},
		ATOM : "yy-mm-dd",
		COOKIE : "D, dd M yy",
		ISO_8601 : "yy-mm-dd",
		RFC_822 : "D, d M y",
		RFC_850 : "DD, dd-M-y",
		RFC_1036 : "D, d M y",
		RFC_1123 : "D, d M yy",
		RFC_2822 : "D, d M yy",
		RSS : "D, d M y",
		TICKS : "!",
		TIMESTAMP : "@",
		W3C : "yy-mm-dd",
		_ticksTo1970 : 1e7 * 60 * 60 * 24 * (718685 + Math.floor(492.5) - Math.floor(19.7) + Math.floor(4.925)),
		formatDate : function (e, t, i) {
			if (!t)
				return "";
			var s,
			a = (i ? i.dayNamesShort : null) || this._defaults.dayNamesShort,
			n = (i ? i.dayNames : null) || this._defaults.dayNames,
			r = (i ? i.monthNamesShort : null) || this._defaults.monthNamesShort,
			o = (i ? i.monthNames : null) || this._defaults.monthNames,
			h = function (t) {
				var i = e.length > s + 1 && e.charAt(s + 1) === t;
				return i && s++,
				i
			},
			l = function (e, t, i) {
				var s = "" + t;
				if (h(e))
					for (; i > s.length; )
						s = "0" + s;
				return s
			},
			u = function (e, t, i, s) {
				return h(e) ? s[t] : i[t]
			},
			d = "",
			c = !1;
			if (t)
				for (s = 0; e.length > s; s++)
					if (c)
						"'" !== e.charAt(s) || h("'") ? d += e.charAt(s) : c = !1;
					else
						switch (e.charAt(s)) {
						case "d":
							d += l("d", t.getDate(), 2);
							break;
						case "D":
							d += u("D", t.getDay(), a, n);
							break;
						case "o":
							d += l("o", Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - new Date(t.getFullYear(), 0, 0).getTime()) / 864e5), 3);
							break;
						case "m":
							d += l("m", t.getMonth() + 1, 2);
							break;
						case "M":
							d += u("M", t.getMonth(), r, o);
							break;
						case "y":
							d += h("y") ? t.getFullYear() : (10 > t.getYear() % 100 ? "0" : "") + t.getYear() % 100;
							break;
						case "@":
							d += t.getTime();
							break;
						case "!":
							d += 1e4 * t.getTime() + this._ticksTo1970;
							break;
						case "'":
							h("'") ? d += "'" : c = !0;
							break;
						default:
							d += e.charAt(s)
						}
			return d
		},
		_possibleChars : function (e) {
			var t,
			i = "",
			s = !1,
			a = function (i) {
				var s = e.length > t + 1 && e.charAt(t + 1) === i;
				return s && t++,
				s
			};
			for (t = 0; e.length > t; t++)
				if (s)
					"'" !== e.charAt(t) || a("'") ? i += e.charAt(t) : s = !1;
				else
					switch (e.charAt(t)) {
					case "d":
					case "m":
					case "y":
					case "@":
						i += "0123456789";
						break;
					case "D":
					case "M":
						return null;
					case "'":
						a("'") ? i += "'" : s = !0;
						break;
					default:
						i += e.charAt(t)
					}
			return i
		},
		_get : function (e, t) {
			return void 0 !== e.settings[t] ? e.settings[t] : this._defaults[t]
		},
		_setDateFromField : function (e, t) {
			if (e.input.val() !== e.lastVal) {
				var i = this._get(e, "dateFormat"),
				s = e.lastVal = e.input ? e.input.val() : null,
				a = this._getDefaultDate(e),
				n = a,
				r = this._getFormatConfig(e);
				try {
					n = this.parseDate(i, s, r) || a
				} catch (o) {
					s = t ? "" : s
				}
				e.selectedDay = n.getDate(),
				e.drawMonth = e.selectedMonth = n.getMonth(),
				e.drawYear = e.selectedYear = n.getFullYear(),
				e.currentDay = s ? n.getDate() : 0,
				e.currentMonth = s ? n.getMonth() : 0,
				e.currentYear = s ? n.getFullYear() : 0,
				this._adjustInstDate(e)
			}
		},
		_getDefaultDate : function (e) {
			return this._restrictMinMax(e, this._determineDate(e, this._get(e, "defaultDate"), new Date))
		},
		_determineDate : function (t, i, s) {
			var a = function (e) {
				var t = new Date;
				return t.setDate(t.getDate() + e),
				t
			},
			n = function (i) {
				try {
					return e.datepicker.parseDate(e.datepicker._get(t, "dateFormat"), i, e.datepicker._getFormatConfig(t))
				} catch (s) {}

				for (var a = (i.toLowerCase().match(/^c/) ? e.datepicker._getDate(t) : null) || new Date, n = a.getFullYear(), r = a.getMonth(), o = a.getDate(), h = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g, l = h.exec(i); l; ) {
					switch (l[2] || "d") {
					case "d":
					case "D":
						o += parseInt(l[1], 10);
						break;
					case "w":
					case "W":
						o += 7 * parseInt(l[1], 10);
						break;
					case "m":
					case "M":
						r += parseInt(l[1], 10),
						o = Math.min(o, e.datepicker._getDaysInMonth(n, r));
						break;
					case "y":
					case "Y":
						n += parseInt(l[1], 10),
						o = Math.min(o, e.datepicker._getDaysInMonth(n, r))
					}
					l = h.exec(i)
				}
				return new Date(n, r, o)
			},
			r = null == i || "" === i ? s : "string" == typeof i ? n(i) : "number" == typeof i ? isNaN(i) ? s : a(i) : new Date(i.getTime());
			return r = r && "Invalid Date" == "" + r ? s : r,
			r && (r.setHours(0), r.setMinutes(0), r.setSeconds(0), r.setMilliseconds(0)),
			this._daylightSavingAdjust(r)
		},
		_daylightSavingAdjust : function (e) {
			return e ? (e.setHours(e.getHours() > 12 ? e.getHours() + 2 : 0), e) : null
		},
		_setDate : function (e, t, i) {
			var s = !t,
			a = e.selectedMonth,
			n = e.selectedYear,
			r = this._restrictMinMax(e, this._determineDate(e, t, new Date));
			e.selectedDay = e.currentDay = r.getDate(),
			e.drawMonth = e.selectedMonth = e.currentMonth = r.getMonth(),
			e.drawYear = e.selectedYear = e.currentYear = r.getFullYear(),
			a === e.selectedMonth && n === e.selectedYear || i || this._notifyChange(e),
			this._adjustInstDate(e),
			e.input && e.input.val(s ? "" : this._formatDate(e))
		},
		_getDate : function (e) {
			var t = !e.currentYear || e.input && "" === e.input.val() ? null : this._daylightSavingAdjust(new Date(e.currentYear, e.currentMonth, e.currentDay));
			return t
		},
		_attachHandlers : function (t) {
			var i = this._get(t, "stepMonths"),
			s = "#" + t.id.replace(/\\\\/g, "\\");
			t.dpDiv.find("[data-handler]").map(function () {
				var t = {
					prev : function () {
						e.datepicker._adjustDate(s, -i, "M")
					},
					next : function () {
						e.datepicker._adjustDate(s, +i, "M")
					},
					hide : function () {
						e.datepicker._hideDatepicker()
					},
					today : function () {
						e.datepicker._gotoToday(s)
					},
					selectDay : function () {
						return e.datepicker._selectDay(s, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this),
						!1
					},
					selectMonth : function () {
						return e.datepicker._selectMonthYear(s, this, "M"),
						!1
					},
					selectYear : function () {
						return e.datepicker._selectMonthYear(s, this, "Y"),
						!1
					}
				};
				e(this).bind(this.getAttribute("data-event"), t[this.getAttribute("data-handler")])
			})
		},
		_generateHTML : function (e) {
			var t,
			i,
			s,
			a,
			n,
			r,
			o,
			h,
			l,
			u,
			d,
			c,
			p,
			f,
			m,
			g,
			v,
			y,
			b,
			_,
			x,
			k,
			w,
			T,
			D,
			S,
			M,
			N,
			C,
			A,
			I,
			P,
			F,
			H,
			z,
			j,
			E,
			O,
			L,
			W = new Date,
			R = this._daylightSavingAdjust(new Date(W.getFullYear(), W.getMonth(), W.getDate())),
			Y = this._get(e, "isRTL"),
			J = this._get(e, "showButtonPanel"),
			B = this._get(e, "hideIfNoPrevNext"),
			K = this._get(e, "navigationAsDateFormat"),
			V = this._getNumberOfMonths(e),
			q = this._get(e, "showCurrentAtPos"),
			U = this._get(e, "stepMonths"),
			G = 1 !== V[0] || 1 !== V[1],
			Q = this._daylightSavingAdjust(e.currentDay ? new Date(e.currentYear, e.currentMonth, e.currentDay) : new Date(9999, 9, 9)),
			X = this._getMinMaxDate(e, "min"),
			$ = this._getMinMaxDate(e, "max"),
			Z = e.drawMonth - q,
			et = e.drawYear;
			if (0 > Z && (Z += 12, et--), $)
				for (t = this._daylightSavingAdjust(new Date($.getFullYear(), $.getMonth() - V[0] * V[1] + 1, $.getDate())), t = X && X > t ? X : t; this._daylightSavingAdjust(new Date(et, Z, 1)) > t; )
					Z--, 0 > Z && (Z = 11, et--);
			for (e.drawMonth = Z, e.drawYear = et, i = this._get(e, "prevText"), i = K ? this.formatDate(i, this._daylightSavingAdjust(new Date(et, Z - U, 1)), this._getFormatConfig(e)) : i, s = this._canAdjustMonth(e, -1, et, Z) ? "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='" + i + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "e" : "w") + "'>" + i + "</span></a>" : B ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" + i + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "e" : "w") + "'>" + i + "</span></a>", a = this._get(e, "nextText"), a = K ? this.formatDate(a, this._daylightSavingAdjust(new Date(et, Z + U, 1)), this._getFormatConfig(e)) : a, n = this._canAdjustMonth(e, 1, et, Z) ? "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='" + a + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "w" : "e") + "'>" + a + "</span></a>" : B ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" + a + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "w" : "e") + "'>" + a + "</span></a>", r = this._get(e, "currentText"), o = this._get(e, "gotoCurrent") && e.currentDay ? Q : R, r = K ? this.formatDate(r, o, this._getFormatConfig(e)) : r, h = e.inline ? "" : "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" + this._get(e, "closeText") + "</button>", l = J ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (Y ? h : "") + (this._isInRange(e, o) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>" + r + "</button>" : "") + (Y ? "" : h) + "</div>" : "", u = parseInt(this._get(e, "firstDay"), 10), u = isNaN(u) ? 0 : u, d = this._get(e, "showWeek"), c = this._get(e, "dayNames"), p = this._get(e, "dayNamesMin"), f = this._get(e, "monthNames"), m = this._get(e, "monthNamesShort"), g = this._get(e, "beforeShowDay"), v = this._get(e, "showOtherMonths"), y = this._get(e, "selectOtherMonths"), b = this._getDefaultDate(e), _ = "", k = 0; V[0] > k; k++) {
				for (w = "", this.maxRows = 4, T = 0; V[1] > T; T++) {
					if (D = this._daylightSavingAdjust(new Date(et, Z, e.selectedDay)), S = " ui-corner-all", M = "", G) {
						if (M += "<div class='ui-datepicker-group", V[1] > 1)
							switch (T) {
							case 0:
								M += " ui-datepicker-group-first",
								S = " ui-corner-" + (Y ? "right" : "left");
								break;
							case V[1] - 1:
								M += " ui-datepicker-group-last",
								S = " ui-corner-" + (Y ? "left" : "right");
								break;
							default:
								M += " ui-datepicker-group-middle",
								S = ""
							}
						M += "'>"
					}
					for (M += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + S + "'>" + (/all|left/.test(S) && 0 === k ? Y ? n : s : "") + (/all|right/.test(S) && 0 === k ? Y ? s : n : "") + this._generateMonthYearHeader(e, Z, et, X, $, k > 0 || T > 0, f, m) + "</div><table class='ui-datepicker-calendar'><thead>" + "<tr>", N = d ? "<th class='ui-datepicker-week-col'>" + this._get(e, "weekHeader") + "</th>" : "", x = 0; 7 > x; x++)
						C = (x + u) % 7, N += "<th scope='col'" + ((x + u + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" + "<span title='" + c[C] + "'>" + p[C] + "</span></th>";
					for (M += N + "</tr></thead><tbody>", A = this._getDaysInMonth(et, Z), et === e.selectedYear && Z === e.selectedMonth && (e.selectedDay = Math.min(e.selectedDay, A)), I = (this._getFirstDayOfMonth(et, Z) - u + 7) % 7, P = Math.ceil((I + A) / 7), F = G ? this.maxRows > P ? this.maxRows : P : P, this.maxRows = F, H = this._daylightSavingAdjust(new Date(et, Z, 1 - I)), z = 0; F > z; z++) {
						for (M += "<tr>", j = d ? "<td class='ui-datepicker-week-col'>" + this._get(e, "calculateWeek")(H) + "</td>" : "", x = 0; 7 > x; x++)
							E = g ? g.apply(e.input ? e.input[0] : null, [H]) : [!0, ""], O = H.getMonth() !== Z, L = O && !y || !E[0] || X && X > H || $ && H > $, j += "<td class='" + ((x + u + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + (O ? " ui-datepicker-other-month" : "") + (H.getTime() === D.getTime() && Z === e.selectedMonth && e._keyEvent || b.getTime() === H.getTime() && b.getTime() === D.getTime() ? " " + this._dayOverClass : "") + (L ? " " + this._unselectableClass + " ui-state-disabled" : "") + (O && !v ? "" : " " + E[1] + (H.getTime() === Q.getTime() ? " " + this._currentClass : "") + (H.getTime() === R.getTime() ? " ui-datepicker-today" : "")) + "'" + (O && !v || !E[2] ? "" : " title='" + E[2].replace(/'/g, "&#39;") + "'") + (L ? "" : " data-handler='selectDay' data-event='click' data-month='" + H.getMonth() + "' data-year='" + H.getFullYear() + "'") + ">" + (O && !v ? "&#xa0;" : L ? "<span class='ui-state-default'>" + H.getDate() + "</span>" : "<a class='ui-state-default" + (H.getTime() === R.getTime() ? " ui-state-highlight" : "") + (H.getTime() === Q.getTime() ? " ui-state-active" : "") + (O ? " ui-priority-secondary" : "") + "' href='#'>" + H.getDate() + "</a>") + "</td>", H.setDate(H.getDate() + 1), H = this._daylightSavingAdjust(H);
						M += j + "</tr>"
					}
					Z++,
					Z > 11 && (Z = 0, et++),
					M += "</tbody></table>" + (G ? "</div>" + (V[0] > 0 && T === V[1] - 1 ? "<div class='ui-datepicker-row-break'></div>" : "") : ""),
					w += M
				}
				_ += w
			}
			return _ += l,
			e._keyEvent = !1,
			_
		},
		_generateMonthYearHeader : function (e, t, i, s, a, n, r, o) {
			var h,
			l,
			u,
			d,
			c,
			p,
			f,
			m,
			g = this._get(e, "changeMonth"),
			v = this._get(e, "changeYear"),
			y = this._get(e, "showMonthAfterYear"),
			b = "<div class='ui-datepicker-title'>",
			_ = "";
			if (n || !g)
				_ += "<span class='ui-datepicker-month'>" + r[t] + "</span>";
			else {
				for (h = s && s.getFullYear() === i, l = a && a.getFullYear() === i, _ += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>", u = 0; 12 > u; u++)
					(!h || u >= s.getMonth()) && (!l || a.getMonth() >= u) && (_ += "<option value='" + u + "'" + (u === t ? " selected='selected'" : "") + ">" + o[u] + "</option>");
				_ += "</select>"
			}
			if (y || (b += _ + (!n && g && v ? "" : "&#xa0;")), !e.yearshtml)
				if (e.yearshtml = "", n || !v)
					b += "<span class='ui-datepicker-year'>" + i + "</span>";
				else {
					for (d = this._get(e, "yearRange").split(":"), c = (new Date).getFullYear(), p = function (e) {
						var t = e.match(/c[+\-].*/) ? i + parseInt(e.substring(1), 10) : e.match(/[+\-].*/) ? c + parseInt(e, 10) : parseInt(e, 10);
						return isNaN(t) ? c : t
					}, f = p(d[0]), m = Math.max(f, p(d[1] || "")), f = s ? Math.max(f, s.getFullYear()) : f, m = a ? Math.min(m, a.getFullYear()) : m, e.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>"; m >= f; f++)
						e.yearshtml += "<option value='" + f + "'" + (f === i ? " selected='selected'" : "") + ">" + f + "</option>";
					e.yearshtml += "</select>",
					b += e.yearshtml,
					e.yearshtml = null
				}
			return b += this._get(e, "yearSuffix"),
			y && (b += (!n && g && v ? "" : "&#xa0;") + _),
			b += "</div>"
		},
		_adjustInstDate : function (e, t, i) {
			var s = e.drawYear + ("Y" === i ? t : 0),
			a = e.drawMonth + ("M" === i ? t : 0),
			n = Math.min(e.selectedDay, this._getDaysInMonth(s, a)) + ("D" === i ? t : 0),
			r = this._restrictMinMax(e, this._daylightSavingAdjust(new Date(s, a, n)));
			e.selectedDay = r.getDate(),
			e.drawMonth = e.selectedMonth = r.getMonth(),
			e.drawYear = e.selectedYear = r.getFullYear(),
			("M" === i || "Y" === i) && this._notifyChange(e)
		},
		_restrictMinMax : function (e, t) {
			var i = this._getMinMaxDate(e, "min"),
			s = this._getMinMaxDate(e, "max"),
			a = i && i > t ? i : t;
			return s && a > s ? s : a
		},
		_notifyChange : function (e) {
			var t = this._get(e, "onChangeMonthYear");
			t && t.apply(e.input ? e.input[0] : null, [e.selectedYear, e.selectedMonth + 1, e])
		},
		_getNumberOfMonths : function (e) {
			var t = this._get(e, "numberOfMonths");
			return null == t ? [1, 1] : "number" == typeof t ? [1, t] : t
		},
		_getMinMaxDate : function (e, t) {
			return this._determineDate(e, this._get(e, t + "Date"), null)
		},
		_getDaysInMonth : function (e, t) {
			return 32 - this._daylightSavingAdjust(new Date(e, t, 32)).getDate()
		},
		_getFirstDayOfMonth : function (e, t) {
			return new Date(e, t, 1).getDay()
		},
		_canAdjustMonth : function (e, t, i, s) {
			var a = this._getNumberOfMonths(e),
			n = this._daylightSavingAdjust(new Date(i, s + (0 > t ? t : a[0] * a[1]), 1));
			return 0 > t && n.setDate(this._getDaysInMonth(n.getFullYear(), n.getMonth())),
			this._isInRange(e, n)
		},
		_isInRange : function (e, t) {
			var i,
			s,
			a = this._getMinMaxDate(e, "min"),
			n = this._getMinMaxDate(e, "max"),
			r = null,
			o = null,
			h = this._get(e, "yearRange");
			return h && (i = h.split(":"), s = (new Date).getFullYear(), r = parseInt(i[0], 10), o = parseInt(i[1], 10), i[0].match(/[+\-].*/) && (r += s), i[1].match(/[+\-].*/) && (o += s)),
			(!a || t.getTime() >= a.getTime()) && (!n || t.getTime() <= n.getTime()) && (!r || t.getFullYear() >= r) && (!o || o >= t.getFullYear())
		},
		_getFormatConfig : function (e) {
			var t = this._get(e, "shortYearCutoff");
			return t = "string" != typeof t ? t : (new Date).getFullYear() % 100 + parseInt(t, 10), {
				shortYearCutoff : t,
				dayNamesShort : this._get(e, "dayNamesShort"),
				dayNames : this._get(e, "dayNames"),
				monthNamesShort : this._get(e, "monthNamesShort"),
				monthNames : this._get(e, "monthNames")
			}
		},
		_formatDate : function (e, t, i, s) {
			t || (e.currentDay = e.selectedDay, e.currentMonth = e.selectedMonth, e.currentYear = e.selectedYear);
			var a = t ? "object" == typeof t ? t : this._daylightSavingAdjust(new Date(s, i, t)) : this._daylightSavingAdjust(new Date(e.currentYear, e.currentMonth, e.currentDay));
			return this.formatDate(this._get(e, "dateFormat"), a, this._getFormatConfig(e))
		}
	}),
	e.fn.datepicker = function (t) {
		if (!this.length)
			return this;
		e.datepicker.initialized || (e(document).mousedown(e.datepicker._checkExternalClick), e.datepicker.initialized = !0),
		0 === e("#" + e.datepicker._mainDivId).length && e("body").append(e.datepicker.dpDiv);
		var i = Array.prototype.slice.call(arguments, 1);
		return "string" != typeof t || "isDisabled" !== t && "getDate" !== t && "widget" !== t ? "option" === t && 2 === arguments.length && "string" == typeof arguments[1] ? e.datepicker["_" + t + "Datepicker"].apply(e.datepicker, [this[0]].concat(i)) : this.each(function () {
			"string" == typeof t ? e.datepicker["_" + t + "Datepicker"].apply(e.datepicker, [this].concat(i)) : e.datepicker._attachDatepicker(this, t)
		}) : e.datepicker["_" + t + "Datepicker"].apply(e.datepicker, [this[0]].concat(i))
	},
	e.datepicker = new a,
	e.datepicker.initialized = !1,
	e.datepicker.uuid = (new Date).getTime(),
	e.datepicker.version = "1.11.4",
	e.datepicker,
	e.widget("ui.dialog", {
		version : "1.11.4",
		options : {
			appendTo : "body",
			autoOpen : !0,
			buttons : [],
			closeOnEscape : !0,
			closeText : "Close",
			dialogClass : "",
			draggable : !0,
			hide : null,
			height : "auto",
			maxHeight : null,
			maxWidth : null,
			minHeight : 150,
			minWidth : 150,
			modal : !1,
			position : {
				my : "center",
				at : "center",
				of : window,
				collision : "fit",
				using : function (t) {
					var i = e(this).css(t).offset().top;
					0 > i && e(this).css("top", t.top - i)
				}
			},
			resizable : !0,
			show : null,
			title : null,
			width : 300,
			beforeClose : null,
			close : null,
			drag : null,
			dragStart : null,
			dragStop : null,
			focus : null,
			open : null,
			resize : null,
			resizeStart : null,
			resizeStop : null
		},
		sizeRelatedOptions : {
			buttons : !0,
			height : !0,
			maxHeight : !0,
			maxWidth : !0,
			minHeight : !0,
			minWidth : !0,
			width : !0
		},
		resizableRelatedOptions : {
			maxHeight : !0,
			maxWidth : !0,
			minHeight : !0,
			minWidth : !0
		},
		_create : function () {
			this.originalCss = {
				display : this.element[0].style.display,
				width : this.element[0].style.width,
				minHeight : this.element[0].style.minHeight,
				maxHeight : this.element[0].style.maxHeight,
				height : this.element[0].style.height
			},
			this.originalPosition = {
				parent : this.element.parent(),
				index : this.element.parent().children().index(this.element)
			},
			this.originalTitle = this.element.attr("title"),
			this.options.title = this.options.title || this.originalTitle,
			this._createWrapper(),
			this.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(this.uiDialog),
			this._createTitlebar(),
			this._createButtonPane(),
			this.options.draggable && e.fn.draggable && this._makeDraggable(),
			this.options.resizable && e.fn.resizable && this._makeResizable(),
			this._isOpen = !1,
			this._trackFocus()
		},
		_init : function () {
			this.options.autoOpen && this.open()
		},
		_appendTo : function () {
			var t = this.options.appendTo;
			return t && (t.jquery || t.nodeType) ? e(t) : this.document.find(t || "body").eq(0)
		},
		_destroy : function () {
			var e,
			t = this.originalPosition;
			this._untrackInstance(),
			this._destroyOverlay(),
			this.element.removeUniqueId().removeClass("ui-dialog-content ui-widget-content").css(this.originalCss).detach(),
			this.uiDialog.stop(!0, !0).remove(),
			this.originalTitle && this.element.attr("title", this.originalTitle),
			e = t.parent.children().eq(t.index),
			e.length && e[0] !== this.element[0] ? e.before(this.element) : t.parent.append(this.element)
		},
		widget : function () {
			return this.uiDialog
		},
		disable : e.noop,
		enable : e.noop,
		close : function (t) {
			var i,
			s = this;
			if (this._isOpen && this._trigger("beforeClose", t) !== !1) {
				if (this._isOpen = !1, this._focusedElement = null, this._destroyOverlay(), this._untrackInstance(), !this.opener.filter(":focusable").focus().length)
					try {
						i = this.document[0].activeElement,
						i && "body" !== i.nodeName.toLowerCase() && e(i).blur()
					} catch (a) {}

				this._hide(this.uiDialog, this.options.hide, function () {
					s._trigger("close", t)
				})
			}
		},
		isOpen : function () {
			return this._isOpen
		},
		moveToTop : function () {
			this._moveToTop()
		},
		_moveToTop : function (t, i) {
			var s = !1,
			a = this.uiDialog.siblings(".ui-front:visible").map(function () {
					return +e(this).css("z-index")
				}).get(),
			n = Math.max.apply(null, a);
			return n >= +this.uiDialog.css("z-index") && (this.uiDialog.css("z-index", n + 1), s = !0),
			s && !i && this._trigger("focus", t),
			s
		},
		open : function () {
			var t = this;
			return this._isOpen ? (this._moveToTop() && this._focusTabbable(), void 0) : (this._isOpen = !0, this.opener = e(this.document[0].activeElement), this._size(), this._position(), this._createOverlay(), this._moveToTop(null, !0), this.overlay && this.overlay.css("z-index", this.uiDialog.css("z-index") - 1), this._show(this.uiDialog, this.options.show, function () {
					t._focusTabbable(),
					t._trigger("focus")
				}), this._makeFocusTarget(), this._trigger("open"), void 0)
		},
		_focusTabbable : function () {
			var e = this._focusedElement;
			e || (e = this.element.find("[autofocus]")),
			e.length || (e = this.element.find(":tabbable")),
			e.length || (e = this.uiDialogButtonPane.find(":tabbable")),
			e.length || (e = this.uiDialogTitlebarClose.filter(":tabbable")),
			e.length || (e = this.uiDialog),
			e.eq(0).focus()
		},
		_keepFocus : function (t) {
			function i() {
				var t = this.document[0].activeElement,
				i = this.uiDialog[0] === t || e.contains(this.uiDialog[0], t);
				i || this._focusTabbable()
			}
			t.preventDefault(),
			i.call(this),
			this._delay(i)
		},
		_createWrapper : function () {
			this.uiDialog = e("<div>").addClass("ui-dialog ui-widget ui-widget-content ui-corner-all ui-front " + this.options.dialogClass).hide().attr({
					tabIndex : -1,
					role : "dialog"
				}).appendTo(this._appendTo()),
			this._on(this.uiDialog, {
				keydown : function (t) {
					if (this.options.closeOnEscape && !t.isDefaultPrevented() && t.keyCode && t.keyCode === e.ui.keyCode.ESCAPE)
						return t.preventDefault(), this.close(t), void 0;
					if (t.keyCode === e.ui.keyCode.TAB && !t.isDefaultPrevented()) {
						var i = this.uiDialog.find(":tabbable"),
						s = i.filter(":first"),
						a = i.filter(":last");
						t.target !== a[0] && t.target !== this.uiDialog[0] || t.shiftKey ? t.target !== s[0] && t.target !== this.uiDialog[0] || !t.shiftKey || (this._delay(function () {
								a.focus()
							}), t.preventDefault()) : (this._delay(function () {
								s.focus()
							}), t.preventDefault())
					}
				},
				mousedown : function (e) {
					this._moveToTop(e) && this._focusTabbable()
				}
			}),
			this.element.find("[aria-describedby]").length || this.uiDialog.attr({
				"aria-describedby" : this.element.uniqueId().attr("id")
			})
		},
		_createTitlebar : function () {
			var t;
			this.uiDialogTitlebar = e("<div>").addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(this.uiDialog),
			this._on(this.uiDialogTitlebar, {
				mousedown : function (t) {
					e(t.target).closest(".ui-dialog-titlebar-close") || this.uiDialog.focus()
				}
			}),
			this.uiDialogTitlebarClose = e("<button type='button'></button>").button({
					label : this.options.closeText,
					icons : {
						primary : "ui-icon-closethick"
					},
					text : !1
				}).addClass("ui-dialog-titlebar-close").appendTo(this.uiDialogTitlebar),
			this._on(this.uiDialogTitlebarClose, {
				click : function (e) {
					e.preventDefault(),
					this.close(e)
				}
			}),
			t = e("<span>").uniqueId().addClass("ui-dialog-title").prependTo(this.uiDialogTitlebar),
			this._title(t),
			this.uiDialog.attr({
				"aria-labelledby" : t.attr("id")
			})
		},
		_title : function (e) {
			this.options.title || e.html("&#160;"),
			e.text(this.options.title)
		},
		_createButtonPane : function () {
			this.uiDialogButtonPane = e("<div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),
			this.uiButtonSet = e("<div>").addClass("ui-dialog-buttonset").appendTo(this.uiDialogButtonPane),
			this._createButtons()
		},
		_createButtons : function () {
			var t = this,
			i = this.options.buttons;
			return this.uiDialogButtonPane.remove(),
			this.uiButtonSet.empty(),
			e.isEmptyObject(i) || e.isArray(i) && !i.length ? (this.uiDialog.removeClass("ui-dialog-buttons"), void 0) : (e.each(i, function (i, s) {
					var a,
					n;
					s = e.isFunction(s) ? {
						click : s,
						text : i
					}
					 : s,
					s = e.extend({
							type : "button"
						}, s),
					a = s.click,
					s.click = function () {
						a.apply(t.element[0], arguments)
					},
					n = {
						icons : s.icons,
						text : s.showText
					},
					delete s.icons,
					delete s.showText,
					e("<button></button>", s).button(n).appendTo(t.uiButtonSet)
				}), this.uiDialog.addClass("ui-dialog-buttons"), this.uiDialogButtonPane.appendTo(this.uiDialog), void 0)
		},
		_makeDraggable : function () {
			function t(e) {
				return {
					position : e.position,
					offset : e.offset
				}
			}
			var i = this,
			s = this.options;
			this.uiDialog.draggable({
				cancel : ".ui-dialog-content, .ui-dialog-titlebar-close",
				handle : ".ui-dialog-titlebar",
				containment : "document",
				start : function (s, a) {
					e(this).addClass("ui-dialog-dragging"),
					i._blockFrames(),
					i._trigger("dragStart", s, t(a))
				},
				drag : function (e, s) {
					i._trigger("drag", e, t(s))
				},
				stop : function (a, n) {
					var r = n.offset.left - i.document.scrollLeft(),
					o = n.offset.top - i.document.scrollTop();
					s.position = {
						my : "left top",
						at : "left" + (r >= 0 ? "+" : "") + r + " " + "top" + (o >= 0 ? "+" : "") + o,
						of : i.window
					},
					e(this).removeClass("ui-dialog-dragging"),
					i._unblockFrames(),
					i._trigger("dragStop", a, t(n))
				}
			})
		},
		_makeResizable : function () {
			function t(e) {
				return {
					originalPosition : e.originalPosition,
					originalSize : e.originalSize,
					position : e.position,
					size : e.size
				}
			}
			var i = this,
			s = this.options,
			a = s.resizable,
			n = this.uiDialog.css("position"),
			r = "string" == typeof a ? a : "n,e,s,w,se,sw,ne,nw";
			this.uiDialog.resizable({
				cancel : ".ui-dialog-content",
				containment : "document",
				alsoResize : this.element,
				maxWidth : s.maxWidth,
				maxHeight : s.maxHeight,
				minWidth : s.minWidth,
				minHeight : this._minHeight(),
				handles : r,
				start : function (s, a) {
					e(this).addClass("ui-dialog-resizing"),
					i._blockFrames(),
					i._trigger("resizeStart", s, t(a))
				},
				resize : function (e, s) {
					i._trigger("resize", e, t(s))
				},
				stop : function (a, n) {
					var r = i.uiDialog.offset(),
					o = r.left - i.document.scrollLeft(),
					h = r.top - i.document.scrollTop();
					s.height = i.uiDialog.height(),
					s.width = i.uiDialog.width(),
					s.position = {
						my : "left top",
						at : "left" + (o >= 0 ? "+" : "") + o + " " + "top" + (h >= 0 ? "+" : "") + h,
						of : i.window
					},
					e(this).removeClass("ui-dialog-resizing"),
					i._unblockFrames(),
					i._trigger("resizeStop", a, t(n))
				}
			}).css("position", n)
		},
		_trackFocus : function () {
			this._on(this.widget(), {
				focusin : function (t) {
					this._makeFocusTarget(),
					this._focusedElement = e(t.target)
				}
			})
		},
		_makeFocusTarget : function () {
			this._untrackInstance(),
			this._trackingInstances().unshift(this)
		},
		_untrackInstance : function () {
			var t = this._trackingInstances(),
			i = e.inArray(this, t);
			-1 !== i && t.splice(i, 1)
		},
		_trackingInstances : function () {
			var e = this.document.data("ui-dialog-instances");
			return e || (e = [], this.document.data("ui-dialog-instances", e)),
			e
		},
		_minHeight : function () {
			var e = this.options;
			return "auto" === e.height ? e.minHeight : Math.min(e.minHeight, e.height)
		},
		_position : function () {
			var e = this.uiDialog.is(":visible");
			e || this.uiDialog.show(),
			this.uiDialog.position(this.options.position),
			e || this.uiDialog.hide()
		},
		_setOptions : function (t) {
			var i = this,
			s = !1,
			a = {};
			e.each(t, function (e, t) {
				i._setOption(e, t),
				e in i.sizeRelatedOptions && (s = !0),
				e in i.resizableRelatedOptions && (a[e] = t)
			}),
			s && (this._size(), this._position()),
			this.uiDialog.is(":data(ui-resizable)") && this.uiDialog.resizable("option", a)
		},
		_setOption : function (e, t) {
			var i,
			s,
			a = this.uiDialog;
			"dialogClass" === e && a.removeClass(this.options.dialogClass).addClass(t),
			"disabled" !== e && (this._super(e, t), "appendTo" === e && this.uiDialog.appendTo(this._appendTo()), "buttons" === e && this._createButtons(), "closeText" === e && this.uiDialogTitlebarClose.button({
					label : "" + t
				}), "draggable" === e && (i = a.is(":data(ui-draggable)"), i && !t && a.draggable("destroy"), !i && t && this._makeDraggable()), "position" === e && this._position(), "resizable" === e && (s = a.is(":data(ui-resizable)"), s && !t && a.resizable("destroy"), s && "string" == typeof t && a.resizable("option", "handles", t), s || t === !1 || this._makeResizable()), "title" === e && this._title(this.uiDialogTitlebar.find(".ui-dialog-title")))
		},
		_size : function () {
			var e,
			t,
			i,
			s = this.options;
			this.element.show().css({
				width : "auto",
				minHeight : 0,
				maxHeight : "none",
				height : 0
			}),
			s.minWidth > s.width && (s.width = s.minWidth),
			e = this.uiDialog.css({
					height : "auto",
					width : s.width
				}).outerHeight(),
			t = Math.max(0, s.minHeight - e),
			i = "number" == typeof s.maxHeight ? Math.max(0, s.maxHeight - e) : "none",
			"auto" === s.height ? this.element.css({
				minHeight : t,
				maxHeight : i,
				height : "auto"
			}) : this.element.height(Math.max(0, s.height - e)),
			this.uiDialog.is(":data(ui-resizable)") && this.uiDialog.resizable("option", "minHeight", this._minHeight())
		},
		_blockFrames : function () {
			this.iframeBlocks = this.document.find("iframe").map(function () {
					var t = e(this);
					return e("<div>").css({
						position : "absolute",
						width : t.outerWidth(),
						height : t.outerHeight()
					}).appendTo(t.parent()).offset(t.offset())[0]
				})
		},
		_unblockFrames : function () {
			this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks)
		},
		_allowInteraction : function (t) {
			return e(t.target).closest(".ui-dialog").length ? !0 : !!e(t.target).closest(".ui-datepicker").length
		},
		_createOverlay : function () {
			if (this.options.modal) {
				var t = !0;
				this._delay(function () {
					t = !1
				}),
				this.document.data("ui-dialog-overlays") || this._on(this.document, {
					focusin : function (e) {
						t || this._allowInteraction(e) || (e.preventDefault(), this._trackingInstances()[0]._focusTabbable())
					}
				}),
				this.overlay = e("<div>").addClass("ui-widget-overlay ui-front").appendTo(this._appendTo()),
				this._on(this.overlay, {
					mousedown : "_keepFocus"
				}),
				this.document.data("ui-dialog-overlays", (this.document.data("ui-dialog-overlays") || 0) + 1)
			}
		},
		_destroyOverlay : function () {
			if (this.options.modal && this.overlay) {
				var e = this.document.data("ui-dialog-overlays") - 1;
				e ? this.document.data("ui-dialog-overlays", e) : this.document.unbind("focusin").removeData("ui-dialog-overlays"),
				this.overlay.remove(),
				this.overlay = null
			}
		}
	}),
	e.widget("ui.progressbar", {
		version : "1.11.4",
		options : {
			max : 100,
			value : 0,
			change : null,
			complete : null
		},
		min : 0,
		_create : function () {
			this.oldValue = this.options.value = this._constrainedValue(),
			this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({
				role : "progressbar",
				"aria-valuemin" : this.min
			}),
			this.valueDiv = e("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element),
			this._refreshValue()
		},
		_destroy : function () {
			this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow"),
			this.valueDiv.remove()
		},
		value : function (e) {
			return void 0 === e ? this.options.value : (this.options.value = this._constrainedValue(e), this._refreshValue(), void 0)
		},
		_constrainedValue : function (e) {
			return void 0 === e && (e = this.options.value),
			this.indeterminate = e === !1,
			"number" != typeof e && (e = 0),
			this.indeterminate ? !1 : Math.min(this.options.max, Math.max(this.min, e))
		},
		_setOptions : function (e) {
			var t = e.value;
			delete e.value,
			this._super(e),
			this.options.value = this._constrainedValue(t),
			this._refreshValue()
		},
		_setOption : function (e, t) {
			"max" === e && (t = Math.max(this.min, t)),
			"disabled" === e && this.element.toggleClass("ui-state-disabled", !!t).attr("aria-disabled", t),
			this._super(e, t)
		},
		_percentage : function () {
			return this.indeterminate ? 100 : 100 * (this.options.value - this.min) / (this.options.max - this.min)
		},
		_refreshValue : function () {
			var t = this.options.value,
			i = this._percentage();
			this.valueDiv.toggle(this.indeterminate || t > this.min).toggleClass("ui-corner-right", t === this.options.max).width(i.toFixed(0) + "%"),
			this.element.toggleClass("ui-progressbar-indeterminate", this.indeterminate),
			this.indeterminate ? (this.element.removeAttr("aria-valuenow"), this.overlayDiv || (this.overlayDiv = e("<div class='ui-progressbar-overlay'></div>").appendTo(this.valueDiv))) : (this.element.attr({
					"aria-valuemax" : this.options.max,
					"aria-valuenow" : t
				}), this.overlayDiv && (this.overlayDiv.remove(), this.overlayDiv = null)),
			this.oldValue !== t && (this.oldValue = t, this._trigger("change")),
			t === this.options.max && this._trigger("complete")
		}
	}),
	e.widget("ui.selectmenu", {
		version : "1.11.4",
		defaultElement : "<select>",
		options : {
			appendTo : null,
			disabled : null,
			icons : {
				button : "ui-icon-triangle-1-s"
			},
			position : {
				my : "left top",
				at : "left bottom",
				collision : "none"
			},
			width : null,
			change : null,
			close : null,
			focus : null,
			open : null,
			select : null
		},
		_create : function () {
			var e = this.element.uniqueId().attr("id");
			this.ids = {
				element : e,
				button : e + "-button",
				menu : e + "-menu"
			},
			this._drawButton(),
			this._drawMenu(),
			this.options.disabled && this.disable()
		},
		_drawButton : function () {
			var t = this;
			this.label = e("label[for='" + this.ids.element + "']").attr("for", this.ids.button),
			this._on(this.label, {
				click : function (e) {
					this.button.focus(),
					e.preventDefault()
				}
			}),
			this.element.hide(),
			this.button = e("<span>", {
					"class" : "ui-selectmenu-button ui-widget ui-state-default ui-corner-all",
					tabindex : this.options.disabled ? -1 : 0,
					id : this.ids.button,
					role : "combobox",
					"aria-expanded" : "false",
					"aria-autocomplete" : "list",
					"aria-owns" : this.ids.menu,
					"aria-haspopup" : "true"
				}).insertAfter(this.element),
			e("<span>", {
				"class" : "ui-icon " + this.options.icons.button
			}).prependTo(this.button),
			this.buttonText = e("<span>", {
					"class" : "ui-selectmenu-text"
				}).appendTo(this.button),
			this._setText(this.buttonText, this.element.find("option:selected").text()),
			this._resizeButton(),
			this._on(this.button, this._buttonEvents),
			this.button.one("focusin", function () {
				t.menuItems || t._refreshMenu()
			}),
			this._hoverable(this.button),
			this._focusable(this.button)
		},
		_drawMenu : function () {
			var t = this;
			this.menu = e("<ul>", {
					"aria-hidden" : "true",
					"aria-labelledby" : this.ids.button,
					id : this.ids.menu
				}),
			this.menuWrap = e("<div>", {
					"class" : "ui-selectmenu-menu ui-front"
				}).append(this.menu).appendTo(this._appendTo()),
			this.menuInstance = this.menu.menu({
					role : "listbox",
					select : function (e, i) {
						e.preventDefault(),
						t._setSelection(),
						t._select(i.item.data("ui-selectmenu-item"), e)
					},
					focus : function (e, i) {
						var s = i.item.data("ui-selectmenu-item");
						null != t.focusIndex && s.index !== t.focusIndex && (t._trigger("focus", e, {
								item : s
							}), t.isOpen || t._select(s, e)),
						t.focusIndex = s.index,
						t.button.attr("aria-activedescendant", t.menuItems.eq(s.index).attr("id"))
					}
				}).menu("instance"),
			this.menu.addClass("ui-corner-bottom").removeClass("ui-corner-all"),
			this.menuInstance._off(this.menu, "mouseleave"),
			this.menuInstance._closeOnDocumentClick = function () {
				return !1
			},
			this.menuInstance._isDivider = function () {
				return !1
			}
		},
		refresh : function () {
			this._refreshMenu(),
			this._setText(this.buttonText, this._getSelectedItem().text()),
			this.options.width || this._resizeButton()
		},
		_refreshMenu : function () {
			this.menu.empty();
			var e,
			t = this.element.find("option");
			t.length && (this._parseOptions(t), this._renderMenu(this.menu, this.items), this.menuInstance.refresh(), this.menuItems = this.menu.find("li").not(".ui-selectmenu-optgroup"), e = this._getSelectedItem(), this.menuInstance.focus(null, e), this._setAria(e.data("ui-selectmenu-item")), this._setOption("disabled", this.element.prop("disabled")))
		},
		open : function (e) {
			this.options.disabled || (this.menuItems ? (this.menu.find(".ui-state-focus").removeClass("ui-state-focus"), this.menuInstance.focus(null, this._getSelectedItem())) : this._refreshMenu(), this.isOpen = !0, this._toggleAttr(), this._resizeMenu(), this._position(), this._on(this.document, this._documentClick), this._trigger("open", e))
		},
		_position : function () {
			this.menuWrap.position(e.extend({
					of : this.button
				}, this.options.position))
		},
		close : function (e) {
			this.isOpen && (this.isOpen = !1, this._toggleAttr(), this.range = null, this._off(this.document), this._trigger("close", e))
		},
		widget : function () {
			return this.button
		},
		menuWidget : function () {
			return this.menu
		},
		_renderMenu : function (t, i) {
			var s = this,
			a = "";
			e.each(i, function (i, n) {
				n.optgroup !== a && (e("<li>", {
						"class" : "ui-selectmenu-optgroup ui-menu-divider" + (n.element.parent("optgroup").prop("disabled") ? " ui-state-disabled" : ""),
						text : n.optgroup
					}).appendTo(t), a = n.optgroup),
				s._renderItemData(t, n)
			})
		},
		_renderItemData : function (e, t) {
			return this._renderItem(e, t).data("ui-selectmenu-item", t)
		},
		_renderItem : function (t, i) {
			var s = e("<li>");
			return i.disabled && s.addClass("ui-state-disabled"),
			this._setText(s, i.label),
			s.appendTo(t)
		},
		_setText : function (e, t) {
			t ? e.text(t) : e.html("&#160;")
		},
		_move : function (e, t) {
			var i,
			s,
			a = ".ui-menu-item";
			this.isOpen ? i = this.menuItems.eq(this.focusIndex) : (i = this.menuItems.eq(this.element[0].selectedIndex), a += ":not(.ui-state-disabled)"),
			s = "first" === e || "last" === e ? i["first" === e ? "prevAll" : "nextAll"](a).eq(-1) : i[e + "All"](a).eq(0),
			s.length && this.menuInstance.focus(t, s)
		},
		_getSelectedItem : function () {
			return this.menuItems.eq(this.element[0].selectedIndex)
		},
		_toggle : function (e) {
			this[this.isOpen ? "close" : "open"](e)
		},
		_setSelection : function () {
			var e;
			this.range && (window.getSelection ? (e = window.getSelection(), e.removeAllRanges(), e.addRange(this.range)) : this.range.select(), this.button.focus())
		},
		_documentClick : {
			mousedown : function (t) {
				this.isOpen && (e(t.target).closest(".ui-selectmenu-menu, #" + this.ids.button).length || this.close(t))
			}
		},
		_buttonEvents : {
			mousedown : function () {
				var e;
				window.getSelection ? (e = window.getSelection(), e.rangeCount && (this.range = e.getRangeAt(0))) : this.range = document.selection.createRange()
			},
			click : function (e) {
				this._setSelection(),
				this._toggle(e)
			},
			keydown : function (t) {
				var i = !0;
				switch (t.keyCode) {
				case e.ui.keyCode.TAB:
				case e.ui.keyCode.ESCAPE:
					this.close(t),
					i = !1;
					break;
				case e.ui.keyCode.ENTER:
					this.isOpen && this._selectFocusedItem(t);
					break;
				case e.ui.keyCode.UP:
					t.altKey ? this._toggle(t) : this._move("prev", t);
					break;
				case e.ui.keyCode.DOWN:
					t.altKey ? this._toggle(t) : this._move("next", t);
					break;
				case e.ui.keyCode.SPACE:
					this.isOpen ? this._selectFocusedItem(t) : this._toggle(t);
					break;
				case e.ui.keyCode.LEFT:
					this._move("prev", t);
					break;
				case e.ui.keyCode.RIGHT:
					this._move("next", t);
					break;
				case e.ui.keyCode.HOME:
				case e.ui.keyCode.PAGE_UP:
					this._move("first", t);
					break;
				case e.ui.keyCode.END:
				case e.ui.keyCode.PAGE_DOWN:
					this._move("last", t);
					break;
				default:
					this.menu.trigger(t),
					i = !1
				}
				i && t.preventDefault()
			}
		},
		_selectFocusedItem : function (e) {
			var t = this.menuItems.eq(this.focusIndex);
			t.hasClass("ui-state-disabled") || this._select(t.data("ui-selectmenu-item"), e)
		},
		_select : function (e, t) {
			var i = this.element[0].selectedIndex;
			this.element[0].selectedIndex = e.index,
			this._setText(this.buttonText, e.label),
			this._setAria(e),
			this._trigger("select", t, {
				item : e
			}),
			e.index !== i && this._trigger("change", t, {
				item : e
			}),
			this.close(t)
		},
		_setAria : function (e) {
			var t = this.menuItems.eq(e.index).attr("id");
			this.button.attr({
				"aria-labelledby" : t,
				"aria-activedescendant" : t
			}),
			this.menu.attr("aria-activedescendant", t)
		},
		_setOption : function (e, t) {
			"icons" === e && this.button.find("span.ui-icon").removeClass(this.options.icons.button).addClass(t.button),
			this._super(e, t),
			"appendTo" === e && this.menuWrap.appendTo(this._appendTo()),
			"disabled" === e && (this.menuInstance.option("disabled", t), this.button.toggleClass("ui-state-disabled", t).attr("aria-disabled", t), this.element.prop("disabled", t), t ? (this.button.attr("tabindex", -1), this.close()) : this.button.attr("tabindex", 0)),
			"width" === e && this._resizeButton()
		},
		_appendTo : function () {
			var t = this.options.appendTo;
			return t && (t = t.jquery || t.nodeType ? e(t) : this.document.find(t).eq(0)),
			t && t[0] || (t = this.element.closest(".ui-front")),
			t.length || (t = this.document[0].body),
			t
		},
		_toggleAttr : function () {
			this.button.toggleClass("ui-corner-top", this.isOpen).toggleClass("ui-corner-all", !this.isOpen).attr("aria-expanded", this.isOpen),
			this.menuWrap.toggleClass("ui-selectmenu-open", this.isOpen),
			this.menu.attr("aria-hidden", !this.isOpen)
		},
		_resizeButton : function () {
			var e = this.options.width;
			e || (e = this.element.show().outerWidth(), this.element.hide()),
			this.button.outerWidth(e)
		},
		_resizeMenu : function () {
			this.menu.outerWidth(Math.max(this.button.outerWidth(), this.menu.width("").outerWidth() + 1))
		},
		_getCreateOptions : function () {
			return {
				disabled : this.element.prop("disabled")
			}
		},
		_parseOptions : function (t) {
			var i = [];
			t.each(function (t, s) {
				var a = e(s),
				n = a.parent("optgroup");
				i.push({
					element : a,
					index : t,
					value : a.val(),
					label : a.text(),
					optgroup : n.attr("label") || "",
					disabled : n.prop("disabled") || a.prop("disabled")
				})
			}),
			this.items = i
		},
		_destroy : function () {
			this.menuWrap.remove(),
			this.button.remove(),
			this.element.show(),
			this.element.removeUniqueId(),
			this.label.attr("for", this.ids.element)
		}
	}),
	e.widget("ui.slider", e.ui.mouse, {
		version : "1.11.4",
		widgetEventPrefix : "slide",
		options : {
			animate : !1,
			distance : 0,
			max : 100,
			min : 0,
			orientation : "horizontal",
			range : !1,
			step : 1,
			value : 0,
			values : null,
			change : null,
			slide : null,
			start : null,
			stop : null
		},
		numPages : 5,
		_create : function () {
			this._keySliding = !1,
			this._mouseSliding = !1,
			this._animateOff = !0,
			this._handleIndex = null,
			this._detectOrientation(),
			this._mouseInit(),
			this._calculateNewMax(),
			this.element.addClass("ui-slider ui-slider-" + this.orientation + " ui-widget" + " ui-widget-content" + " ui-corner-all"),
			this._refresh(),
			this._setOption("disabled", this.options.disabled),
			this._animateOff = !1
		},
		_refresh : function () {
			this._createRange(),
			this._createHandles(),
			this._setupEvents(),
			this._refreshValue()
		},
		_createHandles : function () {
			var t,
			i,
			s = this.options,
			a = this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),
			n = "<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>",
			r = [];
			for (i = s.values && s.values.length || 1, a.length > i && (a.slice(i).remove(), a = a.slice(0, i)), t = a.length; i > t; t++)
				r.push(n);
			this.handles = a.add(e(r.join("")).appendTo(this.element)),
			this.handle = this.handles.eq(0),
			this.handles.each(function (t) {
				e(this).data("ui-slider-handle-index", t)
			})
		},
		_createRange : function () {
			var t = this.options,
			i = "";
			t.range ? (t.range === !0 && (t.values ? t.values.length && 2 !== t.values.length ? t.values = [t.values[0], t.values[0]] : e.isArray(t.values) && (t.values = t.values.slice(0)) : t.values = [this._valueMin(), this._valueMin()]), this.range && this.range.length ? this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({
					left : "",
					bottom : ""
				}) : (this.range = e("<div></div>").appendTo(this.element), i = "ui-slider-range ui-widget-header ui-corner-all"), this.range.addClass(i + ("min" === t.range || "max" === t.range ? " ui-slider-range-" + t.range : ""))) : (this.range && this.range.remove(), this.range = null)
		},
		_setupEvents : function () {
			this._off(this.handles),
			this._on(this.handles, this._handleEvents),
			this._hoverable(this.handles),
			this._focusable(this.handles)
		},
		_destroy : function () {
			this.handles.remove(),
			this.range && this.range.remove(),
			this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"),
			this._mouseDestroy()
		},
		_mouseCapture : function (t) {
			var i,
			s,
			a,
			n,
			r,
			o,
			h,
			l,
			u = this,
			d = this.options;
			return d.disabled ? !1 : (this.elementSize = {
					width : this.element.outerWidth(),
					height : this.element.outerHeight()
				}, this.elementOffset = this.element.offset(), i = {
					x : t.pageX,
					y : t.pageY
				}, s = this._normValueFromMouse(i), a = this._valueMax() - this._valueMin() + 1, this.handles.each(function (t) {
					var i = Math.abs(s - u.values(t));
					(a > i || a === i && (t === u._lastChangedValue || u.values(t) === d.min)) && (a = i, n = e(this), r = t)
				}), o = this._start(t, r), o === !1 ? !1 : (this._mouseSliding = !0, this._handleIndex = r, n.addClass("ui-state-active").focus(), h = n.offset(), l = !e(t.target).parents().addBack().is(".ui-slider-handle"), this._clickOffset = l ? {
						left : 0,
						top : 0
					}
					 : {
					left : t.pageX - h.left - n.width() / 2,
					top : t.pageY - h.top - n.height() / 2 - (parseInt(n.css("borderTopWidth"), 10) || 0) - (parseInt(n.css("borderBottomWidth"), 10) || 0) + (parseInt(n.css("marginTop"), 10) || 0)
				}, this.handles.hasClass("ui-state-hover") || this._slide(t, r, s), this._animateOff = !0, !0))
		},
		_mouseStart : function () {
			return !0
		},
		_mouseDrag : function (e) {
			var t = {
				x : e.pageX,
				y : e.pageY
			},
			i = this._normValueFromMouse(t);
			return this._slide(e, this._handleIndex, i),
			!1
		},
		_mouseStop : function (e) {
			return this.handles.removeClass("ui-state-active"),
			this._mouseSliding = !1,
			this._stop(e, this._handleIndex),
			this._change(e, this._handleIndex),
			this._handleIndex = null,
			this._clickOffset = null,
			this._animateOff = !1,
			!1
		},
		_detectOrientation : function () {
			this.orientation = "vertical" === this.options.orientation ? "vertical" : "horizontal"
		},
		_normValueFromMouse : function (e) {
			var t,
			i,
			s,
			a,
			n;
			return "horizontal" === this.orientation ? (t = this.elementSize.width, i = e.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0)) : (t = this.elementSize.height, i = e.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0)),
			s = i / t,
			s > 1 && (s = 1),
			0 > s && (s = 0),
			"vertical" === this.orientation && (s = 1 - s),
			a = this._valueMax() - this._valueMin(),
			n = this._valueMin() + s * a,
			this._trimAlignValue(n)
		},
		_start : function (e, t) {
			var i = {
				handle : this.handles[t],
				value : this.value()
			};
			return this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()),
			this._trigger("start", e, i)
		},
		_slide : function (e, t, i) {
			var s,
			a,
			n;
			this.options.values && this.options.values.length ? (s = this.values(t ? 0 : 1), 2 === this.options.values.length && this.options.range === !0 && (0 === t && i > s || 1 === t && s > i) && (i = s), i !== this.values(t) && (a = this.values(), a[t] = i, n = this._trigger("slide", e, {
							handle : this.handles[t],
							value : i,
							values : a
						}), s = this.values(t ? 0 : 1), n !== !1 && this.values(t, i))) : i !== this.value() && (n = this._trigger("slide", e, {
						handle : this.handles[t],
						value : i
					}), n !== !1 && this.value(i))
		},
		_stop : function (e, t) {
			var i = {
				handle : this.handles[t],
				value : this.value()
			};
			this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()),
			this._trigger("stop", e, i)
		},
		_change : function (e, t) {
			if (!this._keySliding && !this._mouseSliding) {
				var i = {
					handle : this.handles[t],
					value : this.value()
				};
				this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()),
				this._lastChangedValue = t,
				this._trigger("change", e, i)
			}
		},
		value : function (e) {
			return arguments.length ? (this.options.value = this._trimAlignValue(e), this._refreshValue(), this._change(null, 0), void 0) : this._value()
		},
		values : function (t, i) {
			var s,
			a,
			n;
			if (arguments.length > 1)
				return this.options.values[t] = this._trimAlignValue(i), this._refreshValue(), this._change(null, t), void 0;
			if (!arguments.length)
				return this._values();
			if (!e.isArray(arguments[0]))
				return this.options.values && this.options.values.length ? this._values(t) : this.value();
			for (s = this.options.values, a = arguments[0], n = 0; s.length > n; n += 1)
				s[n] = this._trimAlignValue(a[n]), this._change(null, n);
			this._refreshValue()
		},
		_setOption : function (t, i) {
			var s,
			a = 0;
			switch ("range" === t && this.options.range === !0 && ("min" === i ? (this.options.value = this._values(0), this.options.values = null) : "max" === i && (this.options.value = this._values(this.options.values.length - 1), this.options.values = null)), e.isArray(this.options.values) && (a = this.options.values.length), "disabled" === t && this.element.toggleClass("ui-state-disabled", !!i), this._super(t, i), t) {
			case "orientation":
				this._detectOrientation(),
				this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-" + this.orientation),
				this._refreshValue(),
				this.handles.css("horizontal" === i ? "bottom" : "left", "");
				break;
			case "value":
				this._animateOff = !0,
				this._refreshValue(),
				this._change(null, 0),
				this._animateOff = !1;
				break;
			case "values":
				for (this._animateOff = !0, this._refreshValue(), s = 0; a > s; s += 1)
					this._change(null, s);
				this._animateOff = !1;
				break;
			case "step":
			case "min":
			case "max":
				this._animateOff = !0,
				this._calculateNewMax(),
				this._refreshValue(),
				this._animateOff = !1;
				break;
			case "range":
				this._animateOff = !0,
				this._refresh(),
				this._animateOff = !1
			}
		},
		_value : function () {
			var e = this.options.value;
			return e = this._trimAlignValue(e)
		},
		_values : function (e) {
			var t,
			i,
			s;
			if (arguments.length)
				return t = this.options.values[e], t = this._trimAlignValue(t);
			if (this.options.values && this.options.values.length) {
				for (i = this.options.values.slice(), s = 0; i.length > s; s += 1)
					i[s] = this._trimAlignValue(i[s]);
				return i
			}
			return []
		},
		_trimAlignValue : function (e) {
			if (this._valueMin() >= e)
				return this._valueMin();
			if (e >= this._valueMax())
				return this._valueMax();
			var t = this.options.step > 0 ? this.options.step : 1,
			i = (e - this._valueMin()) % t,
			s = e - i;
			return 2 * Math.abs(i) >= t && (s += i > 0 ? t : -t),
			parseFloat(s.toFixed(5))
		},
		_calculateNewMax : function () {
			var e = this.options.max,
			t = this._valueMin(),
			i = this.options.step,
			s = Math.floor( + (e - t).toFixed(this._precision()) / i) * i;
			e = s + t,
			this.max = parseFloat(e.toFixed(this._precision()))
		},
		_precision : function () {
			var e = this._precisionOf(this.options.step);
			return null !== this.options.min && (e = Math.max(e, this._precisionOf(this.options.min))),
			e
		},
		_precisionOf : function (e) {
			var t = "" + e,
			i = t.indexOf(".");
			return -1 === i ? 0 : t.length - i - 1
		},
		_valueMin : function () {
			return this.options.min
		},
		_valueMax : function () {
			return this.max
		},
		_refreshValue : function () {
			var t,
			i,
			s,
			a,
			n,
			r = this.options.range,
			o = this.options,
			h = this,
			l = this._animateOff ? !1 : o.animate,
			u = {};
			this.options.values && this.options.values.length ? this.handles.each(function (s) {
				i = 100 * ((h.values(s) - h._valueMin()) / (h._valueMax() - h._valueMin())),
				u["horizontal" === h.orientation ? "left" : "bottom"] = i + "%",
				e(this).stop(1, 1)[l ? "animate" : "css"](u, o.animate),
				h.options.range === !0 && ("horizontal" === h.orientation ? (0 === s && h.range.stop(1, 1)[l ? "animate" : "css"]({
							left : i + "%"
						}, o.animate), 1 === s && h.range[l ? "animate" : "css"]({
							width : i - t + "%"
						}, {
							queue : !1,
							duration : o.animate
						})) : (0 === s && h.range.stop(1, 1)[l ? "animate" : "css"]({
							bottom : i + "%"
						}, o.animate), 1 === s && h.range[l ? "animate" : "css"]({
							height : i - t + "%"
						}, {
							queue : !1,
							duration : o.animate
						}))),
				t = i
			}) : (s = this.value(), a = this._valueMin(), n = this._valueMax(), i = n !== a ? 100 * ((s - a) / (n - a)) : 0, u["horizontal" === this.orientation ? "left" : "bottom"] = i + "%", this.handle.stop(1, 1)[l ? "animate" : "css"](u, o.animate), "min" === r && "horizontal" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({
					width : i + "%"
				}, o.animate), "max" === r && "horizontal" === this.orientation && this.range[l ? "animate" : "css"]({
					width : 100 - i + "%"
				}, {
					queue : !1,
					duration : o.animate
				}), "min" === r && "vertical" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({
					height : i + "%"
				}, o.animate), "max" === r && "vertical" === this.orientation && this.range[l ? "animate" : "css"]({
					height : 100 - i + "%"
				}, {
					queue : !1,
					duration : o.animate
				}))
		},
		_handleEvents : {
			keydown : function (t) {
				var i,
				s,
				a,
				n,
				r = e(t.target).data("ui-slider-handle-index");
				switch (t.keyCode) {
				case e.ui.keyCode.HOME:
				case e.ui.keyCode.END:
				case e.ui.keyCode.PAGE_UP:
				case e.ui.keyCode.PAGE_DOWN:
				case e.ui.keyCode.UP:
				case e.ui.keyCode.RIGHT:
				case e.ui.keyCode.DOWN:
				case e.ui.keyCode.LEFT:
					if (t.preventDefault(), !this._keySliding && (this._keySliding = !0, e(t.target).addClass("ui-state-active"), i = this._start(t, r), i === !1))
						return
				}
				switch (n = this.options.step, s = a = this.options.values && this.options.values.length ? this.values(r) : this.value(), t.keyCode) {
				case e.ui.keyCode.HOME:
					a = this._valueMin();
					break;
				case e.ui.keyCode.END:
					a = this._valueMax();
					break;
				case e.ui.keyCode.PAGE_UP:
					a = this._trimAlignValue(s + (this._valueMax() - this._valueMin()) / this.numPages);
					break;
				case e.ui.keyCode.PAGE_DOWN:
					a = this._trimAlignValue(s - (this._valueMax() - this._valueMin()) / this.numPages);
					break;
				case e.ui.keyCode.UP:
				case e.ui.keyCode.RIGHT:
					if (s === this._valueMax())
						return;
					a = this._trimAlignValue(s + n);
					break;
				case e.ui.keyCode.DOWN:
				case e.ui.keyCode.LEFT:
					if (s === this._valueMin())
						return;
					a = this._trimAlignValue(s - n)
				}
				this._slide(t, r, a)
			},
			keyup : function (t) {
				var i = e(t.target).data("ui-slider-handle-index");
				this._keySliding && (this._keySliding = !1, this._stop(t, i), this._change(t, i), e(t.target).removeClass("ui-state-active"))
			}
		}
	}),
	e.widget("ui.spinner", {
		version : "1.11.4",
		defaultElement : "<input>",
		widgetEventPrefix : "spin",
		options : {
			culture : null,
			icons : {
				down : "ui-icon-triangle-1-s",
				up : "ui-icon-triangle-1-n"
			},
			incremental : !0,
			max : null,
			min : null,
			numberFormat : null,
			page : 10,
			step : 1,
			change : null,
			spin : null,
			start : null,
			stop : null
		},
		_create : function () {
			this._setOption("max", this.options.max),
			this._setOption("min", this.options.min),
			this._setOption("step", this.options.step),
			"" !== this.value() && this._value(this.element.val(), !0),
			this._draw(),
			this._on(this._events),
			this._refresh(),
			this._on(this.window, {
				beforeunload : function () {
					this.element.removeAttr("autocomplete")
				}
			})
		},
		_getCreateOptions : function () {
			var t = {},
			i = this.element;
			return e.each(["min", "max", "step"], function (e, s) {
				var a = i.attr(s);
				void 0 !== a && a.length && (t[s] = a)
			}),
			t
		},
		_events : {
			keydown : function (e) {
				this._start(e) && this._keydown(e) && e.preventDefault()
			},
			keyup : "_stop",
			focus : function () {
				this.previous = this.element.val()
			},
			blur : function (e) {
				return this.cancelBlur ? (delete this.cancelBlur, void 0) : (this._stop(), this._refresh(), this.previous !== this.element.val() && this._trigger("change", e), void 0)
			},
			mousewheel : function (e, t) {
				if (t) {
					if (!this.spinning && !this._start(e))
						return !1;
					this._spin((t > 0 ? 1 : -1) * this.options.step, e),
					clearTimeout(this.mousewheelTimer),
					this.mousewheelTimer = this._delay(function () {
							this.spinning && this._stop(e)
						}, 100),
					e.preventDefault()
				}
			},
			"mousedown .ui-spinner-button" : function (t) {
				function i() {
					var e = this.element[0] === this.document[0].activeElement;
					e || (this.element.focus(), this.previous = s, this._delay(function () {
							this.previous = s
						}))
				}
				var s;
				s = this.element[0] === this.document[0].activeElement ? this.previous : this.element.val(),
				t.preventDefault(),
				i.call(this),
				this.cancelBlur = !0,
				this._delay(function () {
					delete this.cancelBlur,
					i.call(this)
				}),
				this._start(t) !== !1 && this._repeat(null, e(t.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, t)
			},
			"mouseup .ui-spinner-button" : "_stop",
			"mouseenter .ui-spinner-button" : function (t) {
				return e(t.currentTarget).hasClass("ui-state-active") ? this._start(t) === !1 ? !1 : (this._repeat(null, e(t.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, t), void 0) : void 0
			},
			"mouseleave .ui-spinner-button" : "_stop"
		},
		_draw : function () {
			var e = this.uiSpinner = this.element.addClass("ui-spinner-input").attr("autocomplete", "off").wrap(this._uiSpinnerHtml()).parent().append(this._buttonHtml());
			this.element.attr("role", "spinbutton"),
			this.buttons = e.find(".ui-spinner-button").attr("tabIndex", -1).button().removeClass("ui-corner-all"),
			this.buttons.height() > Math.ceil(.5 * e.height()) && e.height() > 0 && e.height(e.height()),
			this.options.disabled && this.disable()
		},
		_keydown : function (t) {
			var i = this.options,
			s = e.ui.keyCode;
			switch (t.keyCode) {
			case s.UP:
				return this._repeat(null, 1, t),
				!0;
			case s.DOWN:
				return this._repeat(null, -1, t),
				!0;
			case s.PAGE_UP:
				return this._repeat(null, i.page, t),
				!0;
			case s.PAGE_DOWN:
				return this._repeat(null, -i.page, t),
				!0
			}
			return !1
		},
		_uiSpinnerHtml : function () {
			return "<span class='ui-spinner ui-widget ui-widget-content ui-corner-all'></span>"
		},
		_buttonHtml : function () {
			return "<a class='ui-spinner-button ui-spinner-up ui-corner-tr'><span class='ui-icon " + this.options.icons.up + "'>&#9650;</span>" + "</a>" + "<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" + "<span class='ui-icon " + this.options.icons.down + "'>&#9660;</span>" + "</a>"
		},
		_start : function (e) {
			return this.spinning || this._trigger("start", e) !== !1 ? (this.counter || (this.counter = 1), this.spinning = !0, !0) : !1
		},
		_repeat : function (e, t, i) {
			e = e || 500,
			clearTimeout(this.timer),
			this.timer = this._delay(function () {
					this._repeat(40, t, i)
				}, e),
			this._spin(t * this.options.step, i)
		},
		_spin : function (e, t) {
			var i = this.value() || 0;
			this.counter || (this.counter = 1),
			i = this._adjustValue(i + e * this._increment(this.counter)),
			this.spinning && this._trigger("spin", t, {
				value : i
			}) === !1 || (this._value(i), this.counter++)
		},
		_increment : function (t) {
			var i = this.options.incremental;
			return i ? e.isFunction(i) ? i(t) : Math.floor(t * t * t / 5e4 - t * t / 500 + 17 * t / 200 + 1) : 1
		},
		_precision : function () {
			var e = this._precisionOf(this.options.step);
			return null !== this.options.min && (e = Math.max(e, this._precisionOf(this.options.min))),
			e
		},
		_precisionOf : function (e) {
			var t = "" + e,
			i = t.indexOf(".");
			return -1 === i ? 0 : t.length - i - 1
		},
		_adjustValue : function (e) {
			var t,
			i,
			s = this.options;
			return t = null !== s.min ? s.min : 0,
			i = e - t,
			i = Math.round(i / s.step) * s.step,
			e = t + i,
			e = parseFloat(e.toFixed(this._precision())),
			null !== s.max && e > s.max ? s.max : null !== s.min && s.min > e ? s.min : e
		},
		_stop : function (e) {
			this.spinning && (clearTimeout(this.timer), clearTimeout(this.mousewheelTimer), this.counter = 0, this.spinning = !1, this._trigger("stop", e))
		},
		_setOption : function (e, t) {
			if ("culture" === e || "numberFormat" === e) {
				var i = this._parse(this.element.val());
				return this.options[e] = t,
				this.element.val(this._format(i)),
				void 0
			}
			("max" === e || "min" === e || "step" === e) && "string" == typeof t && (t = this._parse(t)),
			"icons" === e && (this.buttons.first().find(".ui-icon").removeClass(this.options.icons.up).addClass(t.up), this.buttons.last().find(".ui-icon").removeClass(this.options.icons.down).addClass(t.down)),
			this._super(e, t),
			"disabled" === e && (this.widget().toggleClass("ui-state-disabled", !!t), this.element.prop("disabled", !!t), this.buttons.button(t ? "disable" : "enable"))
		},
		_setOptions : h(function (e) {
			this._super(e)
		}),
		_parse : function (e) {
			return "string" == typeof e && "" !== e && (e = window.Globalize && this.options.numberFormat ? Globalize.parseFloat(e, 10, this.options.culture) : +e),
			"" === e || isNaN(e) ? null : e
		},
		_format : function (e) {
			return "" === e ? "" : window.Globalize && this.options.numberFormat ? Globalize.format(e, this.options.numberFormat, this.options.culture) : e
		},
		_refresh : function () {
			this.element.attr({
				"aria-valuemin" : this.options.min,
				"aria-valuemax" : this.options.max,
				"aria-valuenow" : this._parse(this.element.val())
			})
		},
		isValid : function () {
			var e = this.value();
			return null === e ? !1 : e === this._adjustValue(e)
		},
		_value : function (e, t) {
			var i;
			"" !== e && (i = this._parse(e), null !== i && (t || (i = this._adjustValue(i)), e = this._format(i))),
			this.element.val(e),
			this._refresh()
		},
		_destroy : function () {
			this.element.removeClass("ui-spinner-input").prop("disabled", !1).removeAttr("autocomplete").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow"),
			this.uiSpinner.replaceWith(this.element)
		},
		stepUp : h(function (e) {
			this._stepUp(e)
		}),
		_stepUp : function (e) {
			this._start() && (this._spin((e || 1) * this.options.step), this._stop())
		},
		stepDown : h(function (e) {
			this._stepDown(e)
		}),
		_stepDown : function (e) {
			this._start() && (this._spin((e || 1) * -this.options.step), this._stop())
		},
		pageUp : h(function (e) {
			this._stepUp((e || 1) * this.options.page)
		}),
		pageDown : h(function (e) {
			this._stepDown((e || 1) * this.options.page)
		}),
		value : function (e) {
			return arguments.length ? (h(this._value).call(this, e), void 0) : this._parse(this.element.val())
		},
		widget : function () {
			return this.uiSpinner
		}
	}),
	e.widget("ui.tabs", {
		version : "1.11.4",
		delay : 300,
		options : {
			active : null,
			collapsible : !1,
			event : "click",
			heightStyle : "content",
			hide : null,
			show : null,
			activate : null,
			beforeActivate : null,
			beforeLoad : null,
			load : null
		},
		_isLocal : function () {
			var e = /#.*$/;
			return function (t) {
				var i,
				s;
				t = t.cloneNode(!1),
				i = t.href.replace(e, ""),
				s = location.href.replace(e, "");
				try {
					i = decodeURIComponent(i)
				} catch (a) {}

				try {
					s = decodeURIComponent(s)
				} catch (a) {}

				return t.hash.length > 1 && i === s
			}
		}
		(),
		_create : function () {
			var t = this,
			i = this.options;
			this.running = !1,
			this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all").toggleClass("ui-tabs-collapsible", i.collapsible),
			this._processTabs(),
			i.active = this._initialActive(),
			e.isArray(i.disabled) && (i.disabled = e.unique(i.disabled.concat(e.map(this.tabs.filter(".ui-state-disabled"), function (e) {
								return t.tabs.index(e)
							}))).sort()),
			this.active = this.options.active !== !1 && this.anchors.length ? this._findActive(i.active) : e(),
			this._refresh(),
			this.active.length && this.load(i.active)
		},
		_initialActive : function () {
			var t = this.options.active,
			i = this.options.collapsible,
			s = location.hash.substring(1);
			return null === t && (s && this.tabs.each(function (i, a) {
					return e(a).attr("aria-controls") === s ? (t = i, !1) : void 0
				}), null === t && (t = this.tabs.index(this.tabs.filter(".ui-tabs-active"))), (null === t || -1 === t) && (t = this.tabs.length ? 0 : !1)),
			t !== !1 && (t = this.tabs.index(this.tabs.eq(t)), -1 === t && (t = i ? !1 : 0)),
			!i && t === !1 && this.anchors.length && (t = 0),
			t
		},
		_getCreateEventData : function () {
			return {
				tab : this.active,
				panel : this.active.length ? this._getPanelForTab(this.active) : e()
			}
		},
		_tabKeydown : function (t) {
			var i = e(this.document[0].activeElement).closest("li"),
			s = this.tabs.index(i),
			a = !0;
			if (!this._handlePageNav(t)) {
				switch (t.keyCode) {
				case e.ui.keyCode.RIGHT:
				case e.ui.keyCode.DOWN:
					s++;
					break;
				case e.ui.keyCode.UP:
				case e.ui.keyCode.LEFT:
					a = !1,
					s--;
					break;
				case e.ui.keyCode.END:
					s = this.anchors.length - 1;
					break;
				case e.ui.keyCode.HOME:
					s = 0;
					break;
				case e.ui.keyCode.SPACE:
					return t.preventDefault(),
					clearTimeout(this.activating),
					this._activate(s),
					void 0;
				case e.ui.keyCode.ENTER:
					return t.preventDefault(),
					clearTimeout(this.activating),
					this._activate(s === this.options.active ? !1 : s),
					void 0;
				default:
					return
				}
				t.preventDefault(),
				clearTimeout(this.activating),
				s = this._focusNextTab(s, a),
				t.ctrlKey || t.metaKey || (i.attr("aria-selected", "false"), this.tabs.eq(s).attr("aria-selected", "true"), this.activating = this._delay(function () {
							this.option("active", s)
						}, this.delay))
			}
		},
		_panelKeydown : function (t) {
			this._handlePageNav(t) || t.ctrlKey && t.keyCode === e.ui.keyCode.UP && (t.preventDefault(), this.active.focus())
		},
		_handlePageNav : function (t) {
			return t.altKey && t.keyCode === e.ui.keyCode.PAGE_UP ? (this._activate(this._focusNextTab(this.options.active - 1, !1)), !0) : t.altKey && t.keyCode === e.ui.keyCode.PAGE_DOWN ? (this._activate(this._focusNextTab(this.options.active + 1, !0)), !0) : void 0
		},
		_findNextTab : function (t, i) {
			function s() {
				return t > a && (t = 0),
				0 > t && (t = a),
				t
			}
			for (var a = this.tabs.length - 1; -1 !== e.inArray(s(), this.options.disabled); )
				t = i ? t + 1 : t - 1;
			return t
		},
		_focusNextTab : function (e, t) {
			return e = this._findNextTab(e, t),
			this.tabs.eq(e).focus(),
			e
		},
		_setOption : function (e, t) {
			return "active" === e ? (this._activate(t), void 0) : "disabled" === e ? (this._setupDisabled(t), void 0) : (this._super(e, t), "collapsible" === e && (this.element.toggleClass("ui-tabs-collapsible", t), t || this.options.active !== !1 || this._activate(0)), "event" === e && this._setupEvents(t), "heightStyle" === e && this._setupHeightStyle(t), void 0)
		},
		_sanitizeSelector : function (e) {
			return e ? e.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&") : ""
		},
		refresh : function () {
			var t = this.options,
			i = this.tablist.children(":has(a[href])");
			t.disabled = e.map(i.filter(".ui-state-disabled"), function (e) {
					return i.index(e)
				}),
			this._processTabs(),
			t.active !== !1 && this.anchors.length ? this.active.length && !e.contains(this.tablist[0], this.active[0]) ? this.tabs.length === t.disabled.length ? (t.active = !1, this.active = e()) : this._activate(this._findNextTab(Math.max(0, t.active - 1), !1)) : t.active = this.tabs.index(this.active) : (t.active = !1, this.active = e()),
			this._refresh()
		},
		_refresh : function () {
			this._setupDisabled(this.options.disabled),
			this._setupEvents(this.options.event),
			this._setupHeightStyle(this.options.heightStyle),
			this.tabs.not(this.active).attr({
				"aria-selected" : "false",
				"aria-expanded" : "false",
				tabIndex : -1
			}),
			this.panels.not(this._getPanelForTab(this.active)).hide().attr({
				"aria-hidden" : "true"
			}),
			this.active.length ? (this.active.addClass("ui-tabs-active ui-state-active").attr({
					"aria-selected" : "true",
					"aria-expanded" : "true",
					tabIndex : 0
				}), this._getPanelForTab(this.active).show().attr({
					"aria-hidden" : "false"
				})) : this.tabs.eq(0).attr("tabIndex", 0)
		},
		_processTabs : function () {
			var t = this,
			i = this.tabs,
			s = this.anchors,
			a = this.panels;
			this.tablist = this._getList().addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").attr("role", "tablist").delegate("> li", "mousedown" + this.eventNamespace, function (t) {
					e(this).is(".ui-state-disabled") && t.preventDefault()
				}).delegate(".ui-tabs-anchor", "focus" + this.eventNamespace, function () {
					e(this).closest("li").is(".ui-state-disabled") && this.blur()
				}),
			this.tabs = this.tablist.find("> li:has(a[href])").addClass("ui-state-default ui-corner-top").attr({
					role : "tab",
					tabIndex : -1
				}),
			this.anchors = this.tabs.map(function () {
					return e("a", this)[0]
				}).addClass("ui-tabs-anchor").attr({
					role : "presentation",
					tabIndex : -1
				}),
			this.panels = e(),
			this.anchors.each(function (i, s) {
				var a,
				n,
				r,
				o = e(s).uniqueId().attr("id"),
				h = e(s).closest("li"),
				l = h.attr("aria-controls");
				t._isLocal(s) ? (a = s.hash, r = a.substring(1), n = t.element.find(t._sanitizeSelector(a))) : (r = h.attr("aria-controls") || e({}).uniqueId()[0].id, a = "#" + r, n = t.element.find(a), n.length || (n = t._createPanel(r), n.insertAfter(t.panels[i - 1] || t.tablist)), n.attr("aria-live", "polite")),
				n.length && (t.panels = t.panels.add(n)),
				l && h.data("ui-tabs-aria-controls", l),
				h.attr({
					"aria-controls" : r,
					"aria-labelledby" : o
				}),
				n.attr("aria-labelledby", o)
			}),
			this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").attr("role", "tabpanel"),
			i && (this._off(i.not(this.tabs)), this._off(s.not(this.anchors)), this._off(a.not(this.panels)))
		},
		_getList : function () {
			return this.tablist || this.element.find("ol,ul").eq(0)
		},
		_createPanel : function (t) {
			return e("<div>").attr("id", t).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").data("ui-tabs-destroy", !0)
		},
		_setupDisabled : function (t) {
			e.isArray(t) && (t.length ? t.length === this.anchors.length && (t = !0) : t = !1);
			for (var i, s = 0; i = this.tabs[s]; s++)
				t === !0 || -1 !== e.inArray(s, t) ? e(i).addClass("ui-state-disabled").attr("aria-disabled", "true") : e(i).removeClass("ui-state-disabled").removeAttr("aria-disabled");
			this.options.disabled = t
		},
		_setupEvents : function (t) {
			var i = {};
			t && e.each(t.split(" "), function (e, t) {
				i[t] = "_eventHandler"
			}),
			this._off(this.anchors.add(this.tabs).add(this.panels)),
			this._on(!0, this.anchors, {
				click : function (e) {
					e.preventDefault()
				}
			}),
			this._on(this.anchors, i),
			this._on(this.tabs, {
				keydown : "_tabKeydown"
			}),
			this._on(this.panels, {
				keydown : "_panelKeydown"
			}),
			this._focusable(this.tabs),
			this._hoverable(this.tabs)
		},
		_setupHeightStyle : function (t) {
			var i,
			s = this.element.parent();
			"fill" === t ? (i = s.height(), i -= this.element.outerHeight() - this.element.height(), this.element.siblings(":visible").each(function () {
					var t = e(this),
					s = t.css("position");
					"absolute" !== s && "fixed" !== s && (i -= t.outerHeight(!0))
				}), this.element.children().not(this.panels).each(function () {
					i -= e(this).outerHeight(!0)
				}), this.panels.each(function () {
					e(this).height(Math.max(0, i - e(this).innerHeight() + e(this).height()))
				}).css("overflow", "auto")) : "auto" === t && (i = 0, this.panels.each(function () {
					i = Math.max(i, e(this).height("").height())
				}).height(i))
		},
		_eventHandler : function (t) {
			var i = this.options,
			s = this.active,
			a = e(t.currentTarget),
			n = a.closest("li"),
			r = n[0] === s[0],
			o = r && i.collapsible,
			h = o ? e() : this._getPanelForTab(n),
			l = s.length ? this._getPanelForTab(s) : e(),
			u = {
				oldTab : s,
				oldPanel : l,
				newTab : o ? e() : n,
				newPanel : h
			};
			t.preventDefault(),
			n.hasClass("ui-state-disabled") || n.hasClass("ui-tabs-loading") || this.running || r && !i.collapsible || this._trigger("beforeActivate", t, u) === !1 || (i.active = o ? !1 : this.tabs.index(n), this.active = r ? e() : n, this.xhr && this.xhr.abort(), l.length || h.length || e.error("jQuery UI Tabs: Mismatching fragment identifier."), h.length && this.load(this.tabs.index(n), t), this._toggle(t, u))
		},
		_toggle : function (t, i) {
			function s() {
				n.running = !1,
				n._trigger("activate", t, i)
			}
			function a() {
				i.newTab.closest("li").addClass("ui-tabs-active ui-state-active"),
				r.length && n.options.show ? n._show(r, n.options.show, s) : (r.show(), s())
			}
			var n = this,
			r = i.newPanel,
			o = i.oldPanel;
			this.running = !0,
			o.length && this.options.hide ? this._hide(o, this.options.hide, function () {
				i.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active"),
				a()
			}) : (i.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active"), o.hide(), a()),
			o.attr("aria-hidden", "true"),
			i.oldTab.attr({
				"aria-selected" : "false",
				"aria-expanded" : "false"
			}),
			r.length && o.length ? i.oldTab.attr("tabIndex", -1) : r.length && this.tabs.filter(function () {
				return 0 === e(this).attr("tabIndex")
			}).attr("tabIndex", -1),
			r.attr("aria-hidden", "false"),
			i.newTab.attr({
				"aria-selected" : "true",
				"aria-expanded" : "true",
				tabIndex : 0
			})
		},
		_activate : function (t) {
			var i,
			s = this._findActive(t);
			s[0] !== this.active[0] && (s.length || (s = this.active), i = s.find(".ui-tabs-anchor")[0], this._eventHandler({
					target : i,
					currentTarget : i,
					preventDefault : e.noop
				}))
		},
		_findActive : function (t) {
			return t === !1 ? e() : this.tabs.eq(t)
		},
		_getIndex : function (e) {
			return "string" == typeof e && (e = this.anchors.index(this.anchors.filter("[href$='" + e + "']"))),
			e
		},
		_destroy : function () {
			this.xhr && this.xhr.abort(),
			this.element.removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible"),
			this.tablist.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").removeAttr("role"),
			this.anchors.removeClass("ui-tabs-anchor").removeAttr("role").removeAttr("tabIndex").removeUniqueId(),
			this.tablist.unbind(this.eventNamespace),
			this.tabs.add(this.panels).each(function () {
				e.data(this, "ui-tabs-destroy") ? e(this).remove() : e(this).removeClass("ui-state-default ui-state-active ui-state-disabled ui-corner-top ui-corner-bottom ui-widget-content ui-tabs-active ui-tabs-panel").removeAttr("tabIndex").removeAttr("aria-live").removeAttr("aria-busy").removeAttr("aria-selected").removeAttr("aria-labelledby").removeAttr("aria-hidden").removeAttr("aria-expanded").removeAttr("role")
			}),
			this.tabs.each(function () {
				var t = e(this),
				i = t.data("ui-tabs-aria-controls");
				i ? t.attr("aria-controls", i).removeData("ui-tabs-aria-controls") : t.removeAttr("aria-controls")
			}),
			this.panels.show(),
			"content" !== this.options.heightStyle && this.panels.css("height", "")
		},
		enable : function (t) {
			var i = this.options.disabled;
			i !== !1 && (void 0 === t ? i = !1 : (t = this._getIndex(t), i = e.isArray(i) ? e.map(i, function (e) {
								return e !== t ? e : null
							}) : e.map(this.tabs, function (e, i) {
								return i !== t ? i : null
							})), this._setupDisabled(i))
		},
		disable : function (t) {
			var i = this.options.disabled;
			if (i !== !0) {
				if (void 0 === t)
					i = !0;
				else {
					if (t = this._getIndex(t), -1 !== e.inArray(t, i))
						return;
					i = e.isArray(i) ? e.merge([t], i).sort() : [t]
				}
				this._setupDisabled(i)
			}
		},
		load : function (t, i) {
			t = this._getIndex(t);
			var s = this,
			a = this.tabs.eq(t),
			n = a.find(".ui-tabs-anchor"),
			r = this._getPanelForTab(a),
			o = {
				tab : a,
				panel : r
			},
			h = function (e, t) {
				"abort" === t && s.panels.stop(!1, !0),
				a.removeClass("ui-tabs-loading"),
				r.removeAttr("aria-busy"),
				e === s.xhr && delete s.xhr
			};
			this._isLocal(n[0]) || (this.xhr = e.ajax(this._ajaxSettings(n, i, o)), this.xhr && "canceled" !== this.xhr.statusText && (a.addClass("ui-tabs-loading"), r.attr("aria-busy", "true"), this.xhr.done(function (e, t, a) {
						setTimeout(function () {
							r.html(e),
							s._trigger("load", i, o),
							h(a, t)
						}, 1)
					}).fail(function (e, t) {
						setTimeout(function () {
							h(e, t)
						}, 1)
					})))
		},
		_ajaxSettings : function (t, i, s) {
			var a = this;
			return {
				url : t.attr("href"),
				beforeSend : function (t, n) {
					return a._trigger("beforeLoad", i, e.extend({
							jqXHR : t,
							ajaxSettings : n
						}, s))
				}
			}
		},
		_getPanelForTab : function (t) {
			var i = e(t).attr("aria-controls");
			return this.element.find(this._sanitizeSelector("#" + i))
		}
	}),
	e.widget("ui.tooltip", {
		version : "1.11.4",
		options : {
			content : function () {
				var t = e(this).attr("title") || "";
				return e("<a>").text(t).html()
			},
			hide : !0,
			items : "[title]:not([disabled])",
			position : {
				my : "left top+15",
				at : "left bottom",
				collision : "flipfit flip"
			},
			show : !0,
			tooltipClass : null,
			track : !1,
			close : null,
			open : null
		},
		_addDescribedBy : function (t, i) {
			var s = (t.attr("aria-describedby") || "").split(/\s+/);
			s.push(i),
			t.data("ui-tooltip-id", i).attr("aria-describedby", e.trim(s.join(" ")))
		},
		_removeDescribedBy : function (t) {
			var i = t.data("ui-tooltip-id"),
			s = (t.attr("aria-describedby") || "").split(/\s+/),
			a = e.inArray(i, s);
			-1 !== a && s.splice(a, 1),
			t.removeData("ui-tooltip-id"),
			s = e.trim(s.join(" ")),
			s ? t.attr("aria-describedby", s) : t.removeAttr("aria-describedby")
		},
		_create : function () {
			this._on({
				mouseover : "open",
				focusin : "open"
			}),
			this.tooltips = {},
			this.parents = {},
			this.options.disabled && this._disable(),
			this.liveRegion = e("<div>").attr({
					role : "log",
					"aria-live" : "assertive",
					"aria-relevant" : "additions"
				}).addClass("ui-helper-hidden-accessible").appendTo(this.document[0].body)
		},
		_setOption : function (t, i) {
			var s = this;
			return "disabled" === t ? (this[i ? "_disable" : "_enable"](), this.options[t] = i, void 0) : (this._super(t, i), "content" === t && e.each(this.tooltips, function (e, t) {
					s._updateContent(t.element)
				}), void 0)
		},
		_disable : function () {
			var t = this;
			e.each(this.tooltips, function (i, s) {
				var a = e.Event("blur");
				a.target = a.currentTarget = s.element[0],
				t.close(a, !0)
			}),
			this.element.find(this.options.items).addBack().each(function () {
				var t = e(this);
				t.is("[title]") && t.data("ui-tooltip-title", t.attr("title")).removeAttr("title")
			})
		},
		_enable : function () {
			this.element.find(this.options.items).addBack().each(function () {
				var t = e(this);
				t.data("ui-tooltip-title") && t.attr("title", t.data("ui-tooltip-title"))
			})
		},
		open : function (t) {
			var i = this,
			s = e(t ? t.target : this.element).closest(this.options.items);
			s.length && !s.data("ui-tooltip-id") && (s.attr("title") && s.data("ui-tooltip-title", s.attr("title")), s.data("ui-tooltip-open", !0), t && "mouseover" === t.type && s.parents().each(function () {
					var t,
					s = e(this);
					s.data("ui-tooltip-open") && (t = e.Event("blur"), t.target = t.currentTarget = this, i.close(t, !0)),
					s.attr("title") && (s.uniqueId(), i.parents[this.id] = {
							element : this,
							title : s.attr("title")
						}, s.attr("title", ""))
				}), this._registerCloseHandlers(t, s), this._updateContent(s, t))
		},
		_updateContent : function (e, t) {
			var i,
			s = this.options.content,
			a = this,
			n = t ? t.type : null;
			return "string" == typeof s ? this._open(t, e, s) : (i = s.call(e[0], function (i) {
						a._delay(function () {
							e.data("ui-tooltip-open") && (t && (t.type = n), this._open(t, e, i))
						})
					}), i && this._open(t, e, i), void 0)
		},
		_open : function (t, i, s) {
			function a(e) {
				l.of = e,
				r.is(":hidden") || r.position(l)
			}
			var n,
			r,
			o,
			h,
			l = e.extend({}, this.options.position);
			if (s) {
				if (n = this._find(i))
					return n.tooltip.find(".ui-tooltip-content").html(s), void 0;
				i.is("[title]") && (t && "mouseover" === t.type ? i.attr("title", "") : i.removeAttr("title")),
				n = this._tooltip(i),
				r = n.tooltip,
				this._addDescribedBy(i, r.attr("id")),
				r.find(".ui-tooltip-content").html(s),
				this.liveRegion.children().hide(),
				s.clone ? (h = s.clone(), h.removeAttr("id").find("[id]").removeAttr("id")) : h = s,
				e("<div>").html(h).appendTo(this.liveRegion),
				this.options.track && t && /^mouse/.test(t.type) ? (this._on(this.document, {
						mousemove : a
					}), a(t)) : r.position(e.extend({
						of : i
					}, this.options.position)),
				r.hide(),
				this._show(r, this.options.show),
				this.options.show && this.options.show.delay && (o = this.delayedShow = setInterval(function () {
							r.is(":visible") && (a(l.of), clearInterval(o))
						}, e.fx.interval)),
				this._trigger("open", t, {
					tooltip : r
				})
			}
		},
		_registerCloseHandlers : function (t, i) {
			var s = {
				keyup : function (t) {
					if (t.keyCode === e.ui.keyCode.ESCAPE) {
						var s = e.Event(t);
						s.currentTarget = i[0],
						this.close(s, !0)
					}
				}
			};
			i[0] !== this.element[0] && (s.remove = function () {
				this._removeTooltip(this._find(i).tooltip)
			}),
			t && "mouseover" !== t.type || (s.mouseleave = "close"),
			t && "focusin" !== t.type || (s.focusout = "close"),
			this._on(!0, i, s)
		},
		close : function (t) {
			var i,
			s = this,
			a = e(t ? t.currentTarget : this.element),
			n = this._find(a);
			return n ? (i = n.tooltip, n.closing || (clearInterval(this.delayedShow), a.data("ui-tooltip-title") && !a.attr("title") && a.attr("title", a.data("ui-tooltip-title")), this._removeDescribedBy(a), n.hiding = !0, i.stop(!0), this._hide(i, this.options.hide, function () {
						s._removeTooltip(e(this))
					}), a.removeData("ui-tooltip-open"), this._off(a, "mouseleave focusout keyup"), a[0] !== this.element[0] && this._off(a, "remove"), this._off(this.document, "mousemove"), t && "mouseleave" === t.type && e.each(this.parents, function (t, i) {
						e(i.element).attr("title", i.title),
						delete s.parents[t]
					}), n.closing = !0, this._trigger("close", t, {
						tooltip : i
					}), n.hiding || (n.closing = !1)), void 0) : (a.removeData("ui-tooltip-open"), void 0)
		},
		_tooltip : function (t) {
			var i = e("<div>").attr("role", "tooltip").addClass("ui-tooltip ui-widget ui-corner-all ui-widget-content " + (this.options.tooltipClass || "")),
			s = i.uniqueId().attr("id");
			return e("<div>").addClass("ui-tooltip-content").appendTo(i),
			i.appendTo(this.document[0].body),
			this.tooltips[s] = {
				element : t,
				tooltip : i
			}
		},
		_find : function (e) {
			var t = e.data("ui-tooltip-id");
			return t ? this.tooltips[t] : null
		},
		_removeTooltip : function (e) {
			e.remove(),
			delete this.tooltips[e.attr("id")]
		},
		_destroy : function () {
			var t = this;
			e.each(this.tooltips, function (i, s) {
				var a = e.Event("blur"),
				n = s.element;
				a.target = a.currentTarget = n[0],
				t.close(a, !0),
				e("#" + i).remove(),
				n.data("ui-tooltip-title") && (n.attr("title") || n.attr("title", n.data("ui-tooltip-title")), n.removeData("ui-tooltip-title"))
			}),
			this.liveRegion.remove()
		}
	});
	var y = "ui-effects-",
	b = e;
	e.effects = {
		effect : {}

	},
	function (e, t) {
		function i(e, t, i) {
			var s = d[t.type] || {};
			return null == e ? i || !t.def ? null : t.def : (e = s.floor ? ~~e : parseFloat(e), isNaN(e) ? t.def : s.mod ? (e + s.mod) % s.mod : 0 > e ? 0 : e > s.max ? s.max : e)
		}
		function s(i) {
			var s = l(),
			a = s._rgba = [];
			return i = i.toLowerCase(),
			f(h, function (e, n) {
				var r,
				o = n.re.exec(i),
				h = o && n.parse(o),
				l = n.space || "rgba";
				return h ? (r = s[l](h), s[u[l].cache] = r[u[l].cache], a = s._rgba = r._rgba, !1) : t
			}),
			a.length ? ("0,0,0,0" === a.join() && e.extend(a, n.transparent), s) : n[i]
		}
		function a(e, t, i) {
			return i = (i + 1) % 1,
			1 > 6 * i ? e + 6 * (t - e) * i : 1 > 2 * i ? t : 2 > 3 * i ? e + 6 * (t - e) * (2 / 3 - i) : e
		}
		var n,
		r = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",
		o = /^([\-+])=\s*(\d+\.?\d*)/,
		h = [{
				re : /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
				parse : function (e) {
					return [e[1], e[2], e[3], e[4]]
				}
			}, {
				re : /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
				parse : function (e) {
					return [2.55 * e[1], 2.55 * e[2], 2.55 * e[3], e[4]]
				}
			}, {
				re : /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
				parse : function (e) {
					return [parseInt(e[1], 16), parseInt(e[2], 16), parseInt(e[3], 16)]
				}
			}, {
				re : /#([a-f0-9])([a-f0-9])([a-f0-9])/,
				parse : function (e) {
					return [parseInt(e[1] + e[1], 16), parseInt(e[2] + e[2], 16), parseInt(e[3] + e[3], 16)]
				}
			}, {
				re : /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
				space : "hsla",
				parse : function (e) {
					return [e[1], e[2] / 100, e[3] / 100, e[4]]
				}
			}
		],
		l = e.Color = function (t, i, s, a) {
			return new e.Color.fn.parse(t, i, s, a)
		},
		u = {
			rgba : {
				props : {
					red : {
						idx : 0,
						type : "byte"
					},
					green : {
						idx : 1,
						type : "byte"
					},
					blue : {
						idx : 2,
						type : "byte"
					}
				}
			},
			hsla : {
				props : {
					hue : {
						idx : 0,
						type : "degrees"
					},
					saturation : {
						idx : 1,
						type : "percent"
					},
					lightness : {
						idx : 2,
						type : "percent"
					}
				}
			}
		},
		d = {
			"byte" : {
				floor : !0,
				max : 255
			},
			percent : {
				max : 1
			},
			degrees : {
				mod : 360,
				floor : !0
			}
		},
		c = l.support = {},
		p = e("<p>")[0],
		f = e.each;
		p.style.cssText = "background-color:rgba(1,1,1,.5)",
		c.rgba = p.style.backgroundColor.indexOf("rgba") > -1,
		f(u, function (e, t) {
			t.cache = "_" + e,
			t.props.alpha = {
				idx : 3,
				type : "percent",
				def : 1
			}
		}),
		l.fn = e.extend(l.prototype, {
				parse : function (a, r, o, h) {
					if (a === t)
						return this._rgba = [null, null, null, null], this;
					(a.jquery || a.nodeType) && (a = e(a).css(r), r = t);
					var d = this,
					c = e.type(a),
					p = this._rgba = [];
					return r !== t && (a = [a, r, o, h], c = "array"),
					"string" === c ? this.parse(s(a) || n._default) : "array" === c ? (f(u.rgba.props, function (e, t) {
							p[t.idx] = i(a[t.idx], t)
						}), this) : "object" === c ? (a instanceof l ? f(u, function (e, t) {
							a[t.cache] && (d[t.cache] = a[t.cache].slice())
						}) : f(u, function (t, s) {
							var n = s.cache;
							f(s.props, function (e, t) {
								if (!d[n] && s.to) {
									if ("alpha" === e || null == a[e])
										return;
									d[n] = s.to(d._rgba)
								}
								d[n][t.idx] = i(a[e], t, !0)
							}),
							d[n] && 0 > e.inArray(null, d[n].slice(0, 3)) && (d[n][3] = 1, s.from && (d._rgba = s.from(d[n])))
						}), this) : t
				},
				is : function (e) {
					var i = l(e),
					s = !0,
					a = this;
					return f(u, function (e, n) {
						var r,
						o = i[n.cache];
						return o && (r = a[n.cache] || n.to && n.to(a._rgba) || [], f(n.props, function (e, i) {
								return null != o[i.idx] ? s = o[i.idx] === r[i.idx] : t
							})),
						s
					}),
					s
				},
				_space : function () {
					var e = [],
					t = this;
					return f(u, function (i, s) {
						t[s.cache] && e.push(i)
					}),
					e.pop()
				},
				transition : function (e, t) {
					var s = l(e),
					a = s._space(),
					n = u[a],
					r = 0 === this.alpha() ? l("transparent") : this,
					o = r[n.cache] || n.to(r._rgba),
					h = o.slice();
					return s = s[n.cache],
					f(n.props, function (e, a) {
						var n = a.idx,
						r = o[n],
						l = s[n],
						u = d[a.type] || {};
						null !== l && (null === r ? h[n] = l : (u.mod && (l - r > u.mod / 2 ? r += u.mod : r - l > u.mod / 2 && (r -= u.mod)), h[n] = i((l - r) * t + r, a)))
					}),
					this[a](h)
				},
				blend : function (t) {
					if (1 === this._rgba[3])
						return this;
					var i = this._rgba.slice(),
					s = i.pop(),
					a = l(t)._rgba;
					return l(e.map(i, function (e, t) {
							return (1 - s) * a[t] + s * e
						}))
				},
				toRgbaString : function () {
					var t = "rgba(",
					i = e.map(this._rgba, function (e, t) {
							return null == e ? t > 2 ? 1 : 0 : e
						});
					return 1 === i[3] && (i.pop(), t = "rgb("),
					t + i.join() + ")"
				},
				toHslaString : function () {
					var t = "hsla(",
					i = e.map(this.hsla(), function (e, t) {
							return null == e && (e = t > 2 ? 1 : 0),
							t && 3 > t && (e = Math.round(100 * e) + "%"),
							e
						});
					return 1 === i[3] && (i.pop(), t = "hsl("),
					t + i.join() + ")"
				},
				toHexString : function (t) {
					var i = this._rgba.slice(),
					s = i.pop();
					return t && i.push(~~(255 * s)),
					"#" + e.map(i, function (e) {
						return e = (e || 0).toString(16),
						1 === e.length ? "0" + e : e
					}).join("")
				},
				toString : function () {
					return 0 === this._rgba[3] ? "transparent" : this.toRgbaString()
				}
			}),
		l.fn.parse.prototype = l.fn,
		u.hsla.to = function (e) {
			if (null == e[0] || null == e[1] || null == e[2])
				return [null, null, null, e[3]];
			var t,
			i,
			s = e[0] / 255,
			a = e[1] / 255,
			n = e[2] / 255,
			r = e[3],
			o = Math.max(s, a, n),
			h = Math.min(s, a, n),
			l = o - h,
			u = o + h,
			d = .5 * u;
			return t = h === o ? 0 : s === o ? 60 * (a - n) / l + 360 : a === o ? 60 * (n - s) / l + 120 : 60 * (s - a) / l + 240,
			i = 0 === l ? 0 : .5 >= d ? l / u : l / (2 - u),
			[Math.round(t) % 360, i, d, null == r ? 1 : r]
		},
		u.hsla.from = function (e) {
			if (null == e[0] || null == e[1] || null == e[2])
				return [null, null, null, e[3]];
			var t = e[0] / 360,
			i = e[1],
			s = e[2],
			n = e[3],
			r = .5 >= s ? s * (1 + i) : s + i - s * i,
			o = 2 * s - r;
			return [Math.round(255 * a(o, r, t + 1 / 3)), Math.round(255 * a(o, r, t)), Math.round(255 * a(o, r, t - 1 / 3)), n]
		},
		f(u, function (s, a) {
			var n = a.props,
			r = a.cache,
			h = a.to,
			u = a.from;
			l.fn[s] = function (s) {
				if (h && !this[r] && (this[r] = h(this._rgba)), s === t)
					return this[r].slice();
				var a,
				o = e.type(s),
				d = "array" === o || "object" === o ? s : arguments,
				c = this[r].slice();
				return f(n, function (e, t) {
					var s = d["object" === o ? e : t.idx];
					null == s && (s = c[t.idx]),
					c[t.idx] = i(s, t)
				}),
				u ? (a = l(u(c)), a[r] = c, a) : l(c)
			},
			f(n, function (t, i) {
				l.fn[t] || (l.fn[t] = function (a) {
					var n,
					r = e.type(a),
					h = "alpha" === t ? this._hsla ? "hsla" : "rgba" : s,
					l = this[h](),
					u = l[i.idx];
					return "undefined" === r ? u : ("function" === r && (a = a.call(this, u), r = e.type(a)), null == a && i.empty ? this : ("string" === r && (n = o.exec(a), n && (a = u + parseFloat(n[2]) * ("+" === n[1] ? 1 : -1))), l[i.idx] = a, this[h](l)))
				})
			})
		}),
		l.hook = function (t) {
			var i = t.split(" ");
			f(i, function (t, i) {
				e.cssHooks[i] = {
					set : function (t, a) {
						var n,
						r,
						o = "";
						if ("transparent" !== a && ("string" !== e.type(a) || (n = s(a)))) {
							if (a = l(n || a), !c.rgba && 1 !== a._rgba[3]) {
								for (r = "backgroundColor" === i ? t.parentNode : t; ("" === o || "transparent" === o) && r && r.style; )
									try {
										o = e.css(r, "backgroundColor"),
										r = r.parentNode
									} catch (h) {}

								a = a.blend(o && "transparent" !== o ? o : "_default")
							}
							a = a.toRgbaString()
						}
						try {
							t.style[i] = a
						} catch (h) {}

					}
				},
				e.fx.step[i] = function (t) {
					t.colorInit || (t.start = l(t.elem, i), t.end = l(t.end), t.colorInit = !0),
					e.cssHooks[i].set(t.elem, t.start.transition(t.end, t.pos))
				}
			})
		},
		l.hook(r),
		e.cssHooks.borderColor = {
			expand : function (e) {
				var t = {};
				return f(["Top", "Right", "Bottom", "Left"], function (i, s) {
					t["border" + s + "Color"] = e
				}),
				t
			}
		},
		n = e.Color.names = {
			aqua : "#00ffff",
			black : "#000000",
			blue : "#0000ff",
			fuchsia : "#ff00ff",
			gray : "#808080",
			green : "#008000",
			lime : "#00ff00",
			maroon : "#800000",
			navy : "#000080",
			olive : "#808000",
			purple : "#800080",
			red : "#ff0000",
			silver : "#c0c0c0",
			teal : "#008080",
			white : "#ffffff",
			yellow : "#ffff00",
			transparent : [null, null, null, 0],
			_default : "#ffffff"
		}
	}
	(b),
	function () {
		function t(t) {
			var i,
			s,
			a = t.ownerDocument.defaultView ? t.ownerDocument.defaultView.getComputedStyle(t, null) : t.currentStyle,
			n = {};
			if (a && a.length && a[0] && a[a[0]])
				for (s = a.length; s--; )
					i = a[s], "string" == typeof a[i] && (n[e.camelCase(i)] = a[i]);
			else
				for (i in a)
					"string" == typeof a[i] && (n[i] = a[i]);
			return n
		}
		function i(t, i) {
			var s,
			n,
			r = {};
			for (s in i)
				n = i[s], t[s] !== n && (a[s] || (e.fx.step[s] || !isNaN(parseFloat(n))) && (r[s] = n));
			return r
		}
		var s = ["add", "remove", "toggle"],
		a = {
			border : 1,
			borderBottom : 1,
			borderColor : 1,
			borderLeft : 1,
			borderRight : 1,
			borderTop : 1,
			borderWidth : 1,
			margin : 1,
			padding : 1
		};
		e.each(["borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle"], function (t, i) {
			e.fx.step[i] = function (e) {
				("none" !== e.end && !e.setAttr || 1 === e.pos && !e.setAttr) && (b.style(e.elem, i, e.end), e.setAttr = !0)
			}
		}),
		e.fn.addBack || (e.fn.addBack = function (e) {
			return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
		}),
		e.effects.animateClass = function (a, n, r, o) {
			var h = e.speed(n, r, o);
			return this.queue(function () {
				var n,
				r = e(this),
				o = r.attr("class") || "",
				l = h.children ? r.find("*").addBack() : r;
				l = l.map(function () {
						var i = e(this);
						return {
							el : i,
							start : t(this)
						}
					}),
				n = function () {
					e.each(s, function (e, t) {
						a[t] && r[t + "Class"](a[t])
					})
				},
				n(),
				l = l.map(function () {
						return this.end = t(this.el[0]),
						this.diff = i(this.start, this.end),
						this
					}),
				r.attr("class", o),
				l = l.map(function () {
						var t = this,
						i = e.Deferred(),
						s = e.extend({}, h, {
								queue : !1,
								complete : function () {
									i.resolve(t)
								}
							});
						return this.el.animate(this.diff, s),
						i.promise()
					}),
				e.when.apply(e, l.get()).done(function () {
					n(),
					e.each(arguments, function () {
						var t = this.el;
						e.each(this.diff, function (e) {
							t.css(e, "")
						})
					}),
					h.complete.call(r[0])
				})
			})
		},
		e.fn.extend({
			addClass : function (t) {
				return function (i, s, a, n) {
					return s ? e.effects.animateClass.call(this, {
						add : i
					}, s, a, n) : t.apply(this, arguments)
				}
			}
			(e.fn.addClass),
			removeClass : function (t) {
				return function (i, s, a, n) {
					return arguments.length > 1 ? e.effects.animateClass.call(this, {
						remove : i
					}, s, a, n) : t.apply(this, arguments)
				}
			}
			(e.fn.removeClass),
			toggleClass : function (t) {
				return function (i, s, a, n, r) {
					return "boolean" == typeof s || void 0 === s ? a ? e.effects.animateClass.call(this, s ? {
						add : i
					}
						 : {
						remove : i
					}, a, n, r) : t.apply(this, arguments) : e.effects.animateClass.call(this, {
						toggle : i
					}, s, a, n)
				}
			}
			(e.fn.toggleClass),
			switchClass : function (t, i, s, a, n) {
				return e.effects.animateClass.call(this, {
					add : i,
					remove : t
				}, s, a, n)
			}
		})
	}
	(),
	function () {
		function t(t, i, s, a) {
			return e.isPlainObject(t) && (i = t, t = t.effect),
			t = {
				effect : t
			},
			null == i && (i = {}),
			e.isFunction(i) && (a = i, s = null, i = {}),
			("number" == typeof i || e.fx.speeds[i]) && (a = s, s = i, i = {}),
			e.isFunction(s) && (a = s, s = null),
			i && e.extend(t, i),
			s = s || i.duration,
			t.duration = e.fx.off ? 0 : "number" == typeof s ? s : s in e.fx.speeds ? e.fx.speeds[s] : e.fx.speeds._default,
			t.complete = a || i.complete,
			t
		}
		function i(t) {
			return !t || "number" == typeof t || e.fx.speeds[t] ? !0 : "string" != typeof t || e.effects.effect[t] ? e.isFunction(t) ? !0 : "object" != typeof t || t.effect ? !1 : !0 : !0
		}
		e.extend(e.effects, {
			version : "1.11.4",
			save : function (e, t) {
				for (var i = 0; t.length > i; i++)
					null !== t[i] && e.data(y + t[i], e[0].style[t[i]])
			},
			restore : function (e, t) {
				var i,
				s;
				for (s = 0; t.length > s; s++)
					null !== t[s] && (i = e.data(y + t[s]), void 0 === i && (i = ""), e.css(t[s], i))
			},
			setMode : function (e, t) {
				return "toggle" === t && (t = e.is(":hidden") ? "show" : "hide"),
				t
			},
			getBaseline : function (e, t) {
				var i,
				s;
				switch (e[0]) {
				case "top":
					i = 0;
					break;
				case "middle":
					i = .5;
					break;
				case "bottom":
					i = 1;
					break;
				default:
					i = e[0] / t.height
				}
				switch (e[1]) {
				case "left":
					s = 0;
					break;
				case "center":
					s = .5;
					break;
				case "right":
					s = 1;
					break;
				default:
					s = e[1] / t.width
				}
				return {
					x : s,
					y : i
				}
			},
			createWrapper : function (t) {
				if (t.parent().is(".ui-effects-wrapper"))
					return t.parent();
				var i = {
					width : t.outerWidth(!0),
					height : t.outerHeight(!0),
					"float" : t.css("float")
				},
				s = e("<div></div>").addClass("ui-effects-wrapper").css({
						fontSize : "100%",
						background : "transparent",
						border : "none",
						margin : 0,
						padding : 0
					}),
				a = {
					width : t.width(),
					height : t.height()
				},
				n = document.activeElement;
				try {
					n.id
				} catch (r) {
					n = document.body
				}
				return t.wrap(s),
				(t[0] === n || e.contains(t[0], n)) && e(n).focus(),
				s = t.parent(),
				"static" === t.css("position") ? (s.css({
						position : "relative"
					}), t.css({
						position : "relative"
					})) : (e.extend(i, {
						position : t.css("position"),
						zIndex : t.css("z-index")
					}), e.each(["top", "left", "bottom", "right"], function (e, s) {
						i[s] = t.css(s),
						isNaN(parseInt(i[s], 10)) && (i[s] = "auto")
					}), t.css({
						position : "relative",
						top : 0,
						left : 0,
						right : "auto",
						bottom : "auto"
					})),
				t.css(a),
				s.css(i).show()
			},
			removeWrapper : function (t) {
				var i = document.activeElement;
				return t.parent().is(".ui-effects-wrapper") && (t.parent().replaceWith(t), (t[0] === i || e.contains(t[0], i)) && e(i).focus()),
				t
			},
			setTransition : function (t, i, s, a) {
				return a = a || {},
				e.each(i, function (e, i) {
					var n = t.cssUnit(i);
					n[0] > 0 && (a[i] = n[0] * s + n[1])
				}),
				a
			}
		}),
		e.fn.extend({
			effect : function () {
				function i(t) {
					function i() {
						e.isFunction(n) && n.call(a[0]),
						e.isFunction(t) && t()
					}
					var a = e(this),
					n = s.complete,
					o = s.mode;
					(a.is(":hidden") ? "hide" === o : "show" === o) ? (a[o](), i()) : r.call(a[0], s, i)
				}
				var s = t.apply(this, arguments),
				a = s.mode,
				n = s.queue,
				r = e.effects.effect[s.effect];
				return e.fx.off || !r ? a ? this[a](s.duration, s.complete) : this.each(function () {
					s.complete && s.complete.call(this)
				}) : n === !1 ? this.each(i) : this.queue(n || "fx", i)
			},
			show : function (e) {
				return function (s) {
					if (i(s))
						return e.apply(this, arguments);
					var a = t.apply(this, arguments);
					return a.mode = "show",
					this.effect.call(this, a)
				}
			}
			(e.fn.show),
			hide : function (e) {
				return function (s) {
					if (i(s))
						return e.apply(this, arguments);
					var a = t.apply(this, arguments);
					return a.mode = "hide",
					this.effect.call(this, a)
				}
			}
			(e.fn.hide),
			toggle : function (e) {
				return function (s) {
					if (i(s) || "boolean" == typeof s)
						return e.apply(this, arguments);
					var a = t.apply(this, arguments);
					return a.mode = "toggle",
					this.effect.call(this, a)
				}
			}
			(e.fn.toggle),
			cssUnit : function (t) {
				var i = this.css(t),
				s = [];
				return e.each(["em", "px", "%", "pt"], function (e, t) {
					i.indexOf(t) > 0 && (s = [parseFloat(i), t])
				}),
				s
			}
		})
	}
	(),
	function () {
		var t = {};
		e.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (e, i) {
			t[i] = function (t) {
				return Math.pow(t, e + 2)
			}
		}),
		e.extend(t, {
			Sine : function (e) {
				return 1 - Math.cos(e * Math.PI / 2)
			},
			Circ : function (e) {
				return 1 - Math.sqrt(1 - e * e)
			},
			Elastic : function (e) {
				return 0 === e || 1 === e ? e : -Math.pow(2, 8 * (e - 1)) * Math.sin((80 * (e - 1) - 7.5) * Math.PI / 15)
			},
			Back : function (e) {
				return e * e * (3 * e - 2)
			},
			Bounce : function (e) {
				for (var t, i = 4; ((t = Math.pow(2, --i)) - 1) / 11 > e; );
				return 1 / Math.pow(4, 3 - i) - 7.5625 * Math.pow((3 * t - 2) / 22 - e, 2)
			}
		}),
		e.each(t, function (t, i) {
			e.easing["easeIn" + t] = i,
			e.easing["easeOut" + t] = function (e) {
				return 1 - i(1 - e)
			},
			e.easing["easeInOut" + t] = function (e) {
				return .5 > e ? i(2 * e) / 2 : 1 - i(-2 * e + 2) / 2
			}
		})
	}
	(),
	e.effects,
	e.effects.effect.blind = function (t, i) {
		var s,
		a,
		n,
		r = e(this),
		o = /up|down|vertical/,
		h = /up|left|vertical|horizontal/,
		l = ["position", "top", "bottom", "left", "right", "height", "width"],
		u = e.effects.setMode(r, t.mode || "hide"),
		d = t.direction || "up",
		c = o.test(d),
		p = c ? "height" : "width",
		f = c ? "top" : "left",
		m = h.test(d),
		g = {},
		v = "show" === u;
		r.parent().is(".ui-effects-wrapper") ? e.effects.save(r.parent(), l) : e.effects.save(r, l),
		r.show(),
		s = e.effects.createWrapper(r).css({
				overflow : "hidden"
			}),
		a = s[p](),
		n = parseFloat(s.css(f)) || 0,
		g[p] = v ? a : 0,
		m || (r.css(c ? "bottom" : "right", 0).css(c ? "top" : "left", "auto").css({
				position : "absolute"
			}), g[f] = v ? n : a + n),
		v && (s.css(p, 0), m || s.css(f, n + a)),
		s.animate(g, {
			duration : t.duration,
			easing : t.easing,
			queue : !1,
			complete : function () {
				"hide" === u && r.hide(),
				e.effects.restore(r, l),
				e.effects.removeWrapper(r),
				i()
			}
		})
	},
	e.effects.effect.bounce = function (t, i) {
		var s,
		a,
		n,
		r = e(this),
		o = ["position", "top", "bottom", "left", "right", "height", "width"],
		h = e.effects.setMode(r, t.mode || "effect"),
		l = "hide" === h,
		u = "show" === h,
		d = t.direction || "up",
		c = t.distance,
		p = t.times || 5,
		f = 2 * p + (u || l ? 1 : 0),
		m = t.duration / f,
		g = t.easing,
		v = "up" === d || "down" === d ? "top" : "left",
		y = "up" === d || "left" === d,
		b = r.queue(),
		_ = b.length;
		for ((u || l) && o.push("opacity"), e.effects.save(r, o), r.show(), e.effects.createWrapper(r), c || (c = r["top" === v ? "outerHeight" : "outerWidth"]() / 3), u && (n = {
					opacity : 1
				}, n[v] = 0, r.css("opacity", 0).css(v, y ? 2 * -c : 2 * c).animate(n, m, g)), l && (c /= Math.pow(2, p - 1)), n = {}, n[v] = 0, s = 0; p > s; s++)
			a = {},
		a[v] = (y ? "-=" : "+=") + c,
		r.animate(a, m, g).animate(n, m, g),
		c = l ? 2 * c : c / 2;
		l && (a = {
				opacity : 0
			}, a[v] = (y ? "-=" : "+=") + c, r.animate(a, m, g)),
		r.queue(function () {
			l && r.hide(),
			e.effects.restore(r, o),
			e.effects.removeWrapper(r),
			i()
		}),
		_ > 1 && b.splice.apply(b, [1, 0].concat(b.splice(_, f + 1))),
		r.dequeue()
	},
	e.effects.effect.clip = function (t, i) {
		var s,
		a,
		n,
		r = e(this),
		o = ["position", "top", "bottom", "left", "right", "height", "width"],
		h = e.effects.setMode(r, t.mode || "hide"),
		l = "show" === h,
		u = t.direction || "vertical",
		d = "vertical" === u,
		c = d ? "height" : "width",
		p = d ? "top" : "left",
		f = {};
		e.effects.save(r, o),
		r.show(),
		s = e.effects.createWrapper(r).css({
				overflow : "hidden"
			}),
		a = "IMG" === r[0].tagName ? s : r,
		n = a[c](),
		l && (a.css(c, 0), a.css(p, n / 2)),
		f[c] = l ? n : 0,
		f[p] = l ? 0 : n / 2,
		a.animate(f, {
			queue : !1,
			duration : t.duration,
			easing : t.easing,
			complete : function () {
				l || r.hide(),
				e.effects.restore(r, o),
				e.effects.removeWrapper(r),
				i()
			}
		})
	},
	e.effects.effect.drop = function (t, i) {
		var s,
		a = e(this),
		n = ["position", "top", "bottom", "left", "right", "opacity", "height", "width"],
		r = e.effects.setMode(a, t.mode || "hide"),
		o = "show" === r,
		h = t.direction || "left",
		l = "up" === h || "down" === h ? "top" : "left",
		u = "up" === h || "left" === h ? "pos" : "neg",
		d = {
			opacity : o ? 1 : 0
		};
		e.effects.save(a, n),
		a.show(),
		e.effects.createWrapper(a),
		s = t.distance || a["top" === l ? "outerHeight" : "outerWidth"](!0) / 2,
		o && a.css("opacity", 0).css(l, "pos" === u ? -s : s),
		d[l] = (o ? "pos" === u ? "+=" : "-=" : "pos" === u ? "-=" : "+=") + s,
		a.animate(d, {
			queue : !1,
			duration : t.duration,
			easing : t.easing,
			complete : function () {
				"hide" === r && a.hide(),
				e.effects.restore(a, n),
				e.effects.removeWrapper(a),
				i()
			}
		})
	},
	e.effects.effect.explode = function (t, i) {
		function s() {
			b.push(this),
			b.length === d * c && a()
		}
		function a() {
			p.css({
				visibility : "visible"
			}),
			e(b).remove(),
			m || p.hide(),
			i()
		}
		var n,
		r,
		o,
		h,
		l,
		u,
		d = t.pieces ? Math.round(Math.sqrt(t.pieces)) : 3,
		c = d,
		p = e(this),
		f = e.effects.setMode(p, t.mode || "hide"),
		m = "show" === f,
		g = p.show().css("visibility", "hidden").offset(),
		v = Math.ceil(p.outerWidth() / c),
		y = Math.ceil(p.outerHeight() / d),
		b = [];
		for (n = 0; d > n; n++)
			for (h = g.top + n * y, u = n - (d - 1) / 2, r = 0; c > r; r++)
				o = g.left + r * v, l = r - (c - 1) / 2, p.clone().appendTo("body").wrap("<div></div>").css({
					position : "absolute",
					visibility : "visible",
					left : -r * v,
					top : -n * y
				}).parent().addClass("ui-effects-explode").css({
					position : "absolute",
					overflow : "hidden",
					width : v,
					height : y,
					left : o + (m ? l * v : 0),
					top : h + (m ? u * y : 0),
					opacity : m ? 0 : 1
				}).animate({
					left : o + (m ? 0 : l * v),
					top : h + (m ? 0 : u * y),
					opacity : m ? 1 : 0
				}, t.duration || 500, t.easing, s)
	},
	e.effects.effect.fade = function (t, i) {
		var s = e(this),
		a = e.effects.setMode(s, t.mode || "toggle");
		s.animate({
			opacity : a
		}, {
			queue : !1,
			duration : t.duration,
			easing : t.easing,
			complete : i
		})
	},
	e.effects.effect.fold = function (t, i) {
		var s,
		a,
		n = e(this),
		r = ["position", "top", "bottom", "left", "right", "height", "width"],
		o = e.effects.setMode(n, t.mode || "hide"),
		h = "show" === o,
		l = "hide" === o,
		u = t.size || 15,
		d = /([0-9]+)%/.exec(u),
		c = !!t.horizFirst,
		p = h !== c,
		f = p ? ["width", "height"] : ["height", "width"],
		m = t.duration / 2,
		g = {},
		v = {};
		e.effects.save(n, r),
		n.show(),
		s = e.effects.createWrapper(n).css({
				overflow : "hidden"
			}),
		a = p ? [s.width(), s.height()] : [s.height(), s.width()],
		d && (u = parseInt(d[1], 10) / 100 * a[l ? 0 : 1]),
		h && s.css(c ? {
			height : 0,
			width : u
		}
			 : {
			height : u,
			width : 0
		}),
		g[f[0]] = h ? a[0] : u,
		v[f[1]] = h ? a[1] : 0,
		s.animate(g, m, t.easing).animate(v, m, t.easing, function () {
			l && n.hide(),
			e.effects.restore(n, r),
			e.effects.removeWrapper(n),
			i()
		})
	},
	e.effects.effect.highlight = function (t, i) {
		var s = e(this),
		a = ["backgroundImage", "backgroundColor", "opacity"],
		n = e.effects.setMode(s, t.mode || "show"),
		r = {
			backgroundColor : s.css("backgroundColor")
		};
		"hide" === n && (r.opacity = 0),
		e.effects.save(s, a),
		s.show().css({
			backgroundImage : "none",
			backgroundColor : t.color || "#ffff99"
		}).animate(r, {
			queue : !1,
			duration : t.duration,
			easing : t.easing,
			complete : function () {
				"hide" === n && s.hide(),
				e.effects.restore(s, a),
				i()
			}
		})
	},
	e.effects.effect.size = function (t, i) {
		var s,
		a,
		n,
		r = e(this),
		o = ["position", "top", "bottom", "left", "right", "width", "height", "overflow", "opacity"],
		h = ["position", "top", "bottom", "left", "right", "overflow", "opacity"],
		l = ["width", "height", "overflow"],
		u = ["fontSize"],
		d = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"],
		c = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"],
		p = e.effects.setMode(r, t.mode || "effect"),
		f = t.restore || "effect" !== p,
		m = t.scale || "both",
		g = t.origin || ["middle", "center"],
		v = r.css("position"),
		y = f ? o : h,
		b = {
			height : 0,
			width : 0,
			outerHeight : 0,
			outerWidth : 0
		};
		"show" === p && r.show(),
		s = {
			height : r.height(),
			width : r.width(),
			outerHeight : r.outerHeight(),
			outerWidth : r.outerWidth()
		},
		"toggle" === t.mode && "show" === p ? (r.from = t.to || b, r.to = t.from || s) : (r.from = t.from || ("show" === p ? b : s), r.to = t.to || ("hide" === p ? b : s)),
		n = {
			from : {
				y : r.from.height / s.height,
				x : r.from.width / s.width
			},
			to : {
				y : r.to.height / s.height,
				x : r.to.width / s.width
			}
		},
		("box" === m || "both" === m) && (n.from.y !== n.to.y && (y = y.concat(d), r.from = e.effects.setTransition(r, d, n.from.y, r.from), r.to = e.effects.setTransition(r, d, n.to.y, r.to)), n.from.x !== n.to.x && (y = y.concat(c), r.from = e.effects.setTransition(r, c, n.from.x, r.from), r.to = e.effects.setTransition(r, c, n.to.x, r.to))),
		("content" === m || "both" === m) && n.from.y !== n.to.y && (y = y.concat(u).concat(l), r.from = e.effects.setTransition(r, u, n.from.y, r.from), r.to = e.effects.setTransition(r, u, n.to.y, r.to)),
		e.effects.save(r, y),
		r.show(),
		e.effects.createWrapper(r),
		r.css("overflow", "hidden").css(r.from),
		g && (a = e.effects.getBaseline(g, s), r.from.top = (s.outerHeight - r.outerHeight()) * a.y, r.from.left = (s.outerWidth - r.outerWidth()) * a.x, r.to.top = (s.outerHeight - r.to.outerHeight) * a.y, r.to.left = (s.outerWidth - r.to.outerWidth) * a.x),
		r.css(r.from),
		("content" === m || "both" === m) && (d = d.concat(["marginTop", "marginBottom"]).concat(u), c = c.concat(["marginLeft", "marginRight"]), l = o.concat(d).concat(c), r.find("*[width]").each(function () {
				var i = e(this),
				s = {
					height : i.height(),
					width : i.width(),
					outerHeight : i.outerHeight(),
					outerWidth : i.outerWidth()
				};
				f && e.effects.save(i, l),
				i.from = {
					height : s.height * n.from.y,
					width : s.width * n.from.x,
					outerHeight : s.outerHeight * n.from.y,
					outerWidth : s.outerWidth * n.from.x
				},
				i.to = {
					height : s.height * n.to.y,
					width : s.width * n.to.x,
					outerHeight : s.height * n.to.y,
					outerWidth : s.width * n.to.x
				},
				n.from.y !== n.to.y && (i.from = e.effects.setTransition(i, d, n.from.y, i.from), i.to = e.effects.setTransition(i, d, n.to.y, i.to)),
				n.from.x !== n.to.x && (i.from = e.effects.setTransition(i, c, n.from.x, i.from), i.to = e.effects.setTransition(i, c, n.to.x, i.to)),
				i.css(i.from),
				i.animate(i.to, t.duration, t.easing, function () {
					f && e.effects.restore(i, l)
				})
			})),
		r.animate(r.to, {
			queue : !1,
			duration : t.duration,
			easing : t.easing,
			complete : function () {
				0 === r.to.opacity && r.css("opacity", r.from.opacity),
				"hide" === p && r.hide(),
				e.effects.restore(r, y),
				f || ("static" === v ? r.css({
						position : "relative",
						top : r.to.top,
						left : r.to.left
					}) : e.each(["top", "left"], function (e, t) {
						r.css(t, function (t, i) {
							var s = parseInt(i, 10),
							a = e ? r.to.left : r.to.top;
							return "auto" === i ? a + "px" : s + a + "px"
						})
					})),
				e.effects.removeWrapper(r),
				i()
			}
		})
	},
	e.effects.effect.scale = function (t, i) {
		var s = e(this),
		a = e.extend(!0, {}, t),
		n = e.effects.setMode(s, t.mode || "effect"),
		r = parseInt(t.percent, 10) || (0 === parseInt(t.percent, 10) ? 0 : "hide" === n ? 0 : 100),
		o = t.direction || "both",
		h = t.origin,
		l = {
			height : s.height(),
			width : s.width(),
			outerHeight : s.outerHeight(),
			outerWidth : s.outerWidth()
		},
		u = {
			y : "horizontal" !== o ? r / 100 : 1,
			x : "vertical" !== o ? r / 100 : 1
		};
		a.effect = "size",
		a.queue = !1,
		a.complete = i,
		"effect" !== n && (a.origin = h || ["middle", "center"], a.restore = !0),
		a.from = t.from || ("show" === n ? {
				height : 0,
				width : 0,
				outerHeight : 0,
				outerWidth : 0
			}
				 : l),
		a.to = {
			height : l.height * u.y,
			width : l.width * u.x,
			outerHeight : l.outerHeight * u.y,
			outerWidth : l.outerWidth * u.x
		},
		a.fade && ("show" === n && (a.from.opacity = 0, a.to.opacity = 1), "hide" === n && (a.from.opacity = 1, a.to.opacity = 0)),
		s.effect(a)
	},
	e.effects.effect.puff = function (t, i) {
		var s = e(this),
		a = e.effects.setMode(s, t.mode || "hide"),
		n = "hide" === a,
		r = parseInt(t.percent, 10) || 150,
		o = r / 100,
		h = {
			height : s.height(),
			width : s.width(),
			outerHeight : s.outerHeight(),
			outerWidth : s.outerWidth()
		};
		e.extend(t, {
			effect : "scale",
			queue : !1,
			fade : !0,
			mode : a,
			complete : i,
			percent : n ? r : 100,
			from : n ? h : {
				height : h.height * o,
				width : h.width * o,
				outerHeight : h.outerHeight * o,
				outerWidth : h.outerWidth * o
			}
		}),
		s.effect(t)
	},
	e.effects.effect.pulsate = function (t, i) {
		var s,
		a = e(this),
		n = e.effects.setMode(a, t.mode || "show"),
		r = "show" === n,
		o = "hide" === n,
		h = r || "hide" === n,
		l = 2 * (t.times || 5) + (h ? 1 : 0),
		u = t.duration / l,
		d = 0,
		c = a.queue(),
		p = c.length;
		for ((r || !a.is(":visible")) && (a.css("opacity", 0).show(), d = 1), s = 1; l > s; s++)
			a.animate({
				opacity : d
			}, u, t.easing), d = 1 - d;
		a.animate({
			opacity : d
		}, u, t.easing),
		a.queue(function () {
			o && a.hide(),
			i()
		}),
		p > 1 && c.splice.apply(c, [1, 0].concat(c.splice(p, l + 1))),
		a.dequeue()
	},
	e.effects.effect.shake = function (t, i) {
		var s,
		a = e(this),
		n = ["position", "top", "bottom", "left", "right", "height", "width"],
		r = e.effects.setMode(a, t.mode || "effect"),
		o = t.direction || "left",
		h = t.distance || 20,
		l = t.times || 3,
		u = 2 * l + 1,
		d = Math.round(t.duration / u),
		c = "up" === o || "down" === o ? "top" : "left",
		p = "up" === o || "left" === o,
		f = {},
		m = {},
		g = {},
		v = a.queue(),
		y = v.length;
		for (e.effects.save(a, n), a.show(), e.effects.createWrapper(a), f[c] = (p ? "-=" : "+=") + h, m[c] = (p ? "+=" : "-=") + 2 * h, g[c] = (p ? "-=" : "+=") + 2 * h, a.animate(f, d, t.easing), s = 1; l > s; s++)
			a.animate(m, d, t.easing).animate(g, d, t.easing);
		a.animate(m, d, t.easing).animate(f, d / 2, t.easing).queue(function () {
			"hide" === r && a.hide(),
			e.effects.restore(a, n),
			e.effects.removeWrapper(a),
			i()
		}),
		y > 1 && v.splice.apply(v, [1, 0].concat(v.splice(y, u + 1))),
		a.dequeue()
	},
	e.effects.effect.slide = function (t, i) {
		var s,
		a = e(this),
		n = ["position", "top", "bottom", "left", "right", "width", "height"],
		r = e.effects.setMode(a, t.mode || "show"),
		o = "show" === r,
		h = t.direction || "left",
		l = "up" === h || "down" === h ? "top" : "left",
		u = "up" === h || "left" === h,
		d = {};
		e.effects.save(a, n),
		a.show(),
		s = t.distance || a["top" === l ? "outerHeight" : "outerWidth"](!0),
		e.effects.createWrapper(a).css({
			overflow : "hidden"
		}),
		o && a.css(l, u ? isNaN(s) ? "-" + s : -s : s),
		d[l] = (o ? u ? "+=" : "-=" : u ? "-=" : "+=") + s,
		a.animate(d, {
			queue : !1,
			duration : t.duration,
			easing : t.easing,
			complete : function () {
				"hide" === r && a.hide(),
				e.effects.restore(a, n),
				e.effects.removeWrapper(a),
				i()
			}
		})
	},
	e.effects.effect.transfer = function (t, i) {
		var s = e(this),
		a = e(t.to),
		n = "fixed" === a.css("position"),
		r = e("body"),
		o = n ? r.scrollTop() : 0,
		h = n ? r.scrollLeft() : 0,
		l = a.offset(),
		u = {
			top : l.top - o,
			left : l.left - h,
			height : a.innerHeight(),
			width : a.innerWidth()
		},
		d = s.offset(),
		c = e("<div class='ui-effects-transfer'></div>").appendTo(document.body).addClass(t.className).css({
				top : d.top - o,
				left : d.left - h,
				height : s.innerHeight(),
				width : s.innerWidth(),
				position : n ? "fixed" : "absolute"
			}).animate(u, t.duration, t.easing, function () {
				c.remove(),
				i()
			})
	}
});

/*!
Chosen, a Select Box Enhancer for jQuery and Prototype
by Patrick Filler for Harvest, http://getharvest.com

Version 1.1.0
Full source at https://github.com/harvesthq/chosen
Copyright (c) 2011 Harvest http://getharvest.com

MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
This file is generated by `grunt build`, do not edit it by hand.
 */
(function () {
	var $,
	AbstractChosen,
	Chosen,
	SelectParser,
	_ref,
	__hasProp = {}

	.hasOwnProperty,
	__extends = function (child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key))
				child[key] = parent[key];
		}
		function ctor() {
			this.constructor = child;
		}
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		child.__super__ = parent.prototype;
		return child;
	};

	SelectParser = (function () {
		function SelectParser() {
			this.options_index = 0;
			this.parsed = [];
		}

		SelectParser.prototype.add_node = function (child) {
			if (child.nodeName.toUpperCase() === "OPTGROUP") {
				return this.add_group(child);
			} else {
				return this.add_option(child);
			}
		};

		SelectParser.prototype.add_group = function (group) {
			var group_position,
			option,
			_i,
			_len,
			_ref,
			_results;
			group_position = this.parsed.length;
			this.parsed.push({
				array_index : group_position,
				group : true,
				label : this.escapeExpression(group.label),
				children : 0,
				disabled : group.disabled
			});
			_ref = group.childNodes;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				option = _ref[_i];
				_results.push(this.add_option(option, group_position, group.disabled));
			}
			return _results;
		};

		SelectParser.prototype.add_option = function (option, group_position, group_disabled) {
			if (option.nodeName.toUpperCase() === "OPTION") {
				if (option.text !== "") {
					if (group_position != null) {
						this.parsed[group_position].children += 1;
					}
					this.parsed.push({
						array_index : this.parsed.length,
						options_index : this.options_index,
						value : option.value,
						text : option.text,
						html : option.innerHTML,
						selected : option.selected,
						disabled : group_disabled === true ? group_disabled : option.disabled,
						group_array_index : group_position,
						classes : option.className,
						style : option.style.cssText
					});
				} else {
					this.parsed.push({
						array_index : this.parsed.length,
						options_index : this.options_index,
						empty : true
					});
				}
				return this.options_index += 1;
			}
		};

		SelectParser.prototype.escapeExpression = function (text) {
			var map,
			unsafe_chars;
			if ((text == null) || text === false) {
				return "";
			}
			if (!/[\&\<\>\"\'\`]/.test(text)) {
				return text;
			}
			map = {
				"<" : "&lt;",
				">" : "&gt;",
				'"' : "&quot;",
				"'" : "&#x27;",
				"`" : "&#x60;"
			};
			unsafe_chars = /&(?!\w+;)|[\<\>\"\'\`]/g;
			return text.replace(unsafe_chars, function (chr) {
				return map[chr] || "&amp;";
			});
		};

		return SelectParser;

	})();

	SelectParser.select_to_array = function (select) {
		var child,
		parser,
		_i,
		_len,
		_ref;
		parser = new SelectParser();
		_ref = select.childNodes;
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			child = _ref[_i];
			parser.add_node(child);
		}
		return parser.parsed;
	};

	AbstractChosen = (function () {
		function AbstractChosen(form_field, options) {
			this.form_field = form_field;
			this.options = options != null ? options : {};
			if (!AbstractChosen.browser_is_supported()) {
				return;
			}
			this.is_multiple = this.form_field.multiple;
			this.set_default_text();
			this.set_default_values();
			this.setup();
			this.set_up_html();
			this.register_observers();
		}

		AbstractChosen.prototype.set_default_values = function () {
			var _this = this;
			this.click_test_action = function (evt) {
				return _this.test_active_click(evt);
			};
			this.activate_action = function (evt) {
				return _this.activate_field(evt);
			};
			this.active_field = false;
			this.mouse_on_container = false;
			this.results_showing = false;
			this.result_highlighted = null;
			this.allow_single_deselect = (this.options.allow_single_deselect != null) && (this.form_field.options[0] != null) && this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
			this.disable_search_threshold = this.options.disable_search_threshold || 0;
			this.disable_search = this.options.disable_search || false;
			this.enable_split_word_search = this.options.enable_split_word_search != null ? this.options.enable_split_word_search : true;
			this.group_search = this.options.group_search != null ? this.options.group_search : true;
			this.search_contains = this.options.search_contains || false;
			this.single_backstroke_delete = this.options.single_backstroke_delete != null ? this.options.single_backstroke_delete : true;
			this.max_selected_options = this.options.max_selected_options || Infinity;
			this.inherit_select_classes = this.options.inherit_select_classes || false;
			this.display_selected_options = this.options.display_selected_options != null ? this.options.display_selected_options : true;
			return this.display_disabled_options = this.options.display_disabled_options != null ? this.options.display_disabled_options : true;
		};

		AbstractChosen.prototype.set_default_text = function () {
			if (this.form_field.getAttribute("data-placeholder")) {
				this.default_text = this.form_field.getAttribute("data-placeholder");
			} else if (this.is_multiple) {
				this.default_text = this.options.placeholder_text_multiple || this.options.placeholder_text || AbstractChosen.default_multiple_text;
			} else {
				this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || AbstractChosen.default_single_text;
			}
			return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || AbstractChosen.default_no_result_text;
		};

		AbstractChosen.prototype.mouse_enter = function () {
			return this.mouse_on_container = true;
		};

		AbstractChosen.prototype.mouse_leave = function () {
			return this.mouse_on_container = false;
		};

		AbstractChosen.prototype.input_focus = function (evt) {
			var _this = this;
			if (this.is_multiple) {
				if (!this.active_field) {
					return setTimeout((function () {
							return _this.container_mousedown();
						}), 50);
				}
			} else {
				if (!this.active_field) {
					return this.activate_field();
				}
			}
		};

		AbstractChosen.prototype.input_blur = function (evt) {
			var _this = this;
			if (!this.mouse_on_container) {
				this.active_field = false;
				return setTimeout((function () {
						return _this.blur_test();
					}), 100);
			}
		};

		AbstractChosen.prototype.results_option_build = function (options) {
			var content,
			data,
			_i,
			_len,
			_ref;
			content = '';
			_ref = this.results_data;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				data = _ref[_i];
				if (data.group) {
					content += this.result_add_group(data);
				} else {
					content += this.result_add_option(data);
				}
				if (options != null ? options.first : void 0) {
					if (data.selected && this.is_multiple) {
						this.choice_build(data);
					} else if (data.selected && !this.is_multiple) {
						this.single_set_selected_text(data.text);
					}
				}
			}
			return content;
		};

		AbstractChosen.prototype.result_add_option = function (option) {
			var classes,
			option_el;
			if (!option.search_match) {
				return '';
			}
			if (!this.include_option_in_results(option)) {
				return '';
			}
			classes = [];
			if (!option.disabled && !(option.selected && this.is_multiple)) {
				classes.push("active-result");
			}
			if (option.disabled && !(option.selected && this.is_multiple)) {
				classes.push("disabled-result");
			}
			if (option.selected) {
				classes.push("result-selected");
			}
			if (option.group_array_index != null) {
				classes.push("group-option");
			}
			if (option.classes !== "") {
				classes.push(option.classes);
			}
			option_el = document.createElement("li");
			option_el.className = classes.join(" ");
			option_el.style.cssText = option.style;
			option_el.setAttribute("data-option-array-index", option.array_index);
			option_el.innerHTML = option.search_text;
			return this.outerHTML(option_el);
		};

		AbstractChosen.prototype.result_add_group = function (group) {
			var group_el;
			if (!(group.search_match || group.group_match)) {
				return '';
			}
			if (!(group.active_options > 0)) {
				return '';
			}
			group_el = document.createElement("li");
			group_el.className = "group-result";
			group_el.innerHTML = group.search_text;
			return this.outerHTML(group_el);
		};

		AbstractChosen.prototype.results_update_field = function () {
			this.set_default_text();
			if (!this.is_multiple) {
				this.results_reset_cleanup();
			}
			this.result_clear_highlight();
			this.results_build();
			if (this.results_showing) {
				return this.winnow_results();
			}
		};

		AbstractChosen.prototype.reset_single_select_options = function () {
			var result,
			_i,
			_len,
			_ref,
			_results;
			_ref = this.results_data;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				result = _ref[_i];
				if (result.selected) {
					_results.push(result.selected = false);
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		};

		AbstractChosen.prototype.results_toggle = function () {
			if (this.results_showing) {
				return this.results_hide();
			} else {
				return this.results_show();
			}
		};

		AbstractChosen.prototype.results_search = function (evt) {
			if (this.results_showing) {
				return this.winnow_results();
			} else {
				return this.results_show();
			}
		};

		AbstractChosen.prototype.winnow_results = function () {
			var escapedSearchText,
			option,
			regex,
			regexAnchor,
			results,
			results_group,
			searchText,
			startpos,
			text,
			zregex,
			_i,
			_len,
			_ref;
			this.no_results_clear();
			results = 0;
			searchText = this.get_search_text();
			escapedSearchText = searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			regexAnchor = this.search_contains ? "" : "^";
			regex = new RegExp(regexAnchor + escapedSearchText, 'i');
			zregex = new RegExp(escapedSearchText, 'i');
			_ref = this.results_data;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				option = _ref[_i];
				option.search_match = false;
				results_group = null;
				if (this.include_option_in_results(option)) {
					if (option.group) {
						option.group_match = false;
						option.active_options = 0;
					}
					if ((option.group_array_index != null) && this.results_data[option.group_array_index]) {
						results_group = this.results_data[option.group_array_index];
						if (results_group.active_options === 0 && results_group.search_match) {
							results += 1;
						}
						results_group.active_options += 1;
					}
					if (!(option.group && !this.group_search)) {
						option.search_text = option.group ? option.label : option.html;
						option.search_match = this.search_string_match(option.search_text, regex);
						if (option.search_match && !option.group) {
							results += 1;
						}
						if (option.search_match) {
							if (searchText.length) {
								startpos = option.search_text.search(zregex);
								text = option.search_text.substr(0, startpos + searchText.length) + '</em>' + option.search_text.substr(startpos + searchText.length);
								option.search_text = text.substr(0, startpos) + '<em>' + text.substr(startpos);
							}
							if (results_group != null) {
								results_group.group_match = true;
							}
						} else if ((option.group_array_index != null) && this.results_data[option.group_array_index].search_match) {
							option.search_match = true;
						}
					}
				}
			}
			this.result_clear_highlight();
			if (results < 1 && searchText.length) {
				this.update_results_content("");
				return this.no_results(searchText);
			} else {
				this.update_results_content(this.results_option_build());
				return this.winnow_results_set_highlight();
			}
		};

		AbstractChosen.prototype.search_string_match = function (search_string, regex) {
			var part,
			parts,
			_i,
			_len;
			if (regex.test(search_string)) {
				return true;
			} else if (this.enable_split_word_search && (search_string.indexOf(" ") >= 0 || search_string.indexOf("[") === 0)) {
				parts = search_string.replace(/\[|\]/g, "").split(" ");
				if (parts.length) {
					for (_i = 0, _len = parts.length; _i < _len; _i++) {
						part = parts[_i];
						if (regex.test(part)) {
							return true;
						}
					}
				}
			}
		};

		AbstractChosen.prototype.choices_count = function () {
			var option,
			_i,
			_len,
			_ref;
			if (this.selected_option_count != null) {
				return this.selected_option_count;
			}
			this.selected_option_count = 0;
			_ref = this.form_field.options;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				option = _ref[_i];
				if (option.selected) {
					this.selected_option_count += 1;
				}
			}
			return this.selected_option_count;
		};

		AbstractChosen.prototype.choices_click = function (evt) {
			evt.preventDefault();
			if (!(this.results_showing || this.is_disabled)) {
				return this.results_show();
			}
		};

		AbstractChosen.prototype.keyup_checker = function (evt) {
			var stroke,
			_ref;
			stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
			this.search_field_scale();
			switch (stroke) {
			case 8:
				if (this.is_multiple && this.backstroke_length < 1 && this.choices_count() > 0) {
					return this.keydown_backstroke();
				} else if (!this.pending_backstroke) {
					this.result_clear_highlight();
					return this.results_search();
				}
				break;
			case 13:
				evt.preventDefault();
				if (this.results_showing) {
					return this.result_select(evt);
				}
				break;
			case 27:
				if (this.results_showing) {
					this.results_hide();
				}
				return true;
			case 9:
			case 38:
			case 40:
			case 16:
			case 91:
			case 17:
				break;
			default:
				return this.results_search();
			}
		};

		AbstractChosen.prototype.clipboard_event_checker = function (evt) {
			var _this = this;
			return setTimeout((function () {
					return _this.results_search();
				}), 50);
		};

		AbstractChosen.prototype.container_width = function () {
			if (this.options.width != null) {
				return this.options.width;
			} else {
				return "" + this.form_field.offsetWidth + "px";
			}
		};

		AbstractChosen.prototype.include_option_in_results = function (option) {
			if (this.is_multiple && (!this.display_selected_options && option.selected)) {
				return false;
			}
			if (!this.display_disabled_options && option.disabled) {
				return false;
			}
			if (option.empty) {
				return false;
			}
			return true;
		};

		AbstractChosen.prototype.search_results_touchstart = function (evt) {
			this.touch_started = true;
			return this.search_results_mouseover(evt);
		};

		AbstractChosen.prototype.search_results_touchmove = function (evt) {
			this.touch_started = false;
			return this.search_results_mouseout(evt);
		};

		AbstractChosen.prototype.search_results_touchend = function (evt) {
			if (this.touch_started) {
				return this.search_results_mouseup(evt);
			}
		};

		AbstractChosen.prototype.outerHTML = function (element) {
			var tmp;
			if (element.outerHTML) {
				return element.outerHTML;
			}
			tmp = document.createElement("div");
			tmp.appendChild(element);
			return tmp.innerHTML;
		};

		AbstractChosen.browser_is_supported = function () {
			if (window.navigator.appName === "Microsoft Internet Explorer") {
				return document.documentMode >= 8;
			}
			if (/iP(od|hone)/i.test(window.navigator.userAgent)) {
				return false;
			}
			if (/Android/i.test(window.navigator.userAgent)) {
				if (/Mobile/i.test(window.navigator.userAgent)) {
					return false;
				}
			}
			return true;
		};

		AbstractChosen.default_multiple_text = "Select Some Options";

		AbstractChosen.default_single_text = "Select an Option";

		AbstractChosen.default_no_result_text = "No results match";

		return AbstractChosen;

	})();

	$ = jQuery;

	$.fn.extend({
		chosen : function (options) {
			if (!AbstractChosen.browser_is_supported()) {
				return this;
			}
			return this.each(function (input_field) {
				var $this,
				chosen;
				$this = $(this);
				chosen = $this.data('chosen');
				if (options === 'destroy' && chosen) {
					chosen.destroy();
				} else if (!chosen) {
					$this.data('chosen', new Chosen(this, options));
				}
			});
		}
	});

	Chosen = (function (_super) {
		__extends(Chosen, _super);

		function Chosen() {
			_ref = Chosen.__super__.constructor.apply(this, arguments);
			return _ref;
		}

		Chosen.prototype.setup = function () {
			this.form_field_jq = $(this.form_field);
			this.current_selectedIndex = this.form_field.selectedIndex;
			return this.is_rtl = this.form_field_jq.hasClass("chosen-rtl");
		};

		Chosen.prototype.set_up_html = function () {
			var container_classes,
			container_props;
			container_classes = ["chosen-container"];
			container_classes.push("chosen-container-" + (this.is_multiple ? "multi" : "single"));
			if (this.inherit_select_classes && this.form_field.className) {
				container_classes.push(this.form_field.className);
			}
			if (this.is_rtl) {
				container_classes.push("chosen-rtl");
			}
			container_props = {
				'class' : container_classes.join(' '),
				'style' : "width: " + (this.container_width()) + ";",
				'title' : this.form_field.title
			};
			if (this.form_field.id.length) {
				container_props.id = this.form_field.id.replace(/[^\w]/g, '_') + "_chosen";
			}
			this.container = $("<div />", container_props);
			if (this.is_multiple) {
				this.container.html('<ul class="chosen-choices"><li class="search-field"><input type="text" value="' + this.default_text + '" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chosen-drop"><ul class="chosen-results"></ul></div>');
			} else {
				this.container.html('<a class="chosen-single chosen-default" tabindex="-1"><span>' + this.default_text + '</span><div><b></b></div></a><div class="chosen-drop"><div class="chosen-search"><input type="text" autocomplete="off" /></div><ul class="chosen-results"></ul></div>');
			}
			this.form_field_jq.hide().after(this.container);
			this.dropdown = this.container.find('div.chosen-drop').first();
			this.search_field = this.container.find('input').first();
			this.search_results = this.container.find('ul.chosen-results').first();
			this.search_field_scale();
			this.search_no_results = this.container.find('li.no-results').first();
			if (this.is_multiple) {
				this.search_choices = this.container.find('ul.chosen-choices').first();
				this.search_container = this.container.find('li.search-field').first();
			} else {
				this.search_container = this.container.find('div.chosen-search').first();
				this.selected_item = this.container.find('.chosen-single').first();
			}
			this.results_build();
			this.set_tab_index();
			this.set_label_behavior();
			return this.form_field_jq.trigger("chosen:ready", {
				chosen : this
			});
		};

		Chosen.prototype.register_observers = function () {
			var _this = this;
			this.container.bind('mousedown.chosen', function (evt) {
				_this.container_mousedown(evt);
			});
			this.container.bind('mouseup.chosen', function (evt) {
				_this.container_mouseup(evt);
			});
			this.container.bind('mouseenter.chosen', function (evt) {
				_this.mouse_enter(evt);
			});
			this.container.bind('mouseleave.chosen', function (evt) {
				_this.mouse_leave(evt);
			});
			this.search_results.bind('mouseup.chosen', function (evt) {
				_this.search_results_mouseup(evt);
			});
			this.search_results.bind('mouseover.chosen', function (evt) {
				_this.search_results_mouseover(evt);
			});
			this.search_results.bind('mouseout.chosen', function (evt) {
				_this.search_results_mouseout(evt);
			});
			this.search_results.bind('mousewheel.chosen DOMMouseScroll.chosen', function (evt) {
				_this.search_results_mousewheel(evt);
			});
			this.search_results.bind('touchstart.chosen', function (evt) {
				_this.search_results_touchstart(evt);
			});
			this.search_results.bind('touchmove.chosen', function (evt) {
				_this.search_results_touchmove(evt);
			});
			this.search_results.bind('touchend.chosen', function (evt) {
				_this.search_results_touchend(evt);
			});
			this.form_field_jq.bind("chosen:updated.chosen", function (evt) {
				_this.results_update_field(evt);
			});
			this.form_field_jq.bind("chosen:activate.chosen", function (evt) {
				_this.activate_field(evt);
			});
			this.form_field_jq.bind("chosen:open.chosen", function (evt) {
				_this.container_mousedown(evt);
			});
			this.form_field_jq.bind("chosen:close.chosen", function (evt) {
				_this.input_blur(evt);
			});
			this.search_field.bind('blur.chosen', function (evt) {
				_this.input_blur(evt);
			});
			this.search_field.bind('keyup.chosen', function (evt) {
				_this.keyup_checker(evt);
			});
			this.search_field.bind('keydown.chosen', function (evt) {
				_this.keydown_checker(evt);
			});
			this.search_field.bind('focus.chosen', function (evt) {
				_this.input_focus(evt);
			});
			this.search_field.bind('cut.chosen', function (evt) {
				_this.clipboard_event_checker(evt);
			});
			this.search_field.bind('paste.chosen', function (evt) {
				_this.clipboard_event_checker(evt);
			});
			if (this.is_multiple) {
				return this.search_choices.bind('click.chosen', function (evt) {
					_this.choices_click(evt);
				});
			} else {
				return this.container.bind('click.chosen', function (evt) {
					evt.preventDefault();
				});
			}
		};

		Chosen.prototype.destroy = function () {
			$(this.container[0].ownerDocument).unbind("click.chosen", this.click_test_action);
			if (this.search_field[0].tabIndex) {
				this.form_field_jq[0].tabIndex = this.search_field[0].tabIndex;
			}
			this.container.remove();
			this.form_field_jq.removeData('chosen');
			return this.form_field_jq.show();
		};

		Chosen.prototype.search_field_disabled = function () {
			this.is_disabled = this.form_field_jq[0].disabled;
			if (this.is_disabled) {
				this.container.addClass('chosen-disabled');
				this.search_field[0].disabled = true;
				if (!this.is_multiple) {
					this.selected_item.unbind("focus.chosen", this.activate_action);
				}
				return this.close_field();
			} else {
				this.container.removeClass('chosen-disabled');
				this.search_field[0].disabled = false;
				if (!this.is_multiple) {
					return this.selected_item.bind("focus.chosen", this.activate_action);
				}
			}
		};

		Chosen.prototype.container_mousedown = function (evt) {
			if (!this.is_disabled) {
				if (evt && evt.type === "mousedown" && !this.results_showing) {
					evt.preventDefault();
				}
				if (!((evt != null) && ($(evt.target)).hasClass("search-choice-close"))) {
					if (!this.active_field) {
						if (this.is_multiple) {
							this.search_field.val("");
						}
						$(this.container[0].ownerDocument).bind('click.chosen', this.click_test_action);
						this.results_show();
					} else if (!this.is_multiple && evt && (($(evt.target)[0] === this.selected_item[0]) || $(evt.target).parents("a.chosen-single").length)) {
						evt.preventDefault();
						this.results_toggle();
					}
					return this.activate_field();
				}
			}
		};

		Chosen.prototype.container_mouseup = function (evt) {
			if (evt.target.nodeName === "ABBR" && !this.is_disabled) {
				return this.results_reset(evt);
			}
		};

		Chosen.prototype.search_results_mousewheel = function (evt) {
			var delta;
			if (evt.originalEvent) {
				delta = -evt.originalEvent.wheelDelta || evt.originalEvent.detail;
			}
			if (delta != null) {
				evt.preventDefault();
				if (evt.type === 'DOMMouseScroll') {
					delta = delta * 40;
				}
				return this.search_results.scrollTop(delta + this.search_results.scrollTop());
			}
		};

		Chosen.prototype.blur_test = function (evt) {
			if (!this.active_field && this.container.hasClass("chosen-container-active")) {
				return this.close_field();
			}
		};

		Chosen.prototype.close_field = function () {
			$(this.container[0].ownerDocument).unbind("click.chosen", this.click_test_action);
			this.active_field = false;
			this.results_hide();
			this.container.removeClass("chosen-container-active");
			this.clear_backstroke();
			this.show_search_field_default();
			return this.search_field_scale();
		};

		Chosen.prototype.activate_field = function () {
			this.container.addClass("chosen-container-active");
			this.active_field = true;
			this.search_field.val(this.search_field.val());
			return this.search_field.focus();
		};

		Chosen.prototype.test_active_click = function (evt) {
			var active_container;
			active_container = $(evt.target).closest('.chosen-container');
			if (active_container.length && this.container[0] === active_container[0]) {
				return this.active_field = true;
			} else {
				return this.close_field();
			}
		};

		Chosen.prototype.results_build = function () {
			this.parsing = true;
			this.selected_option_count = null;
			this.results_data = SelectParser.select_to_array(this.form_field);
			if (this.is_multiple) {
				this.search_choices.find("li.search-choice").remove();
			} else if (!this.is_multiple) {
				this.single_set_selected_text();
				if (this.disable_search || this.form_field.options.length <= this.disable_search_threshold) {
					this.search_field[0].readOnly = true;
					this.container.addClass("chosen-container-single-nosearch");
				} else {
					this.search_field[0].readOnly = false;
					this.container.removeClass("chosen-container-single-nosearch");
				}
			}
			this.update_results_content(this.results_option_build({
					first : true
				}));
			this.search_field_disabled();
			this.show_search_field_default();
			this.search_field_scale();
			return this.parsing = false;
		};

		Chosen.prototype.result_do_highlight = function (el) {
			var high_bottom,
			high_top,
			maxHeight,
			visible_bottom,
			visible_top;
			if (el.length) {
				this.result_clear_highlight();
				this.result_highlight = el;
				this.result_highlight.addClass("highlighted");
				maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
				visible_top = this.search_results.scrollTop();
				visible_bottom = maxHeight + visible_top;
				high_top = this.result_highlight.position().top + this.search_results.scrollTop();
				high_bottom = high_top + this.result_highlight.outerHeight();
				if (high_bottom >= visible_bottom) {
					return this.search_results.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
				} else if (high_top < visible_top) {
					return this.search_results.scrollTop(high_top);
				}
			}
		};

		Chosen.prototype.result_clear_highlight = function () {
			if (this.result_highlight) {
				this.result_highlight.removeClass("highlighted");
			}
			return this.result_highlight = null;
		};

		Chosen.prototype.results_show = function () {
			if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
				this.form_field_jq.trigger("chosen:maxselected", {
					chosen : this
				});
				return false;
			}
			this.container.addClass("chosen-with-drop");
			this.results_showing = true;
			this.search_field.focus();
			this.search_field.val(this.search_field.val());
			this.winnow_results();
			return this.form_field_jq.trigger("chosen:showing_dropdown", {
				chosen : this
			});
		};

		Chosen.prototype.update_results_content = function (content) {
			return this.search_results.html(content);
		};

		Chosen.prototype.results_hide = function () {
			if (this.results_showing) {
				this.result_clear_highlight();
				this.container.removeClass("chosen-with-drop");
				this.form_field_jq.trigger("chosen:hiding_dropdown", {
					chosen : this
				});
			}
			return this.results_showing = false;
		};

		Chosen.prototype.set_tab_index = function (el) {
			var ti;
			if (this.form_field.tabIndex) {
				ti = this.form_field.tabIndex;
				this.form_field.tabIndex = -1;
				return this.search_field[0].tabIndex = ti;
			}
		};

		Chosen.prototype.set_label_behavior = function () {
			var _this = this;
			this.form_field_label = this.form_field_jq.parents("label");
			if (!this.form_field_label.length && this.form_field.id.length) {
				this.form_field_label = $("label[for='" + this.form_field.id + "']");
			}
			if (this.form_field_label.length > 0) {
				return this.form_field_label.bind('click.chosen', function (evt) {
					if (_this.is_multiple) {
						return _this.container_mousedown(evt);
					} else {
						return _this.activate_field();
					}
				});
			}
		};

		Chosen.prototype.show_search_field_default = function () {
			if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
				this.search_field.val(this.default_text);
				return this.search_field.addClass("default");
			} else {
				this.search_field.val("");
				return this.search_field.removeClass("default");
			}
		};

		Chosen.prototype.search_results_mouseup = function (evt) {
			var target;
			target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
			if (target.length) {
				this.result_highlight = target;
				this.result_select(evt);
				return this.search_field.focus();
			}
		};

		Chosen.prototype.search_results_mouseover = function (evt) {
			var target;
			target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
			if (target) {
				return this.result_do_highlight(target);
			}
		};

		Chosen.prototype.search_results_mouseout = function (evt) {
			if ($(evt.target).hasClass("active-result" || $(evt.target).parents('.active-result').first())) {
				return this.result_clear_highlight();
			}
		};

		Chosen.prototype.choice_build = function (item) {
			var choice,
			close_link,
			_this = this;
			choice = $('<li />', {
					"class" : "search-choice"
				}).html("<span>" + item.html + "</span>");
			if (item.disabled) {
				choice.addClass('search-choice-disabled');
			} else {
				close_link = $('<a />', {
						"class" : 'search-choice-close',
						'data-option-array-index' : item.array_index
					});
				close_link.bind('click.chosen', function (evt) {
					return _this.choice_destroy_link_click(evt);
				});
				choice.append(close_link);
			}
			return this.search_container.before(choice);
		};

		Chosen.prototype.choice_destroy_link_click = function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			if (!this.is_disabled) {
				return this.choice_destroy($(evt.target));
			}
		};

		Chosen.prototype.choice_destroy = function (link) {
			if (this.result_deselect(link[0].getAttribute("data-option-array-index"))) {
				this.show_search_field_default();
				if (this.is_multiple && this.choices_count() > 0 && this.search_field.val().length < 1) {
					this.results_hide();
				}
				link.parents('li').first().remove();
				return this.search_field_scale();
			}
		};

		Chosen.prototype.results_reset = function () {
			this.reset_single_select_options();
			this.form_field.options[0].selected = true;
			this.single_set_selected_text();
			this.show_search_field_default();
			this.results_reset_cleanup();
			this.form_field_jq.trigger("change");
			if (this.active_field) {
				return this.results_hide();
			}
		};

		Chosen.prototype.results_reset_cleanup = function () {
			this.current_selectedIndex = this.form_field.selectedIndex;
			return this.selected_item.find("abbr").remove();
		};

		Chosen.prototype.result_select = function (evt) {
			var high,
			item;
			if (this.result_highlight) {
				high = this.result_highlight;
				this.result_clear_highlight();
				if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
					this.form_field_jq.trigger("chosen:maxselected", {
						chosen : this
					});
					return false;
				}
				if (this.is_multiple) {
					high.removeClass("active-result");
				} else {
					this.reset_single_select_options();
				}
				item = this.results_data[high[0].getAttribute("data-option-array-index")];
				item.selected = true;
				this.form_field.options[item.options_index].selected = true;
				this.selected_option_count = null;
				if (this.is_multiple) {
					this.choice_build(item);
				} else {
					this.single_set_selected_text(item.text);
				}
				if (!((evt.metaKey || evt.ctrlKey) && this.is_multiple)) {
					this.results_hide();
				}
				this.search_field.val("");
				if (this.is_multiple || this.form_field.selectedIndex !== this.current_selectedIndex) {
					this.form_field_jq.trigger("change", {
						'selected' : this.form_field.options[item.options_index].value
					});
				}
				this.current_selectedIndex = this.form_field.selectedIndex;
				return this.search_field_scale();
			}
		};

		Chosen.prototype.single_set_selected_text = function (text) {
			if (text == null) {
				text = this.default_text;
			}
			if (text === this.default_text) {
				this.selected_item.addClass("chosen-default");
			} else {
				this.single_deselect_control_build();
				this.selected_item.removeClass("chosen-default");
			}
			return this.selected_item.find("span").text(text);
		};

		Chosen.prototype.result_deselect = function (pos) {
			var result_data;
			result_data = this.results_data[pos];
			if (!this.form_field.options[result_data.options_index].disabled) {
				result_data.selected = false;
				this.form_field.options[result_data.options_index].selected = false;
				this.selected_option_count = null;
				this.result_clear_highlight();
				if (this.results_showing) {
					this.winnow_results();
				}
				this.form_field_jq.trigger("change", {
					deselected : this.form_field.options[result_data.options_index].value
				});
				this.search_field_scale();
				return true;
			} else {
				return false;
			}
		};

		Chosen.prototype.single_deselect_control_build = function () {
			if (!this.allow_single_deselect) {
				return;
			}
			if (!this.selected_item.find("abbr").length) {
				this.selected_item.find("span").first().after("<abbr class=\"search-choice-close\"></abbr>");
			}
			return this.selected_item.addClass("chosen-single-with-deselect");
		};

		Chosen.prototype.get_search_text = function () {
			if (this.search_field.val() === this.default_text) {
				return "";
			} else {
				return $('<div/>').text($.trim(this.search_field.val())).html();
			}
		};

		Chosen.prototype.winnow_results_set_highlight = function () {
			var do_high,
			selected_results;
			selected_results = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
			do_high = selected_results.length ? selected_results.first() : this.search_results.find(".active-result").first();
			if (do_high != null) {
				return this.result_do_highlight(do_high);
			}
		};

		Chosen.prototype.no_results = function (terms) {
			var no_results_html;
			no_results_html = $('<li class="no-results">' + this.results_none_found + ' "<span></span>"</li>');
			no_results_html.find("span").first().html(terms);
			this.search_results.append(no_results_html);
			return this.form_field_jq.trigger("chosen:no_results", {
				chosen : this
			});
		};

		Chosen.prototype.no_results_clear = function () {
			return this.search_results.find(".no-results").remove();
		};

		Chosen.prototype.keydown_arrow = function () {
			var next_sib;
			if (this.results_showing && this.result_highlight) {
				next_sib = this.result_highlight.nextAll("li.active-result").first();
				if (next_sib) {
					return this.result_do_highlight(next_sib);
				}
			} else {
				return this.results_show();
			}
		};

		Chosen.prototype.keyup_arrow = function () {
			var prev_sibs;
			if (!this.results_showing && !this.is_multiple) {
				return this.results_show();
			} else if (this.result_highlight) {
				prev_sibs = this.result_highlight.prevAll("li.active-result");
				if (prev_sibs.length) {
					return this.result_do_highlight(prev_sibs.first());
				} else {
					if (this.choices_count() > 0) {
						this.results_hide();
					}
					return this.result_clear_highlight();
				}
			}
		};

		Chosen.prototype.keydown_backstroke = function () {
			var next_available_destroy;
			if (this.pending_backstroke) {
				this.choice_destroy(this.pending_backstroke.find("a").first());
				return this.clear_backstroke();
			} else {
				next_available_destroy = this.search_container.siblings("li.search-choice").last();
				if (next_available_destroy.length && !next_available_destroy.hasClass("search-choice-disabled")) {
					this.pending_backstroke = next_available_destroy;
					if (this.single_backstroke_delete) {
						return this.keydown_backstroke();
					} else {
						return this.pending_backstroke.addClass("search-choice-focus");
					}
				}
			}
		};

		Chosen.prototype.clear_backstroke = function () {
			if (this.pending_backstroke) {
				this.pending_backstroke.removeClass("search-choice-focus");
			}
			return this.pending_backstroke = null;
		};

		Chosen.prototype.keydown_checker = function (evt) {
			var stroke,
			_ref1;
			stroke = (_ref1 = evt.which) != null ? _ref1 : evt.keyCode;
			this.search_field_scale();
			if (stroke !== 8 && this.pending_backstroke) {
				this.clear_backstroke();
			}
			switch (stroke) {
			case 8:
				this.backstroke_length = this.search_field.val().length;
				break;
			case 9:
				if (this.results_showing && !this.is_multiple) {
					this.result_select(evt);
				}
				this.mouse_on_container = false;
				break;
			case 13:
				evt.preventDefault();
				break;
			case 38:
				evt.preventDefault();
				this.keyup_arrow();
				break;
			case 40:
				evt.preventDefault();
				this.keydown_arrow();
				break;
			}
		};

		Chosen.prototype.search_field_scale = function () {
			var div,
			f_width,
			h,
			style,
			style_block,
			styles,
			w,
			_i,
			_len;
			if (this.is_multiple) {
				h = 0;
				w = 0;
				style_block = "position:absolute; left: -1000px; top: -1000px; display:none;";
				styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
				for (_i = 0, _len = styles.length; _i < _len; _i++) {
					style = styles[_i];
					style_block += style + ":" + this.search_field.css(style) + ";";
				}
				div = $('<div />', {
						'style' : style_block
					});
				div.text(this.search_field.val());
				$('body').append(div);
				w = div.width() + 25;
				div.remove();
				f_width = this.container.outerWidth();
				if (w > f_width - 10) {
					w = f_width - 10;
				}
				return this.search_field.css({
					'width' : w + 'px'
				});
			}
		};

		return Chosen;

	})(AbstractChosen);

}).call(this);

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// ******** [ base64.js ] ********

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Base64 class: Base 64 encoding / decoding (c) Chris Veness 2002-2009                          */
/*    note: depends on Utf8 class                                                                 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Base64 = {}; // Base64 namespace

Base64.code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Encode string into Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, no newlines are added.
 *
 * @param {String} str The string to be encoded as base-64
 * @param {Boolean} [utf8encode=false] Flag to indicate whether str is Unicode string to be encoded
 *   to UTF8 before conversion to base64; otherwise string is assumed to be 8-bit characters
 * @returns {String} Base64-encoded string
 */
Base64.encode = function (str, utf8encode) { // http://tools.ietf.org/html/rfc4648
	utf8encode = (typeof utf8encode == 'undefined') ? false : utf8encode;
	var o1,
	o2,
	o3,
	bits,
	h1,
	h2,
	h3,
	h4,
	e = [],
	pad = '',
	c,
	plain,
	coded;
	var b64 = Base64.code;

	plain = utf8encode ? str.encodeUTF8() : str;

	c = plain.length % 3; // pad string to length of multiple of 3
	if (c > 0) {
		while (c++ < 3) {
			pad += '=';
			plain += '\0';
		}
	}
	// note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars

	for (c = 0; c < plain.length; c += 3) { // pack three octets into four hexets
		o1 = plain.charCodeAt(c);
		o2 = plain.charCodeAt(c + 1);
		o3 = plain.charCodeAt(c + 2);

		bits = o1 << 16 | o2 << 8 | o3;

		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;

		// use hextets to index into code string
		e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	}
	coded = e.join(''); // join() is far faster than repeated string concatenation in IE

	// replace 'A's from padded nulls with '='s
	coded = coded.slice(0, coded.length - pad.length) + pad;

	return coded;
}

/**
 * Decode string from Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, newlines are not catered for.
 *
 * @param {String} str The string to be decoded from base-64
 * @param {Boolean} [utf8decode=false] Flag to indicate whether str is Unicode string to be decoded
 *   from UTF8 after conversion from base64
 * @returns {String} decoded string
 */
Base64.decode = function (str, utf8decode) {
	utf8decode = (typeof utf8decode == 'undefined') ? false : utf8decode;
	var o1,
	o2,
	o3,
	h1,
	h2,
	h3,
	h4,
	bits,
	d = [],
	plain,
	coded;
	var b64 = Base64.code;

	coded = utf8decode ? str.decodeUTF8() : str;

	for (var c = 0; c < coded.length; c += 4) { // unpack four hexets into three octets
		h1 = b64.indexOf(coded.charAt(c));
		h2 = b64.indexOf(coded.charAt(c + 1));
		h3 = b64.indexOf(coded.charAt(c + 2));
		h4 = b64.indexOf(coded.charAt(c + 3));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >>> 16 & 0xff;
		o2 = bits >>> 8 & 0xff;
		o3 = bits & 0xff;

		d[c / 4] = String.fromCharCode(o1, o2, o3);
		// check for padding
		if (h4 == 0x40)
			d[c / 4] = String.fromCharCode(o1, o2);
		if (h3 == 0x40)
			d[c / 4] = String.fromCharCode(o1);
	}
	plain = d.join(''); // join() is far faster than repeated string concatenation in IE

	return utf8decode ? plain.decodeUTF8() : plain;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// ******** [ utf8.js ] ********

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2009                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {}; // Utf8 namespace

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function (strUni) {
	// use regular expressions & String.replace callback function for better efficiency
	// than procedural approaches
	var strUtf = strUni.replace(
			/[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
			function (c) {
			var cc = c.charCodeAt(0);
			return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
		});
	strUtf = strUtf.replace(
			/[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
			function (c) {
			var cc = c.charCodeAt(0);
			return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
		});
	return strUtf;
}

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 *
 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function (strUtf) {
	var strUni = strUtf.replace(
			/[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars
			function (c) { // (note parentheses for precence)
			var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
			return String.fromCharCode(cc);
		});
	strUni = strUni.replace(
			/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars
			function (c) { // (note parentheses for precence)
			var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
			return String.fromCharCode(cc);
		});
	return strUni;
}

/**
 * @version: 1.0 Alpha-1
 * @author: Coolite Inc. http://www.coolite.com/
 * @date: 2008-05-13
 * @copyright: Copyright (c) 2006-2008, Coolite Inc. (http://www.coolite.com/). All rights reserved.
 * @license: Licensed under The MIT License. See license.txt and http://www.datejs.com/license/.
 * @website: http://www.datejs.com/
 */
Date.CultureInfo = {
	name : "en-US",
	englishName : "English (United States)",
	nativeName : "English (United States)",
	dayNames : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	abbreviatedDayNames : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	shortestDayNames : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
	firstLetterDayNames : ["S", "M", "T", "W", "T", "F", "S"],
	monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	abbreviatedMonthNames : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	amDesignator : "AM",
	pmDesignator : "PM",
	firstDayOfWeek : 0,
	twoDigitYearMax : 2029,
	dateElementOrder : "mdy",
	formatPatterns : {
		shortDate : "M/d/yyyy",
		longDate : "dddd, MMMM dd, yyyy",
		shortTime : "h:mm tt",
		longTime : "h:mm:ss tt",
		fullDateTime : "dddd, MMMM dd, yyyy h:mm:ss tt",
		sortableDateTime : "yyyy-MM-ddTHH:mm:ss",
		universalSortableDateTime : "yyyy-MM-dd HH:mm:ssZ",
		rfc1123 : "ddd, dd MMM yyyy HH:mm:ss GMT",
		monthDay : "MMMM dd",
		yearMonth : "MMMM, yyyy"
	},
	regexPatterns : {
		jan : /^jan(uary)?/i,
		feb : /^feb(ruary)?/i,
		mar : /^mar(ch)?/i,
		apr : /^apr(il)?/i,
		may : /^may/i,
		jun : /^jun(e)?/i,
		jul : /^jul(y)?/i,
		aug : /^aug(ust)?/i,
		sep : /^sep(t(ember)?)?/i,
		oct : /^oct(ober)?/i,
		nov : /^nov(ember)?/i,
		dec : /^dec(ember)?/i,
		sun : /^su(n(day)?)?/i,
		mon : /^mo(n(day)?)?/i,
		tue : /^tu(e(s(day)?)?)?/i,
		wed : /^we(d(nesday)?)?/i,
		thu : /^th(u(r(s(day)?)?)?)?/i,
		fri : /^fr(i(day)?)?/i,
		sat : /^sa(t(urday)?)?/i,
		future : /^next/i,
		past : /^last|past|prev(ious)?/i,
		add : /^(\+|aft(er)?|from|hence)/i,
		subtract : /^(\-|bef(ore)?|ago)/i,
		yesterday : /^yes(terday)?/i,
		today : /^t(od(ay)?)?/i,
		tomorrow : /^tom(orrow)?/i,
		now : /^n(ow)?/i,
		millisecond : /^ms|milli(second)?s?/i,
		second : /^sec(ond)?s?/i,
		minute : /^mn|min(ute)?s?/i,
		hour : /^h(our)?s?/i,
		week : /^w(eek)?s?/i,
		month : /^m(onth)?s?/i,
		day : /^d(ay)?s?/i,
		year : /^y(ear)?s?/i,
		shortMeridian : /^(a|p)/i,
		longMeridian : /^(a\.?m?\.?|p\.?m?\.?)/i,
		timezone : /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt|utc)/i,
		ordinalSuffix : /^\s*(st|nd|rd|th)/i,
		timeContext : /^\s*(\:|a(?!u|p)|p)/i
	},
	timezones : [{
			name : "UTC",
			offset : "-000"
		}, {
			name : "GMT",
			offset : "-000"
		}, {
			name : "EST",
			offset : "-0500"
		}, {
			name : "EDT",
			offset : "-0400"
		}, {
			name : "CST",
			offset : "-0600"
		}, {
			name : "CDT",
			offset : "-0500"
		}, {
			name : "MST",
			offset : "-0700"
		}, {
			name : "MDT",
			offset : "-0600"
		}, {
			name : "PST",
			offset : "-0800"
		}, {
			name : "PDT",
			offset : "-0700"
		}
	]
};
(function () {
	var $D = Date,
	$P = $D.prototype,
	$C = $D.CultureInfo,
	p = function (s, l) {
		if (!l) {
			l = 2;
		}
		return ("000" + s).slice(l * -1);
	};
	$P.clearTime = function () {
		this.setHours(0);
		this.setMinutes(0);
		this.setSeconds(0);
		this.setMilliseconds(0);
		return this;
	};
	$P.setTimeToNow = function () {
		var n = new Date();
		this.setHours(n.getHours());
		this.setMinutes(n.getMinutes());
		this.setSeconds(n.getSeconds());
		this.setMilliseconds(n.getMilliseconds());
		return this;
	};
	$D.today = function () {
		return new Date().clearTime();
	};
	$D.compare = function (date1, date2) {
		if (isNaN(date1) || isNaN(date2)) {
			throw new Error(date1 + " - " + date2);
		} else if (date1 instanceof Date && date2 instanceof Date) {
			return (date1 < date2) ? -1 : (date1 > date2) ? 1 : 0;
		} else {
			throw new TypeError(date1 + " - " + date2);
		}
	};
	$D.equals = function (date1, date2) {
		return (date1.compareTo(date2) === 0);
	};
	$D.getDayNumberFromName = function (name) {
		var n = $C.dayNames,
		m = $C.abbreviatedDayNames,
		o = $C.shortestDayNames,
		s = name.toLowerCase();
		for (var i = 0; i < n.length; i++) {
			if (n[i].toLowerCase() == s || m[i].toLowerCase() == s || o[i].toLowerCase() == s) {
				return i;
			}
		}
		return -1;
	};
	$D.getMonthNumberFromName = function (name) {
		var n = $C.monthNames,
		m = $C.abbreviatedMonthNames,
		s = name.toLowerCase();
		for (var i = 0; i < n.length; i++) {
			if (n[i].toLowerCase() == s || m[i].toLowerCase() == s) {
				return i;
			}
		}
		return -1;
	};
	$D.isLeapYear = function (year) {
		return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
	};
	$D.getDaysInMonth = function (year, month) {
		return [31, ($D.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	};
	$D.getTimezoneAbbreviation = function (offset) {
		var z = $C.timezones,
		p;
		for (var i = 0; i < z.length; i++) {
			if (z[i].offset === offset) {
				return z[i].name;
			}
		}
		return null;
	};
	$D.getTimezoneOffset = function (name) {
		var z = $C.timezones,
		p;
		for (var i = 0; i < z.length; i++) {
			if (z[i].name === name.toUpperCase()) {
				return z[i].offset;
			}
		}
		return null;
	};
	$P.clone = function () {
		return new Date(this.getTime());
	};
	$P.compareTo = function (date) {
		return Date.compare(this, date);
	};
	$P.equals = function (date) {
		return Date.equals(this, date || new Date());
	};
	$P.between = function (start, end) {
		return this.getTime() >= start.getTime() && this.getTime() <= end.getTime();
	};
	$P.isAfter = function (date) {
		return this.compareTo(date || new Date()) === 1;
	};
	$P.isBefore = function (date) {
		return (this.compareTo(date || new Date()) === -1);
	};
	$P.isToday = function () {
		return this.isSameDay(new Date());
	};
	$P.isSameDay = function (date) {
		return this.clone().clearTime().equals(date.clone().clearTime());
	};
	$P.addMilliseconds = function (value) {
		this.setMilliseconds(this.getMilliseconds() + value);
		return this;
	};
	$P.addSeconds = function (value) {
		return this.addMilliseconds(value * 1000);
	};
	$P.addMinutes = function (value) {
		return this.addMilliseconds(value * 60000);
	};
	$P.addHours = function (value) {
		return this.addMilliseconds(value * 3600000);
	};
	$P.addDays = function (value) {
		this.setDate(this.getDate() + value);
		return this;
	};
	$P.addWeeks = function (value) {
		return this.addDays(value * 7);
	};
	$P.addMonths = function (value) {
		var n = this.getDate();
		this.setDate(1);
		this.setMonth(this.getMonth() + value);
		this.setDate(Math.min(n, $D.getDaysInMonth(this.getFullYear(), this.getMonth())));
		return this;
	};
	$P.addYears = function (value) {
		return this.addMonths(value * 12);
	};
	$P.add = function (config) {
		if (typeof config == "number") {
			this._orient = config;
			return this;
		}
		var x = config;
		if (x.milliseconds) {
			this.addMilliseconds(x.milliseconds);
		}
		if (x.seconds) {
			this.addSeconds(x.seconds);
		}
		if (x.minutes) {
			this.addMinutes(x.minutes);
		}
		if (x.hours) {
			this.addHours(x.hours);
		}
		if (x.weeks) {
			this.addWeeks(x.weeks);
		}
		if (x.months) {
			this.addMonths(x.months);
		}
		if (x.years) {
			this.addYears(x.years);
		}
		if (x.days) {
			this.addDays(x.days);
		}
		return this;
	};
	var $y,
	$m,
	$d;
	$P.getWeek = function () {
		var a,
		b,
		c,
		d,
		e,
		f,
		g,
		n,
		s,
		w;
		$y = (!$y) ? this.getFullYear() : $y;
		$m = (!$m) ? this.getMonth() + 1 : $m;
		$d = (!$d) ? this.getDate() : $d;
		if ($m <= 2) {
			a = $y - 1;
			b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
			c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
			s = b - c;
			e = 0;
			f = $d - 1 + (31 * ($m - 1));
		} else {
			a = $y;
			b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
			c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
			s = b - c;
			e = s + 1;
			f = $d + ((153 * ($m - 3) + 2) / 5) + 58 + s;
		}
		g = (a + b) % 7;
		d = (f + g - e) % 7;
		n = (f + 3 - d) | 0;
		if (n < 0) {
			w = 53 - ((g - s) / 5 | 0);
		} else if (n > 364 + s) {
			w = 1;
		} else {
			w = (n / 7 | 0) + 1;
		}
		$y = $m = $d = null;
		return w;
	};
	$P.getISOWeek = function () {
		$y = this.getUTCFullYear();
		$m = this.getUTCMonth() + 1;
		$d = this.getUTCDate();
		return p(this.getWeek());
	};
	$P.setWeek = function (n) {
		return this.moveToDayOfWeek(1).addWeeks(n - this.getWeek());
	};
	$D._validate = function (n, min, max, name) {
		if (typeof n == "undefined") {
			return false;
		} else if (typeof n != "number") {
			throw new TypeError(n + " is not a Number.");
		} else if (n < min || n > max) {
			throw new RangeError(n + " is not a valid value for " + name + ".");
		}
		return true;
	};
	$D.validateMillisecond = function (value) {
		return $D._validate(value, 0, 999, "millisecond");
	};
	$D.validateSecond = function (value) {
		return $D._validate(value, 0, 59, "second");
	};
	$D.validateMinute = function (value) {
		return $D._validate(value, 0, 59, "minute");
	};
	$D.validateHour = function (value) {
		return $D._validate(value, 0, 23, "hour");
	};
	$D.validateDay = function (value, year, month) {
		return $D._validate(value, 1, $D.getDaysInMonth(year, month), "day");
	};
	$D.validateMonth = function (value) {
		return $D._validate(value, 0, 11, "month");
	};
	$D.validateYear = function (value) {
		return $D._validate(value, 0, 9999, "year");
	};
	$P.set = function (config) {
		if ($D.validateMillisecond(config.millisecond)) {
			this.addMilliseconds(config.millisecond - this.getMilliseconds());
		}
		if ($D.validateSecond(config.second)) {
			this.addSeconds(config.second - this.getSeconds());
		}
		if ($D.validateMinute(config.minute)) {
			this.addMinutes(config.minute - this.getMinutes());
		}
		if ($D.validateHour(config.hour)) {
			this.addHours(config.hour - this.getHours());
		}
		if ($D.validateMonth(config.month)) {
			this.addMonths(config.month - this.getMonth());
		}
		if ($D.validateYear(config.year)) {
			this.addYears(config.year - this.getFullYear());
		}
		if ($D.validateDay(config.day, this.getFullYear(), this.getMonth())) {
			this.addDays(config.day - this.getDate());
		}
		if (config.timezone) {
			this.setTimezone(config.timezone);
		}
		if (config.timezoneOffset) {
			this.setTimezoneOffset(config.timezoneOffset);
		}
		if (config.week && $D._validate(config.week, 0, 53, "week")) {
			this.setWeek(config.week);
		}
		return this;
	};
	$P.moveToFirstDayOfMonth = function () {
		return this.set({
			day : 1
		});
	};
	$P.moveToLastDayOfMonth = function () {
		return this.set({
			day : $D.getDaysInMonth(this.getFullYear(), this.getMonth())
		});
	};
	$P.moveToNthOccurrence = function (dayOfWeek, occurrence) {
		var shift = 0;
		if (occurrence > 0) {
			shift = occurrence - 1;
		} else if (occurrence === -1) {
			this.moveToLastDayOfMonth();
			if (this.getDay() !== dayOfWeek) {
				this.moveToDayOfWeek(dayOfWeek, -1);
			}
			return this;
		}
		return this.moveToFirstDayOfMonth().addDays(-1).moveToDayOfWeek(dayOfWeek, +1).addWeeks(shift);
	};
	$P.moveToDayOfWeek = function (dayOfWeek, orient) {
		var diff = (dayOfWeek - this.getDay() + 7 * (orient || +1)) % 7;
		return this.addDays((diff === 0) ? diff += 7 * (orient || +1) : diff);
	};
	$P.moveToMonth = function (month, orient) {
		var diff = (month - this.getMonth() + 12 * (orient || +1)) % 12;
		return this.addMonths((diff === 0) ? diff += 12 * (orient || +1) : diff);
	};
	$P.getOrdinalNumber = function () {
		return Math.ceil((this.clone().clearTime() - new Date(this.getFullYear(), 0, 1)) / 86400000) + 1;
	};
	$P.getTimezone = function () {
		return $D.getTimezoneAbbreviation(this.getUTCOffset());
	};
	$P.setTimezoneOffset = function (offset) {
		var here = this.getTimezoneOffset(),
		there = Number(offset) * -6 / 10;
		return this.addMinutes(there - here);
	};
	$P.setTimezone = function (offset) {
		return this.setTimezoneOffset($D.getTimezoneOffset(offset));
	};
	$P.hasDaylightSavingTime = function () {
		return (Date.today().set({
				month : 0,
				day : 1
			}).getTimezoneOffset() !== Date.today().set({
				month : 6,
				day : 1
			}).getTimezoneOffset());
	};
	$P.isDaylightSavingTime = function () {
		return (this.hasDaylightSavingTime() && new Date().getTimezoneOffset() === Date.today().set({
				month : 6,
				day : 1
			}).getTimezoneOffset());
	};
	$P.getUTCOffset = function () {
		var n = this.getTimezoneOffset() * -10 / 6,
		r;
		if (n < 0) {
			r = (n - 10000).toString();
			return r.charAt(0) + r.substr(2);
		} else {
			r = (n + 10000).toString();
			return "+" + r.substr(1);
		}
	};
	$P.getElapsed = function (date) {
		return (date || new Date()) - this;
	};
	if (!$P.toISOString) {
		$P.toISOString = function () {
			function f(n) {
				return n < 10 ? '0' + n : n;
			}
			return '"' + this.getUTCFullYear() + '-' +
			f(this.getUTCMonth() + 1) + '-' +
			f(this.getUTCDate()) + 'T' +
			f(this.getUTCHours()) + ':' +
			f(this.getUTCMinutes()) + ':' +
			f(this.getUTCSeconds()) + 'Z"';
		};
	}
	$P._toString = $P.toString;
	$P.toString = function (format) {
		var x = this;
		if (format && format.length == 1) {
			var c = $C.formatPatterns;
			x.t = x.toString;
			switch (format) {
			case "d":
				return x.t(c.shortDate);
			case "D":
				return x.t(c.longDate);
			case "F":
				return x.t(c.fullDateTime);
			case "m":
				return x.t(c.monthDay);
			case "r":
				return x.t(c.rfc1123);
			case "s":
				return x.t(c.sortableDateTime);
			case "t":
				return x.t(c.shortTime);
			case "T":
				return x.t(c.longTime);
			case "u":
				return x.t(c.universalSortableDateTime);
			case "y":
				return x.t(c.yearMonth);
			}
		}
		var ord = function (n) {
			switch (n * 1) {
			case 1:
			case 21:
			case 31:
				return "st";
			case 2:
			case 22:
				return "nd";
			case 3:
			case 23:
				return "rd";
			default:
				return "th";
			}
		};
		return format ? format.replace(/(\\)?(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|S)/g, function (m) {
			if (m.charAt(0) === "\\") {
				return m.replace("\\", "");
			}
			x.h = x.getHours;
			switch (m) {
			case "hh":
				return p(x.h() < 13 ? (x.h() === 0 ? 12 : x.h()) : (x.h() - 12));
			case "h":
				return x.h() < 13 ? (x.h() === 0 ? 12 : x.h()) : (x.h() - 12);
			case "HH":
				return p(x.h());
			case "H":
				return x.h();
			case "mm":
				return p(x.getMinutes());
			case "m":
				return x.getMinutes();
			case "ss":
				return p(x.getSeconds());
			case "s":
				return x.getSeconds();
			case "yyyy":
				return p(x.getFullYear(), 4);
			case "yy":
				return p(x.getFullYear());
			case "dddd":
				return $C.dayNames[x.getDay()];
			case "ddd":
				return $C.abbreviatedDayNames[x.getDay()];
			case "dd":
				return p(x.getDate());
			case "d":
				return x.getDate();
			case "MMMM":
				return $C.monthNames[x.getMonth()];
			case "MMM":
				return $C.abbreviatedMonthNames[x.getMonth()];
			case "MM":
				return p((x.getMonth() + 1));
			case "M":
				return x.getMonth() + 1;
			case "t":
				return x.h() < 12 ? $C.amDesignator.substring(0, 1) : $C.pmDesignator.substring(0, 1);
			case "tt":
				return x.h() < 12 ? $C.amDesignator : $C.pmDesignator;
			case "S":
				return ord(x.getDate());
			default:
				return m;
			}
		}) : this._toString();
	};
}
	());
(function () {
	var $D = Date,
	$P = $D.prototype,
	$C = $D.CultureInfo,
	$N = Number.prototype;
	$P._orient = +1;
	$P._nth = null;
	$P._is = false;
	$P._same = false;
	$P._isSecond = false;
	$N._dateElement = "day";
	$P.next = function () {
		this._orient = +1;
		return this;
	};
	$D.next = function () {
		return $D.today().next();
	};
	$P.last = $P.prev = $P.previous = function () {
		this._orient = -1;
		return this;
	};
	$D.last = $D.prev = $D.previous = function () {
		return $D.today().last();
	};
	$P.is = function () {
		this._is = true;
		return this;
	};
	$P.same = function () {
		this._same = true;
		this._isSecond = false;
		return this;
	};
	$P.today = function () {
		return this.same().day();
	};
	$P.weekday = function () {
		if (this._is) {
			this._is = false;
			return (!this.is().sat() && !this.is().sun());
		}
		return false;
	};
	$P.at = function (time) {
		return (typeof time === "string") ? $D.parse(this.toString("d") + " " + time) : this.set(time);
	};
	$N.fromNow = $N.after = function (date) {
		var c = {};
		c[this._dateElement] = this;
		return ((!date) ? new Date() : date.clone()).add(c);
	};
	$N.ago = $N.before = function (date) {
		var c = {};
		c[this._dateElement] = this * -1;
		return ((!date) ? new Date() : date.clone()).add(c);
	};
	var dx = ("sunday monday tuesday wednesday thursday friday saturday").split(/\s/),
	mx = ("january february march april may june july august september october november december").split(/\s/),
	px = ("Millisecond Second Minute Hour Day Week Month Year").split(/\s/),
	pxf = ("Milliseconds Seconds Minutes Hours Date Week Month FullYear").split(/\s/),
	nth = ("final first second third fourth fifth").split(/\s/),
	de;
	$P.toObject = function () {
		var o = {};
		for (var i = 0; i < px.length; i++) {
			o[px[i].toLowerCase()] = this["get" + pxf[i]]();
		}
		return o;
	};
	$D.fromObject = function (config) {
		config.week = null;
		return Date.today().set(config);
	};
	var df = function (n) {
		return function () {
			if (this._is) {
				this._is = false;
				return this.getDay() == n;
			}
			if (this._nth !== null) {
				if (this._isSecond) {
					this.addSeconds(this._orient * -1);
				}
				this._isSecond = false;
				var ntemp = this._nth;
				this._nth = null;
				var temp = this.clone().moveToLastDayOfMonth();
				this.moveToNthOccurrence(n, ntemp);
				if (this > temp) {
					throw new RangeError($D.getDayName(n) + " does not occur " + ntemp + " times in the month of " + $D.getMonthName(temp.getMonth()) + " " + temp.getFullYear() + ".");
				}
				return this;
			}
			return this.moveToDayOfWeek(n, this._orient);
		};
	};
	var sdf = function (n) {
		return function () {
			var t = $D.today(),
			shift = n - t.getDay();
			if (n === 0 && $C.firstDayOfWeek === 1 && t.getDay() !== 0) {
				shift = shift + 7;
			}
			return t.addDays(shift);
		};
	};
	for (var i = 0; i < dx.length; i++) {
		$D[dx[i].toUpperCase()] = $D[dx[i].toUpperCase().substring(0, 3)] = i;
		$D[dx[i]] = $D[dx[i].substring(0, 3)] = sdf(i);
		$P[dx[i]] = $P[dx[i].substring(0, 3)] = df(i);
	}
	var mf = function (n) {
		return function () {
			if (this._is) {
				this._is = false;
				return this.getMonth() === n;
			}
			return this.moveToMonth(n, this._orient);
		};
	};
	var smf = function (n) {
		return function () {
			return $D.today().set({
				month : n,
				day : 1
			});
		};
	};
	for (var j = 0; j < mx.length; j++) {
		$D[mx[j].toUpperCase()] = $D[mx[j].toUpperCase().substring(0, 3)] = j;
		$D[mx[j]] = $D[mx[j].substring(0, 3)] = smf(j);
		$P[mx[j]] = $P[mx[j].substring(0, 3)] = mf(j);
	}
	var ef = function (j) {
		return function () {
			if (this._isSecond) {
				this._isSecond = false;
				return this;
			}
			if (this._same) {
				this._same = this._is = false;
				var o1 = this.toObject(),
				o2 = (arguments[0] || new Date()).toObject(),
				v = "",
				k = j.toLowerCase();
				for (var m = (px.length - 1); m > -1; m--) {
					v = px[m].toLowerCase();
					if (o1[v] != o2[v]) {
						return false;
					}
					if (k == v) {
						break;
					}
				}
				return true;
			}
			if (j.substring(j.length - 1) != "s") {
				j += "s";
			}
			return this["add" + j](this._orient);
		};
	};
	var nf = function (n) {
		return function () {
			this._dateElement = n;
			return this;
		};
	};
	for (var k = 0; k < px.length; k++) {
		de = px[k].toLowerCase();
		$P[de] = $P[de + "s"] = ef(px[k]);
		$N[de] = $N[de + "s"] = nf(de);
	}
	$P._ss = ef("Second");
	var nthfn = function (n) {
		return function (dayOfWeek) {
			if (this._same) {
				return this._ss(arguments[0]);
			}
			if (dayOfWeek || dayOfWeek === 0) {
				return this.moveToNthOccurrence(dayOfWeek, n);
			}
			this._nth = n;
			if (n === 2 && (dayOfWeek === undefined || dayOfWeek === null)) {
				this._isSecond = true;
				return this.addSeconds(this._orient);
			}
			return this;
		};
	};
	for (var l = 0; l < nth.length; l++) {
		$P[nth[l]] = (l === 0) ? nthfn(-1) : nthfn(l);
	}
}
	());
(function () {
	Date.Parsing = {
		Exception : function (s) {
			this.message = "Parse error at '" + s.substring(0, 10) + " ...'";
		}
	};
	var $P = Date.Parsing;
	var _ = $P.Operators = {
		rtoken : function (r) {
			return function (s) {
				var mx = s.match(r);
				if (mx) {
					return ([mx[0], s.substring(mx[0].length)]);
				} else {
					throw new $P.Exception(s);
				}
			};
		},
		token : function (s) {
			return function (s) {
				return _.rtoken(new RegExp("^\s*" + s + "\s*"))(s);
			};
		},
		stoken : function (s) {
			return _.rtoken(new RegExp("^" + s));
		},
		until : function (p) {
			return function (s) {
				var qx = [],
				rx = null;
				while (s.length) {
					try {
						rx = p.call(this, s);
					} catch (e) {
						qx.push(rx[0]);
						s = rx[1];
						continue;
					}
					break;
				}
				return [qx, s];
			};
		},
		many : function (p) {
			return function (s) {
				var rx = [],
				r = null;
				while (s.length) {
					try {
						r = p.call(this, s);
					} catch (e) {
						return [rx, s];
					}
					rx.push(r[0]);
					s = r[1];
				}
				return [rx, s];
			};
		},
		optional : function (p) {
			return function (s) {
				var r = null;
				try {
					r = p.call(this, s);
				} catch (e) {
					return [null, s];
				}
				return [r[0], r[1]];
			};
		},
		not : function (p) {
			return function (s) {
				try {
					p.call(this, s);
				} catch (e) {
					return [null, s];
				}
				throw new $P.Exception(s);
			};
		},
		ignore : function (p) {
			return p ? function (s) {
				var r = null;
				r = p.call(this, s);
				return [null, r[1]];
			}
			 : null;
		},
		product : function () {
			var px = arguments[0],
			qx = Array.prototype.slice.call(arguments, 1),
			rx = [];
			for (var i = 0; i < px.length; i++) {
				rx.push(_.each(px[i], qx));
			}
			return rx;
		},
		cache : function (rule) {
			var cache = {},
			r = null;
			return function (s) {
				try {
					r = cache[s] = (cache[s] || rule.call(this, s));
				} catch (e) {
					r = cache[s] = e;
				}
				if (r instanceof $P.Exception) {
					throw r;
				} else {
					return r;
				}
			};
		},
		any : function () {
			var px = arguments;
			return function (s) {
				var r = null;
				for (var i = 0; i < px.length; i++) {
					if (px[i] == null) {
						continue;
					}
					try {
						r = (px[i].call(this, s));
					} catch (e) {
						r = null;
					}
					if (r) {
						return r;
					}
				}
				throw new $P.Exception(s);
			};
		},
		each : function () {
			var px = arguments;
			return function (s) {
				var rx = [],
				r = null;
				for (var i = 0; i < px.length; i++) {
					if (px[i] == null) {
						continue;
					}
					try {
						r = (px[i].call(this, s));
					} catch (e) {
						throw new $P.Exception(s);
					}
					rx.push(r[0]);
					s = r[1];
				}
				return [rx, s];
			};
		},
		all : function () {
			var px = arguments,
			_ = _;
			return _.each(_.optional(px));
		},
		sequence : function (px, d, c) {
			d = d || _.rtoken(/^\s*/);
			c = c || null;
			if (px.length == 1) {
				return px[0];
			}
			return function (s) {
				var r = null,
				q = null;
				var rx = [];
				for (var i = 0; i < px.length; i++) {
					try {
						r = px[i].call(this, s);
					} catch (e) {
						break;
					}
					rx.push(r[0]);
					try {
						q = d.call(this, r[1]);
					} catch (ex) {
						q = null;
						break;
					}
					s = q[1];
				}
				if (!r) {
					throw new $P.Exception(s);
				}
				if (q) {
					throw new $P.Exception(q[1]);
				}
				if (c) {
					try {
						r = c.call(this, r[1]);
					} catch (ey) {
						throw new $P.Exception(r[1]);
					}
				}
				return [rx, (r ? r[1] : s)];
			};
		},
		between : function (d1, p, d2) {
			d2 = d2 || d1;
			var _fn = _.each(_.ignore(d1), p, _.ignore(d2));
			return function (s) {
				var rx = _fn.call(this, s);
				return [[rx[0][0], r[0][2]], rx[1]];
			};
		},
		list : function (p, d, c) {
			d = d || _.rtoken(/^\s*/);
			c = c || null;
			return (p instanceof Array ? _.each(_.product(p.slice(0, -1), _.ignore(d)), p.slice(-1), _.ignore(c)) : _.each(_.many(_.each(p, _.ignore(d))), px, _.ignore(c)));
		},
		set : function (px, d, c) {
			d = d || _.rtoken(/^\s*/);
			c = c || null;
			return function (s) {
				var r = null,
				p = null,
				q = null,
				rx = null,
				best = [[], s],
				last = false;
				for (var i = 0; i < px.length; i++) {
					q = null;
					p = null;
					r = null;
					last = (px.length == 1);
					try {
						r = px[i].call(this, s);
					} catch (e) {
						continue;
					}
					rx = [[r[0]], r[1]];
					if (r[1].length > 0 && !last) {
						try {
							q = d.call(this, r[1]);
						} catch (ex) {
							last = true;
						}
					} else {
						last = true;
					}
					if (!last && q[1].length === 0) {
						last = true;
					}
					if (!last) {
						var qx = [];
						for (var j = 0; j < px.length; j++) {
							if (i != j) {
								qx.push(px[j]);
							}
						}
						p = _.set(qx, d).call(this, q[1]);
						if (p[0].length > 0) {
							rx[0] = rx[0].concat(p[0]);
							rx[1] = p[1];
						}
					}
					if (rx[1].length < best[1].length) {
						best = rx;
					}
					if (best[1].length === 0) {
						break;
					}
				}
				if (best[0].length === 0) {
					return best;
				}
				if (c) {
					try {
						q = c.call(this, best[1]);
					} catch (ey) {
						throw new $P.Exception(best[1]);
					}
					best[1] = q[1];
				}
				return best;
			};
		},
		forward : function (gr, fname) {
			return function (s) {
				return gr[fname].call(this, s);
			};
		},
		replace : function (rule, repl) {
			return function (s) {
				var r = rule.call(this, s);
				return [repl, r[1]];
			};
		},
		process : function (rule, fn) {
			return function (s) {
				var r = rule.call(this, s);
				return [fn.call(this, r[0]), r[1]];
			};
		},
		min : function (min, rule) {
			return function (s) {
				var rx = rule.call(this, s);
				if (rx[0].length < min) {
					throw new $P.Exception(s);
				}
				return rx;
			};
		}
	};
	var _generator = function (op) {
		return function () {
			var args = null,
			rx = [];
			if (arguments.length > 1) {
				args = Array.prototype.slice.call(arguments);
			} else if (arguments[0]instanceof Array) {
				args = arguments[0];
			}
			if (args) {
				for (var i = 0, px = args.shift(); i < px.length; i++) {
					args.unshift(px[i]);
					rx.push(op.apply(null, args));
					args.shift();
					return rx;
				}
			} else {
				return op.apply(null, arguments);
			}
		};
	};
	var gx = "optional not ignore cache".split(/\s/);
	for (var i = 0; i < gx.length; i++) {
		_[gx[i]] = _generator(_[gx[i]]);
	}
	var _vector = function (op) {
		return function () {
			if (arguments[0]instanceof Array) {
				return op.apply(null, arguments[0]);
			} else {
				return op.apply(null, arguments);
			}
		};
	};
	var vx = "each any all".split(/\s/);
	for (var j = 0; j < vx.length; j++) {
		_[vx[j]] = _vector(_[vx[j]]);
	}
}
	());
(function () {
	var $D = Date,
	$P = $D.prototype,
	$C = $D.CultureInfo;
	var flattenAndCompact = function (ax) {
		var rx = [];
		for (var i = 0; i < ax.length; i++) {
			if (ax[i]instanceof Array) {
				rx = rx.concat(flattenAndCompact(ax[i]));
			} else {
				if (ax[i]) {
					rx.push(ax[i]);
				}
			}
		}
		return rx;
	};
	$D.Grammar = {};
	$D.Translator = {
		hour : function (s) {
			return function () {
				this.hour = Number(s);
			};
		},
		minute : function (s) {
			return function () {
				this.minute = Number(s);
			};
		},
		second : function (s) {
			return function () {
				this.second = Number(s);
			};
		},
		meridian : function (s) {
			return function () {
				this.meridian = s.slice(0, 1).toLowerCase();
			};
		},
		timezone : function (s) {
			return function () {
				var n = s.replace(/[^\d\+\-]/g, "");
				if (n.length) {
					this.timezoneOffset = Number(n);
				} else {
					this.timezone = s.toLowerCase();
				}
			};
		},
		day : function (x) {
			var s = x[0];
			return function () {
				this.day = Number(s.match(/\d+/)[0]);
			};
		},
		month : function (s) {
			return function () {
				this.month = (s.length == 3) ? "jan feb mar apr may jun jul aug sep oct nov dec".indexOf(s) / 4 : Number(s) - 1;
			};
		},
		year : function (s) {
			return function () {
				var n = Number(s);
				this.year = ((s.length > 2) ? n : (n + (((n + 2000) < $C.twoDigitYearMax) ? 2000 : 1900)));
			};
		},
		rday : function (s) {
			return function () {
				switch (s) {
				case "yesterday":
					this.days = -1;
					break;
				case "tomorrow":
					this.days = 1;
					break;
				case "today":
					this.days = 0;
					break;
				case "now":
					this.days = 0;
					this.now = true;
					break;
				}
			};
		},
		finishExact : function (x) {
			x = (x instanceof Array) ? x : [x];
			for (var i = 0; i < x.length; i++) {
				if (x[i]) {
					x[i].call(this);
				}
			}
			var now = new Date();
			if ((this.hour || this.minute) && (!this.month && !this.year && !this.day)) {
				this.day = now.getDate();
			}
			if (!this.year) {
				this.year = now.getFullYear();
			}
			if (!this.month && this.month !== 0) {
				this.month = now.getMonth();
			}
			if (!this.day) {
				this.day = 1;
			}
			if (!this.hour) {
				this.hour = 0;
			}
			if (!this.minute) {
				this.minute = 0;
			}
			if (!this.second) {
				this.second = 0;
			}
			if (this.meridian && this.hour) {
				if (this.meridian == "p" && this.hour < 12) {
					this.hour = this.hour + 12;
				} else if (this.meridian == "a" && this.hour == 12) {
					this.hour = 0;
				}
			}
			if (this.day > $D.getDaysInMonth(this.year, this.month)) {
				throw new RangeError(this.day + " is not a valid value for days.");
			}
			var r = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second);
			if (this.timezone) {
				r.set({
					timezone : this.timezone
				});
			} else if (this.timezoneOffset) {
				r.set({
					timezoneOffset : this.timezoneOffset
				});
			}
			return r;
		},
		finish : function (x) {
			x = (x instanceof Array) ? flattenAndCompact(x) : [x];
			if (x.length === 0) {
				return null;
			}
			for (var i = 0; i < x.length; i++) {
				if (typeof x[i] == "function") {
					x[i].call(this);
				}
			}
			var today = $D.today();
			if (this.now && !this.unit && !this.operator) {
				return new Date();
			} else if (this.now) {
				today = new Date();
			}
			var expression = !!(this.days && this.days !== null || this.orient || this.operator);
			var gap,
			mod,
			orient;
			orient = ((this.orient == "past" || this.operator == "subtract") ? -1 : 1);
			if (!this.now && "hour minute second".indexOf(this.unit) != -1) {
				today.setTimeToNow();
			}
			if (this.month || this.month === 0) {
				if ("year day hour minute second".indexOf(this.unit) != -1) {
					this.value = this.month + 1;
					this.month = null;
					expression = true;
				}
			}
			if (!expression && this.weekday && !this.day && !this.days) {
				var temp = Date[this.weekday]();
				this.day = temp.getDate();
				if (!this.month) {
					this.month = temp.getMonth();
				}
				this.year = temp.getFullYear();
			}
			if (expression && this.weekday && this.unit != "month") {
				this.unit = "day";
				gap = ($D.getDayNumberFromName(this.weekday) - today.getDay());
				mod = 7;
				this.days = gap ? ((gap + (orient * mod)) % mod) : (orient * mod);
			}
			if (this.month && this.unit == "day" && this.operator) {
				this.value = (this.month + 1);
				this.month = null;
			}
			if (this.value != null && this.month != null && this.year != null) {
				this.day = this.value * 1;
			}
			if (this.month && !this.day && this.value) {
				today.set({
					day : this.value * 1
				});
				if (!expression) {
					this.day = this.value * 1;
				}
			}
			if (!this.month && this.value && this.unit == "month" && !this.now) {
				this.month = this.value;
				expression = true;
			}
			if (expression && (this.month || this.month === 0) && this.unit != "year") {
				this.unit = "month";
				gap = (this.month - today.getMonth());
				mod = 12;
				this.months = gap ? ((gap + (orient * mod)) % mod) : (orient * mod);
				this.month = null;
			}
			if (!this.unit) {
				this.unit = "day";
			}
			if (!this.value && this.operator && this.operator !== null && this[this.unit + "s"] && this[this.unit + "s"] !== null) {
				this[this.unit + "s"] = this[this.unit + "s"] + ((this.operator == "add") ? 1 : -1) + (this.value || 0) * orient;
			} else if (this[this.unit + "s"] == null || this.operator != null) {
				if (!this.value) {
					this.value = 1;
				}
				this[this.unit + "s"] = this.value * orient;
			}
			if (this.meridian && this.hour) {
				if (this.meridian == "p" && this.hour < 12) {
					this.hour = this.hour + 12;
				} else if (this.meridian == "a" && this.hour == 12) {
					this.hour = 0;
				}
			}
			if (this.weekday && !this.day && !this.days) {
				var temp = Date[this.weekday]();
				this.day = temp.getDate();
				if (temp.getMonth() !== today.getMonth()) {
					this.month = temp.getMonth();
				}
			}
			if ((this.month || this.month === 0) && !this.day) {
				this.day = 1;
			}
			if (!this.orient && !this.operator && this.unit == "week" && this.value && !this.day && !this.month) {
				return Date.today().setWeek(this.value);
			}
			if (expression && this.timezone && this.day && this.days) {
				this.day = this.days;
			}
			return (expression) ? today.add(this) : today.set(this);
		}
	};
	var _ = $D.Parsing.Operators,
	g = $D.Grammar,
	t = $D.Translator,
	_fn;
	g.datePartDelimiter = _.rtoken(/^([\s\-\.\,\/\x27]+)/);
	g.timePartDelimiter = _.stoken(":");
	g.whiteSpace = _.rtoken(/^\s*/);
	g.generalDelimiter = _.rtoken(/^(([\s\,]|at|@|on)+)/);
	var _C = {};
	g.ctoken = function (keys) {
		var fn = _C[keys];
		if (!fn) {
			var c = $C.regexPatterns;
			var kx = keys.split(/\s+/),
			px = [];
			for (var i = 0; i < kx.length; i++) {
				px.push(_.replace(_.rtoken(c[kx[i]]), kx[i]));
			}
			fn = _C[keys] = _.any.apply(null, px);
		}
		return fn;
	};
	g.ctoken2 = function (key) {
		return _.rtoken($C.regexPatterns[key]);
	};
	g.h = _.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2]|[1-9])/), t.hour));
	g.hh = _.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2])/), t.hour));
	g.H = _.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3]|[0-9])/), t.hour));
	g.HH = _.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3])/), t.hour));
	g.m = _.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/), t.minute));
	g.mm = _.cache(_.process(_.rtoken(/^[0-5][0-9]/), t.minute));
	g.s = _.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/), t.second));
	g.ss = _.cache(_.process(_.rtoken(/^[0-5][0-9]/), t.second));
	g.hms = _.cache(_.sequence([g.H, g.m, g.s], g.timePartDelimiter));
	g.t = _.cache(_.process(g.ctoken2("shortMeridian"), t.meridian));
	g.tt = _.cache(_.process(g.ctoken2("longMeridian"), t.meridian));
	g.z = _.cache(_.process(_.rtoken(/^((\+|\-)\s*\d\d\d\d)|((\+|\-)\d\d\:?\d\d)/), t.timezone));
	g.zz = _.cache(_.process(_.rtoken(/^((\+|\-)\s*\d\d\d\d)|((\+|\-)\d\d\:?\d\d)/), t.timezone));
	g.zzz = _.cache(_.process(g.ctoken2("timezone"), t.timezone));
	g.timeSuffix = _.each(_.ignore(g.whiteSpace), _.set([g.tt, g.zzz]));
	g.time = _.each(_.optional(_.ignore(_.stoken("T"))), g.hms, g.timeSuffix);
	g.d = _.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1]|\d)/), _.optional(g.ctoken2("ordinalSuffix"))), t.day));
	g.dd = _.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1])/), _.optional(g.ctoken2("ordinalSuffix"))), t.day));
	g.ddd = g.dddd = _.cache(_.process(g.ctoken("sun mon tue wed thu fri sat"), function (s) {
				return function () {
					this.weekday = s;
				};
			}));
	g.M = _.cache(_.process(_.rtoken(/^(1[0-2]|0\d|\d)/), t.month));
	g.MM = _.cache(_.process(_.rtoken(/^(1[0-2]|0\d)/), t.month));
	g.MMM = g.MMMM = _.cache(_.process(g.ctoken("jan feb mar apr may jun jul aug sep oct nov dec"), t.month));
	g.y = _.cache(_.process(_.rtoken(/^(\d\d?)/), t.year));
	g.yy = _.cache(_.process(_.rtoken(/^(\d\d)/), t.year));
	g.yyy = _.cache(_.process(_.rtoken(/^(\d\d?\d?\d?)/), t.year));
	g.yyyy = _.cache(_.process(_.rtoken(/^(\d\d\d\d)/), t.year));
	_fn = function () {
		return _.each(_.any.apply(null, arguments), _.not(g.ctoken2("timeContext")));
	};
	g.day = _fn(g.d, g.dd);
	g.month = _fn(g.M, g.MMM);
	g.year = _fn(g.yyyy, g.yy);
	g.orientation = _.process(g.ctoken("past future"), function (s) {
			return function () {
				this.orient = s;
			};
		});
	g.operator = _.process(g.ctoken("add subtract"), function (s) {
			return function () {
				this.operator = s;
			};
		});
	g.rday = _.process(g.ctoken("yesterday tomorrow today now"), t.rday);
	g.unit = _.process(g.ctoken("second minute hour day week month year"), function (s) {
			return function () {
				this.unit = s;
			};
		});
	g.value = _.process(_.rtoken(/^\d\d?(st|nd|rd|th)?/), function (s) {
			return function () {
				this.value = s.replace(/\D/g, "");
			};
		});
	g.expression = _.set([g.rday, g.operator, g.value, g.unit, g.orientation, g.ddd, g.MMM]);
	_fn = function () {
		return _.set(arguments, g.datePartDelimiter);
	};
	g.mdy = _fn(g.ddd, g.month, g.day, g.year);
	g.ymd = _fn(g.ddd, g.year, g.month, g.day);
	g.dmy = _fn(g.ddd, g.day, g.month, g.year);
	g.date = function (s) {
		return ((g[$C.dateElementOrder] || g.mdy).call(this, s));
	};
	g.format = _.process(_.many(_.any(_.process(_.rtoken(/^(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?)/), function (fmt) {
						if (g[fmt]) {
							return g[fmt];
						} else {
							throw $D.Parsing.Exception(fmt);
						}
					}), _.process(_.rtoken(/^[^dMyhHmstz]+/), function (s) {
						return _.ignore(_.stoken(s));
					}))), function (rules) {
			return _.process(_.each.apply(null, rules), t.finishExact);
		});
	var _F = {};
	var _get = function (f) {
		return _F[f] = (_F[f] || g.format(f)[0]);
	};
	g.formats = function (fx) {
		if (fx instanceof Array) {
			var rx = [];
			for (var i = 0; i < fx.length; i++) {
				rx.push(_get(fx[i]));
			}
			return _.any.apply(null, rx);
		} else {
			return _get(fx);
		}
	};
	g._formats = g.formats(["\"yyyy-MM-ddTHH:mm:ssZ\"", "yyyy-MM-ddTHH:mm:ssZ", "yyyy-MM-ddTHH:mm:ssz", "yyyy-MM-ddTHH:mm:ss", "yyyy-MM-ddTHH:mmZ", "yyyy-MM-ddTHH:mmz", "yyyy-MM-ddTHH:mm", "ddd, MMM dd, yyyy H:mm:ss tt", "ddd MMM d yyyy HH:mm:ss zzz", "MMddyyyy", "ddMMyyyy", "Mddyyyy", "ddMyyyy", "Mdyyyy", "dMyyyy", "yyyy", "Mdyy", "dMyy", "d"]);
	g._start = _.process(_.set([g.date, g.time, g.expression], g.generalDelimiter, g.whiteSpace), t.finish);
	g.start = function (s) {
		try {
			var r = g._formats.call({}, s);
			if (r[1].length === 0) {
				return r;
			}
		} catch (e) {}
		return g._start.call({}, s);
	};
	$D._parse = $D.parse;
	$D.parse = function (s) {
		var r = null;
		if (!s) {
			return null;
		}
		if (s instanceof Date) {
			return s;
		}
		try {
			r = $D.Grammar.start.call({}, s.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1"));
		} catch (e) {
			return null;
		}
		return ((r[1].length === 0) ? r[0] : null);
	};
	$D.getParseFunction = function (fx) {
		var fn = $D.Grammar.formats(fx);
		return function (s) {
			var r = null;
			try {
				r = fn.call({}, s);
			} catch (e) {
				return null;
			}
			return ((r[1].length === 0) ? r[0] : null);
		};
	};
	$D.parseExact = function (s, fx) {
		return $D.getParseFunction(fx)(s);
	};
}
	());

/*!
 * accounting.js v0.4.2, copyright 2014 Open Exchange Rates, MIT license, http://openexchangerates.github.io/accounting.js
Copyright (c) 2014 Open Exchange Rates

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
 */
(function (p, z) {
	function q(a) {
		return !!("" === a || a && a.charCodeAt && a.substr)
	}
	function m(a) {
		return u ? u(a) : "[object Array]" === v.call(a)
	}
	function r(a) {
		return "[object Object]" === v.call(a)
	}
	function s(a, b) {
		var d,
		a = a || {},
		b = b || {};
		for (d in b)
			b.hasOwnProperty(d) && null == a[d] && (a[d] = b[d]);
		return a
	}
	function j(a, b, d) {
		var c = [],
		e,
		h;
		if (!a)
			return c;
		if (w && a.map === w)
			return a.map(b, d);
		for (e = 0, h = a.length; e < h; e++)
			c[e] = b.call(d, a[e], e, a);
		return c
	}
	function n(a, b) {
		a = Math.round(Math.abs(a));
		return isNaN(a) ? b : a
	}
	function x(a) {
		var b = c.settings.currency.format;
		"function" === typeof a && (a = a());
		return q(a) && a.match("%v") ? {
			pos : a,
			neg : a.replace("-", "").replace("%v", "-%v"),
			zero : a
		}
		 : !a || !a.pos || !a.pos.match("%v") ? !q(b) ? b : c.settings.currency.format = {
			pos : b,
			neg : b.replace("%v", "-%v"),
			zero : b
		}
		 : a
	}
	var c = {
		version : "0.4.1",
		settings : {
			currency : {
				symbol : "$",
				format : "%s%v",
				decimal : ".",
				thousand : ",",
				precision : 2,
				grouping : 3
			},
			number : {
				precision : 0,
				grouping : 3,
				thousand : ",",
				decimal : "."
			}
		}
	},
	w = Array.prototype.map,
	u = Array.isArray,
	v = Object.prototype.toString,
	o = c.unformat = c.parse = function (a, b) {
		if (m(a))
			return j(a, function (a) {
				return o(a, b)
			});
		a = a || 0;
		if ("number" === typeof a)
			return a;
		var b = b || ".",
		c = RegExp("[^0-9-" + b + "]", ["g"]),
		c = parseFloat(("" + a).replace(/\((.*)\)/, "-$1").replace(c, "").replace(b, "."));
		return !isNaN(c) ? c : 0
	},
	y = c.toFixed = function (a, b) {
		var b = n(b, c.settings.number.precision),
		d = Math.pow(10, b);
		return (Math.round(c.unformat(a) * d) / d).toFixed(b)
	},
	t = c.formatNumber = c.format = function (a, b, d, i) {
		if (m(a))
			return j(a, function (a) {
				return t(a, b, d, i)
			});
		var a = o(a),
		e = s(r(b) ? b : {
				precision : b,
				thousand : d,
				decimal : i
			}, c.settings.number),
		h = n(e.precision),
		f = 0 > a ? "-" : "",
		g = parseInt(y(Math.abs(a || 0), h), 10) + "",
		l = 3 < g.length ? g.length % 3 : 0;
		return f + (l ? g.substr(0, l) + e.thousand : "") + g.substr(l).replace(/(\d{3})(?=\d)/g, "$1" + e.thousand) + (h ? e.decimal + y(Math.abs(a), h).split(".")[1] : "")
	},
	A = c.formatMoney = function (a, b, d, i, e, h) {
		if (m(a))
			return j(a, function (a) {
				return A(a, b, d, i, e, h)
			});
		var a = o(a),
		f = s(r(b) ? b : {
				symbol : b,
				precision : d,
				thousand : i,
				decimal : e,
				format : h
			}, c.settings.currency),
		g = x(f.format);
		return (0 < a ? g.pos : 0 > a ? g.neg : g.zero).replace("%s", f.symbol).replace("%v", t(Math.abs(a), n(f.precision), f.thousand, f.decimal))
	};
	c.formatColumn = function (a, b, d, i, e, h) {
		if (!a)
			return [];
		var f = s(r(b) ? b : {
				symbol : b,
				precision : d,
				thousand : i,
				decimal : e,
				format : h
			}, c.settings.currency),
		g = x(f.format),
		l = g.pos.indexOf("%s") < g.pos.indexOf("%v") ? !0 : !1,
		k = 0,
		a = j(a, function (a) {
				if (m(a))
					return c.formatColumn(a, f);
				a = o(a);
				a = (0 < a ? g.pos : 0 > a ? g.neg : g.zero).replace("%s", f.symbol).replace("%v", t(Math.abs(a), n(f.precision), f.thousand, f.decimal));
				if (a.length > k)
					k = a.length;
				return a
			});
		return j(a, function (a) {
			return q(a) && a.length < k ? l ? a.replace(f.symbol, f.symbol + Array(k - a.length + 1).join(" ")) : Array(k - a.length + 1).join(" ") + a : a
		})
	};
	if ("undefined" !== typeof exports) {
		if ("undefined" !== typeof module && module.exports)
			exports = module.exports = c;
		exports.accounting = c
	} else
		"function" === typeof define && define.amd ? define([], function () {
			return c
		}) : (c.noConflict = function (a) {
			return function () {
				p.accounting = a;
				c.noConflict = z;
				return c
			}
		}
			(p.accounting), p.accounting = c)
})(this);

/*
Blackbird - Open Source JavaScript Logging Utility
Author: G Scott Olson
Web: http://blackbirdjs.googlecode.com/
http://www.gscottolson.com/blackbirdjs/
Version: 1.0

The MIT License - Copyright (c) 2008 Blackbird Project
 */
(function () {
	var NAMESPACE = 'log';
	var IE6_POSITION_FIXED = true; // enable IE6 {position:fixed}

	var bbird;
	var outputList;
	var cache = [];

	var state = getState();
	var classes = {};
	var profiler = {};
	var IDs = {
		blackbird : 'blackbird',
		checkbox : 'bbVis',
		filters : 'bbFilters',
		controls : 'bbControls',
		size : 'bbSize'
	}
	var messageTypes = { //order of these properties imply render order of filter controls
		debug : true,
		info : true,
		warn : true,
		error : true,
		profile : true
	};

	function generateMarkup() { //build markup
		var spans = [];
		for (type in messageTypes) {
			spans.push(['<span class="', type, '" type="', type, '"></span>'].join(''));
		}

		var newNode = document.createElement('DIV');
		newNode.id = IDs.blackbird;
		newNode.style.display = 'none';
		newNode.innerHTML = [
			'<div class="header">',
			'<div class="left">',
			'<div id="', IDs.filters, '" class="filters" title="click to filter by message type">', spans.join(''), '</div>',
			'</div>',
			'<div class="right">',
			'<div id="', IDs.controls, '" class="controls">',
			'<span id="', IDs.size, '" title="contract" op="resize"></span>',
			'<span class="clear" title="clear" op="clear"></span>',
			'<span class="close" title="close" op="close"></span>',
			'</div>',
			'</div>',
			'</div>',
			'<div class="main">',
			'<div class="left"></div><div class="mainBody">',
			'<ol>', cache.join(''), '</ol>',
			'</div><div class="right"></div>',
			'</div>',
			'<div class="footer">',
			'<div class="left"><label for="', IDs.checkbox, '"><input type="checkbox" id="', IDs.checkbox, '" />Visible on page load</label></div>',
			'<div class="right"></div>',
			'</div>'
		].join('');
		return newNode;
	}

	function backgroundImage() { //(IE6 only) change <BODY> tag's background to resolve {position:fixed} support
		var bodyTag = document.getElementsByTagName('BODY')[0];

		if (bodyTag.currentStyle && IE6_POSITION_FIXED) {
			if (bodyTag.currentStyle.backgroundImage == 'none') {
				bodyTag.style.backgroundImage = 'url(about:blank)';
			}
			if (bodyTag.currentStyle.backgroundAttachment == 'scroll') {
				bodyTag.style.backgroundAttachment = 'fixed';
			}
		}
	}

	function addMessage(type, content) { //adds a message to the output list
		content = (content.constructor == Array) ? content.join('') : content;
		if (outputList) {
			var newMsg = document.createElement('LI');
			newMsg.className = type;
			newMsg.innerHTML = ['<span class="icon"></span>', content].join('');
			outputList.appendChild(newMsg);
			scrollToBottom();
		} else {
			cache.push(['<li class="', type, '"><span class="icon"></span>', content, '</li>'].join(''));
		}
	}

	function clear() { //clear list output
		outputList.innerHTML = '';
	}

	function clickControl(evt) {
		if (!evt)
			evt = window.event;
		var el = (evt.target) ? evt.target : evt.srcElement;

		if (el.tagName == 'SPAN') {
			switch (el.getAttributeNode('op').nodeValue) {
			case 'resize':
				resize();
				break;
			case 'clear':
				clear();
				break;
			case 'close':
				hide();
				break;
			}
		}
	}

	function clickFilter(evt) { //show/hide a specific message type
		if (!evt)
			evt = window.event;
		var span = (evt.target) ? evt.target : evt.srcElement;

		if (span && span.tagName == 'SPAN') {

			var type = span.getAttributeNode('type').nodeValue;

			if (evt.altKey) {
				var filters = document.getElementById(IDs.filters).getElementsByTagName('SPAN');

				var active = 0;
				for (entry in messageTypes) {
					if (messageTypes[entry])
						active++;
				}
				var oneActiveFilter = (active == 1 && messageTypes[type]);

				for (var i = 0; filters[i]; i++) {
					var spanType = filters[i].getAttributeNode('type').nodeValue;

					filters[i].className = (oneActiveFilter || (spanType == type)) ? spanType : spanType + 'Disabled';
					messageTypes[spanType] = oneActiveFilter || (spanType == type);
				}
			} else {
				messageTypes[type] = !messageTypes[type];
				span.className = (messageTypes[type]) ? type : type + 'Disabled';
			}

			//build outputList's class from messageTypes object
			var disabledTypes = [];
			for (type in messageTypes) {
				if (!messageTypes[type])
					disabledTypes.push(type);
			}
			disabledTypes.push('');
			outputList.className = disabledTypes.join('Hidden ');

			scrollToBottom();
		}
	}

	function clickVis(evt) {
		if (!evt)
			evt = window.event;
		var el = (evt.target) ? evt.target : evt.srcElement;

		state.load = el.checked;
		setState();
	}

	function scrollToBottom() { //scroll list output to the bottom
		outputList.scrollTop = outputList.scrollHeight;
	}

	function isVisible() { //determine the visibility
		return (bbird.style.display == 'block');
	}

	function hide() {
		bbird.style.display = 'none';
	}

	function show() {
		var body = document.getElementsByTagName('BODY')[0];
		body.removeChild(bbird);
		body.appendChild(bbird);
		bbird.style.display = 'block';
	}

	//sets the position
	function reposition(position) {
		if (position === undefined || position == null) {
			position = (state && state.pos === null) ? 1 : (state.pos + 1) % 4; //set to initial position ('topRight') or move to next position
		}

		switch (position) {
		case 0:
			classes[0] = 'bbTopLeft';
			break;
		case 1:
			classes[0] = 'bbTopRight';
			break;
		case 2:
			classes[0] = 'bbBottomLeft';
			break;
		case 3:
			classes[0] = 'bbBottomRight';
			break;
		}
		state.pos = position;
		setState();
	}

	function resize(size) {
		if (size === undefined || size === null) {
			size = (state && state.size == null) ? 0 : (state.size + 1) % 2;
		}

		classes[1] = (size === 0) ? 'bbSmall' : 'bbLarge'

		var span = document.getElementById(IDs.size);
		span.title = (size === 1) ? 'small' : 'large';
		span.className = span.title;

		state.size = size;
		setState();
		scrollToBottom();
	}

	function setState() {
		var props = [];
		for (entry in state) {
			var value = (state[entry] && state[entry].constructor === String) ? '"' + state[entry] + '"' : state[entry];
			props.push(entry + ':' + value);
		}
		props = props.join(',');

		var expiration = new Date();
		expiration.setDate(expiration.getDate() + 14);
		document.cookie = ['blackbird={', props, '}; expires=', expiration.toUTCString(), ';'].join('');

		var newClass = [];
		for (word in classes) {
			newClass.push(classes[word]);
		}
		bbird.className = newClass.join(' ');
	}

	function getState() {
		var re = new RegExp(/blackbird=({[^;]+})(;|\b|$)/);
		var match = re.exec(document.cookie);
		return (match && match[1]) ? eval('(' + match[1] + ')') : {
			pos : null,
			size : null,
			load : null
		};
	}

	//event handler for 'keyup' event for window
	function readKey(evt) {
		if (!evt)
			evt = window.event;
		var code = 113; //F2 key

		if (evt && evt.keyCode == code) {

			var visible = isVisible();

			if (visible && evt.shiftKey && evt.altKey)
				clear();
			else if (visible && evt.shiftKey)
				reposition();
			else if (!evt.shiftKey && !evt.altKey) {
				(visible) ? hide() : show();
			}
		}
	}

	//event management ( thanks John Resig )
	function addEvent(obj, type, fn) {
		var obj = (obj.constructor === String) ? document.getElementById(obj) : obj;
		if (obj.attachEvent) {
			obj['e' + type + fn] = fn;
			obj[type + fn] = function () {
				obj['e' + type + fn](window.event)
			};
			obj.attachEvent('on' + type, obj[type + fn]);
		} else
			obj.addEventListener(type, fn, false);
	}
	function removeEvent(obj, type, fn) {
		var obj = (obj.constructor === String) ? document.getElementById(obj) : obj;
		if (obj.detachEvent) {
			obj.detachEvent('on' + type, obj[type + fn]);
			obj[type + fn] = null;
		} else
			obj.removeEventListener(type, fn, false);
	}

	window[NAMESPACE] = {
		toggle :
		function () {
			(isVisible()) ? hide() : show();
		},
		resize :
		function () {
			resize();
		},
		clear :
		function () {
			clear();
		},
		move :
		function () {
			reposition();
		},
		debug :
		function (msg) {
			addMessage('debug', msg);
		},
		warn :
		function (msg) {
			addMessage('warn', msg);
		},
		info :
		function (msg) {
			addMessage('info', msg);
		},
		error :
		function (msg) {
			addMessage('error', msg);
		},
		profile :
		function (label) {
			var currentTime = new Date(); //record the current time when profile() is executed

			if (label == undefined || label == '') {
				addMessage('error', '<b>ERROR:</b> Please specify a label for your profile statement');
			} else if (profiler[label]) {
				addMessage('profile', [label, ': ', currentTime - profiler[label], 'ms'].join(''));
				delete profiler[label];
			} else {
				profiler[label] = currentTime;
				addMessage('profile', label);
			}
			return currentTime;
		}
	}

	addEvent(window, 'load',
		/* initialize Blackbird when the page loads */
		function () {
		var body = document.getElementsByTagName('BODY')[0];
		bbird = body.appendChild(generateMarkup());
		outputList = bbird.getElementsByTagName('OL')[0];

		backgroundImage();

		//add events
		addEvent(IDs.checkbox, 'click', clickVis);
		addEvent(IDs.filters, 'click', clickFilter);
		addEvent(IDs.controls, 'click', clickControl);
		addEvent(document, 'keyup', readKey);

		resize(state.size);
		reposition(state.pos);
		if (state.load) {
			show();
			document.getElementById(IDs.checkbox).checked = true;
		}

		scrollToBottom();

		window[NAMESPACE].init = function () {
			show();
			window[NAMESPACE].error(['<b>', NAMESPACE, '</b> can only be initialized once']);
		}

		addEvent(window, 'unload', function () {
			removeEvent(IDs.checkbox, 'click', clickVis);
			removeEvent(IDs.filters, 'click', clickFilter);
			removeEvent(IDs.controls, 'click', clickControl);
			removeEvent(document, 'keyup', readKey);
		});
	});
})();

/*End Third Party plug-ins*/
/*Mpage Modal Dialog Scripting*/
/**
 * The ModalDialog object contains information about the aspects of how the modal dialog will be created and what actions will take
 * place.  Depending on how the variables are set, the modal can flex based on the consumers needs.  Customizable options include the following;
 * size, modal title, onClose function, modal body content, variable footer buttons with dither options and onclick events.
 * @constructor
 */
function ModalDialog(modalId) {
	//The id given to the ModalDialog object.  Will be used to set/retrieve the modal dialog
	this.m_modalId = modalId;
	//A flag used to determine if the modal is active or not
	this.m_isModalActive = false;
	//A flag to determine if the modal should be fixed to the icon used to activate the modal
	this.m_isFixedToIcon = false;
	//A flag to determine if the modal dialog should grey out the background when being displayed or not.
	this.m_hasGrayBackground = true;
	//A flag to determine if the close icon should be shown or not
	this.m_showCloseIcon = true;

	//The margins object contains the margins that will be applied to the modal window.
	this.m_margins = {
		top : 5,
		right : 5,
		bottom : 5,
		left : 5
	};

	//The icon object contains information about the icon that the user will use to launch the modal dialog
	this.m_icon = {
		elementId : modalId + "icon",
		cssClass : "",
		text : "",
		hoverText : "",
		isActive : true
	};

	//The header object of the modal.  Contains all of the necessary information to render the header of the dialog
	this.m_header = {
		elementId : modalId + "header",
		title : "",
		closeFunction : null
	};

	//The body object of the modal.  Contains all of the necessary information to render the body of the dialog
	this.m_body = {
		elementId : modalId + "body",
		dataFunction : null,
		isBodySizeFixed : true
	};

	//The footer object of the modal.  Contains all of the necessary information to render the footer of the dialog
	this.m_footer = {
		isAlwaysShown : false,
		elementId : modalId + "footer",
		buttons : []
	};
}

/** Adders **/

/**
 * Adds a ModalButton object to the list of buttons that will be used in the footer of to modal dialog.
 * Only ModalButtons will be used, no other object type will be accepted.
 * @param {ModalButton} modalButton The button to add to the footer.
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.addFooterButton = function (modalButton) {
	if (!(modalButton instanceof ModalButton)) {
		MP_Util.LogError("ModalDialog.addFooterButton: Cannot add footer button which isnt a ModalButton object.\nModalButtons can be created using the ModalDialog.createModalButton function.");
		return this;
	}

	if (!modalButton.getId()) {
		MP_Util.LogError("ModalDialog.addFooterButton: All ModalButton objects must have an id assigned");
		return this;
	}

	this.m_footer.buttons.push(modalButton);
	return this;
};

/** Checkers **/

/**
 * Checks to see if the modal dialog object has a gray background or not
 * @return {boolean} True if the modal dialog is active, false otherwise
 */
ModalDialog.prototype.hasGrayBackground = function () {
	return this.m_hasGrayBackground;
};

/**
 * Checks to see if the modal dialog object is active or not
 * @return {boolean} True if the modal dialog is active, false otherwise
 */
ModalDialog.prototype.isActive = function () {
	return this.m_isModalActive;
};

/**
 * Checks to see if the modal dialog body should have a fixed size or not
 * @return {boolean} True if the modal dialog body is a fixed size, false otherwise
 */
ModalDialog.prototype.isBodySizeFixed = function () {
	return this.m_body.isBodySizeFixed;
};

/**
 * Checks to see if the modal dialog footer should always be shown or not
 * @return {boolean} True if the modal dialog footer should always be shown
 */
ModalDialog.prototype.isFooterAlwaysShown = function () {
	return this.m_footer.isAlwaysShown;
};

/**
 * Checks to see if the modal dialog object is active or not
 * @return {boolean} True if the modal dialog is active, false otherwise
 */
ModalDialog.prototype.isFixedToIcon = function () {
	return this.m_isFixedToIcon;
};

/**
 * Checks to see if the modal dialog icon is active or not
 * @return {boolean} True if the modal dialog icon is active, false otherwise
 */
ModalDialog.prototype.isIconActive = function () {
	return this.m_icon.isActive;
};

/**
 * Checks to see if the close icon should be shown in the modal dialog
 * @return {boolean} True if the close icon should be shown, false otherwise
 */
ModalDialog.prototype.showCloseIcon = function () {
	return this.m_showCloseIcon;
};

/** Getters **/

/**
 * Retrieves the function that will be used when attempting to populate the content of the modal dialog body.
 * @return {function} The function used when loading the modal dialog body
 */
ModalDialog.prototype.getBodyDataFunction = function () {
	return this.m_body.dataFunction;
};

/**
 * Retrieves the id associated to the modal dialog body element
 * @return {string} The id associated to the modal dialog body element
 */
ModalDialog.prototype.getBodyElementId = function () {
	return this.m_body.elementId;
};

/**
 * Retrieves the percentage set for the bottom margin of the modal dialog
 * @return {number} The percentage assigned to the bottom margin for the modal dialog
 */
ModalDialog.prototype.getBottomMarginPercentage = function () {
	return this.m_margins.bottom;
};

/**
 * Retrieves the button identified by the id passed into the function
 * @param {string} buttonId The if of the ModalButton object to retrieve
 * @return {ModalButton} The modal button with the id of buttonId, else null
 */
ModalDialog.prototype.getFooterButton = function (buttonId) {
	var x = 0;
	var buttons = this.getFooterButtons();
	var buttonCnt = buttons.length;
	//Get the ModalButton
	for (x = buttonCnt; x--; ) {
		button = buttons[x];
		if (button.getId() === buttonId) {
			return buttons[x];
		}
	}
	return null;
};

/**
 * Retrieves the array of buttons which will be used in the footer of the modal dialog.
 * @return {ModalButton[]} An array of ModalButton objects which will be used in the footer of the modal dialog
 */
ModalDialog.prototype.getFooterButtons = function () {
	return this.m_footer.buttons;
};

/**
 * Retrieves the id associated to the modal dialog footer element
 * @return {string} The id associated to the modal dialog footer element
 */
ModalDialog.prototype.getFooterElementId = function () {
	return this.m_footer.elementId;
};

/**
 * Retrieves a boolean which determines if the modal dialog should display a gray background or not
 * @return {boolean} The flag which determines if this modal dialog should display a gray background
 */
ModalDialog.prototype.getHasGrayBackground = function () {
	return this.m_hasGrayBackground;
};

/**
 * Retrieves the function that will be used when the user attempts to close the modal dialog.
 * @return {function} The function used when closing the modal dialog
 */
ModalDialog.prototype.getHeaderCloseFunction = function () {
	return this.m_header.closeFunction;
};

/**
 * Retrieves the id associated to the modal dialog header element
 * @return {string} The id associated to the modal dialog header element
 */
ModalDialog.prototype.getHeaderElementId = function () {
	return this.m_header.elementId;
};

/**
 * Retrieves the title which will be used in the header of the modal dialog
 * @return {string} The title given to the modal dialog header element
 */
ModalDialog.prototype.getHeaderTitle = function () {
	return this.m_header.title;
};

/**
 * Retrieves the css class which will be applied to the html span used to open the modal dialog
 * @return {string} The css which will be applied to the html span used ot open the modal dialog
 */
ModalDialog.prototype.getIconClass = function () {
	return this.m_icon.cssClass;
};

/**
 * Retrieves the id associated to the modal dialog icon element
 * @return {string} The id associated to the modal dialog icon element
 */
ModalDialog.prototype.getIconElementId = function () {
	return this.m_icon.elementId;
};

/**
 * Retrieves the text which will be displayed the user hovers over the modal dialog icon
 * @return {string} The text displayed when hovering over the modal dialog icon
 */
ModalDialog.prototype.getIconHoverText = function () {
	return this.m_icon.hoverText;
};

/**
 * Retrieves the text which will be displayed next to the icon used to open the modal dialog
 * @return {string} The text displayed next to the icon
 */
ModalDialog.prototype.getIconText = function () {
	return this.m_icon.text;
};

/**
 * Retrieves the id given to this modal dialog object
 * @return {string} The id given to this modal dialog object
 */
ModalDialog.prototype.getId = function () {
	return this.m_modalId;
};

/**
 * Retrieves a boolean which determines if this modal dialog object is active or not
 * @return {boolean} The flag which determines if this modal dialog object is active or not
 */
ModalDialog.prototype.getIsActive = function () {
	return this.m_isModalActive;
};

/**
 * Retrieves a boolean which determines if this body of the modal dialog object has a fixed height or not
 * @return {boolean} The flag which determines if the body of the modal dialog object is fixed or not
 */
ModalDialog.prototype.getIsBodySizeFixed = function () {
	return this.m_body.isBodySizeFixed;
};

/**
 * Retrieves a boolean which determines if this modal dialog object is fixed to the icon used to launch it.
 * @return {boolean} The flag which determines if this modal dialog object is active or not
 */
ModalDialog.prototype.getIsFixedToIcon = function () {
	return this.m_isFixedToIcon;
};

/**
 * Retrieves a boolean which determines if this modal dialog footer is always shown or not.
 * @return {boolean} The flag which determines if this modal dialog footer is always shown or not.
 */
ModalDialog.prototype.getIsFooterAlwaysShown = function () {
	return this.m_footer.isAlwaysShown;
};

/**
 * Retrieves a boolean which determines if this modal dialog icon is active or not.  If the icon is not active it should
 * not be clickable by the user and the cursor should not change when hovered over.
 * @return {boolean} The flag which determines if modal dialog icon is active or not.
 */
ModalDialog.prototype.getIsIconActive = function () {
	return this.m_icon.isActive;
};

/**
 * Retrieves the percentage set for the left margin of the modal dialog
 * @return {number} The percentage assigned to the left margin for the modal dialog
 */
ModalDialog.prototype.getLeftMarginPercentage = function () {
	return this.m_margins.left;
};

/**
 * Retrieves the percentage set for the right margin of the modal dialog
 * @return {number} The percentage assigned to the right margin for the modal dialog
 */
ModalDialog.prototype.getRightMarginPercentage = function () {
	return this.m_margins.right;
};

/**
 * Retrieves a boolean which determines if the close icon should be shown in the modal dialog.
 * @return {boolean} The flag which determines if the close icon should be shown or not.
 */
ModalDialog.prototype.getShowCloseIcon = function () {
	return this.m_showCloseIcon;
};

/**
 * Retrieves the percentage set for the top margin of the modal dialog
 * @return {number} The percentage assigned to the top margin for the modal dialog
 */
ModalDialog.prototype.getTopMarginPercentage = function () {
	return this.m_margins.top;
};

/** Setters **/
/**
 * Sets the function to be called when the modal dialog is shown.  This function will be passed ModalDialog object so that
 * it can interact with the modal dialog easily while the dialog is open.
 * @param {function} dataFunc The function used to populate the body of the modal dialog
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setBodyDataFunction = function (dataFunc) {

	//Check the proposed function
	if (!(typeof dataFunc === "function") && dataFunc !== null) {
		MP_Util.LogError("ModalDialog.setBodyDataFunction: dataFunc param must be a function or null");
		return this;
	}

	this.m_body.dataFunction = dataFunc;
	return this;
};

/**
 * Sets the html element id of the modal dialog body.  This id will be used to insert html into the body of the modal dialog.
 * @param {string} elementId The id of the html element
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setBodyElementId = function (elementId) {
	if (elementId && typeof elementId == "string") {
		//Update the existing element id if the modal dialog is active
		if (this.isActive()) {
			$("#" + this.getBodyElementId()).attr("id", elementId);
		}
		this.m_body.elementId = elementId;
	}
	return this;
};

/**
 * Sets the html of the body element.
 * @param {string} html The HTML to insert into the body element
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setBodyHTML = function (html) {
	if (html && typeof html == "string") {
		//Update the existing html iff the modal dialog is active
		if (this.isActive()) {
			$("#" + this.getBodyElementId()).html(html);
		}
	}
	return this;
};

/**
 * Sets the percentage of the window size that will make up the bottom margin of the modal dialog.  The default value is 5.
 * @param {number} margin A number that determines what percentage of the window's width will make up the bottom margin of the modal dialog
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setBottomMarginPercentage = function (margin) {
	if (typeof margin == "number") {
		this.m_margins.bottom = (margin <= 0) ? 1 : margin;
		//Resize the modal if it is active
		if (this.isActive()) {
			MP_ModalDialog.resizeModalDialog(this.getId());
		}
	}
	return this;
};

/**
 * Sets the close on click property of a specific button in the modal dialog.
 * @param {string} buttonId The id of the button to be dithered
 * @param {boolean} closeOnClick A boolean used to determine if the button should close the dialog or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setFooterButtonCloseOnClick = function (buttonId, closeOnClick) {
	var button = null;
	var buttonElement = null;
	var onClickFunc = null;
	var modal = this;

	//check the closeOnClick type
	if (!(typeof closeOnClick === "boolean")) {
		MP_Util.LogError("ModalDialog.setFooterButtonCloseOnClick: closeOnClick param must be of type boolean");
		return this;
	}

	//Get the ModalButton
	button = this.getFooterButton(buttonId);
	if (button) {
		//Update the closeOnClick flag
		button.setCloseOnClick(closeOnClick);
		//If the modal dialog is active, update the existing class
		if (this.isActive()) {
			//Update the class of the object
			buttonElement = $("#" + buttonId);
			buttonElement.click(function () {
				onClickFunc = button.getOnClickFunction();
				if (onClickFunc && typeof onClickFunc == "function") {
					onClickFunc();
				}
				if (closeOnClick) {
					MP_ModalDialog.closeModalDialog(modal.getId());
				}
			});

		}
	} else {
		MP_Util.LogError("ModalDialog.setFooterButtonCloseOnClick: No button with the id of " + buttonId + " exists for this ModalDialog");
	}
	return this;
};

/**
 * Sets the dithered property of a specific button in the modal dialog
 * @param {string} buttonId The id of the button to be dithered
 * @param {boolean} dithered A boolean used to determine if the button should be dithered or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setFooterButtonDither = function (buttonId, dithered) {
	var button = null;
	var buttonElement = null;
	//check the dithered type
	if (!(typeof dithered === "boolean")) {
		MP_Util.LogError("ModalDialog.setFooterButtonDither: Dithered param must be of type boolean");
		return this;
	}
	//Get the ModalButton
	button = this.getFooterButton(buttonId);
	if (button) {
		//Update the dithered flag
		button.setIsDithered(dithered);
		//If the modal dialog is active, update the existing class
		if (this.isActive()) {
			//Update the class of the object
			buttonElement = $("#" + buttonId);
			if (dithered) {
				$(buttonElement).attr("disabled", true);
			} else {
				$(buttonElement).attr("disabled", false);
			}
		}
	} else {
		MP_Util.LogError("ModalDialog.setFooterButtonDither: No button with the id of " + buttonId + " exists for this ModalDialog");
	}
	return this;
};

/**
 * Sets the onclick function of the footer button with the given buttonId
 * @param {string} buttonId The id of the button to be dithered
 * @param {boolean} dithered A boolean used to determine if the button should be dithered or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setFooterButtonOnClickFunction = function (buttonId, clickFunc) {
	var button = null;
	var modal = this;

	//Check the proposed function and make sure it is a function
	if (!(typeof clickFunc == "function") && clickFunc !== null) {
		MP_Util.LogError("ModalDialog.setFooterButtonOnClickFunction: clickFunc param must be a function or null");
		return this;
	}

	//Get the modal button
	button = this.getFooterButton(buttonId);
	if (button) {
		//Set the onclick function of the button
		button.setOnClickFunction(clickFunc);
		//If the modal dialog is active, update the existing onClick function
		$("#" + buttonId).unbind("click").click(function () {
			if (clickFunc) {
				clickFunc();
			}
			if (button.closeOnClick()) {
				MP_ModalDialog.closeModalDialog(modal.getId());
			}
		});
	} else {
		MP_Util.LogError("ModalDialog.setFooterButtonOnClickFunction: No button with the id of " + buttonId + " exists for this ModalDialog");
	}
	return this;
};

/**
 * Sets the text displayed in the footer button with the given buttonId
 * @param {string} buttonId The id of the button to be dithered
 * @param {string} buttonText the text to display in the button
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setFooterButtonText = function (buttonId, buttonText) {
	var button = null;

	//Check the proposed text and make sure it is a string
	if (!(typeof buttonText === "string")) {
		MP_Util.LogError("ModalDialog.setFooterButtonText: buttonText param must be a string");
		return this;
	}

	//Check make sure the string is not empty
	if (!buttonText) {
		MP_Util.LogError("ModalDialog.setFooterButtonText: buttonText param must not be empty or null");
		return this;
	}

	//Get the modal button
	button = this.getFooterButton(buttonId);
	if (button) {
		//Set the onclick function of the button
		button.setText(buttonText);
		//If the modal dialog is active, update the existing onClick function
		$("#" + buttonId).html(buttonText);
	} else {
		MP_Util.LogError("ModalDialog.setFooterButtonText: No button with the id of " + buttonId + " exists for this ModalDialog");
	}
	return this;
};

/**
 * Sets the html element id of the modal dialog footer.  This id will be used to interact with the footer of the modal dialog.
 * @param {string} elementId The id of the html element
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setFooterElementId = function (elementId) {
	if (elementId && typeof elementId == "string") {
		//Update the existing element id if the modal dialog is active
		if (this.isActive()) {
			$("#" + this.getFooterElementId()).attr("id", elementId);
		}
		this.m_footer.elementId = elementId;
	}
	return this;
};

/**
 * Sets the indicator which determines if the icon to launch the modal dialog is active or not.  When this is
 * set, the icon and its interactions are updated if it is shown on the MPage.
 * @param {boolean} activeInd An indicator which determines if the modal dialog icon is active or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIsIconActive = function (activeInd) {
	var modal = this;

	if (typeof activeInd == "boolean") {
		this.m_icon.isActive = activeInd;
		//Update the icon click event based on the indicator
		//Get the icon container and remove all events if there are any
		var iconElement = $("#" + this.getIconElementId());
		if (iconElement) {
			$(iconElement).unbind("click");
			$(iconElement).removeClass("vwp-util-icon");
			if (activeInd) {
				//Add the click event
				$(iconElement).click(function () {
					MP_ModalDialog.showModalDialog(modal.getId());
				});

				$(iconElement).addClass("vwp-util-icon");
			}
		}
	}
	return this;
};

/**
 * Sets the flag which determines if the modal dialog will have a gray backgound when rendered.  This property
 * will not update dynamically.
 * @param {boolean} hasGrayBackground The id of the html element
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setHasGrayBackground = function (hasGrayBackground) {
	if (typeof hasGrayBackground == "boolean") {
		this.m_hasGrayBackground = hasGrayBackground;
	}
	return this;
};

/**
 * Sets the function to be called upon the user choosing to close the dialog via the exit button instead of one of the available buttons.
 * @param {function} closeFunc The function to call when the user closes the modal dialog
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setHeaderCloseFunction = function (closeFunc) {
	var modal = this;
	//Check the proposed function and make sure it is a function
	if (!(typeof closeFunc === "function") && closeFunc !== null) {
		MP_Util.LogError("ModalDialog.setHeaderCloseFunction: closeFunc param must be a function or null");
		return this;
	}

	//Update close function since it is valid
	this.m_header.closeFunction = closeFunc;

	//Update the header close function if the modal is active
	if (this.isActive()) {
		//Get the close element
		$('.dyn-modal-hdr-close').click(function () {
			if (closeFunc) {
				closeFunc();
			}
			//call the close mechanism of the modal dialog to cleanup everything
			MP_ModalDialog.closeModalDialog(modal.getId());
		});

	}
	return this;
};

/**
 * Sets the html element id of the modal dialog header.  This id will be used to interact with the header of the modal dialog.
 * @param {string} elementId The id of the html element
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setHeaderElementId = function (elementId) {
	if (elementId && typeof elementId == "string") {
		//Update the existing element id if the modal dialog is active
		if (this.isActive()) {
			$("#" + this.getHeaderElementId()).attr("id", elementId);
		}
		this.m_header.elementId = elementId;
	}
	return this;
};

/**
 * Sets the title to be displayed in the modal dialog header.
 * @param {string} headerTitle The string to be used in the modal dialog header as the title
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setHeaderTitle = function (headerTitle) {
	if (headerTitle && typeof headerTitle == "string") {
		this.m_header.title = headerTitle;
		//Update the existing header title if the modal dialog is active
		if (this.isActive()) {
			$('#' + this.getHeaderElementId() + " .dyn-modal-hdr-title").html(headerTitle);
		}
	}
	return this;
};

/**
 * Sets the css class to be used to display the modal dialog launch icon.  This class should contain a background and proper sizing
 * as to diaply the entire icon.
 * @param {string} iconClass The css class to be applied to the html element the user will use to launch the modal dialog
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIconClass = function (iconClass) {
	if (iconClass && typeof iconClass == "string") {
		//Update the existing icon class
		$('#' + this.getIconElementId()).removeClass(this.m_icon.cssClass).addClass(iconClass);
		this.m_icon.cssClass = iconClass;
	}
	return this;
};

/**
 * Sets the html element id of the modal dialog icon.  This id will be used to interact with the icon of the modal dialog.
 * @param {string} elementId The id of the html element
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIconElementId = function (elementId) {
	if (elementId && typeof elementId == "string") {
		//Update the existing element id if the modal dialog is active
		if (this.isActive()) {
			$("#" + this.getIconElementId()).attr("id", elementId);
		}
		this.m_icon.elementId = elementId;
	}
	return this;
};

/**
 * Sets the test which will be displayed to the user when hovering over the modal dialog icon.
 * @param {string} iconHoverText The text to display in the icon hover
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIconHoverText = function (iconHoverText) {
	if (iconHoverText !== null && typeof iconHoverText == "string") {
		this.m_icon.hoverText = iconHoverText;
		//Update the icon hover text
		if ($('#' + this.getIconElementId()).length > 0) {
			$('#' + this.getIconElementId()).attr("title", iconHoverText);
		}
	}
	return this;
};

/**
 * Sets the text to be displayed next to the modal dialog icon.
 * @param {string} iconText The text to display next to the modal dialog icon.
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIconText = function (iconText) {
	if (iconText !== null && typeof iconText == "string") {
		this.m_icon.text = iconText;
		//Update the icon text
		if ($('#' + this.getIconElementId()).length > 0) {
			$('#' + this.getIconElementId()).html(iconText);
		}
	}
	return this;
};

/**
 * Sets the id which will be used to identify a particular ModalDialog object.
 * @param {string} id The id that will be assigned to this ModalDialog object
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setId = function (id) {
	if (id && typeof id == "string") {
		this.m_modalId = id;
	}
	return this;
};

/**
 * Sets the flag which identifies the modal dialog as being active or not
 * @param {boolean} activeInd A boolean that can be used to determine if the modal is active or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIsActive = function (activeInd) {
	if (typeof activeInd == "boolean") {
		this.m_isModalActive = activeInd;
	}
	return this;
};

/**
 * Sets the flag which identifies if the modal dialog body is a fixed height or not.
 * @param {boolean} bodyFixed A boolean that can be used to determine if the modal dialog has a fixed size body or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIsBodySizeFixed = function (bodyFixed) {
	if (typeof bodyFixed == "boolean") {
		this.m_body.isBodySizeFixed = bodyFixed;
	}
	return this;
};

/**
 * Sets the flag which identifies if the modal dialog is fixed to the icon or not.  If this flag is set
 * the modal dialog will be displayed as an extension of the icon used to launch the dialog, much like a popup window.
 * In this case the Top and Right margins are ignored and the location of the icon will determine those margins.  If this
 * flag is set to false the modal dialog window will be displayed according to all of the margin settings.
 * @param {boolean} fixedToIcon A boolean that can be used to determine if the modal is fixed to the launch icon or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIsFixedToIcon = function (fixedToIcon) {
	if (typeof fixedToIcon == "boolean") {
		this.m_isFixedToIcon = fixedToIcon;
	}
	return this;
};

/**
 * Sets the flag which identifies if the modal dialog footer is always shown or not
 * @param {boolean} footerAlwaysShown A boolean used to determine if the modal dialog footer is always shown or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setIsFooterAlwaysShown = function (footerAlwaysShown) {
	if (typeof footerAlwaysShown == "boolean") {
		this.m_footer.isAlwaysShown = footerAlwaysShown;
	}
	return this;
};

/**
 * Sets the percentage of the window size that will make up the left margin of the modal dialog.  The default value is 5.
 * @param {number} margin A number that determines what percentage of the window's width will make up the left margin of the modal dialog
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setLeftMarginPercentage = function (margin) {
	if (typeof margin == "number") {
		this.m_margins.left = (margin <= 0) ? 1 : margin;
		//Resize the modal if it is active
		if (this.isActive()) {
			MP_ModalDialog.resizeModalDialog(this.getId());
		}
	}
	return this;
};

/**
 * Sets the percentage of the window size that will make up the right margin of the modal dialog.  The default value is 5.
 * @param {number} margin A number that determines what percentage of the window's width will make up the right margin of the modal dialog
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setRightMarginPercentage = function (margin) {
	if (typeof margin == "number") {
		this.m_margins.right = (margin <= 0) ? 1 : margin;
		//Resize the modal if it is active
		if (this.isActive()) {
			MP_ModalDialog.resizeModalDialog(this.getId());
		}
	}
	return this;
};

/**
 * Sets the flag which identifies if the modal dialog close icon is shown or not
 * @param {boolean} showCloseIcon A boolean used to determine if the modal dialog close icon is shown or not
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setShowCloseIcon = function (showCloseIcon) {
	if (typeof showCloseIcon == "boolean") {
		this.m_showCloseIcon = showCloseIcon;
	}
	return this;
};

/**
 * Sets the percentage of the window size that will make up the top margin of the modal dialog.  The default value is 5.
 * @param {number} margin A number that determines what percentage of the window's width will make up the top margin of the modal dialog
 * @return {ModalDialog} The modal dialog object calling this function so chaining can be used
 */
ModalDialog.prototype.setTopMarginPercentage = function (margin) {
	if (typeof margin == "number") {
		this.m_margins.top = (margin <= 0) ? 1 : margin;
		//Resize the modal if it is active
		if (this.isActive()) {
			MP_ModalDialog.resizeModalDialog(this.getId());
		}
	}
	return this;
};

/**
 * The ModalButton class is used specifically for adding buttons to the footer of a modal dialog.
 * @constructor
 */
function ModalButton(buttonId) {
	//The id given to the button.  This id will be used to identify individual buttons
	this.m_buttonId = buttonId;
	//The text that will be displayed in the button itself
	this.m_buttonText = "";
	//A flag to determine if the button shall be disabled or not
	this.m_dithered = false;
	//The function to call when the button is clicked
	this.m_onClickFunction = null;
	//A flag to determine if this button should be closed when clicked.
	this.m_closeOnClick = true;
	//A flag to determine if this button should be focused when the modal dialog is shown
	this.m_focusInd = false;
}

/** Checkers **/
/**
 * Check to see if the button click should close the modal dialog on click
 * @return {boolean} A boolean which determines if the button click should cause the modal dialog to close
 */
ModalButton.prototype.closeOnClick = function () {
	return this.m_closeOnClick;
};

/**
 * Check to see if the Modal Button is currently dithered
 * @return {boolean} A boolean flag that indicates if the modal button is dithered or not
 */
ModalButton.prototype.isDithered = function () {
	return this.m_dithered;
};

/** Getters **/
/**
 * Retrieves the id assigned the this ModalButton object
 * @return {string} The id assigned to this ModalButton object
 */
ModalButton.prototype.getId = function () {
	return this.m_buttonId;
};

/**
 * Retrieve the close on click flag of the ModalButton object
 * @return {boolean} The close on click flag of the ModalButton object
 */
ModalButton.prototype.getCloseOnClick = function () {
	return this.m_closeOnClick;
};

/**
 * Retrieve the focus indicator flag of the ModalButton object
 * @return {boolean} The focus indicator flag of the ModalButton object
 */
ModalButton.prototype.getFocusInd = function () {
	return this.m_focusInd;
};

/**
 * Retrieves the text used for the ModalButton display
 * @return {string} The text which will be used in the button display
 */
ModalButton.prototype.getText = function () {
	return this.m_buttonText;
};

/**
 * Retrieves the onClick function associated to this Modal Button
 * @return {function} The function executed when the button is clicked
 */
ModalButton.prototype.getOnClickFunction = function () {
	return this.m_onClickFunction;
};

/** Setters **/

/**
 * Sets the id of the ModalButton object.  The id must be a string otherwise it is ignored.
 * @return {ModalButton} The modal button object calling this function so chaining can be used
 */
ModalButton.prototype.setId = function (buttonId) {
	if (buttonId && typeof buttonId == "string") {
		this.m_buttonId = buttonId;
	}
	return this;
};

/**
 * Sets the close on click flag of the dialog button
 * @return {ModalButton} The modal button object calling this function so chaining can be used
 */
ModalButton.prototype.setCloseOnClick = function (closeFlag) {
	if (typeof closeFlag == "boolean") {
		this.m_closeOnClick = closeFlag;
	}
	return this;
};

/**
 * Sets the focus indicator flag of the dialog button
 * @return {ModalButton} The modal button object calling this function so chaining can be used
 */
ModalButton.prototype.setFocusInd = function (focusInd) {
	if (typeof focusInd == "boolean") {
		this.m_focusInd = focusInd;
	}
	return this;
};

/**
 * Sets the text which will be shown in the button
 * @return {ModalButton} The modal button object calling this function so chaining can be used
 */
ModalButton.prototype.setText = function (buttonText) {
	if (buttonText && typeof buttonText == "string") {
		this.m_buttonText = buttonText;
	}
	return this;
};

/**
 * Sets the dithered status of the dialog button
 * @return {ModalButton} The modal button object calling this function so chaining can be used
 */
ModalButton.prototype.setIsDithered = function (dithered) {
	if (typeof dithered == "boolean") {
		this.m_dithered = dithered;
	}
	return this;
};

/**
 * Sets the onClick function for the ModalButton
 * @return {ModalButton} The modal button object calling this function so chaining can be used
 */
ModalButton.prototype.setOnClickFunction = function (clickFunc) {
	this.m_onClickFunction = clickFunc;
	return this;
};

/**
 * A collection of functions which can be used to maintain, create, destroy and update modal dialogs.
 * The MP_ModalDialog function keeps a copy of all of the ModalDialog objects that have been created
 * for the current view.  If a ModalDialog object is updated outside of these functions, the updated
 * version of the object should replace the stale version that is stored here by using the
 * updateModalDialogObject functionality.
 * @namespace
 */
var MP_ModalDialog = function () {
	var modalDialogObjects = {};
	var whiteSpacePixels = 26;

	//A inner function used to the resize event that can be added and also removed from the window
	var resizeFunction = function () {
		MP_ModalDialog.resizeAllModalDialogs();
	};

	return {
		/**
		 * This function will be used to add ModalDialog objects to the collection of ModalDialog objects for the current
		 * View.  This list of ModalDialog objects will be the one source of this type of object and will be used when
		 * showing modal dialogs.
		 * @param {ModalDialog} modalObject An instance of the ModalDialog object
		 */
		addModalDialogObject : function (modalObject) {
			var modalId = "";
			//Check that he object is not null and that the object type is ModalDialog
			if (!(modalObject instanceof ModalDialog)) {
				MP_Util.LogError("MP_ModalDialog.addModalDialogObject only accepts objects of type ModalDialog");
				return false;
			}

			//Check for a valid id.
			modalId = modalObject.getId();
			if (!modalId) {
				//Modal id is not populated
				MP_Util.LogError("MP_ModalDialog.addModalDialogObject: no/invalid ModalDialog id given");
				return false;
			} else if (modalDialogObjects[modalId]) {
				//Modal id is already in use
				MP_Util.LogError("MP_ModalDialog.addModalDialogObject: modal dialog id" + modalId + " is already in use");
				return false;
			}

			//Add the ModalDialog Object to the list of ModalDialog objects
			modalDialogObjects[modalId] = modalObject;
		},

		/**
		 * Add the modal dialog icon to the viewpoint framework.  This icon will be responsible for
		 * launching the correct modal dialog based on the ModalDialog object that it is associated to.
		 * @param {string} modalDialogId The id of the ModalDialog object to reference when creating the modal dialog icon
		 * @return null
		 */
		addModalDialogOptionToViewpoint : function (modalDialogId) {
			var modalObj = null;
			var iconElement = null;
			var vwpUtilElement = null;

			//Check to see if the ModalDialog exists
			modalObj = modalDialogObjects[modalDialogId];
			if (!modalObj) {
				return;
			}

			//Check to see if the modal utility has already been added to the viewpoint
			if ($("#" + modalDialogId).length > 0) {
				MP_Util.LogError("MP_ModalDialog.addModalDialogObject: Modal dialog " + modalDialogId + " already added");
				return;
			}

			//If the MP_Viewpoint function is defined call it
			if (typeof MP_Viewpoint.addModalDialogUtility != 'undefined') {
				MP_Viewpoint.addModalDialogUtility(modalObj);
			}
		},

		/**
		 * Closes all of the associated modal dialog windows and removes the resize event listener
		 * @return null
		 */
		closeModalDialog : function (modalDialogId) {
			var modalObj = null;

			//Check to see if the ModalDialog exists
			modalObj = modalDialogObjects[modalDialogId];
			if (!modalObj) {
				return;
			}

			//destroy the modal dialog
			$("#vwpModalDialog" + modalObj.getId()).remove();
			//destroy the modal background
			$("#vwpModalBackground" + modalObj.getId()).remove();
			//remove modal dialog resize event from the window
			$(window).unbind("resize", resizeFunction);
			//Mark the modal dialog as inactive
			modalObj.setIsActive(false);
			$("html").css("overflow", "auto");
		},

		/**
		 * Deletes the modal dialog object with the id modalDialogId.
		 * @param {string} modalDialogId The id of the modal dialog object to be deleted
		 * @return {boolean} True if a ModalDialog object was deleted, false otherwise
		 */
		deleteModalDialogObject : function (modalDialogId) {
			if (modalDialogObjects[modalDialogId]) {
				modalDialogObjects[modalDialogId] = null;
				return true;
			}
			return false;
		},

		/**
		 * Retrieves the ModalDialog object with the id of modalDialogId
		 * @param {string} modalDialogId The id of the modal dialog object to retrieve
		 */
		retrieveModalDialogObject : function (modalDialogId) {
			if (modalDialogObjects[modalDialogId]) {
				return modalDialogObjects[modalDialogId];
			}
			return null;
		},

		/**
		 * Resizes all of the active modal dialogs when the window itself is being resized.
		 * @param {string} modalDialogId The id of the modal dialog object to resize
		 */
		resizeAllModalDialogs : function () {
			var tempObj = null;
			var attr = "";
			//Get all of the modal dialog objects from the modalDialogObjects collection
			for (attr in modalDialogObjects) {
				if (modalDialogObjects.hasOwnProperty(attr)) {
					tempObj = modalDialogObjects[attr];
					if ((tempObj instanceof ModalDialog) && tempObj.isActive()) {
						MP_ModalDialog.resizeModalDialog(tempObj.getId());
					}
				}
			}
		},

		/**
		 * Resizes the modal dialog when the window itself is being resized.
		 * @param {string} modalDialogId The id of the modal dialog object to resize
		 */
		resizeModalDialog : function (modalDialogId) {
			var docHeight = 0;
			var docWidth = 0;
			var topMarginSize = 0;
			var leftMarginSize = 0;
			var bottomMarginSize = 0;
			var rightMarginSize = 0;
			var modalWidth = "";
			var modalHeight = "";
			var modalObj = null;

			//Get the ModalDialog object
			modalObj = modalDialogObjects[modalDialogId];
			if (!modalObj) {
				MP_Util.LogError("MP_ModalDialog.resizeModalDialog: No modal dialog with the id " + modalDialogId + "exists");
				return;
			}

			if (!modalObj.isActive()) {
				MP_Util.LogError("MP_ModalDialog.resizeModalDialog: this modal dialog is not active it cannot be resized");
				return;
			}

			//Determine the new margins and update accordingly
			docHeight = $(window).height();
			docWidth = $(document.body).width();
			topMarginSize = Math.floor(docHeight * (modalObj.getTopMarginPercentage() / 100));
			leftMarginSize = Math.floor(docWidth * (modalObj.getLeftMarginPercentage() / 100));
			bottomMarginSize = Math.floor(docHeight * (modalObj.getBottomMarginPercentage() / 100));
			rightMarginSize = Math.floor(docWidth * (modalObj.getRightMarginPercentage() / 100));
			modalWidth = (docWidth - leftMarginSize - rightMarginSize);
			modalHeight = (docHeight - topMarginSize - bottomMarginSize);
			$("#vwpModalDialog" + modalObj.getId()).css({
				"top" : topMarginSize,
				"left" : leftMarginSize,
				"width" : modalWidth + "px"
			});

			//Make sure the body div fills all of the alloted space if the body is a fixed size and also make sure the modal dialog is sized correctly.
			if (modalObj.isBodySizeFixed()) {
				$("#vwpModalDialog" + modalObj.getId()).css("height", modalHeight + "px");
				$("#" + modalObj.getBodyElementId()).height(modalHeight - $("#" + modalObj.getHeaderElementId()).height() - $("#" + modalObj.getFooterElementId()).height() - whiteSpacePixels);
			} else {
				$("#vwpModalDialog" + modalObj.getId()).css("max-height", modalHeight + "px");
				$("#" + modalObj.getBodyElementId()).css("max-height", (modalHeight - $("#" + modalObj.getHeaderElementId()).height() - $("#" + modalObj.getFooterElementId()).height() - whiteSpacePixels) + "px");
			}

			//Make sure the modal background is resized as well
			$("#vwpModalBackground" + modalObj.getId()).css({
				"height" : "100%",
				"width" : "100%"
			});
		},

		/**
		 * Render and show the modal dialog based on the settings applied in the ModalDialog object referenced by the
		 * modalDialogId parameter.
		 * @param {string} modalDialogId The id of the ModalDialog object to render
		 * @return null
		 */
		showModalDialog : function (modalDialogId) {
			var bodyDiv = null;
			var bodyLoadFunc = null;
			var bottomMarginSize = 0;
			var button = null;
			var dialogDiv = null;
			var docHeight = 0;
			var docWidth = 0;
			var focusButtonId = "";
			var footerDiv = null;
			var footerButtons = [];
			var footerButtonsCnt = 0;
			var footerButtonContainer = null;
			var headerDiv = null;
			var leftMarginSize = 0;
			var modalDiv = null;
			var modalObj = null;
			var modalHeight = "";
			var modalWidth = "";
			var rightMarginSize = 0;
			var topMarginSize = 0;
			var x = 0;

			/**
			 * This function is used to create onClick functions for each button.  Using this function
			 * will prevent closures from applying the same action onClick function to all buttons.
			 */
			function createButtonClickFunc(buttonObj, modalDialogId) {
				var clickFunc = buttonObj.getOnClickFunction();
				var closeModal = buttonObj.closeOnClick();
				if (!clickFunc) {
					clickFunc = function () {};

				}
				return function () {
					clickFunc();
					if (closeModal) {
						MP_ModalDialog.closeModalDialog(modalDialogId);
					}
				};

			}

			//Get the ModalDialog object
			modalObj = modalDialogObjects[modalDialogId];
			if (!modalObj) {
				MP_Util.LogError("MP_ModalDialog.showModalDialog: No modal dialog with the id " + modalDialogId + "exists");
				return;
			}

			//Check to see if the modal dialog is already displayed.  If so, return
			if (modalObj.isActive()) {
				return;
			}

			//Create the modal window based on the ModalDialog object
			//Create the header div element
			headerDiv = $('<div></div>').attr({
					id : modalObj.getHeaderElementId()
				}).addClass("dyn-modal-hdr-container").append($('<span></span>').addClass("dyn-modal-hdr-title").html(modalObj.getHeaderTitle()));
			if (modalObj.showCloseIcon()) {
				headerDiv.append($('<span></span>').addClass("dyn-modal-hdr-close").click(function () {
						var closeFunc = null;
						//call the close function of the modalObj
						closeFunc = modalObj.getHeaderCloseFunction();
						if (closeFunc) {
							closeFunc();
						}
						//call the close mechanism of the modal dialog to cleanup everything
						MP_ModalDialog.closeModalDialog(modalDialogId);
					}));

			}

			//Create the body div element
			bodyDiv = $('<div></div>').attr({
					id : modalObj.getBodyElementId()
				}).addClass("dyn-modal-body-container");

			//Create the footer element if there are any buttons available
			footerButtons = modalObj.getFooterButtons();
			footerButtonsCnt = footerButtons.length;
			if (footerButtonsCnt) {
				footerDiv = $('<div></div>').attr({
						id : modalObj.getFooterElementId()
					}).addClass("dyn-modal-footer-container");
				footerButtonContainer = $('<div></div>').attr({
						id : modalObj.getFooterElementId() + "btnCont"
					}).addClass("dyn-modal-button-container");
				for (x = 0; x < footerButtonsCnt; x++) {
					button = footerButtons[x];
					buttonFunc = button.getOnClickFunction();
					footerButtonContainer.append($('<button></button>').attr({
							id : button.getId(),
							disabled : button.isDithered()
						}).addClass("dyn-modal-button").html(button.getText()).click(createButtonClickFunc(button, modalObj.getId())));

					//Check to see if we should focus on this button when loading the modal dialog
					if (!focusButtonId) {
						focusButtonId = (button.getFocusInd()) ? button.getId() : "";
					}
				}
				footerDiv.append(footerButtonContainer);
			} else if (modalObj.isFooterAlwaysShown()) {
				footerDiv = $('<div></div>').attr({
						id : modalObj.getFooterElementId()
					}).addClass("dyn-modal-footer-container");
				footerDiv.append(footerButtonContainer);
			}

			//determine the dialog size
			docHeight = $(window).height();
			docWidth = $(document.body).width();
			topMarginSize = Math.floor(docHeight * (modalObj.getTopMarginPercentage() / 100));
			leftMarginSize = Math.floor(docWidth * (modalObj.getLeftMarginPercentage() / 100));
			bottomMarginSize = Math.floor(docHeight * (modalObj.getBottomMarginPercentage() / 100));
			rightMarginSize = Math.floor(docWidth * (modalObj.getRightMarginPercentage() / 100));
			modalWidth = (docWidth - leftMarginSize - rightMarginSize);
			modalHeight = (docHeight - topMarginSize - bottomMarginSize);
			dialogDiv = $('<div></div>').attr({
					id : "vwpModalDialog" + modalObj.getId()
				}).addClass("dyn-modal-dialog").css({
					"top" : topMarginSize,
					"left" : leftMarginSize,
					"width" : modalWidth + "px"
				}).append(headerDiv).append(bodyDiv).append(footerDiv);

			//Create the modal background if set in the ModalDialog object.
			modalDiv = $('<div></div>').attr({
					id : "vwpModalBackground" + modalObj.getId()
				}).addClass((modalObj.hasGrayBackground()) ? "dyn-modal-div" : "dyn-modal-div-clear").height($(document).height());

			//Add the flash function to the modal if using a clear background
			if (!modalObj.hasGrayBackground()) {
				modalDiv.click(function () {
					var modal = $("#vwpModalDialog" + modalObj.getId());
					$(modal).fadeOut(100);
					$(modal).fadeIn(100);
				});

			}

			//Add all of these elements to the document body
			$(document.body).append(modalDiv).append(dialogDiv);
			//Set the focus of a button if indicated
			if (focusButtonId) {
				$("#" + focusButtonId).focus();
			}
			//disable page scrolling when modal is enabled
			$("html").css("overflow", "hidden");

			//Make sure the body div fills all of the alloted space if the body is a fixed size and also make sure the modal dialog is sized correctly.
			if (modalObj.isBodySizeFixed()) {
				$(dialogDiv).css("height", modalHeight + "px");
				$(bodyDiv).height(modalHeight - $(headerDiv).height() - $(footerDiv).height() - whiteSpacePixels);
			} else {
				$(dialogDiv).css("max-height", modalHeight + "px");
				$(bodyDiv).css("max-height", (modalHeight - $(headerDiv).height() - $(footerDiv).height() - whiteSpacePixels) + "px");
			}

			//This next line makes the modal draggable.  If this is commented out updates will need to be made
			//to resize functions and also updates to the ModalDialog object to save the location of the modal
			//$(dialogDiv).draggable({containment: "parent"});

			//Mark the displayed modal as active and save its id
			modalObj.setIsActive(true);

			//Call the onBodyLoadFunction of the modal dialog
			bodyLoadFunc = modalObj.getBodyDataFunction();
			if (bodyLoadFunc) {
				bodyLoadFunc(modalObj);
			}

			//Attempt to resize the window as it is being resized
			$(window).resize(resizeFunction);
		},

		/**
		 * Updates the existing ModalDialog with a new instance of the object.  If the modal objet does not exist it is added to the collection
		 * @param {ModalDialog} modalObject The updated instance of the ModalDialog object.
		 * @return null
		 */
		updateModalDialogObject : function (modalObject) {
			var modalDialogId = "";

			//Check to see if we were passed a ModalDialog object
			if (!modalObject || !(modalObject instanceof ModalDialog)) {
				MP_Util.LogError("MP_ModalDialog.updateModalDialogObject only accepts objects of type ModalDialog");
				return;
			}

			//Blindly update the ModalDialog object.  If it didnt previously exist, it will now.
			modalDialogId = modalObject.getId();
			modalDialogObjects[modalDialogId] = modalObject;
			return;
		}

	};
}
();

/* jQUERY contain won't search result by lowercase  */    
;(function() {
    jQuery.expr[':'].containsNC =  function(elem, index, match) {
        return (elem.textContent || elem.innerText || jQuery(elem).text() || '').toLowerCase().indexOf((match[3] || '').toLowerCase()) >= 0;
    }
}(jQuery));

/**
 * @class
 * This class wraps the checkpoint system. It allows developers to make use of the RTMS V4 API.
 * @returns {CheckpointTimer}
 * @constructor
 */
function CheckpointTimer() {
    this.m_checkpointObject = null;
    try {
        this.m_checkpointObject = CERN_Platform.getDiscernObject("CHECKPOINT");
    } catch (exe) {
        log.info("Unable to create checkpoint object via window.external.DiscernObjectFactory('CHECKPOINT')");
        //alert("Unable to create checkpoint object via window.external.DiscernObjectFactory('CHECKPOINT')")
        return this;
    }
    return this;
}
/**
 * Sets the ClassName parameter on the checkpoint object, if it exists. The class name identifies which class
 * this checkpoint originates from.
 * @param {string} className - The ClassName parameter for the checkpoint object.
 * @returns {CheckpointTimer}
 */
CheckpointTimer.prototype.setClassName = function(className) {
    if (this.m_checkpointObject) {
        this.m_checkpointObject.ClassName = className;
    }
    return this;
};
/**
 * Sets the ProjectName parameter on the checkpoint object. The project name identifies the project that this
 * checkpoint originates from.
 * @param {string} projectName - The ProjectName parameter for the checkpoint object.
 * @returns {CheckpointTimer}
 */
CheckpointTimer.prototype.setProjectName = function(projectName) {
    if (this.m_checkpointObject) {
        this.m_checkpointObject.ProjectName = projectName;
    }
    return this;
};
/**
 * Sets the EventName on the checkpoint object. The event name identifies which event the checkpoint originates
 * from.
 * @param {string} eventName - The EventName for the checkpoint object.
 * @returns {CheckpointTimer}
 */
CheckpointTimer.prototype.setEventName = function(eventName) {
    if (this.m_checkpointObject) {
        this.m_checkpointObject.EventName = eventName;
    }
    return this;
};
/**
 * Sets the SubEventName on the checkpoint object. The sub event name identifies which sub-event the checkpoint
 * originates from.
 * @param {string} subEventName - The SubEventName for the checkpoint object.
 * @returns {CheckpointTimer}
 */
CheckpointTimer.prototype.setSubEventName = function(subEventName) {
    if (this.m_checkpointObject) {
        this.m_checkpointObject.SubEventName = subEventName;
    }
    return this;
};
/**
 * Calls Publish on the checkpoint object. This will publish the checkpoint out to the timer system.
 */
CheckpointTimer.prototype.publish = function() {
    if (this.m_checkpointObject) {
        this.m_checkpointObject.Publish();
    }
};
/**
 * This will add a metadata value to the checkpoint object with the specified key and value.
 * @param {string} key - The key value for the metadata.
 * @param {string} value - The value for the metadata.
 */
CheckpointTimer.prototype.addMetaData = function(key, value) {
    if (this.m_checkpointObject && key && value) {
        try {
            //Check where the code is being run (Millennium vs Web) so we can call the appropriate 
            //metadata function.  
            if (CERN_Platform.inMillenniumContext()) {
                //Call the win32 implementation of MetaData (Millennium)
                this.m_checkpointObject.MetaData(key) = value;
            } else {
                //Call the web enabled implementation of metaData (Web Enabled)
                this.m_checkpointObject.MetaData(key, value);
            }
        } catch (e) {
            log.info("Error adding MetaData [" + key + "] = " + value + "; on CheckpointTimer");
           // alert("Error adding MetaData [" + key + "] = " + value + "; on CheckpointTimer")
            return this;
        }
    }
    return this;
};
/**
 * This is the API design for Referral Management Timer Library.
 * @requires mpage-timer.js
 * @requires CERN_Platform.js
 * @requires mpage-logging.js
 */
//define([], function() {
//    "use strict";
/**
 * This class is the wrapper of either CPM JAVA timer, DiscernObjectFactory("CHECKPOINT") or its web equivalent.
 * The constructor will check whether the timer is created in CPM application and will wrap around CheckpointTimer in mpage-timer.js if it is not in CPM.
 * CheckpointTimer has ability to create timer in win32 Millennium environment and web environment, therefore this REFTimer class should be able to cover CPM, win32 Millennium and web.
 * @param {String} projectName A string identifying the name of the project/library that generated the checkpoint.
 * @param {String} className A string identifying the class, dialog, or module generating the checkpoint.
 * @param {String} eventName A string identifying the event or method the checkpoint measures.
 * @returns {REFTimer} Timer object for Referral Management.
 * @public
 * @example
 * // Usage example
 * var timer = new REFTimer("REF", "detail-view::documentList", "USR:RFM.ADD_DOCUMENT");
 * timer.setSubEvent("Start").setMetaData("documentTitle", "Message 1").publish();
 * // ...later
 * timer.setSubEvent("Stop");
 * timer.publish();
 * @constructor
 */
var REFTimer = function(projectName, className, eventName) {
    this.m_isInCPM = typeof cpmCheckpoint === "function";
    this.m_projectName = projectName || "";
    this.m_className = className || "";
    this.m_eventName = eventName || "";
    this.m_subEventName = "";
    this.m_timerObject = null;
    this.m_metaData = null;
    if (!this.m_isInCPM) {
        this.m_timerObject = (new CheckpointTimer()).setClassName(this.m_className).setProjectName(this.m_projectName).setEventName(eventName);
    }
};
/**
 * Sets class name of the timer.
 * @param {String} className  A string identifying the class the checkpoint measures.
 * @returns {REFTimer} Timer object for Referral Management.
 */
REFTimer.prototype.setClassName = function(className) {
    this.m_className = className;
    if (!this.m_isInCPM) {
        this.m_timerObject.setClassName(className);
    }
    return this;
};
/**
 * Sets event name of the timer.
 * @param {String} eventName  A string identifying the event or method the checkpoint measures.
 * @returns {REFTimer} Timer object for Referral Management.
 */
REFTimer.prototype.setEventName = function(eventName) {
    this.m_eventName = eventName;
    if (!this.m_isInCPM) {
        this.m_timerObject.setEventName(eventName);
    }
    return this;
};
/**
 * Sets meta data value to mapped meta data key in the timer.
 * @param {String} metaKey A string identifying the metadata key.
 * @param {String/Number} metaValue A string or number of the value of meta data to be set to timer.
 * @returns {REFTimer} Timer object for Referral Management.
 */
REFTimer.prototype.setMetaData = function(metaKey, metaValue) {
    if (!this.m_isInCPM) {
        this.m_timerObject.addMetaData(metaKey, metaValue);
    } else {
        if (this.m_metaData === null) {
            this.m_metaData = {};
        }
        this.m_metaData[metaKey] = metaValue;
    }
    return this;
};
/**
 * Sets subevent of the timer.
 * @param {String} subEventName A string identifying current subevent to be published.
 * @returns {REFTimer} Timer object for Referral Management.
 */
REFTimer.prototype.setSubEvent = function(subEventName) {
    this.m_subEventName = subEventName;
    if (!this.m_isInCPM) {
        this.m_timerObject.setSubEventName(this.m_subEventName);
    }
    return this;
};
/**
 * Publishes current subevent with meta data.
 * @returns {REFTimer} Timer object for Referral Management.
 */
REFTimer.prototype.publish = function() {
    if (!this.m_isInCPM) {
        this.m_timerObject.publish();
    } else {
        var checkPointParamObject = {
            "projectName": this.m_projectName,
            "className": this.m_className,
            "eventName": this.m_eventName,
            "subEventName": this.m_subEventName
        };
        if (this.m_metaData !== null) {
            checkPointParamObject.metadata = this.m_metaData;
        }
        cpmCheckpoint(JSON.stringify(checkPointParamObject));
    }
    return this;
};
//    return REFTimer;
//});

/*Start Amb code*/
/**
 * @function clean bad characters from JSON so it parses successfully
 * @param {string} json_parse : json string to parse
 * @param {string} program: program json came from
 */
function ambJSONParse(json_parse, program) {
	//preserve newlines, etc - use valid JSON
	json_parse = json_parse.replace(/\\n/g, "\\n")
		.replace(/\\'/g, "\\'")
		.replace(/\\"/g, '\\"')
		.replace(/\\&/g, "\\&")
		.replace(/\\r/g, "\\r")
		.replace(/\\t/g, "\\t")
		.replace(/\\b/g, "\\b")
		.replace(/\\f/g, "\\f");
	// remove non-printable and other non-valid JSON chars
	json_parse = json_parse.replace(/[\u0000-\u0019]+/g, "");
	try {
		json_parse = JSON.parse(json_parse)
			return json_parse;
	} catch (err) {
		alert(err.message + " in Program Name: " + program)
	}
}
//variable set to check if XMLCCLREQUEST exists telling us we are in Millennium context
var CERN_Platform = {
	m_inMillenniumContext : null,
	m_inPatientChartContext : null,
	m_inTouchMode : false,
	m_scriptServletLoc : "",
	m_webappRoot : null,
	m_criterion : null
};
/**
 * The inMillenniumContext function can be used to determine if the the current MPage is being run from within the context of a
 * Millennium application or not.  From there the consumer can utilize Win32 pieces of functionality or gracefully degrade based on the
 * availability of alternative solutions.
 * @return {boolean} true if the mpage is being run within Millennium, false otherwise.
 */
CERN_Platform.inMillenniumContext = function () {
	if (this.m_inMillenniumContext === null) {
		this.m_inMillenniumContext = (typeof XMLCclRequest !== "undefined") ? true : false;
	}
	return this.m_inMillenniumContext;
};

/*
 * @function Create promt input for ccl script when there are multiple value possible in one parameter.
 * @param {Array} ar : The ar array contains promt .
 * @param {string} type : The type string contains 1 or o to identify when to append .00 at the end.
 */
function CreateParamArray(ar, type) {
	var returnVal = (type === 1) ? "0.0" : "0";
	if (ar && ar.length > 0) {
		if (ar.length > 1) {
			if (type === 1) {
				returnVal = "value(" + ar.join(".0,") + ".0)";
			} else {
				returnVal = "value(" + ar.join(",") + ")";
			}
		} else {
			returnVal = (type === 1) ? ar[0] + ".0" : ar[0];
		}
	}
	return returnVal;
}
/*
 * @function handle filter list base on key word
 * @param {string} textbox : The textbox string contain Id of the textbox where search words entered.
 * @param {Boolean} selectSingleMatch : The selectSingleMatch boolean value contain yes or no value.
 */

jQuery.fn.filterByText = function (textbox, selectSingleMatch) {
	return this.each(function () {
		var select = this;
		var options = [];
		$(select).find('option').each(function () {
			options.push({
				value : $(this).val(),
				text : $(this).text(),
				status : $(this).prop("disabled")
			});
		});
		$(select).data('options', options);
		$(textbox).bind('change keyup', function () {
			var options = $(select).empty().scrollTop(0).data('options');
			var search = $.trim($(this).val());
			if (ambclearkeyeventind === 1 || ambclearkeyeventindhp === 1) {
				search = "";
				ambclearkeyeventind = 0;
				ambclearkeyeventindhp = 0;
			}
			try {
				var regex = new RegExp(search, "gi");
			} catch (e) {
				return false;
			}
			var selected_item_prsch = [];
			$('#amb-pricesch-modal-list-box  option').each(function () {
				selected_item_prsch.push($(this).val());
			});
			var selected_item_bentity = [];
			$('#amb_rvu_modal-list-box  option').each(function () {
				selected_item_bentity.push($(this).val());
			});

			$.each(options, function (i) {
				var option = options[i];
				if (option.text.match(regex) !== null) {
					if (selected_item_prsch.indexOf(option.value) !== -1) {
						option.status = "True"
					}
					if (selected_item_bentity.indexOf(option.value) !== -1) {
						option.status = "True"
					}
					$(select).append(
						$('<option>').text(option.text).val(option.value).prop("disabled", option.status));
				}
			});
			if (selectSingleMatch === true && $(select).children().length === 1) {
				$(select).children().get(0).selected = true;
			}
		})
	})
}

/*
 * @function Create promt input for ccl script when there are multiple value possible in one parameter.
 * @param {Object} JSONData : The JSONData contain data to convert .
 * @param {string} csvstring type : The csvstring string contain filter selection string
 * @param {string} showlabel type : The showlabel string will print label as well
 * @param {string} reporttitle type : The reporttitle string contain title of report
 */
function JSONToCSVConvertor(JSONData, csvstring, ShowLabel,reporttitle) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;    
    var CSV = '';    
    //Set Report title in first row or line    
    CSV += csvstring + '\r\n\n';
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
	var csvFileName = reporttitle + '.csv'
	var csvData = new Blob([CSV],{type : 'text/csv;charset=utf-8;'});
	if (window.navigator.msSaveOrOpenBlob){ // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
	    window.navigator.msSaveOrOpenBlob(csvData, csvFileName);}
	else{
		var a = window.document.createElement("a");
		a.href = window.URL.createObjectURL(csvData);
		a.download = csvFileName;
		document.body.appendChild(a);
		a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
		document.body.removeChild(a);
	}  	
}

/*
 * @function to create events for filter modal
 * @param {String} availablelist : The availablelist string contain avialable list Id.
 * @param {String} selectedlist : The selectedlist string contain selected list Id.
 * @param {String} moveleftlist : The moveleftlist string contain id of the Add button Id
 * @param {String} moverightlist : The moverightlist string contain remove button Id
 * @param {String} searchtextbox : The ssearchtextbox string contain textbox Id where user can search through filter
 * @param {String} allselectedcheckbox : The allselectedcheckbox string contains checkbox ID to signify all selected
 */
function AmbMultipleListSaveEvents(availablelist, selectedlist, moveleftlist, moverightlist, selectallavail, selectallselected, selectallavailhide, selectallselectedhide, searchtextbox) {
	//save off elements for usage
	var availListElem = $('#' + availablelist);
	var selectedListElem = $('#' + selectedlist);
	var addBtnElem = $('#' + moveleftlist);
	var removeBtnElem = $('#' + moverightlist);
	var searchBoxElem = $('#' + searchtextbox);
	var selectallavailElem = $('#' + selectallavail);
	var selectallHideavailElem = $('#' + selectallavailhide);
	var selectallselectedElem = $('#' + selectallselected);
	var selectallHideselectedElem = $('#' + selectallselectedhide);

	if (selectedListElem.children('option').length === 0) {
		removeBtnElem.prop('disabled', true);
		selectallselectedElem.hide()
		selectallHideselectedElem.show()
	}

	selectedListElem.off("DOMNodeInserted");
	selectedListElem.on("DOMNodeInserted", function () {
		var a = availListElem.children('option').length
			removeBtnElem.prop('disabled', false);
		selectallselectedElem.show()
		selectallHideselectedElem.hide()
		if (availListElem.children('option').length === selectedListElem.children('option').length) {
			addBtnElem.prop('disabled', true);
			selectallHideavailElem.show()
			selectallavailElem.hide()
		}
	});
	availListElem.off("DOMNodeInserted");
	availListElem.on("DOMNodeInserted", function () {
		var b = selectedListElem.children('option').length;
		addBtnElem.prop('disabled', false);
		selectallavailElem.show()
		selectallHideavailElem.hide()
		if (b === 0) {
			removeBtnElem.prop('disabled', true);
			selectallselectedElem.hide()
			selectallHideselectedElem.show()
		}
	});
	availListElem.off("dblclick");
	availListElem.on("dblclick", function (e) {
		//doublecheck it is not already added, due to select area dblclick issue
		var dblCheck = false;
		var avail_item_val = availListElem.children('option:selected').val()
			selectedListElem.children('option').each(function (i, e) {
				var current_selected_list_val = $(this).val();
				if (avail_item_val === current_selected_list_val) {
					dblCheck = true;
				}
			});
		if (dblCheck === false) {
			availListElem.children('option:selected').clone().appendTo('#' + selectedlist);
			availListElem.children('option:selected').prop('disabled', true)
			AmbSortingSingleItemList(selectedlist);
		}
		e.preventDefault();
	});
	selectedListElem.off("dblclick");
	selectedListElem.on("dblclick", function (e) {
		// make an array
		var selected_item_all = selectedListElem.children('option:selected').val()
			availListElem.children('option').each(function (i, e) {
				var current_avail_list = $(this).val();
				if (selected_item_all === current_avail_list) {
					$(this).remove();
				}
			});
		selectedListElem.children('option:selected').remove().appendTo('#' + availablelist);
		AmbSortingSingleItemList(availablelist);
		e.preventDefault();
	});
	addBtnElem.off("click");
	addBtnElem.on("click", function () {
		var dblCheck = false;
		//doublecheck they are not control clicking and getting duplicates
		if (selectedListElem.children('option').length > 0) {
			availListElem.children('option:selected').each(function (i, e) {
				dblCheck = false;
				var current_avail_option_selected = $(this).val();
				selectedListElem.children('option').each(function (i, e) {
					var current_selected_list_val = $(this).val();
					if (current_avail_option_selected == current_selected_list_val) {
						dblCheck = true;
					}
				});
				if (dblCheck === false) {
					$(this).clone().appendTo('#' + selectedlist);
					$(this).prop('disabled', true)
				}
			});
		} else {
			availListElem.children('option:selected').clone().appendTo('#' + selectedlist);
			availListElem.children('option:selected').prop('disabled', true)
		}
		AmbSortingAllItemList(selectedlist);
	});
	removeBtnElem.off("click");
	removeBtnElem.on("click", function () {
		var selected_item_array = [];
		selectedListElem.children('option:selected').each(function () {
			selected_item_array.push($(this).val());
		});
		availListElem.children('option').each(function (i, e) {
			var current_avail_list1 = $(this).val();
			if (jQuery.inArray(current_avail_list1, selected_item_array) != '-1') {
				$(this).remove();
			}
		});
		selectedListElem.children('option:selected').remove().appendTo('#' + availablelist);
		AmbSortingAllItemList(availablelist);
	});

	selectallavailElem.click(function () {
		availListElem.children('option').each(function (i, e) {
			if ($(this).is(":enabled")) {
				$(this).prop('selected', true);
			} else {
				$(this).prop('selected', false);
			}
		});
	});
	selectallselectedElem.click(function () {
		selectedListElem.children('option').prop('selected', true);
	});
	function AmbSortingSingleItemList(anchor) {
		// Convert the list options to a javascript array and sort(ascending)
		var sortedList = $.makeArray($("#" + anchor + " option"))
			.sort(function (a, b) {
				return $(a).text() < $(b).text() ? -1 : 1;
			});
		//Clear the options and add the sorted ones
		$("#" + anchor).empty().html(sortedList);
		//availListElem.filterByText($("#" + searchtextbox), true);
	}
	function AmbSortingAllItemList(anchor) {
		//Convert the list options to a javascript array and sort(ascending)
		var sortedList = $.makeArray($("#" + anchor + " option"))
			.sort(function (a, b) {
				return $(a).text() < $(b).text() ? -1 : 1;
			});
		//Clear the options and add the sorted ones
		$("#" + anchor).empty().html(sortedList);
		//availListElem.filterByText($("#" + searchtextbox), true);
	}
}

/*
 * @function Create tab dynamic.
 * @param {Array} tabArray : The tabArray array contain tab body HTML.
 * @param {string} tabid : The tabid contain Unique ID for tab
*/ 
function pwx_create_tabs(tabArray, tabid) {
	var listVar = '';
	var divVar = '';
	var tabHTML = '';
	if (tabArray.length > 0) {
		tabArray.sort(pwx_sort_num_col2_asc);
		var tabcnt = 0
			for (var i = 0; i < tabArray.length; i++) {
				tabcnt++
				//listVar += '<li style="padding:4px"><a href="#' + tabid + '-' + tabcnt + '">' + tabArray[i][0] + '</a></li>';
				divVar += '<div id="' + tabid + '-' + tabcnt + '">' + tabArray[i][1].join("") + '</div>';
			}
	}
	tabHTML += '<div id="' + tabid + '">'
	tabHTML += '<span title="Print Report" class="amb_price_rvu_print_icon amb_cursor_pointer amb_price_rvu_report_print" id="amb_price_rvu_report_click">&nbsp;&nbsp;&nbsp;&nbsp;</span>'
	tabHTML +=  divVar + '</div>';	
	return tabHTML;
}
//sort numerical ascending  on column 3function
function pwx_sort_num_col2_asc(a, b) {
	return a[2] - b[2];
}

/*
 * @function function to call a ccl script to gather data and return the json object. Flexes from xmlcclrequest
 *  to xmlhttprequest if cclrequest does not exist
 * @param {string} program : ccl program to be called
 * @param {Array} paramAr : Array of parameters to be sent to program
 * @param {boolean} async : indicating if to do an aysnc or sync call
 * @param {function} callback : function to callback after request completed
 */
function PWX_CCL_Request(program, paramAr, async, callback) {
    if (CERN_Platform.inMillenniumContext()) {		
		var info = new XMLCclRequest();//this run in millennium context i.e powerchart
	}else{
		var info = new XMLHttpRequest(); //this run outside of millenium context i.e cpm				
	}
	info.onreadystatechange = function () {
		//alert(JSON.stringify(info));
		if (info.readyState == 4 && info.status == 200) {		
			var jsonEval = ambJSONParse(this.responseText, program);
			var recordData = jsonEval.RECORD_DATA;
			if (recordData.STATUS_DATA.STATUS === "S") {
				callback.call(recordData);
			} else {
				if (log) {
					var errString = "Status: " + this.status + "</br>Request Text: " + this.requestText;
					log.info("program: " + program + "</br> Parameters: " + paramAr.join(","));
					log.info("program: " + program + "</br> Reply: " + errString);
					}
				alert("Status: " + recordData.STATUS_DATA.STATUS  );
				alert(" Request Text: " + this.requestText);
				
	   		}
		}
	};
	if (CERN_Platform.inMillenniumContext()) {	
	   info.open('GET', program, async);
	    info.send(paramAr.join(","));
	}
	else{
	   var url = program + "?parameters=" + encodeURIComponent(paramAr.join(","));
	   info.open('GET', url, async);
	   info.send(null); 	
	}
}
	
//intilize global variable here in this object
var tabcurrentname = 'Prices' //set default title
var bill_code_array = []
var price_sch_array = []
var bill_entity_array = []
var bill_code_name_report = []
var amb_pricesch_selected_modal_array = [];
var amb_rvu_selected_modal_array = [];
var amb_pricesch_selected_modal_name_report_array = [];
var amb_rvu_selected_modal_name_report_array = [];
var amb_pricesch_modal_query_ind = 0
var amb_pricesch_modal_open_count = 0;
var amb_pricesch_modal_html_save = "";
var amb_rvu_modal_query_ind = 0
var amb_rvu_modal_open_count = 0;
var amb_rvu_modal_html_save = "";
var ambclearkeyeventind = 0;
var ambclearkeyeventindhp = 0;
var ASAcode = 'ASA';

//global main object that hold all function
function PRVuMainObject() { /*object to handle export data storage*/ this.blobObj = { "RPTACCTS" : {} };}

/*
 * @function clear data for price schedule tab. 
*/
PRVuMainObject.prototype.clearPRICEObj = function () {
	if (log) {
		log.info("calling clearPRICEObj");
	}
	this.pricerecorddata = {};//data object to be clear
	this.blobObj.RPTACCTS.PRICE_BILL_INFO = [] //report object to be clear
	this.blobObj.RPTACCTS.ALL_PRICE_BILL_INFO = [] //all price schedule report object 
}

/*
 * @function clear DOM elements for price schedule tab
*/
PRVuMainObject.prototype.clearPRICEcontent = function () {
	if (log) {
		log.info("calling clearPRICEcontent");
	}   
	$("#amb_price_content_id").empty();
	$("#amb_price_content_header_id").empty();
	$("#amb_price_contain_search_txt").addClass("amb_price_contain_search_defaultTextActive");
	$("#amb_price_contain_search_txt").addClass("amb_rvu_contain_search_defaultTextActive");	
	$("#amb_price_contain_search_txt").val('Search Content within Activity Type, Charge Description, Physician Name')
	$("#amb_price_rvu_report_click").hide()						
}

/*
 * @function call CCL script to gather price schedule data
  @param {string} program : sendArr array contain promot string to CCL program
*/
PRVuMainObject.prototype.callPriceDataGather = function(sendArr, timerreqdata, timer) {
    var thiz = this;
	
	var programName = "";
	if(criterionObj.CRITERION.DRG_FLAG===1 && criterionObj.CRITERION.DRG_V2_FLAG===1)
		programName = "cme_rcm_drg_charge_v2";	
	else if(criterionObj.CRITERION.DRG_FLAG===1 && criterionObj.CRITERION.DRG_V2_FLAG ===0)
		programName = "cme_rcm_drg_charge";
	else
		programName = "me_rcm_mpage_charge_json";	
	//alert(JSON.stringify(criterionObj.CRITERION))
	//alert(programName);
    //createCheckpoint("USR:CUST:MPG.COMPONENT", "Start",[{key:"rtms.legacy.subtimerName", value: "PriceRVUmPage"},{key: "rtms.legacy.metadata.1", value:"Fetching Price"},{key: "rtms.legacy.metadata.2", value:"Price-RVU Fetch Price"}])
    log.info("Start timer to GetPriceSchedule");
	timer.setSubEvent("Start").setMetaData("rtms.legacy.subtimerName", "PriceRVUmPage").setMetaData("rtms.legacy.metadata.1", "getting price schedule").setMetaData("rtms.legacy.metadata.2", timerreqdata).publish();	 
	PWX_CCL_Request(programName, sendArr, true, function() {
        timer.setSubEvent("Stop");
        log.info("Stop timer to GetPriceSchedule");			
        timer.publish();		
        log.info("Publish timer to GetPriceSchedule");	    
        //set data to object
        //createCheckpoint("USR:CUST:MPG.COMPONENT", "Start",[{key:"rtms.legacy.subtimerName", value: "PriceRVUmPage"},{key: "rtms.legacy.metadata.1", value:"Fetching Price"},{key: "rtms.legacy.metadata.2", value:"Price-RVU Fetch Price"}])
        thiz.pricerecorddata = this;
        //call below function to paint data on screen	
        thiz.pricecontentrrow(timer);
    });
}

/*
 *@function render radio buttons (quick search and standard search) using unique ID's for PRICE and RVU both tab
  @param {Array} RadiotabArrayRender : RadiotabArrayRender array contain tab HTML for radio button area
  @param {string} radioareaID : radioareaID string contain unique ID for price and RVU tab for radio button area only
*/

PRVuMainObject.prototype.renderRadioheaderSearch = function (RadiotabArrayRender, radioareaID) {
	//create html for radio button area
	if (log) {
		log.info("calling to build Radio button for amb_price_search_radio"); //logging ID here for troubleshooting
	}
	RadiotabArrayRender.push('<div class= "cme_header_class">' );
	RadiotabArrayRender.push('<div class="dropdown"> <button class="dropbtn">Menu</button>');
    RadiotabArrayRender.push('<div class="dropdown-content">');
	if (criterionObj.CRITERION.SEC_RSC === 1){	
    RadiotabArrayRender.push('<a href="#" id="cme_apply_cr" >Apply Correction</a>');
	};
	if (criterionObj.CRITERION.SEC_RSC === 1){	
    RadiotabArrayRender.push('<a href="#" id="cme_apply_rc" >Apply Reconciliation</a>');
	};		
	if (criterionObj.CRITERION.SEC_RSI === 1){	
    RadiotabArrayRender.push('<a href="#" id="cme_apply_ic">Apply Internal Complaint</a>');
	};	
	if (criterionObj.CRITERION.SEC_BAT === 1){	
     RadiotabArrayRender.push('<a href="#" id="cme_upd_auth_btn">Batch Update Auth and Observation</a>');
	};	   
	if (criterionObj.CRITERION.SEC_CLM === 1){	
	RadiotabArrayRender.push('<a href="#" id="cme_gen_claim" >Generate and Send Claim</a>');
	};		
	if (criterionObj.CRITERION.SEC_BEN === 1){
	RadiotabArrayRender.push('<a href="#" id="cme_upd_benefit_btn" >Update Health Plan Benefits</a>');
	};	
	if (criterionObj.CRITERION.SEC_DOWN === 1){
	RadiotabArrayRender.push('<a href="#" id="cme_upd_physicians_btn" >Pull Data</a>');
	};	
	if (criterionObj.CRITERION.SEC_RECLC === 1 && !(criterionObj.CRITERION.DRG_FLAG)){
	RadiotabArrayRender.push('<a href="#" id="amb_fee_all_export_option" >Recalculate</a>');
	};
	if (criterionObj.CRITERION.SEC_RECLC === 1 && (criterionObj.CRITERION.DRG_FLAG)){
	RadiotabArrayRender.push('<a href="#" id="cme_apply_adj_drg" >DRG Recalculate</a>');
	};
	if (criterionObj.CRITERION.SEC_RECLC === 1){
	RadiotabArrayRender.push('<a href="#" id="amb_fee_all_export_option1" >Recalculate Med Necc</a>');
	};	
	if (criterionObj.CRITERION.SEC_COMMIT === 1){
	RadiotabArrayRender.push('<a href="#" id="cme_apply_adj" >Save Manual User Discounts</a>');
	};	
	if (criterionObj.CRITERION.SEC_DIS === 1){
	RadiotabArrayRender.push('<a href="#" id="cme_apply_dscnt" >Apply and Save Discount</a>');
	};	
	if (criterionObj.CRITERION.SEC_VAT === 1){
	RadiotabArrayRender.push('<a href="#" id="cme_apply_vat" >Apply VAT</a>');
	};
	if (criterionObj.CRITERION.SEC_NC === 1){
	RadiotabArrayRender.push('<a href="#" id="cme_apply_nc" >Selected charges as Non Covered</a>');
	};
	if (criterionObj.CRITERION.SEC_DEL=== 1){
	RadiotabArrayRender.push('<a href="#" id="cme_del_chrg" >Delete Selected Items</a>');
	};	
	if (criterionObj.CRITERION.SEC_HIM=== 1){	
	RadiotabArrayRender.push('<a href="#" id="cme_him_code" >View HIM Coding</a>');
	};	
		
    RadiotabArrayRender.push('</div>');
    RadiotabArrayRender.push('</div>');
	
	RadiotabArrayRender.push('<div class="amb_price_search_radio_class" id="amb_price_search_radio_id">');
	RadiotabArrayRender.push('<label class="amb_prvu_eff_date_lbl"><span class="amb_prvu_lbl_span">Begin Date: </span>',
	'<input type="text" id="amb_price_header_filter_eff_date_val" class="amb_prvu_eff_date_val" name="Effectivedate"/>',
	'</label>',
	'<label class="amb_prvu_eff_date_lbl"><span class="amb_prvu_lbl_span">End Date: </span>',
	'<input type="text" id="amb_price_header_filter_end_date_val" class="amb_prvu_eff_date_val" name="Effectivedate"/>',
	'</label>',
	'<label class="amb_prvu_eff_date_lbl"><span class="amb_prvu_lbl_span">Activity Type: </span>',
	'<input id="ActType" maxlength="10" class="price_update_box_class"></input>',
	'</label>',
	'<label class="amb_prvu_eff_date_lbl"><span class="amb_prvu_lbl_span">Exclude: </span>',
	'<select id = "noncoveredflg" class="price_update_box_class"><option  value = "-1"></option>><option  value = "1">Non Covered</option>><option  value = "2">Non Covered/Full Paid</option><option  value = "3">Non Covered/Full Paid/ Partial Paid</option></select>',
	'</label>',
	'<label class="amb_prvu_eff_date_lbl"><span class="amb_prvu_lbl_span">Include: </span>',
	'<select id = "incldflg" class="price_update_box_class"><option  value = "-1"></option>><option  value = "1">Non Covered</option>><option  value = "2">Non Covered/Full Paid</option><option  value = "3">Non Covered/Full Paid/ Partial Paid</option></select></label>');
	RadiotabArrayRender.push('   ');
	

	if (criterionObj.CRITERION.BOHP_CNT > 1 ) {
	RadiotabArrayRender.push('<select id = "bohpid" class="price_update_box_class">');
	RadiotabArrayRender.push('<option value=""></option>')
	for (var i = 0; i < criterionObj.CRITERION.BOHP_CNT; i++) {
	RadiotabArrayRender.push('<option value="' + criterionObj.CRITERION.BOHP[i].BOHP_ID + '">'+ criterionObj.CRITERION.BOHP[i].BOHP_NAME  + '</option>')	
    };   
    RadiotabArrayRender.push('</select>');
	RadiotabArrayRender.push('</div>');
	RadiotabArrayRender.push('</div>');
	}

	
	RadiotabArrayRender.push('<button id="amb_price_header_filter_qsearchbtn" class="amb_prvu_display_button" type="button">Search</button>');

	
	//RadiotabArrayRender.push('<div class="cme_header_btns_class" id="cme_header_btns_id">');
	if (criterionObj.CRITERION.BOHP_CNT === 1 ) {
	RadiotabArrayRender.push('<select id = "bohpid" class="price_update_box_class_hide">');
	for (var i = 0; i < criterionObj.CRITERION.BOHP_CNT; i++) {
	RadiotabArrayRender.push('<option value="' + criterionObj.CRITERION.BOHP[i].BOHP_ID + '">'+ criterionObj.CRITERION.BOHP[i].BOHP_NAME  + '</option>')	
    };   
    RadiotabArrayRender.push('</select>');

	}
	RadiotabArrayRender.push('</div>');
	RadiotabArrayRender.push('</div>');

		
	

	return RadiotabArrayRender
}

/*
 *@function will check logic to either enable or dither display button base off required selection 
  @param {string} currenttabname : currenttabname string current tab name
  @param {string} currentradioselection : currentradioselection string radio button currently selected
*/
PRVuMainObject.prototype.buttonditherenablelogic = function (currenttabname, currentradioselection) {
	//stores all ID's in variable for performance side so we don't refer dom everytime
	//price quick search variable

	var price_eff_q_search_txtbox = $("#amb_price_header_filter_eff_date_val")
	var price_end_q_search_txtbox = $("#amb_price_header_filter_end_date_val")
	var ncflg_q_search =  $("#noncoveredflg").val();
	var incldflg_q_search =  $("#incldflg").val();
	var bohpflg_q_search =  $("#bohpid").val();

	var price_disp_button = $("#amb_price_header_filter_qsearchbtn")

	//if current view is PRICE
	if (currenttabname === "Prices") {
			if (price_eff_q_search_txtbox.val() === "" || price_end_q_search_txtbox.val() === "") {
				price_disp_button.prop('disabled', true);
			} else {
				price_disp_button.prop('disabled', false);
			}
	} 
}

/*
 *@function will check logic to either enable or dither co-pay or deductible text inputs based on coverage 
*/
PRVuMainObject.prototype.textfieldditherenablelogic = function () {
	if($("#dentalNotCovered").is(":checked")){
		$("#dentalCopay").prop("readOnly", true);
	   	$("#dentalDeductible").prop("readOnly", true);
	   	$('#dentalCopay').addClass('input-disabled');
	   	$('#dentalDeductible').addClass('input-disabled');
	}
	else{
	   	$("#dentalCopay").prop("readOnly", false);
	   	$("#dentalDeductible").prop("readOnly", false);
	  	$('#dentalCopay').removeClass('input-disabled');
	  	$('#dentalDeductible').removeClass('input-disabled');
	}
	if($("#OpticalNotCovered").is(":checked")){
		$("#OpticalCopay").prop("readOnly", true);
	   	$("#OpticalDeductible").prop("readOnly", true);
	   	$('#OpticalCopay').addClass('input-disabled');
	   	$('#OpticalDeductible').addClass('input-disabled');
	}
	else{
	   	$("#OpticalCopay").prop("readOnly", false);
	   	$("#OpticalDeductible").prop("readOnly", false);
	  	$('#OpticalCopay').removeClass('input-disabled');
	  	$('#OpticalDeductible').removeClass('input-disabled');
	}
	if($("#MaternityNotCovered").is(":checked")){
		$("#MaternityCopay").prop("readOnly", true);
	   	$("#MaternityDeductible").prop("readOnly", true);
	   	$('#MaternityCopay').addClass('input-disabled');
	   	$('#MaternityDeductible').addClass('input-disabled');
	}
	else{
	   	$("#dentalCopay").prop("readOnly", false);
	   	$("#dentalDeductible").prop("readOnly", false);
	  	$('#dentalCopay').removeClass('input-disabled');
	  	$('#dentalDeductible').removeClass('input-disabled');
	}
	if($("#MaternityNotCovered").is(":checked")){
		$("#MaternityCopay").prop("readOnly", true);
	   	$("#MaternityDeductible").prop("readOnly", true);
	   	$('#MaternityCopay').addClass('input-disabled');
	   	$('#MaternityDeductible').addClass('input-disabled');
	}
	else{
	   	$("#MaternityCopay").prop("readOnly", false);
	   	$("#MaternityDeductible").prop("readOnly", false);
	  	$('#MaternityCopay').removeClass('input-disabled');
	  	$('#MaternityDeductible').removeClass('input-disabled');
	}
	if($("#LaboratoryNotCovered").is(":checked")){
		$("#LaboratoryCopay").prop("readOnly", true);
	   	$("#LaboratoryDeductible").prop("readOnly", true);
	   	$('#LaboratoryCopay').addClass('input-disabled');
	   	$('#LaboratoryDeductible').addClass('input-disabled');
	}
	else{
	   	$("#LaboratoryCopay").prop("readOnly", false);
	   	$("#LaboratoryDeductible").prop("readOnly", false);
	  	$('#LaboratoryCopay').removeClass('input-disabled');
	  	$('#LaboratoryDeductible').removeClass('input-disabled');
	}
	if($("#RadiologyNotCovered").is(":checked")){
		$("#RadiologyCopay").prop("readOnly", true);
	   	$("#RadiologyDeductible").prop("readOnly", true);
	   	$('#RadiologyCopay').addClass('input-disabled');
	   	$('#RadiologyDeductible').addClass('input-disabled');
	}
	else{
	   	$("#RadiologyCopay").prop("readOnly", false);
	   	$("#RadiologyDeductible").prop("readOnly", false);
	  	$('#RadiologyCopay').removeClass('input-disabled');
	  	$('#RadiologyDeductible').removeClass('input-disabled');
	}
}

/*
 * @function kick off Price Rvu Sch page. Create main object/html, create header, create filter modal, and basic page level events
 */
function RenderPRVuFrame() {
    //testing set screensize on top so I know size. will probably need a warning if too small? if 1024 works then not needed.
    var scrnwidth = $(window).width();
	
    //set criterion
    criterionObj = JSON.parse(m_criterionJSON); //   33379982.00
//	alert("V1")
//alert(m_criterionJSON) // pdtest


    var timer = new REFTimer("REF", "timertest", "USR:CUST:MPG.COMPONENT");	
	//set date locale
    // Choose Date Format by Locale
    var localeId = criterionObj.CRITERION.LOCALE_ID.substring(0, 2).toLowerCase();
    ledgerDateFormat = "MM/dd/yyyy";
    //localeId = "de" // use for testing
    if (localeId == "en")
        ledgerDateFormat = "MM/dd/yyyy"; // English
    else if (localeId == "de")
        ledgerDateFormat = "dd.MM.yyyy"; // German
    else if (localeId == "fr")
        ledgerDateFormat = "dd/MM/yyyy"; // French
    else if (localeId == "es")
        ledgerDateFormat = "dd/MM/yyyy"; // Spanish
    //get framework level dom ID and class
    var tabcreate = document.getElementById('amb_PRVu_head');
    //tab area
    var mainpageObject = new PRVuMainObject();
    var PRVutabid = 'ambPRvutabs';
    var PRVutabCount = 0;
    var PRVucontentArray = new Array()
	
	
    PRVutabCount++;
    PRVucontentArray.length = PRVutabCount;
    PRVucontentArray[PRVutabCount - 1] = new Array(1);
    PRVucontentArray[PRVutabCount - 1][0] = 'Charges';
    PRVucontentArray[PRVutabCount - 1][1] = [];
    //add price sch header div before we call individual tab related info
    PRVucontentArray[PRVutabCount - 1][1].push("<div id='amb_prvu_price_main_div' class='amb_prvu_main_header_price_div'>")
    PRVucontentArray[PRVutabCount - 1][1].push(mainpageObject.renderRadioheaderSearch(PRVucontentArray[PRVutabCount - 1][1], "amb_price_search_radio"))
    PRVucontentArray[PRVutabCount - 1][1].push('</div>')
    //main Price search div goes here
	PRVucontentArray[PRVutabCount - 1][1].push('<div id="amb_price_search_main_content_id" class="amb_price_search_main_content_class">')	


    PRVucontentArray[PRVutabCount - 1][1].push('<button id="amb_price_content_searchbtn" class="amb_price_content_sbuttonclass" type="button">Filter</button>');
    PRVucontentArray[PRVutabCount - 1][1].push('<input type="text" title="Search Content within Activity Type, Charge Description, Physician Name" class="amb_price_contain_search amb_price_contain_search_defaultText" id="amb_price_contain_search_txt"/>');
    PRVucontentArray[PRVutabCount - 1][1].push('<input type="text" title="Search Content within Activity Type, Charge Description, Physician Name" class="amb_price_contain_search amb_price_contain_search_defaultText" style="display:none" id="amb_price_contain_search_txt_nokeyup"/>');
    PRVucontentArray[PRVutabCount - 1][1].push('</div>')
    //start main contain area to fill out price schedule data
    PRVucontentArray[PRVutabCount - 1][1].push('<div id="amb_price_main_content_id" class="amb_price_main_content_class">')
    PRVucontentArray[PRVutabCount - 1][1].push('<div id="amb_price_content_header_id" class="amb_price_content_header_class">')
    PRVucontentArray[PRVutabCount - 1][1].push('</div>')
    PRVucontentArray[PRVutabCount - 1][1].push('<div id="amb_price_content_id" class="amb_price_content_class">')
    PRVucontentArray[PRVutabCount - 1][1].push('</div>')
    PRVucontentArray[PRVutabCount - 1][1].push('</div>')
    PRVucontentArray[PRVutabCount - 1][1].push('<div style="clear: both;"></div>')

    var displayHTML = pwx_create_tabs(PRVucontentArray, PRVutabid)
    tabcreate.innerHTML = displayHTML
    //hide RVU on intial load
    $(".amb_rvu_header_filter_standardsearch").hide()
    //when tab click then load RVU header
    $('#' + PRVutabid).tabs({
        activate: function(event, ui) {
            var array = ui.newPanel.selector.split("-")
                mainpageObject.pricebuildheaderrow();
				 $('#amb_price_rvu_tfoot_id').hide();
           }
    })
    $('#amb_price_header_filter_bill_cd_dp').chosen({
        no_results_text: "No results matched"
    });
    $('#amb_price_header_filter_act_type_dp').chosen({
        no_results_text: "No results matched"
    });
    //This area execute when user select dates
    var dates = $("#amb_price_header_filter_eff_date_val,#amb_price_header_filter_end_date_val").datepicker({
        changeMonth: true,
        changeYear: true,
        onSelect: function(selectedDate) {
            instance = $(this).data("datepicker"),
            date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
            dates.not(this).datepicker("option", date);
            if (tabcurrentname === "Prices") {
                mainpageObject.buttonditherenablelogic(tabcurrentname, $('input[type=radio][name=amb_price_search_radio]:checked').attr('id'))
            } }
    });

    $(".amb_price_header_filter_qsearch").show();
    $("#amb_price_header_filter_eff_date_val").show();
	$("#amb_price_header_filter_end_date_val").show();
	var beginDate = $.datepicker.parseDate("dd-mm-yy",  criterionObj.CRITERION.ADMITDATE);
	var endDate = $.datepicker.parseDate("dd-mm-yy" , criterionObj.CRITERION.DISCHDATE);
	$("#amb_price_header_filter_eff_date_val").datepicker("setDate", beginDate);
	$("#amb_price_header_filter_end_date_val").datepicker("setDate", endDate);
	
	
	$("#amb_price_header_filter_eff_date_val").datepicker({
        changeMonth: true,
        changeYear: true,
		onSelect: function(selectedDate) {
			instance = $(this).data("datepicker"),
			date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
			dates.not(this).datepicker("option", date);
			mainpageObject.buttonditherenablelogic(tabcurrentname, $('input[type=radio][name=amb_price_search_radio]:checked').attr('id'))
		}
	});
	$("#amb_price_header_filter_end_date_val").datepicker({
        changeMonth: true,
        changeYear: true,
		onSelect: function(selectedDate) {
			instance = $(this).data("datepicker"),
			date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
			dates.not(this).datepicker("option", date);
			mainpageObject.buttonditherenablelogic(tabcurrentname, $('input[type=radio][name=amb_price_search_radio]:checked').attr('id'))
		}
	});
    mainpageObject.buttonditherenablelogic(tabcurrentname, $('input[type=radio][name=amb_price_search_radio]:checked').attr('id'))
    mainpageObject.clearPRICEObj();
	mainpageObject.clearPRICEcontent();
    mainpageObject.pricebuildheaderrow();
	$('#amb_price_rvu_tfoot_id').hide();

    //dither display button on load untill proper filter selected
    //$('button#amb_price_header_filter_qsearchbtn').prop('disabled', true);

    //start tracking change event on all filter so we know when to turn on and when to turn off display button
    var price_header_event = $('#amb_prvu_price_main_div');

    //track manual change in calender text box to make sure button will be dither
    $("#amb_price_header_filter_eff_date_val,#amb_price_header_filter_ss_eff_date_val").keyup(function() {
        if (tabcurrentname === "Prices") {
            mainpageObject.buttonditherenablelogic(tabcurrentname, $('input[type=radio][name=amb_price_search_radio]:checked').attr('id'))
        } 
    });

    //default text on search textbox for content search area
    $(".amb_price_contain_search_defaultText").focus(function(srcc) {
        if ($(this).val() == $(this)[0].title) {
            $(this).removeClass("amb_price_contain_search_defaultTextActive");
            $(this).val("");
        }
    });
    $(".amb_price_contain_search_defaultText").blur(function() {
        if ($(this).val() == "") {
            $(this).addClass("amb_price_contain_search_defaultTextActive");
            $(this).val($(this)[0].title);
        }
    });
    $(".amb_price_contain_search_defaultText").blur();

    //call price header here to get only header area built on
    mainpageObject.pricebuildheaderrow()
	$('#amb_price_rvu_tfoot_id').hide();

    //kick off quick or standard search Price Schedule data gather upon clicking on display button
    price_header_event.off('click', '#amb_price_header_filter_qsearchbtn,#amb_price_header_filter_ssearchbtn')
    price_header_event.on('click', '#amb_price_header_filter_qsearchbtn,#amb_price_header_filter_ssearchbtn', function(event) {
        var pricesendArr = [];
		var timerreqdata = [];
		var timerreqdatapush = [];

        var effdate = $("#amb_price_header_filter_eff_date_val").val();
		var enddate = $("#amb_price_header_filter_end_date_val").val();
		var ncflg = "0"
		var ncflg = $("#noncoveredflg").val();
		var incflg =  "0"
		var incflg =  $("#incldflg").val();
		var bohpflg =  "0"
		var bohpflg =  $("#bohpid").val();
		var ActTypeflg = "0"
		var ActTypeflg =  $("#ActType").val();
		

		var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
		var PriceSchArray = CreateParamArray(price_sch_array, 1);
		var BillCodeArray = CreateParamArray(bill_code_array, 1);
		if ($(this).attr("id") === 'amb_price_header_filter_qsearchbtn') {
            pricesendArr = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^", "^" + ncflg + "^", "^" + incflg + "^", "^" + bohpflg + "^", "^" +  ActTypeflg + "^"];
			timerreqdatapush.push("searchType: quicksearch");
			timerreqdatapush.push("Date: "+effdate);
			timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
			timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
			timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
			timerreqdatapush.push("ActivityType: All");
			timerreqdatapush.push("Exclude0: Yes");
			timerreqdata = timerreqdatapush.join(",");
		
		}         
		$("tbody#amb_price_tbody_id").empty()
        $("#amb_price_error_row_id").empty()
        $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
        mainpageObject.clearPRICEObj(); //always clear object before it can used
		
        mainpageObject.callPriceDataGather(pricesendArr, timerreqdata, timer) //call data gather script
    });
	
	
	$('#selectAllChgs').click(function() {
		var isChecked = $(this).prop("checked");
		var allpricerow = $("#amb_price_tbody_id tr")
		allpricerow.find('input[type="checkBox"]:visible').prop('checked', isChecked);
	});
	
	$('#amb_price_tbody_id tr:has(td)').find('input[type="checkBox"]').click(function() {
    var isChecked = $(this).prop("checked");
    var isHeaderChecked = $("#selectAllChgs").prop("checked");
    if (isChecked == false && isHeaderChecked)
      $("#selectAllChgs").prop('checked', isChecked);
    else {
      $('#amb_price_tbody_id tr:has(td)').find('input[type="checkBox"]').each(function() {
        if ($(this).prop("checked") == false)
          isChecked = false;
      });
      console.log(isChecked);
      $("#selectAllChgs").prop('checked', isChecked);
    }
	});


    $("#amb_price_rvu_report_click").click(function() {
        if (tabcurrentname === "Prices") {
            mainpageObject.buildreportfilterstring(price_sch_array_name_report)
        } 
    })
   //Recalulate
    $("#amb_fee_all_export_option").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';

		
		modaltitle = 'Recalculate';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to recalculate.";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					document.getElementById("amb_fee_all_export_option").disabled = true;
					document.getElementById("amb_fee_all_export_option").style.backgroundColor = "#A9A9A9";
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("OEN_DIMENSION_MPAGE_DFT_V4", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Recalulate successfully Complete.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});

 $("#cme_apply_adj_drg").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';
				
		modaltitle = 'Post Adjustment(s)';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to post adjustment(s).";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("ME_RCM_APPLY_ADJUST_DRG", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Adjustment(s) posted successfully.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});
		
		
	//Recalulate12
    $("#amb_fee_all_export_option1").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';

		
		modaltitle = 'Recalculate';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to recalculate.";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					document.getElementById("amb_fee_all_export_option").disabled = true;
					document.getElementById("amb_fee_all_export_option").style.backgroundColor = "#A9A9A9";
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("OEN_DIMENSION_MPAGE_MNDFT_V4", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Recalulate successfully Complete.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});



			
		//Apply Claim data Phys + auths
    $("#cme_upd_physicians_btn").click(function() {
		var modaltitle = '';
		var buttontitle = '';
				
		modaltitle = 'Post Automatic Claim Data';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
		
		});
		
		
					
					var applyPhysArr  = [];					
					applyPhysArr = [criterionObj.CRITERION.ENCNTRID + ".0"];		
					
					PWX_CCL_Request("ME_RCM_GET_CLM_DATA", applyPhysArr, true, function () {	
				
						
						var sucess_text = "Data posted successfully to charge lines";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	         	
		});
	
	//Apply Adjustments
    $("#cme_apply_adj").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';
				
		modaltitle = 'Post Adjustment(s)';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to post adjustment(s).";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("ME_RCM_APPLY_ADJUST", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Adjustment(s) posted successfully.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});

//Apply VAT
    $("#cme_apply_vat").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';
				
		modaltitle = 'Post VAT';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to post VAT).";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("ME_RCM_APPLY_VAT", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Adjustment(s) posted successfully.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});

//Apply Resub RC
    $("#cme_apply_rc").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';
				
		modaltitle = 'Post Resub Correction';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to post Correction Resub Code.";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("ME_RCM_APPLY_RC", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Resubmission CR codes(s) posted successfully.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});



//Apply Resub CR
    $("#cme_apply_cr").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';
				
		modaltitle = 'Post Resub Correction';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to post Correction Resub Code.";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("ME_RCM_APPLY_CR", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Resubmission CR codes(s) posted successfully.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});

//Apply Resub nc
    $("#cme_apply_nc").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';
				
		modaltitle = 'Post Non-Covered Correction';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to post Non-Covered Correction.";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("ME_RCM_APPLY_NC", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Non Covered(s) posted successfully.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});

//Apply Resub IC
    $("#cme_apply_ic").click(function() {
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';
				
		modaltitle = 'Post Resub Internal ';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to post Correction Resub Code.";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }else{
					
					var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("ME_RCM_APPLY_IC", applyAdjArr, true, function () {	
				
						
						var sucess_text = "Resubmision IC Code(s) posted successfully.";
						var notificationtitle = ""+modaltitle+" Notification"
						MP_ModalDialog.deleteModalDialogObject("successmodal")
						var feenotificationModalobj = new ModalDialog("successmodal")
							.setHeaderTitle(notificationtitle)
							.setTopMarginPercentage(30)
							.setRightMarginPercentage(35)
							.setBottomMarginPercentage(30)
							.setLeftMarginPercentage(35)
							.setIsBodySizeFixed(true)
							.setHasGrayBackground(true)
							.setIsFooterAlwaysShown(true);
						feenotificationModalobj.setBodyDataFunction(
						function (modalObj){
								modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
							}
						);
					   
						var closebtn = new ModalButton("addCancel");
						closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						//refresh current selection upon Ok button click
							var sendArrafterpriceupdate  = [];
							var timerreqdatapush = [];
							var timerreqdata = [];
							var effdate = $("#amb_price_header_filter_eff_date_val").val();
							var enddate = $("#amb_price_header_filter_end_date_val").val();
							var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
							var PriceSchArray = CreateParamArray(price_sch_array, 1);
							var BillCodeArray = CreateParamArray(bill_code_array, 1);
			
							MP_ModalDialog.closeModalDialog("successmodal");
							sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
							timerreqdatapush.push("searchType: quicksearch");
							timerreqdatapush.push("Date: "+effdate);
							timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
							timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
							timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
							timerreqdatapush.push("ActivityType: All");
							timerreqdatapush.push("Exclude0: Yes");
							timerreqdata = timerreqdatapush.join(",");	
							 
							$("tbody#amb_price_tbody_id").empty();
							$("#amb_price_error_row_id").empty();
							$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
							mainpageObject.clearPRICEObj(); //always clear object before it can used
							mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
						});
						
						feenotificationModalobj.addFooterButton(closebtn)
						MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
						MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
						$('.dyn-modal-hdr-close').css('display','none')				
				});
	        } 	
		});

	//update Benefits
    $("#cme_upd_benefit_btn").click(function(){
    	var personId = [];
    	personId = ["^MINE^",criterionObj.CRITERION.PERSONID + ".0"];	
    	var benefits = [];
    	$("tbody#amb_price_tbody_id").empty();
		$("#amb_price_error_row_id").empty();
		$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');

		function search(nameKey, myArray){
		    for (var i=0; i < myArray.length; i++) {
		        if (myArray[i].BENEFITNAME === nameKey) {
		            return myArray[i];
		        }
		    }
		}

		PWX_CCL_Request("CME_RCM_GET_BENEFITS", personId, true, function(){

			var modaltitle = '';
			var successmsg = ''
			var modifyind = 0;
			var buttontitle = '';
			var benefitUpdateHTML = [];  
//			var benefits = [];

			benefitData = this;
			//alert(JSON.stringify(benefitData.BENEFIT));
			modaltitle = 'Benefit Update';successmsg='Updated';buttontitle = 'Update';modifyind = 1;
			
			benefitData.BENEFIT.forEach(function(benefit){
				benefitObj = {};
				benefitObj["benefitName"] = benefit.BENEFITNAME;
				benefitObj["personInfoId"] = benefit.PERSON_INFO_ID;
				benefitObj["valueCd"] = benefit.VALUE_CD;
				benefitObj["longTextID"] = benefit.LONG_TEXT_ID;
				benefitObj["longText"] = benefit.LONG_TEXT;
				benefits.push(benefitObj);
			});		

			benefitUpdateHTML.push('<div id="benefit-cont" class="benefit-hdr-cont">');
			benefitUpdateHTML.push('<div class="benefit-hdr-title">');
			benefitUpdateHTML.push('<span>General Benefits</span>');
			benefitUpdateHTML.push('</div>');
			benefitUpdateHTML.push('<div class="benefits-item">');
			benefitUpdateHTML.push('<div class="general-benefits-item">');
			benefitUpdateHTML.push('<label for= "OPCopay" class="gen_copay_label">OutPatient Co-pay %</label>');
			benefitUpdateHTML.push('<input type="text" id="OPCopay" maxlength="6" class="copay_text_input"></input>');	
			benefitUpdateHTML.push('<label for= "consultCopay" class="gen_copay_label">Consultation Co-pay %</label>');
			benefitUpdateHTML.push('<input type="text" id="consultCopay" maxlength="6" class="copay_text_input"></input>');		
			benefitUpdateHTML.push('<label for= "consultDeductible" class="gen_deductible_label">Consultation Deductible</label>');
			benefitUpdateHTML.push('<input type="text" id="consultDeductible" maxlength="6" class="deductible_text_input"></input>');
			benefitUpdateHTML.push('</div>');

			benefitUpdateHTML.push('<div class="general-benefits-item">');
			benefitUpdateHTML.push('<label for= "IPCopay" class="gen_copay_label">Inpatient Co-pay %</label>');
			benefitUpdateHTML.push('<input type="text" id="IPCopay" maxlength="6" class="copay_text_input"></input>');
			benefitUpdateHTML.push('<label for= "pharmacyCopay" class="gen_copay_label">Co-participation Pharmacy %</label>');
			benefitUpdateHTML.push('<input type="text" id="pharmacyCopay" maxlength="6" class="copay_text_input"></input>');
			benefitUpdateHTML.push('<label for= "outOfPocket" class="gen_deductible_label">Out of Pocket Limit</label>');
			benefitUpdateHTML.push('<input type="text" id="outOfPocket" maxlength="6" class="copay_text_input"></input>');		
			benefitUpdateHTML.push('</div>');
			benefitUpdateHTML.push('</div>');
			

		    benefitUpdateHTML.push('<div id="benefit-cont">');
			benefitUpdateHTML.push('<div class="benefit-hdr-title">');
			benefitUpdateHTML.push('<span>Laboratory Benefits</span>');
			benefitUpdateHTML.push('</div>');
			benefitUpdateHTML.push('<div class="benefits-item">');
			benefitUpdateHTML.push('<label class="benefit-coverage">Laboratory Cover?</label>');
			benefitUpdateHTML.push('<label class="radioSelectionLabelYes">Yes</label>');
			benefitUpdateHTML.push('<input type="radio" name="LaboratoryRadio" id="LaboratoryCovered" value="Yes" class="radioSelectionYes" checked></input>');
			benefitUpdateHTML.push('<label class="radioSelectionLabelNo">No</label>');
			benefitUpdateHTML.push('<input type="radio" name="LaboratoryRadio" id="LaboratoryNotCovered" value="No" class="radioSelectionNo"></input>');		
			benefitUpdateHTML.push('<label for= "LaboratoryCopay" class="copay_label">Laboratory Co-pay %</label>');
			benefitUpdateHTML.push('<input type="text" id="LaboratoryCopay" maxlength="6" class="copay_text_input"></input>');		
			benefitUpdateHTML.push('<label for= "LaboratoryDeductible" class="deductible_label">Laboratory Deductible</label>');
			benefitUpdateHTML.push('<input type="text" id="LaboratoryDeductible" maxlength="6" class="deductible_text_input"></input>');
			benefitUpdateHTML.push('</div>');
		    

		    
			benefitUpdateHTML.push('<div class="benefit-hdr-title">');
			benefitUpdateHTML.push('<span>Radiology Benefits</span>');
			benefitUpdateHTML.push('</div>');
			benefitUpdateHTML.push('<div class="benefits-item">');
			benefitUpdateHTML.push('<label class="benefit-coverage">Radiology Cover?</label>');
			benefitUpdateHTML.push('<label class="radioSelectionLabelYes">Yes</label>');
			benefitUpdateHTML.push('<input type="radio" name="RadiologyRadio" id="RadiologyCovered" value="Yes" class="radioSelectionYes" checked></input>');
			benefitUpdateHTML.push('<label class="radioSelectionLabelNo">No</label>');
			benefitUpdateHTML.push('<input type="radio" name="RadiologyRadio" id="RadiologyNotCovered" value="No" class="radioSelectionNo"></input>');		
			benefitUpdateHTML.push('<label for= "RadiologyCopay" class="copay_label">Radiology Co-pay %</label>');
			benefitUpdateHTML.push('<input type="text" id="RadiologyCopay" maxlength="6" class="copay_text_input"></input>');		
			benefitUpdateHTML.push('<label for= "RadiologyDeductible" class="deductible_label">Radiology Deductible</label>');
			benefitUpdateHTML.push('<input type="text" id="RadiologyDeductible" maxlength="6" class="deductible_text_input"></input>');
			benefitUpdateHTML.push('</div>');
		    

		    
			//benefitUpdateHTML.push('<div class="benefit-hdr-title">');
			//benefitUpdateHTML.push('<span>Maternity Benefits</span>');
			//benefitUpdateHTML.push('</div>');
			//benefitUpdateHTML.push('<div class="benefits-item">');
			//benefitUpdateHTML.push('<label class="benefit-coverage">Maternity Cover?</label>');
			//benefitUpdateHTML.push('<label class="radioSelectionLabelYes">Yes</label>');
			//benefitUpdateHTML.push('<input type="radio" name="MaternityRadio" id="MaternityCovered" value="Yes" class="radioSelectionYes" checked></input>');
			//benefitUpdateHTML.push('<label class="radioSelectionLabelNo">No</label>');
			//benefitUpdateHTML.push('<input type="radio" name="MaternityRadio" id="MaternityNotCovered" value="No" class="radioSelectionNo"></input>');		
			//benefitUpdateHTML.push('<label for= "MaternityCopay" class="copay_label">Maternity Co-pay %</label>');
			//benefitUpdateHTML.push('<input type="text" id="MaternityCopay" maxlength="6" class="copay_text_input"></input>');		
			//benefitUpdateHTML.push('<label for= "MaternityDeductible" class="deductible_label">Maternity Deductible</label>');
			//benefitUpdateHTML.push('<input type="text" id="MaternityDeductible" maxlength="6" class="deductible_text_input"></input>');
			//benefitUpdateHTML.push('</div>');
		    

		    
			benefitUpdateHTML.push('<div class="benefit-hdr-title">');
			benefitUpdateHTML.push('<span>Optical Benefits</span>');
			benefitUpdateHTML.push('</div>');
			benefitUpdateHTML.push('<div class="benefits-item">');
			benefitUpdateHTML.push('<label class="benefit-coverage">Optical Cover?</label>');
			benefitUpdateHTML.push('<label class="radioSelectionLabelYes">Yes</label>');
			benefitUpdateHTML.push('<input type="radio" name="OpticalRadio" id="OpticalCovered" value="Yes" class="radioSelectionYes" checked></input>');
			benefitUpdateHTML.push('<label class="radioSelectionLabelNo">No</label>');
			benefitUpdateHTML.push('<input type="radio" name="OpticalRadio" id="OpticalNotCovered" value="No" class="radioSelectionNo"></input>');		
			benefitUpdateHTML.push('<label for= "OpticalCopay" class="copay_label">Optical Co-pay %</label>');
			benefitUpdateHTML.push('<input type="text" id="OpticalCopay" maxlength="6" class="copay_text_input"></input>');		
			benefitUpdateHTML.push('<label for= "OpticalDeductible" class="deductible_label">Optical Deductible</label>');
			benefitUpdateHTML.push('<input type="text" id="OpticalDeductible" maxlength="6" class="deductible_text_input"></input>');
			benefitUpdateHTML.push('</div>');
		    
		    
			benefitUpdateHTML.push('<div class="benefit-hdr-title">');
			benefitUpdateHTML.push('<span>Dental Benefits</span>');
			benefitUpdateHTML.push('</div>');
			benefitUpdateHTML.push('<div class="benefits-item">');
			benefitUpdateHTML.push('<label class="benefit-coverage">Dental Cover?</label>');
			benefitUpdateHTML.push('<label class="radioSelectionLabelYes">Yes</label>');
			benefitUpdateHTML.push('<input type="radio" name="dentalRadio" id="dentalCovered" value="Yes" class="radioSelectionYes" checked></input>');
			benefitUpdateHTML.push('<label class="radioSelectionLabelNo">No</label>');
			benefitUpdateHTML.push('<input type="radio" name="dentalRadio" id="dentalNotCovered" value="No" class="radioSelectionNo"></input>');		
			benefitUpdateHTML.push('<label for= "dentalCopay" class="copay_label">Dental Co-pay %</label>');
			benefitUpdateHTML.push('<input type="text" id="dentalCopay" maxlength="6" class="copay_text_input"></input>');		
			benefitUpdateHTML.push('<label for= "dentalDeductible" class="deductible_label">Dental Deductible</label>');
			benefitUpdateHTML.push('<input type="text" id="dentalDeductible" maxlength="6" class="deductible_text_input"></input>');
			benefitUpdateHTML.push('</div>');
		    benefitUpdateHTML.push('</div>');

		    MP_ModalDialog.deleteModalDialogObject("benefitUpdate")
		    var benefitUpdatemodalobj = new ModalDialog("benefitUpdate")		
		   	.setHeaderTitle(modaltitle)		
		   	.setTopMarginPercentage(10)
		   	.setRightMarginPercentage(20)
		   	.setBottomMarginPercentage(10)
		   	.setLeftMarginPercentage(20)
		   	.setIsBodySizeFixed(true)
		   	.setHasGrayBackground(true)
		   	.setIsFooterAlwaysShown(true);
		   	benefitUpdatemodalobj.setBodyDataFunction(function (modalObj){
		   		modalObj.setBodyHTML(benefitUpdateHTML.join(""));
		    });

		    	    	
	    	var actionbtn = new ModalButton("chgupdatebtn");		
	    	actionbtn.setText(buttontitle).setCloseOnClick(false).setIsDithered(true).setOnClickFunction(function () {
			//price update or Add (disable button after 1click)
				var benefitsUpd = [];
				var allInputs = $("#benefit-cont input");
				var benefitUpdArr  = [];
				var matAdded = false;
				var labAdded = false;	
				var radAdded = false;
				var dentalAdded = false;
				var opticalAdded = false;

				allInputs.each(function(e) {
				    // if it has a value, increment the counter
				    benefitObj = {};
				    switch(this.id){
				    	case 'OPCopay':	
										var OPCopayObj = search("Copay OP",benefitData.BENEFIT);
					    				if(OPCopayObj){
						    				OPCopayObj["LONG_TEXT"] = 	$("#OPCopay").val();	    				
											benefitsUpd.push(OPCopayObj);
										}
				    	break;
				    	case 'consultCopay': 
				    						var consultCopayObj = search("Copay Consult",benefitData.BENEFIT);
							    			if(consultCopayObj){
								    			consultCopayObj["LONG_TEXT"] = 	$("#consultCopay").val();	    				
												benefitsUpd.push(consultCopayObj);
											}
				    	break;
				    	case 'consultDeductible':	
				    					var consultDeductibleObj = search("Deduct Consult",benefitData.BENEFIT);
					    				if(consultDeductibleObj){
						    				consultDeductibleObj["LONG_TEXT"] = 	$("#consultDeductible").val();	    				
											benefitsUpd.push(consultDeductibleObj);
										}
				    	break;
				    	case 'IPCopay': 
				    						var IPCopayObj = search("Copay IP",benefitData.BENEFIT);
							    			if(IPCopayObj){
								    			IPCopayObj["LONG_TEXT"] = 	$("#IPCopay").val();	    				
												benefitsUpd.push(IPCopayObj);
											}
				    	break;
				    	case 'pharmacyCopay':
				    					var pharmacyCopayObj = search("COPAY PHARMA",benefitData.BENEFIT);
				    					if(pharmacyCopayObj){
						    				pharmacyCopayObj["LONG_TEXT"] = $("#pharmacyCopay").val();	    				
											benefitsUpd.push(pharmacyCopayObj);
										}
				    	break;
				    	case 'outOfPocket': 
				    						var outOfPocketObj = search("OOP Limit",benefitData.BENEFIT);
							    			if(outOfPocketObj){
								    			outOfPocketObj["LONG_TEXT"] = 	$("#outOfPocket").val();	    				
												benefitsUpd.push(outOfPocketObj);
											}
				    	break;
				    	case 'LaboratoryCopay': 
				    						var LabCoPayObj = search("Copay Lab",benefitData.BENEFIT);
							    			if(LabCoPayObj){
								    			LabCoPayObj["LONG_TEXT"] = 	$("#LaboratoryCopay").val();	    				
												benefitsUpd.push(LabCoPayObj);
											}
				    	break;
				    	case 'LaboratoryDeductible': 
				    						var LabDeductObj = search("Deduct Lab",benefitData.BENEFIT);
							    			if(LabDeductObj){
								    			LabDeductObj["LONG_TEXT"] = 	$("#LaboratoryDeductible").val();	    				
												benefitsUpd.push(LabDeductObj);
											}
				    	break;
				    	case 'RadiologyCopay': 
				    						var RadCoPayObj = search("Copay Rad",benefitData.BENEFIT);
							    			if(RadCoPayObj){
								    			RadCoPayObj["LONG_TEXT"] = 	$("#RadiologyCopay").val();	    				
												benefitsUpd.push(RadCoPayObj);
											}
				    	break;
				    	case 'RadiologyDeductible': 
				    						var RadDeductObj = search("Deduct Rad",benefitData.BENEFIT);
							    			if(RadDeductObj){
								    			RadDeductObj["LONG_TEXT"] = 	$("#RadiologyDeductible").val();	    				
												benefitsUpd.push(RadDeductObj);
											}
				    	break;
				    	case 'MaternityCopay': 
				    						var MatCoPayObj = search("Copay Maternity %",benefitData.BENEFIT);
							    			if(MatCoPayObj){
								    			MatCoPayObj["LONG_TEXT"] = 	$("#MaternityCopay").val();	    				
												benefitsUpd.push(MatCoPayObj);
											}
				    	break;
				    	case 'MaternityDeductible': 
				    						var MatDeductObj = search("Deductible Maternity AED",benefitData.BENEFIT);
							    			if(MatDeductObj){
								    			MatDeductObj["LONG_TEXT"] = 	$("#MaternityDeductible").val();	    				
												benefitsUpd.push(MatDeductObj);
											}
				    	break;
				    	case 'OpticalCopay': 
				    						var OpticalCoPayObj = search("Copay Optical",benefitData.BENEFIT);
							    			if(OpticalCoPayObj){
								    			OpticalCoPayObj["LONG_TEXT"] = 	$("#OpticalCopay").val();	    				
												benefitsUpd.push(OpticalCoPayObj);
											}
				    	break;
				    	case 'OpticalDeductible': 
				    						var OptDeductObj = search("Deduct Optical",benefitData.BENEFIT);
							    			if(OptDeductObj){
								    			OptDeductObj["LONG_TEXT"] = 	$("#OpticalDeductible").val();	    				
												benefitsUpd.push(OptDeductObj);
											}
				    	break;
				    	case 'dentalCopay': 
				    						var DentalCoPayObj = search("Copay Dental",benefitData.BENEFIT);
							    			if(DentalCoPayObj){
								    			DentalCoPayObj["LONG_TEXT"] = 	$("#dentalCopay").val();	    				
												benefitsUpd.push(DentalCoPayObj);
											}
				    	break;
				    	case 'dentalDeductible': 
				    						var DentalDeductObj = search("Deduct Dental",benefitData.BENEFIT);
							    			if(DentalDeductObj){
								    			DentalDeductObj["LONG_TEXT"] = 	$("#dentalDeductible").val();	    				
												benefitsUpd.push(DentalDeductObj);
											}
				    	break;
				    	case 'MaternityCovered': 
				    	case 'MaternityNotCovered':
				    						var maternityCoverObj = search("Covered Maternity Y/N",benefitData.BENEFIT);
							    			if(maternityCoverObj && !(matAdded)){
							    				if($("#MaternityNotCovered").is(":checked")){
								    				maternityCoverObj["VALUE_CD"] = 684151;	    				
												}else{
													maternityCoverObj["VALUE_CD"] = 684152;
												}
												benefitsUpd.push(maternityCoverObj);
												matAdded = true;
											}
				    	break;
				    	case 'LaboratoryCovered': 
				    	case 'LaboratoryNotCovered':
				    						var labCoverObj = search("Covered Lab",benefitData.BENEFIT);
							    			if(labCoverObj && !(labAdded)){
							    				if($("#LaboratoryNotCovered").is(":checked")){
								    				labCoverObj["VALUE_CD"] = 684151;	    				
												}else{
													labCoverObj["VALUE_CD"] = 684152;
												}
												benefitsUpd.push(labCoverObj);
												labAdded = true;
											}
				    	break;
				    	case 'RadiologyCovered': 
				    	case 'RadiologyNotCovered':
				    						var radCoverObj = search("Covered Rad",benefitData.BENEFIT);
							    			if(radCoverObj && !(radAdded)){
							    				if($("#RadiologyNotCovered").is(":checked")){
								    				radCoverObj["VALUE_CD"] = 684151;	    				
												}else{
													radCoverObj["VALUE_CD"] = 684152;
												}
												benefitsUpd.push(radCoverObj);
												radAdded = true;
											}
				    	break;
				    	case 'dentalCover': 
				    	case 'dentalNotCovered':
				    						var dentalCoverObj = search("Covered Dental",benefitData.BENEFIT);
							    			if(dentalCoverObj && !(dentalAdded)){
							    				if($("#dentalNotCovered").is(":checked")){
								    				dentalCoverObj["VALUE_CD"] = 684151;	    				
												}else{
													dentalCoverObj["VALUE_CD"] = 684152;
												}
												benefitsUpd.push(dentalCoverObj);
												dentalAdded = true;
											}
				    	break;
				    	case 'OpticalCovered': 
				    	case 'OpticalNotCovered':
				    						var opticalCoverObj = search("Covered Optical",benefitData.BENEFIT);
							    			if(opticalCoverObj && !(opticalAdded)){
							    				if($("#OpticalNotCovered").is(":checked")){
								    				opticalCoverObj["VALUE_CD"] = 684151;	    				
												}else{
													opticalCoverObj["VALUE_CD"] = 684152;
												}
												benefitsUpd.push(opticalCoverObj);
												opticalAdded = true;
											}
				    	break;


				    }
			  	});	

			  	
				//var benefitUpdStr = "{benefitRec : { benefitList :" +JSON.stringify( benefitsUpd) +"}}";
				//benefitUpdArr = ["^MINE^", "^"+benefitUpdStr+"^"];	

				var benefitUpdStr = {benefitRec : { benefitList : benefitsUpd }};
				benefitUpdArr = ["^MINE^", "~"+JSON.stringify(benefitUpdStr)+"~"];			

				//loading and other important textbox to disable so user can not modify while things running behind the scene
				$('#clwx_price_update_row_price').after('<div class="clwx_update_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to modify database. Please wait...</span></div>');
				benefitUpdatemodalobj.setFooterButtonDither("chgupdatebtn", true);
				
				//update or add script
				PWX_CCL_Request("CME_RCM_UPD_BENEFITS", benefitUpdArr, true, function () {
			        
				
					if(this.DB_UPDATE_STATUS !== "S"){		
					   //if script fail then enable textbox back so user can pick different date and price
					   $('.clwx_update_loading_div').empty()
				       benefitUpdatemodalobj.setFooterButtonDither("chgupdatebtn", false);
	                   $("#clwx_eff_updtdt_box").prop('disabled',false);			
			           $("#price_update_box_id").prop('disabled',false);				   
					   var error_text = "Failed to update database";
					   MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					   var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
					   	.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
					   	.setTopMarginPercentage(30)
					   	.setRightMarginPercentage(35)
					   	.setBottomMarginPercentage(30)
					   	.setLeftMarginPercentage(35)
					   	.setIsBodySizeFixed(true)
					   	.setHasGrayBackground(true)
					   	.setIsFooterAlwaysShown(true);
					   pwxerrorModalobj.setBodyDataFunction(
					   	function (modalObj){
					   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
					   }
					   );
					   var closebtn = new ModalButton("addCancel");
					   closebtn.setText("OK").setCloseOnClick(true);
					   pwxerrorModalobj.addFooterButton(closebtn)
					   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
					   MP_ModalDialog.showModalDialog("pwxerrormodal")				   
				    }else{
					   var sucess_text = "Benefit "+successmsg+" successfully.";
					   var notificationtitle = ""+modaltitle+" Notification"
					   MP_ModalDialog.deleteModalDialogObject("successmodal")
					   var feenotificationModalobj = new ModalDialog("successmodal")
					   	.setHeaderTitle(notificationtitle)
					   	.setTopMarginPercentage(30)
					   	.setRightMarginPercentage(35)
					   	.setBottomMarginPercentage(30)
					   	.setLeftMarginPercentage(35)
					   	.setIsBodySizeFixed(true)
					   	.setHasGrayBackground(true)
					   	.setIsFooterAlwaysShown(true);
					   feenotificationModalobj.setBodyDataFunction(
					   	function (modalObj){
					   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
					   }
					   );
					   var closebtn = new ModalButton("addCancel");
					   closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
						 //refresh current selection upon Ok button click
						 var sendArrafterpriceupdate  = [];
						 var timerreqdata = [];
						 var timerreqdatapush = [];
						 var effdate = $("#amb_price_header_filter_eff_date_val").val();
						 var enddate = $("#amb_price_header_filter_end_date_val").val();
						 var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
						 var PriceSchArray = CreateParamArray(price_sch_array, 1);
						 var BillCodeArray = CreateParamArray(bill_code_array, 1);
					     MP_ModalDialog.closeModalDialog("successmodal")
						 MP_ModalDialog.closeModalDialog("benefitUpdate")
						 sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
						 timerreqdatapush.push("searchType: quicksearch");
						timerreqdatapush.push("Date: "+effdate);
						timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
						timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
						timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
						timerreqdatapush.push("ActivityType: All");
						timerreqdatapush.push("Exclude0: Yes");
						timerreqdata = timerreqdatapush.join(",");		
						 
						 $("tbody#amb_price_tbody_id").empty()
						 $("#amb_price_error_row_id").empty()
						 $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
						 thiz.clearPRICEObj(); //always clear object before it can used
						 thiz.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer) //call data gather script		
					   })
					   feenotificationModalobj.addFooterButton(closebtn)
					   MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
					   MP_ModalDialog.showModalDialog("successmodal")  
						//Hide close icon so they can exit modal by clicking ok button
					   $('.dyn-modal-hdr-close').css('display','none')
					}
		        }); 
	    	})
		    benefitUpdatemodalobj.addFooterButton(actionbtn)

		    var closebtn = new ModalButton("addCancel");
			closebtn.setText("Cancel").setCloseOnClick(true).setOnClickFunction(function () {
			//refresh current selection upon Ok button click
				var sendArrafterpriceupdate  = [];
				var timerreqdatapush = [];
				var timerreqdata = [];
				var effdate = $("#amb_price_header_filter_eff_date_val").val();
				var enddate = $("#amb_price_header_filter_end_date_val").val();
				var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
				var PriceSchArray = CreateParamArray(price_sch_array, 1);
				var BillCodeArray = CreateParamArray(bill_code_array, 1);

				MP_ModalDialog.closeModalDialog("successmodal");
				sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
				timerreqdatapush.push("searchType: quicksearch");
				timerreqdatapush.push("Date: "+effdate);
				timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
				timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
				timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
				timerreqdatapush.push("ActivityType: All");
				timerreqdatapush.push("Exclude0: Yes");
				timerreqdata = timerreqdatapush.join(",");	
				 
				$("tbody#amb_price_tbody_id").empty();
				$("#amb_price_error_row_id").empty();
				$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
				mainpageObject.clearPRICEObj(); //always clear object before it can used
				mainpageObject.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer); //call data gather script		
			});			
			benefitUpdatemodalobj.addFooterButton(closebtn)

			MP_ModalDialog.addModalDialogObject(benefitUpdatemodalobj);
			MP_ModalDialog.showModalDialog("benefitUpdate");
			$('.dyn-modal-hdr-close').css('display','none')	
			
			$('input[type=radio]').change(function() {
				mainpageObject.textfieldditherenablelogic();
			});

			benefits.forEach(function(benefit){

			   	if(benefit.benefitName == "Copay OP" && benefit.longText !== ""){
			   		$("#OPCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Copay Consult" && benefit.longText !== ""){

			   		$("#consultCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Deduct Consult" && benefit.longText !== ""){
			   		$("#consultDeductible").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Copay IP" && benefit.longText !== ""){
			   		$("#IPCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "COPAY PHARMA" && benefit.longText !== ""){
			   		$("#pharmacyCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "OOP Limit" && benefit.longText !== ""){
			   		$("#outOfPocket").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Covered Dental" && benefit.valueCd == 684151){
			   		$("#dentalNotCovered").prop("checked", true);
			   	}else if(benefit.benefitName == "Covered Dental" && benefit.valueCd == 684152){
			   		$("#dentalCovered").prop("checked", true);
			   	}

			   	if(benefit.benefitName == "Copay Dental" && benefit.longText !== ""){
			   		$("#dentalCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Deduct Dental" && benefit.longText !== ""){
			   		$("#dentalDeductible").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Covered Optical" && benefit.valueCd == 684151){
			   		$("#OpticalNotCovered").prop("checked", true);
			   	}else if(benefit.benefitName == "Covered Dental" && benefit.valueCd == 684152){
			   		$("#OpticalCovered").prop("checked", true);
			   	}

			   	if(benefit.benefitName == "Copay Optical" && benefit.longText !== ""){
			   		$("#OpticalCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Deduct Optical" && benefit.longText !== ""){
			   		$("#OpticalDeductible").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Covered Maternity Y/N" && benefit.valueCd == 684151){
			   		$("#MaternityNotCovered").prop("checked", true);
			   	}else if(benefit.benefitName == "Covered Dental" && benefit.valueCd == 684152){
			   		$("#MaternityCovered").prop("checked", true);
			   	}

			   	if(benefit.benefitName == "Copay Maternity %" && benefit.longText !== ""){
			   		$("#MaternityCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Deductible Maternity AED" && benefit.longText !== ""){
			   		$("#MaternityDeductible").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Covered Lab" && benefit.valueCd == 684151){
			   		$("#LaboratoryNotCovered").prop("checked", true);
			   	}else if(benefit.benefitName == "Covered Dental" && benefit.valueCd == 684152){
			   		$("#LaboratoryCovered").prop("checked", true);
			   	}

			   	if(benefit.benefitName == "Copay Lab" && benefit.longText !== ""){
			   		$("#LaboratoryCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Deduct Lab" && benefit.longText !== ""){
			   		$("#LaboratoryDeductible").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Covered Rad" && benefit.valueCd == 684151){
			   		$("#RadiologyNotCovered").prop("checked", true);
			   	}else if(benefit.benefitName == "Covered Dental" && benefit.valueCd == 684152){
			   		$("#RadiologyCovered").prop("checked", true);
			   	}

			   	if(benefit.benefitName == "Copay Rad" && benefit.longText !== ""){
			   		$("#RadiologyCopay").val(benefit.longText);
			   	}

			   	if(benefit.benefitName == "Deduct Rad" && benefit.longText !== ""){
			   		$("#RadiologyDeductible").val(benefit.longText);
			   	}
			});

			mainpageObject.textfieldditherenablelogic();

		    $("#benefit-cont input").on("keypress keyup blur change",function (event) {	
			    var regexpression = /^\d+(\.\d{2})?$/;  
			    var allInputs = $("#benefit-cont input[type=text]");
				var maternityCover = $("#MaternityCovered").is(":checked");
			    var labCover = $("#LaboratoryCovered").is(":checked");
			    var dentalCover = $("#dentalCovered").is(":checked");
			    var opticalCover = $("#OpticalCovered").is(":checked");
			    var radCover = $("#RadiologyCovered").is(":checked");
			    var textInput = 0;
			    var maternityNotCover = $("#MaternityNotCovered").is(":checked");
				var labNotCover = $("#LaboratoryNotCovered").is(":checked");
				var dentalNotCover = $("#dentalNotCovered").is(":checked");
				var opticalNotCover = $("#OpticalNotCovered").is(":checked");
				var radNotCover = $("#RadiologyNotCovered").is(":checked");

			    if($(this).val().indexOf('.') > -1){
					$(this).removeAttr("maxlength","6")
				}else{
					$(this).attr("maxlength","6")
				}	

				allInputs.each(function(e) {
				    if($(this).attr("id") === 'MaternityCopay' || $(this).attr("id")==='MaternityDeductible'){
				    	if (maternityNotCover || (regexpression.test($(this).val())  &&  $(this).attr("id")==='MaternityDeductible') || ($(this).val()<=100) && $(this).attr("id")==='MaternityCopay'){
				    			textInput += 1;
				    			$(this).removeClass("inputError");
				    	}else {$(this).addClass("inputError");}  				
					}
					if($(this).attr("id") ==='LaboratoryCopay' || $(this).attr("id") === 'LaboratoryDeductible'){
						if (labNotCover || (regexpression.test($(this).val())  &&  $(this).attr("id")==='LaboratoryDeductible') || ($(this).val()<=100) && $(this).attr("id")==='LaboratoryCopay'){
						//if (regexpression.test($(this).val())  ||  labNotCover) {
				    		textInput += 1;
				    		$(this).removeClass("inputError");
				    	}else {$(this).addClass("inputError");}  			
					}
					if($(this).attr("id") ==='RadiologyCopay' || $(this).attr("id") ==='RadiologyDeductible'){
						if (radNotCover || (regexpression.test($(this).val())  &&  $(this).attr("id")==='RadiologyDeductible') || ($(this).val()<=100) && $(this).attr("id")==='RadiologyCopay'){
						//if (regexpression.test($(this).val())  ||  radNotCover) {
				    		textInput += 1;
				    		$(this).removeClass("inputError");
				    	}else {$(this).addClass("inputError");}        				
					}
					if($(this).attr("id") === 'dentalCopay' || $(this).attr("id") === 'dentalDeductible'){
						//if (regexpression.test($(this).val())   || dentalNotCover) {
						if (dentalNotCover || (regexpression.test($(this).val())  &&  $(this).attr("id")==='dentalDeductible') || ($(this).val()<=100) && $(this).attr("id")==='dentalCopay'){
				    		textInput += 1;
				    		$(this).removeClass("inputError");
				    	}else {$(this).addClass("inputError");}        				
					}
					if($(this).attr("id") === 'OpticalCopay'|| $(this).attr("id") === 'OpticalDeductible'){
						//if (regexpression.test($(this).val())  ||  opticalNotCover) {
						if (opticalNotCover || (regexpression.test($(this).val())  &&  $(this).attr("id")==='OpticalDeductible') || ($(this).val()<=100) && $(this).attr("id")==='OpticalCopay'){
				    		textInput += 1;
				    		$(this).removeClass("inputError");
				    	}else {$(this).addClass("inputError");}    				
					}
					if($(this).attr("id") === 'OPCopay'|| $(this).attr("id") === 'consultCopay'|| $(this).attr("id") === 'consultDeductible'|| $(this).attr("id") === 'IPCopay' || $(this).attr("id") === 'pharmacyCopay' || $(this).attr("id") === 'outOfPocket'){
						//if (regexpression.test($(this).val())) {
						if ((regexpression.test($(this).val())  &&  $(this).attr("id")==='outOfPocket') || (regexpression.test($(this).val())  &&  $(this).attr("id")==='consultDeductible') || ($(this).val()<=100) && regexpression.test($(this).val())){
				    		textInput += 1;
				    		$(this).removeClass("inputError");
				    	}else {$(this).addClass("inputError");}    			
					}
			  	});	

			  	if (textInput === allInputs.length) {
			  		benefitUpdatemodalobj.setFooterButtonDither("chgupdatebtn", false);
				}else{
					benefitUpdatemodalobj.setFooterButtonDither("chgupdatebtn", true);
				}
		
			})
		});
	});
	
		//update auth
    $("#cme_upd_auth_btn").click(function(){
    	$("tbody#amb_price_tbody_id").empty();
		$("#amb_price_error_row_id").empty();
				$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');

		var modaltitle = '';
		var successmsg = ''
		var modifyind = 0;
		var buttontitle = '';
		var priceupdateHTML = [];        
		modaltitle = 'Auth Code';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		priceupdateHTML.push('<div class="clwx_price_update_main">');
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Auth Code:</span>&nbsp;<br/><textarea id="at_chg_upd_id" maxlength="250" class="price_update_box_class" name="textarea" cols="45" rows="2"></textarea>');
		
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		
		priceupdateHTML.push('<dl class="clwx_price_update_row2" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Observation:</span>&nbsp;<br/><textarea id="ob_chg_upd_id" maxlength="250" class="price_update_box_class" name="textarea" cols="45" rows="4"></textarea>');
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		
		MP_ModalDialog.deleteModalDialogObject("priceupdate")
	    var priceupdatemodalobj = new ModalDialog("priceupdate")		
	   	.setHeaderTitle(modaltitle)		
	   	.setTopMarginPercentage(25)
	   	.setRightMarginPercentage(35)
	   	.setBottomMarginPercentage(25)
	   	.setLeftMarginPercentage(35)
	   	.setIsBodySizeFixed(true)
	   	.setHasGrayBackground(true)
	   	.setIsFooterAlwaysShown(true);
	   priceupdatemodalobj.setBodyDataFunction(function (modalObj){
		 modalObj.setBodyHTML(priceupdateHTML.join(""));
	     });
	 

var actionbtn = new ModalButton("chgupdatebtn");
 
	    actionbtn.setText(buttontitle).setCloseOnClick(false).setIsDithered(true).setOnClickFunction(function () {
			var attype = $("#at_chg_upd_id").val();
			var obtype = $("#ob_chg_upd_id").val();
			var encntr_id = 10001;
			var priceUpdateArr = []
			priceUpdateArr = ["^MINE^", 
			criterionObj.CRITERION.ENCNTRID ,
			"^" + attype + "^",
			"^" + obtype + "^"];
			//loading and other important textbox to disable so user can not modify while things running behind the scene
			$('#clwx_price_update_row_price').after('<div class="clwx_update_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to modify database. Please wait...</span></div>');
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", true);
            $("#clwx_eff_updtdt_box").prop('disabled',true);			
			$("#price_update_box_id").prop('disabled',true);
			//update or add script
			PWX_CCL_Request("RCM_UPD_BATCH_RESUB", priceUpdateArr, true, function () {		
				if(this.DB_UPDATE_STATUS !== "S"){
				   //if script fail then enable textbox back so user can pick different date and price
				   $('.clwx_update_loading_div').empty()
			       priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false);
                   $("#clwx_eff_updtdt_box").prop('disabled',false);			
		           $("#price_update_box_id").prop('disabled',false);				   
				   var error_text = "Failed to update database";
				   MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
				   var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
				   	.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")				   
			    }else{
				   var sucess_text = "Charge "+successmsg+" successfully.";
				   var notificationtitle = ""+modaltitle+" Notification"
				   MP_ModalDialog.deleteModalDialogObject("successmodal")
				   var feenotificationModalobj = new ModalDialog("successmodal")
				   	.setHeaderTitle(notificationtitle)
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   feenotificationModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
					 //refresh current selection upon Ok button click
					 var sendArrafterpriceupdate  = [];
					 var timerreqdata = [];
					 var timerreqdatapush = [];
					 var effdate = $("#amb_price_header_filter_eff_date_val").val();
					 var enddate = $("#amb_price_header_filter_end_date_val").val();
					 var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
					 var PriceSchArray = CreateParamArray(price_sch_array, 1);
					 var BillCodeArray = CreateParamArray(bill_code_array, 1);
				     MP_ModalDialog.closeModalDialog("successmodal")
					 MP_ModalDialog.closeModalDialog("priceupdate")
					 sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
					 timerreqdatapush.push("searchType: quicksearch");
					timerreqdatapush.push("Date: "+effdate);
					timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
					timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
					timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
					timerreqdatapush.push("ActivityType: All");
					timerreqdatapush.push("Exclude0: Yes");
					timerreqdata = timerreqdatapush.join(",");		
					 
					 $("tbody#amb_price_tbody_id").empty()
					 $("#amb_price_error_row_id").empty()
					 $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
					 thiz.clearPRICEObj(); //always clear object before it can used
					 thiz.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer) //call data gather script		
				   })
				   feenotificationModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
				   MP_ModalDialog.showModalDialog("successmodal")  
					//Hide close icon so they can exit modal by clicking ok button
				   $('.dyn-modal-hdr-close').css('display','none')
				}
	        }); 	  
	    })
	    priceupdatemodalobj.addFooterButton(actionbtn)		   
	   var closebtn = new ModalButton("addCancel");
	   closebtn.setText("Close").setCloseOnClick(true);
	   priceupdatemodalobj.addFooterButton(closebtn)
	   MP_ModalDialog.addModalDialogObject(priceupdatemodalobj);
	   MP_ModalDialog.showModalDialog("priceupdate")
	   
        //restrict textbox to allow only certain number of inputs
		//valid price : 123, 123456, 123.45
        //Not valid price: 123. , 123.4, 123.345, aaa123, aabbcc, aa#$%, 1234567 (more than 6 digit so it is not valid) 
	    $("#cp_chg_upd_id, #net_chg_upd_id, #nc_chg_upd_id ,#at_chg_upd_id ,#rs_chg_upd_id,#ob_chg_upd_id").on("keypress keyup blur",function (event) {	
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false)	
		}) 
	
	



}
)
		//show HIM codes
    $("#cme_him_code").click(function(){
	
    	$("tbody#amb_price_tbody_id").empty();
		$("#amb_price_error_row_id").empty();
				$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');

		var modaltitle = '';
		var successmsg = ''
		var modifyind = 0;
		var buttontitle = '';
		var priceupdateHTML = []; 


		 
		modaltitle = 'Medical Coding';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		priceupdateHTML.push('<div class="clwx_price_update_main">');
		priceupdateHTML.push('<div class="benefit-hdr-title">');
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">'); 
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('<span>DRG</span>');
		priceupdateHTML.push('<br>');
		priceupdateHTML.push('</div>');
		priceupdateHTML.push('<br>');
		priceupdateHTML.push('<table id="amb_price_rvu_table" class="amb_price_rvu_table_class">');
		priceupdateHTML.push('<thead class="amb_price_rvu_thead">');
		priceupdateHTML.push('<tr id="amb_price_rvu_header_id" class="amb_price_rvu_header">');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">DRG Code</td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">DRG Description</td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">Severity of illness </td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">Risk of mortality </td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">DRG Weight </td>');
		priceupdateHTML.push('</tr></thead>')
		priceupdateHTML.push('<tr>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_billcode_class amb_standard_search_td">' + criterionObj.CRITERION.DRG_CODE + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.DRG_NAME + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.DRG_SOI + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.DRG_ROM + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.DRG_WEIGHT + '</td>');
		priceupdateHTML.push('</tr>');
		priceupdateHTML.push('</table>');
		priceupdateHTML.push('<br>');
		
		
		
		priceupdateHTML.push('<div class="benefit-hdr-title">');
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">'); 
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('<span>Diagnosis</span>');
		priceupdateHTML.push('</div>');
		priceupdateHTML.push('<br>');
		priceupdateHTML.push('<table id="amb_price_rvu_table" class="amb_price_rvu_table_class">');
		priceupdateHTML.push('<thead class="amb_price_rvu_thead">');
		priceupdateHTML.push('<tr id="amb_price_rvu_header_id" class="amb_price_rvu_header">');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">ICD Code</td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">ICD Description</td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">Type</td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">Present On Admission</td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">Update Date Time</td>');
		priceupdateHTML.push('</tr></thead>')
		for (var i = 0; i < criterionObj.CRITERION.DIAG_CNT; i++) {
		
		priceupdateHTML.push('<tr>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_billcode_class amb_standard_search_td">' + criterionObj.CRITERION.DIAG_QUAL[i].ICD_CODE + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.DIAG_QUAL[i].ICD_NAME + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.DIAG_QUAL[i].TYPE + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.DIAG_QUAL[i].POA + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.DIAG_QUAL[i].DT_TM + '</td>');
		priceupdateHTML.push('</tr>');
		};
		priceupdateHTML.push('</table>');
		priceupdateHTML.push('<br>');
		
		priceupdateHTML.push('<div class="benefit-hdr-title">');
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">'); 
	    priceupdateHTML.push('</dl>');
		priceupdateHTML.push('<span>Procedure Codes</span>');
		priceupdateHTML.push('</div>');
		

		
		priceupdateHTML.push('<br>');
		priceupdateHTML.push('<table id="amb_price_rvu_table" class="amb_price_rvu_table_class">');
		priceupdateHTML.push('<thead class="amb_price_rvu_thead">');
		priceupdateHTML.push('<tr id="amb_price_rvu_header_id" class="amb_price_rvu_header">');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">CPT Code</td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">CPT Description</td>');
		priceupdateHTML.push('<td id="amb_price_begdate_id" class="cme_chg_desc_class">Charge Dropped</td>');
		priceupdateHTML.push('</tr></thead>')
		for (var i = 0; i < criterionObj.CRITERION.PRO_CNT; i++) {
		
		priceupdateHTML.push('<tr>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_billcode_class amb_standard_search_td">' + criterionObj.CRITERION.PRO_QUAL[i].CPT_CODE + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.PRO_QUAL[i].CPT_DESC + '</td>');
		priceupdateHTML.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + criterionObj.CRITERION.PRO_QUAL[i].CPT_CHECK + '</td>');
		priceupdateHTML.push('</tr>');
		};
		priceupdateHTML.push('</table>');
		priceupdateHTML.push('<br>');
		

		MP_ModalDialog.deleteModalDialogObject("priceupdate")
	    var priceupdatemodalobj = new ModalDialog("priceupdate")		
	   	.setHeaderTitle(modaltitle)		
	   	.setTopMarginPercentage(5)
	   	.setRightMarginPercentage(15)
	   	.setBottomMarginPercentage(15)
	   	.setLeftMarginPercentage(15)
	   	.setIsBodySizeFixed(true)
	   	.setHasGrayBackground(true)
	   	.setIsFooterAlwaysShown(true);
	   priceupdatemodalobj.setBodyDataFunction(function (modalObj){
		 modalObj.setBodyHTML(priceupdateHTML.join(""));
	     });
	 


	 
	   var closebtn = new ModalButton("addCancel");
	   closebtn.setText("Close").setCloseOnClick(true);
	   priceupdatemodalobj.addFooterButton(closebtn)
	   MP_ModalDialog.addModalDialogObject(priceupdatemodalobj);
	   MP_ModalDialog.showModalDialog("priceupdate")
	   
        //restrict textbox to allow only certain number of inputs
		//valid price : 123, 123456, 123.45
        //Not valid price: 123. , 123.4, 123.345, aaa123, aabbcc, aa#$%, 1234567 (more than 6 digit so it is not valid) 
	    $("#cp_chg_upd_id, #net_chg_upd_id, #nc_chg_upd_id ,#at_chg_upd_id ,#rs_chg_upd_id,#ob_chg_upd_id").on("keypress keyup blur",function (event) {	
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false)	
		}) 
	
	



}
)
		//claim gen 2
    $("#cme_gen_claim").click(function(){
    	$("tbody#amb_price_tbody_id").empty();
		$("#amb_price_error_row_id").empty();
				$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');

		var modaltitle = '';
		var successmsg = ''
		var modifyind = 0;
		var buttontitle = '';
		var priceupdateHTML = [];        
		modaltitle = 'Claim Gen';successmsg='Updated';buttontitle = 'YES';modifyind = 1
		priceupdateHTML.push('<div class="clwx_price_update_main">');
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">DO YOU WISH TO SEND CLAIM TO THE PAYOR ?</span>&nbsp;');	 
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		

		
		MP_ModalDialog.deleteModalDialogObject("priceupdate")
	    var priceupdatemodalobj = new ModalDialog("priceupdate")		
	   	.setHeaderTitle(modaltitle)		
	   	.setTopMarginPercentage(25)
	   	.setRightMarginPercentage(35)
	   	.setBottomMarginPercentage(25)
	   	.setLeftMarginPercentage(35)
	   	.setIsBodySizeFixed(true)
	   	.setHasGrayBackground(true)
	   	.setIsFooterAlwaysShown(true);
	   priceupdatemodalobj.setBodyDataFunction(function (modalObj){
		 modalObj.setBodyHTML(priceupdateHTML.join(""));
	     });
	 

var actionbtn = new ModalButton("chgupdatebtn");

 
	    actionbtn.setText(buttontitle).setCloseOnClick(false).setIsDithered(false).setOnClickFunction(function () {

			//loading and other important textbox to disable so user can not modify while things running behind the scene
			$('#clwx_price_update_row_price').after('<div class="clwx_update_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to modify database. Please wait...</span></div>');
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", true);
            $("#clwx_eff_updtdt_box").prop('disabled',true);			
			$("#price_update_box_id").prop('disabled',true);
			//update or add script
				var clmgenparm  = [];					
					clmgenparm = [criterionObj.CRITERION.ENCNTRID + ".0"];		
					
					PWX_CCL_Request("ME_RCM_CLAIM_GEN", clmgenparm, true, function () {	
				
				if(this.DB_UPDATE_STATUS !== "S"){
				   //if script fail then enable textbox back so user can pick different date and price
				   $('.clwx_update_loading_div').empty()
			       //priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false);
                   $("#clwx_eff_updtdt_box").prop('disabled',false);			
		           $("#price_update_box_id").prop('disabled',false);				   
				   var error_text = "Failed to update database";
				   MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
				   var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
				   	.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")				   
			    }else{
				   var sucess_text = "Claim Sent "+successmsg+" successfully.";
				   var notificationtitle = ""+modaltitle+" Notification"
				   MP_ModalDialog.deleteModalDialogObject("successmodal")
				   var feenotificationModalobj = new ModalDialog("successmodal")
				   	.setHeaderTitle(notificationtitle)
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   feenotificationModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
					 //refresh current selection upon Ok button click
					 var sendArrafterpriceupdate  = [];
					 var timerreqdata = [];
					 var timerreqdatapush = [];
					 var effdate = $("#amb_price_header_filter_eff_date_val").val();
					 var enddate = $("#amb_price_header_filter_end_date_val").val();
					 var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
					 var PriceSchArray = CreateParamArray(price_sch_array, 1);
					 var BillCodeArray = CreateParamArray(bill_code_array, 1);
				     MP_ModalDialog.closeModalDialog("successmodal")
					 MP_ModalDialog.closeModalDialog("priceupdate")
					 sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
					 timerreqdatapush.push("searchType: quicksearch");
					timerreqdatapush.push("Date: "+effdate);
					timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
					timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
					timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
					timerreqdatapush.push("ActivityType: All");
					timerreqdatapush.push("Exclude0: Yes");
					timerreqdata = timerreqdatapush.join(",");		
					 
					 $("tbody#amb_price_tbody_id").empty()
					 $("#amb_price_error_row_id").empty()
					 $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
					 thiz.clearPRICEObj(); //always clear object before it can used
					 thiz.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer) //call data gather script		
				   })
				   feenotificationModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
				   MP_ModalDialog.showModalDialog("successmodal")  
					//Hide close icon so they can exit modal by clicking ok button
				   $('.dyn-modal-hdr-close').css('display','none')
				}
	        }); 	  
	    })
	    priceupdatemodalobj.addFooterButton(actionbtn)		   
	   var closebtn = new ModalButton("addCancel");
	   closebtn.setText("NO").setCloseOnClick(true);
	   priceupdatemodalobj.addFooterButton(closebtn)
	   MP_ModalDialog.addModalDialogObject(priceupdatemodalobj);
	   MP_ModalDialog.showModalDialog("priceupdate")
	   




}
)		




	// delete charge data
	
		var chargeIdArr = [];
		var chargeIdStr = '';
		
    $("#cme_del_chrg").click(function(){
	    var chargeIdArr = [];
		var chargeIdStr = '';
		var modaltitle = '';
		var buttontitle = '';
		var successmsg = ''
				
		modaltitle = 'Delete Charge Data';successmsg='Updated';buttontitle = 'YES';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');
		
		var priceupdateHTML = [];        
		priceupdateHTML.push('<div class="clwx_price_update_main">');
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">DO YOU WISH DELETE ALL CHARGE DATA FROM SELECTED CHARGES ?</span>&nbsp;');	 
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		

		
		MP_ModalDialog.deleteModalDialogObject("priceupdate")
	    var priceupdatemodalobj = new ModalDialog("priceupdate")		
	   	.setHeaderTitle(modaltitle)		
	   	.setTopMarginPercentage(25)
	   	.setRightMarginPercentage(35)
	   	.setBottomMarginPercentage(25)
	   	.setLeftMarginPercentage(35)
	   	.setIsBodySizeFixed(true)
	   	.setHasGrayBackground(true)
	   	.setIsFooterAlwaysShown(true);
	   priceupdatemodalobj.setBodyDataFunction(function (modalObj){
		 modalObj.setBodyHTML(priceupdateHTML.join(""));
	     });
	 

var actionbtn = new ModalButton("chgupdatebtn");

 
	    actionbtn.setText(buttontitle).setCloseOnClick(false).setIsDithered(false).setOnClickFunction(function () {

			//loading and other important textbox to disable so user can not modify while things running behind the scene
			$('#clwx_price_update_row_price').after('<div class="clwx_update_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to modify database. Please wait...</span></div>');
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", true);
            $("#clwx_eff_updtdt_box").prop('disabled',true);			
			$("#price_update_box_id").prop('disabled',true);
			//update or add script
				var applyAdjArr  = [];					
					applyAdjArr = [criterionObj.CRITERION.ENCNTRID + ".0","^"+ chargeIdStr +"^","^2^"];		
					
					PWX_CCL_Request("ME_RCM_DELETE_CHRG", applyAdjArr, true, function () {	
				
				if(this.DB_UPDATE_STATUS !== "S"){
				   //if script fail then enable textbox back so user can pick different date and price
				   $('.clwx_update_loading_div').empty()
			       //priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false);
                   $("#clwx_eff_updtdt_box").prop('disabled',false);			
		           $("#price_update_box_id").prop('disabled',false);				   
				   var error_text = "Failed to update database";
				   MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
				   var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
				   	.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")				   
			    }else{
				   var sucess_text = "Charge "+successmsg+" successfully.";
				   var notificationtitle = ""+modaltitle+" Notification"
				   MP_ModalDialog.deleteModalDialogObject("successmodal")
				   var feenotificationModalobj = new ModalDialog("successmodal")
				   	.setHeaderTitle(notificationtitle)
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   feenotificationModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
					 //refresh current selection upon Ok button click
					 var sendArrafterpriceupdate  = [];
					 var timerreqdata = [];
					 var timerreqdatapush = [];
					 var effdate = $("#amb_price_header_filter_eff_date_val").val();
					 var enddate = $("#amb_price_header_filter_end_date_val").val();
					 var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
					 var PriceSchArray = CreateParamArray(price_sch_array, 1);
					 var BillCodeArray = CreateParamArray(bill_code_array, 1);
				     MP_ModalDialog.closeModalDialog("successmodal")
					 MP_ModalDialog.closeModalDialog("priceupdate")
					 sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
					 timerreqdatapush.push("searchType: quicksearch");
					timerreqdatapush.push("Date: "+effdate);
					timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
					timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
					timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
					timerreqdatapush.push("ActivityType: All");
					timerreqdatapush.push("Exclude0: Yes");
					timerreqdata = timerreqdatapush.join(",");		
					 
					 $("tbody#amb_price_tbody_id").empty()
					 $("#amb_price_error_row_id").empty()
					 $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
					 thiz.clearPRICEObj(); //always clear object before it can used
					 thiz.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer) //call data gather script		
				   })
				   feenotificationModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
				   MP_ModalDialog.showModalDialog("successmodal")  
					//Hide close icon so they can exit modal by clicking ok button
				   $('.dyn-modal-hdr-close').css('display','none')
				}
	        }); 	  
	    })
	    priceupdatemodalobj.addFooterButton(actionbtn)		   
	   var closebtn = new ModalButton("addCancel");
	   closebtn.setText("NO").setCloseOnClick(true);
	   priceupdatemodalobj.addFooterButton(closebtn)
	   MP_ModalDialog.addModalDialogObject(priceupdatemodalobj);
	   MP_ModalDialog.showModalDialog("priceupdate")
	   




}
)		
	//apply %
    $("#cme_apply_dscnt").click(function(){
    	//$("tbody#amb_price_tbody_id").empty();
		$("#amb_price_error_row_id").empty();
				$('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');


	    var chargeIdArr = [];
		var chargeIdStr = '';
				
		modaltitle = 'Apply % Discounts';successmsg='Updated';buttontitle = 'Update';modifyind = 1
		$('#amb_price_tbody_id input:checked').each(function(index, row) {
			var chargeId = $(this).val();
			chargeIdArr.push(chargeId);		
		});
		
		chargeIdStr = chargeIdArr.join(',');

		var successmsg = ''
		var modifyind = 0;
		var buttontitle = '';
		var priceupdateHTML = [];        

		
		        
				
		if(chargeIdArr.length === 0){	
				   //if script fail then enable textbox back so user can pick different date and price
					var error_text = "Please select one or more charge to recalculate.";
					MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
					var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
						.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
						.setTopMarginPercentage(30)
						.setRightMarginPercentage(35)
						.setBottomMarginPercentage(30)
						.setLeftMarginPercentage(35)
						.setIsBodySizeFixed(true)
						.setHasGrayBackground(true)
						.setIsFooterAlwaysShown(true);
				   
					pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
							modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
						}
				    );
				   
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")	
				   $('.dyn-modal-hdr-close').css('display','none')				   
			    }
		else{
		priceupdateHTML.push('<div class="clwx_price_update_main">');
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Balance :</span>&nbsp; ');
		priceupdateHTML.push('<select id = "balanceflg" class="price_update_box_class"> ');
		priceupdateHTML.push('<option  value = "1">Patient</option> ');
		priceupdateHTML.push('<option  value = "2">Payer</option> ');
		priceupdateHTML.push('<option  value = "3">Both</option> ');
		priceupdateHTML.push('</select>');	 
	
		priceupdateHTML.push('<br/>');
		priceupdateHTML.push('<br/>');			
		priceupdateHTML.push('<span class="amb_grey">Discount % :</span>&nbsp;<input id="ds_chg_upd_id" min="1" max="100"  maxlength="20" class="price_update_box_class"></input>');	 
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		
		MP_ModalDialog.deleteModalDialogObject("priceupdate")
	    var priceupdatemodalobj = new ModalDialog("priceupdate")		
	   	.setHeaderTitle(modaltitle)		
	   	.setTopMarginPercentage(25)
	   	.setRightMarginPercentage(35)
	   	.setBottomMarginPercentage(25)
	   	.setLeftMarginPercentage(35)
	   	.setIsBodySizeFixed(true)
	   	.setHasGrayBackground(true)
	   	.setIsFooterAlwaysShown(true);
	   priceupdatemodalobj.setBodyDataFunction(function (modalObj){
		 modalObj.setBodyHTML(priceupdateHTML.join(""));
	     });

		var actionbtn = new ModalButton("chgupdatebtn");
		var buttontitle = 'Update'
 
	    actionbtn.setText(buttontitle).setCloseOnClick(false).setIsDithered(true).setOnClickFunction(function () {
			var attype = $("#ds_chg_upd_id").val();
			var bflg  = $("#balanceflg").val();
			var priceUpdateArr = []
			priceUpdateArr = [criterionObj.CRITERION.ENCNTRID ,
			"^" + chargeIdStr + "^",
			"^1^",
			"" + attype + "",
			"^" + bflg + "^"];

			//loading and other important textbox to disable so user can not modify while things running behind the scene
			$('#clwx_price_update_row_price').after('<div class="clwx_update_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to modify database. Please wait...</span></div>');
			//priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", true);
            // $("#clwx_eff_updtdt_box").prop('disabled',true);			
			// $("#price_update_box_id").prop('disabled',true);
			   priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false)	
			//update or add script
			PWX_CCL_Request("ME_RCM_APPLY_DISCOUNT", priceUpdateArr, true, function () {		
				if(this.DB_UPDATE_STATUS !== "S"){
				   //if script fail then enable textbox back so user can pick different date and price
				   $('.clwx_update_loading_div').empty()
			       priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false);
                   $("#clwx_eff_updtdt_box").prop('disabled',false);			
		           $("#price_update_box_id").prop('disabled',false);				   
				   var error_text = "Failed to update database";
				   MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
				   var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
				   	.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")				   
			    }else{
				   var sucess_text = "Discount "+successmsg+" successfully added.";
				   var notificationtitle = ""+modaltitle+" Notification"
				   MP_ModalDialog.deleteModalDialogObject("successmodal")
				   var feenotificationModalobj = new ModalDialog("successmodal")
				   	.setHeaderTitle(notificationtitle)
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   feenotificationModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
				   }
				   );

				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
					 //refresh current selection upon Ok button click
					 var sendArrafterpriceupdate  = [];
					 var timerreqdata = [];
					 var timerreqdatapush = [];
					 var effdate = $("#amb_price_header_filter_eff_date_val").val();
					 var enddate = $("#amb_price_header_filter_end_date_val").val();
					 var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
					 var PriceSchArray = CreateParamArray(price_sch_array, 1);
					 var BillCodeArray = CreateParamArray(bill_code_array, 1);
				     MP_ModalDialog.closeModalDialog("successmodal")
					 MP_ModalDialog.closeModalDialog("priceupdate")
					 sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
					 timerreqdatapush.push("searchType: quicksearch");
					timerreqdatapush.push("Date: "+effdate);
					timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
					timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
					timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
					timerreqdatapush.push("ActivityType: All");
					timerreqdatapush.push("Exclude0: Yes");
					timerreqdata = timerreqdatapush.join(",");		
					 
					 $("tbody#amb_price_tbody_id").empty()
					 $("#amb_price_error_row_id").empty()
					 $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
					 thiz.clearPRICEObj(); //always clear object before it can used
					 thiz.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer) //call data gather script		
				   })
				   feenotificationModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
				   MP_ModalDialog.showModalDialog("successmodal")  
					//Hide close icon so they can exit modal by clicking ok button
				   $('.dyn-modal-hdr-close').css('display','none')
				}
	        }); 	  
	    })
	    priceupdatemodalobj.addFooterButton(actionbtn)		   
	   var closebtn = new ModalButton("addCancel");
	   closebtn.setText("Close").setCloseOnClick(true);
	   priceupdatemodalobj.addFooterButton(closebtn)
	   MP_ModalDialog.addModalDialogObject(priceupdatemodalobj);
	   MP_ModalDialog.showModalDialog("priceupdate")
	   
        //restrict textbox to allow only certain number of inputs
		//valid price : 123, 123456, 123.45
        //Not valid price: 123. , 123.4, 123.345, aaa123, aabbcc, aa#$%, 1234567 (more than 6 digit so it is not valid) 
	    $("#ds_chg_upd_id").on("keypress keyup blur",function (event) {	
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false)	
		}) 
	
		document.querySelector("#ds_chg_upd_id").addEventListener("keypress", function (evt) {
	    if (evt.which < 48 || evt.which > 57)
	    {
	        evt.preventDefault();
	    }
		});
		var discount = document.getElementById('ds_chg_upd_id'),
			cleandiscount;
			
			cleandiscount= function(e) {
			e.preventDefault();
			var pastedText = '';
			if (window.clipboardData && window.clipboardData.getData) { // IE
			pastedText = window.clipboardData.getData('Text');
			} else if (e.clipboardData && e.clipboardData.getData) {
			pastedText = e.clipboardData.getData('text/plain');
			}
			this.value = pastedText.replace(/\D/g, '');
			};
			
			discount.onpaste = cleandiscount;
				
		
		
		}

		
		
	



}
)

    //kick off keyup event for our PRICE content search area
    $('#amb_price_contain_search_txt').keyup(function(e) {
        var keyuptextvalue = this.value;
        clearTimeout($.data(this, 'timer'));
        if (e.keyCode == 13){
            pricesearch(keyuptextvalue);
			//calcTotal() ;
		}
		else {
            $(this).data('timer', setTimeout(pricesearch(keyuptextvalue), 500));
			//calcTotal() ;
		}
    });

    //filter button click event in case user is searching on more than or eq to 500 data
    $("#amb_price_content_searchbtn").click(function() {
        var nokeyuptextvalue = $("#amb_price_contain_search_txt_nokeyup").val();
        if (nokeyuptextvalue === 'Search Content within Code, Description, Bill Code Type and Activity Type') {
            nokeyuptextvalue = ""
        }
        pricesearch(nokeyuptextvalue);
		//calcTotal() ;
    });


	/* this function search given string within table and do show and hide according to that */
    function pricesearch(textboxstring) {
		var headerSelect = $("#selectAllChgs")
		var allpricerow = $("#amb_price_tbody_id tr")
        var toShow = $("#amb_price_tbody_id td.amb_standard_search_td:containsNC('" + textboxstring + "')");
        if (textboxstring !== "") {
            $("#amb_price_tbody_id tr").not($('#amb_price_tbody_id tr').has(toShow)).hide();
        } else {
            allpricerow.show()
        }
		calcTotal() ;
		headerSelect.prop('checked', false);
		allpricerow.find('input[type="checkBox"]:visible').prop('checked', false);
    }
	
	function calcTotal() {
		accounting.settings = {
			currency: {
				symbol : "",   // default currency symbol is '$'
				decimal : ".",  // decimal point separator
				thousand: ",",  // thousands separator
				precision : 2   // decimal places
			},
			number: {
				precision : 0,  // default precision on numbers is 0
				thousand: ",",
				decimal : "."
			}
		}
		
		accounting.settings.currency.format = {
			pos : "%s %v",   // for positive values, eg. "$ 1.00" (required)
			neg : "%s (%v)", // for negative values, eg. "$ (1.00)" [optional]
			zero: "%s  -- "  // for zero values, eg. "$  --" [optional]
		};
		var grossSum = 0;
		var netSum = 0;
		var payTTLSum = 0;
		var adjTTLSum = 0;
		var patShareSum = 0;
		var balSum = 0;
		var vatSum = 0;
		var discSum = 0;
		var uDiscSum = 0;
		$("#amb_price_tbody_id tr").each(function() {
			if($(this).is(':visible')){
				grossSum += parseFloat($(this).find(".cme_chg_gross_class").text());
				netSum += parseFloat($(this).find(".cme_chg_net_class").text());
				payTTLSum += parseFloat($(this).find(".cme_chg_pay_class").text());
				vatSum += parseFloat($(this).find(".cme_chg_vat_class").text());
				adjTTLSum += parseFloat($(this).find(".cme_chg_adj_class").text());
				patShareSum += parseFloat($(this).find(".cme_chg_ps_class").text());
				balSum += parseFloat($(this).find(".cme_chg_bal_class").text());
				discSum += parseFloat($(this).find(".cme_chg_disc_class").text());
				uDiscSum += parseFloat($(this).find(".cme_chg_udisc_class").text());
			}
		});
		$("#cme_charge_gross_tot").html(accounting.formatMoney(grossSum.toFixed(2)))
		$("#cme_charge_net_tot").html(accounting.formatMoney(netSum.toFixed(2)))
		$("#cme_charge_pay_ttl_tot").html(accounting.formatMoney(payTTLSum.toFixed(2)))
		$("#cme_charge_vat_ttl_tot").html(accounting.formatMoney(vatSum.toFixed(2)))
		$("#cme_charge_adj_ttl_tot").html(accounting.formatMoney(adjTTLSum.toFixed(2)))
		$("#cme_charge_pat_share_tot").html(accounting.formatMoney(patShareSum.toFixed(2)))
		$("#cme_charge_bal_tot").html(accounting.formatMoney(balSum.toFixed(2)))
		$("#cme_charge_disc_tot").html(accounting.formatMoney(discSum.toFixed(2)))
		$("#cme_charge_udisc_tot").html(accounting.formatMoney(uDiscSum.toFixed(2)))
	};
	

PRVuMainObject.prototype.calcTotalonLoad = function() {
	
		
		accounting.settings = {
			currency: {
				symbol : "",   // default currency symbol is '$'
				decimal : ".",  // decimal point separator
				thousand: ",",  // thousands separator
				precision : 2   // decimal places
			},
			number: {
				precision : 0,  // default precision on numbers is 0
				thousand: ",",
				decimal : "."
			}
		}
		
		accounting.settings.currency.format = {
			pos : "%s %v",   // for positive values, eg. "$ 1.00" (required)
			neg : "%s (%v)", // for negative values, eg. "$ (1.00)" [optional]
			zero: "%s  -- "  // for zero values, eg. "$  --" [optional]
		};

		var grossSum = 0;
		var netSum = 0;
		var payTTLSum = 0;
		var vatSum = 0;
		var adjTTLSum = 0;
		var patShareSum = 0;
		var balSum = 0;
		var discSum = 0;
		var uDiscSum = 0;

		$("#amb_price_tbody_id tr").each(function() {
			if($(this).is(':visible')){
				grossSum += parseFloat($(this).find(".cme_chg_gross_class").text());
				netSum += parseFloat($(this).find(".cme_chg_net_class").text());
				payTTLSum += parseFloat($(this).find(".cme_chg_pay_class").text());
				vatSum += parseFloat($(this).find(".cme_chg_vat_class").text());
				adjTTLSum += parseFloat($(this).find(".cme_chg_adj_class").text());
				patShareSum += parseFloat($(this).find(".cme_chg_ps_class").text());
				balSum += parseFloat($(this).find(".cme_chg_bal_class").text());
				discSum += parseFloat($(this).find(".cme_chg_disc_class").text());
				uDiscSum += parseFloat($(this).find(".cme_chg_udisc_class").text());
			}
		});
		$("#cme_charge_gross_tot").html(accounting.formatMoney(grossSum.toFixed(2)))
		$("#cme_charge_net_tot").html(accounting.formatMoney(netSum.toFixed(2)))
		$("#cme_charge_pay_ttl_tot").html(accounting.formatMoney(payTTLSum.toFixed(2)))
		$("#cme_charge_vat_ttl_tot").html(accounting.formatMoney(vatSum.toFixed(2)))
		$("#cme_charge_adj_ttl_tot").html(accounting.formatMoney(adjTTLSum.toFixed(2)))
		$("#cme_charge_pat_share_tot").html(accounting.formatMoney(patShareSum.toFixed(2)))
		$("#cme_charge_bal_tot").html(accounting.formatMoney(balSum.toFixed(2)))
		$("#cme_charge_disc_tot").html(accounting.formatMoney(discSum.toFixed(2)))
		$("#cme_charge_udisc_tot").html(accounting.formatMoney(uDiscSum.toFixed(2)))
	};
    
    var onLoadChargeArr = [];
	var timerreqdata = [];
	var timerreqdatapush = [];
    var effdate = $("#amb_price_header_filter_eff_date_val").val();
	var enddate = $("#amb_price_header_filter_end_date_val").val();
	var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
	var PriceSchArray = CreateParamArray(price_sch_array, 1);
	var BillCodeArray = CreateParamArray(bill_code_array, 1);
	onLoadChargeArr = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^^", "^^"];
	timerreqdatapush.push("searchType: quicksearch");
	timerreqdatapush.push("Date: "+effdate);
	timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
	timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
	timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
	timerreqdatapush.push("ActivityType: All");
	timerreqdatapush.push("Exclude0: Yes");
	timerreqdata = timerreqdatapush.join(",");
	$("tbody#amb_price_tbody_id").empty()
    $("#amb_price_error_row_id").empty()
    $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
    mainpageObject.clearPRICEObj(); //always clear object before it can used

    mainpageObject.callPriceDataGather(onLoadChargeArr, timerreqdata, timer) //call data gather script
}



/*
 * @function to report filter CSV string
 * @param {string} price_billing_array_name_report : The price_billing_array_name_report string contain name of report.
 */
PRVuMainObject.prototype.buildreportfilterstring = function (price_billing_array_name_report) {
	thiz = this;
	var CurrentfilterSelection = "";
	var reporttitle = "";
	if(tabcurrentname === "Prices"){
		  //building filter string for price schedule report
		  CurrentfilterSelection += 'Filter Selection'+ '\r\n\n';
		  if($('input[type=radio][name=amb_price_search_radio]:checked').val() === "qc"){
			CurrentfilterSelection += 'Bill code Effective date:  ' + $("#amb_price_header_filter_eff_date_val").val() + '\n';
	  	 	CurrentfilterSelection += 'Bill code:  ' + $("#amb_price_header_filter_bill_cd_val").val() + '\n';
			CurrentfilterSelection += 'Bill code Type:  ' + bill_code_name_report.join("|") + '\n';
	  	 	CurrentfilterSelection += 'Price Schedule:  ' + price_billing_array_name_report.join("|") + '\n';
			CurrentfilterSelection += 'Exclude $0 Fee:  No\n';
			CurrentfilterSelection += 'Activity Type:  All\n';
		  }else{
           	CurrentfilterSelection += 'Bill code Effective date:  ' + $("#amb_price_header_filter_ss_eff_date_val").val() + '\n';
			CurrentfilterSelection += 'Bill code Type:  ' + $("#amb_price_header_filter_bill_cd_dp option:selected").text() + '\n';
	  	 	CurrentfilterSelection += 'Price Schedule:  ' + amb_pricesch_selected_modal_name_report_array.join("|") + '\n';
			if ($("#amb_price_header_filter_excl_mod_val").prop('checked') != true) {
				CurrentfilterSelection += 'Exclude $0 Fee:  No\n';
			}else{
				CurrentfilterSelection += 'Exclude $0 Fee:  Yes\n';
			}
			CurrentfilterSelection += 'Activity Type:  ' + $("#amb_price_header_filter_act_type_dp option:selected").text() + '\n';
		  }		
	      reporttitle = 'Price Schedule'	 
          JSONToCSVConvertor(thiz.blobObj.RPTACCTS.PRICE_BILL_INFO, CurrentfilterSelection, true,reporttitle);		  
	}
}

	
//we build header row sepearte so anytime  filter change we don't create header
PRVuMainObject.prototype.pricebuildheaderrow = function () {
	var amb_price_header_main_holder = $("#amb_price_content_header_id")
	var amb_price_header_html = []
	amb_price_header_html.push('<div>');
	amb_price_header_html.push('</div> ')
	amb_price_header_html.push('<table id="amb_price_rvu_table" class="amb_price_rvu_table_class">');

	amb_price_header_html.push('<thead class="amb_price_rvu_thead">');
	amb_price_header_html.push('<tr id="amb_price_rvu_header_id" class="amb_price_rvu_header">');
	amb_price_header_html.push('<td id="amb_price_begdate_id" class="cme_chg_checkbox_class"><input type = "checkBox" id="selectAllChgs"></input></td>');
	amb_price_header_html.push('<td id="amb_price_begdate_id" class="cme_chg_chg_status_class"></td>');
	amb_price_header_html.push('<td id="amb_price_begdate_id" class="cme_chg_chgdate_class">Date/Time</td>');
	amb_price_header_html.push('<td id="amb_price_begdate_id" class="cme_chg_acttype_class">Activity Type</td>');
	amb_price_header_html.push('<td id="amb_price_desc_id" class="cme_chg_desc_class">Charge Description</td>');
	amb_price_header_html.push('<td id="amb_price_schname_id" class="cme_chg_phyname_class">Physician Name</td>');
	amb_price_header_html.push('<td id="amb_price_qty_id" class="cme_chg_qty_class">Qty</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_billcode_class">Code</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_gross_class">Gross</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_disc_class">Discount</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_net_class">Net</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_ps_class">Patient Share</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_bal_class">Claim Amount</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_vat_class">VAT</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_pay_class">Payments</td>');
	amb_price_header_html.push('<td id="amb_price_billtype_id" class="cme_chg_adj_class">Adjustments</td>');
	if (criterionObj.CRITERION.SEC_CRS== 1){	
	amb_price_header_html.push('<td id="amb_price_acttype_id" class="cme_chg_resub_class">Resub</td>');
	};	
	if (criterionObj.CRITERION.SEC_CAT== 1){		
	amb_price_header_html.push('<td id="amb_price_flex_id" class="cme_chg_auth_class">Auth</td>');
	};	
	if (criterionObj.CRITERION.SEC_COB== 1){			
	amb_price_header_html.push('<td id="amb_price_flex_id" class="cme_chg_obs_class">Observation</td>');
	};		
	if (criterionObj.CRITERION.SEC_CDL== 1){		
	amb_price_header_html.push('<td id="amb_price_flex_id" class="cme_chg_obs_class">Denial</td>');
	};	

	amb_price_header_html.push('</tr></thead>')
	//put default content message
	amb_price_header_html.push('<tbody id="amb_price_tbody_id" class="amb_price_tbody">')
    amb_price_header_html.push('</tbody>')
	amb_price_header_html.push('<tfoot id = "amb_price_rvu_tfoot_id" class="amb_price_rvu_tfoot">');
	amb_price_header_html.push('<tr id="cme_charge_foot_id" class="amb_price_rvu_header">');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;text-align: center;" id="amb_price_code_val"  class="amb_price_code_class" colspan = "8">Total (AED)</td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_gross_tot"  class="cme_chg_gross_class"></td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_disc_tot"  class="cme_chg_disc_class"></td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_net_tot"  class="cme_chg_net_class"></td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_pat_share_tot"  class="cme_chg_ps_class"></td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_bal_tot"  class="cme_chg_bal_class"></td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_vat_ttl_tot"  class="cme_chg_vat_class"></td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_pay_ttl_tot"  class="cme_chg_pay_class"></td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_adj_ttl_tot"  class="cme_chg_adj_class"></td>');


	//amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_udisc_tot"  class="cme_chg_udisc_class"></td>');
	amb_price_header_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="amb_price_code_class" colspan = "4"></td>');
	amb_price_header_html.push('</tr></tfoot>')
	amb_price_header_html.push('</table>')

	amb_price_header_html.push('<p id="amb_price_error_row_id" class="amb_price_rvu_error_row">Please make selections from parameters above and click Search.</p>')
	amb_price_header_html.push('<p id="refreshedOn" class="cme_last_refresh"></p>')	
	amb_price_header_html.push('</br>')
	amb_price_header_html.push('<p id="contentCount" class="cme_last_refresh"></p>')	
	amb_price_header_main_holder.html(amb_price_header_html.join(""))
}

//contain row build here so we can call as many times as we need
PRVuMainObject.prototype.pricecontentrrow = function (timer) {
	thiz = this;
	//clear stuff
	$("#amb_price_tbody_id").empty()
	$('#amb_price_content_id').empty()
	//get the data to send in report
    this.blobObj.RPTACCTS.PRICE_BILL_INFO = [];	
	var amb_price_content_row = $("#amb_price_tbody_id")
	var amb_price_content_html = []	
	var amb_price_row_index = 0;
	var amb_price_stripe_class = "";
	thiz = this;
	
	function checkTime(i){
		if (i<10) 
		{
			i="0" + i;
		}
		return i;
	}
	
	var currentDateTime = new Date();
	var month = currentDateTime.getMonth() +1;	
	var dateString = '* Last refreshed on '+currentDateTime.getDate()+'/'+month+'/'+currentDateTime.getFullYear()+' '+currentDateTime.getHours()+":"+checkTime(currentDateTime.getMinutes());
	$('#refreshedOn').text(dateString);
	

	
	
	var price_sch_length = this.pricerecorddata.CHARGE.length;
	var contentCountDisplay = 'Displaying '+price_sch_length+ ' items';
	$('#contentCount').text(contentCountDisplay);


	
	if (price_sch_length > 0) {
		for (var i = 0, len = price_sch_length; i < len; i++) {
			amb_price_row_index = amb_price_row_index + 1;
			if (amb_price_row_index % 2 == 0) {
				amb_price_stripe_class = "amb_price_rvu_stripe_even_class";
			} else {
				amb_price_stripe_class = "amb_price_rvu_stripe_odd_class";
			}
			//remove last border from table			
			if (price_sch_length == 1) {
				var bottom_border = 'border-bottom:1px solid #EDEDED;';
			} else {
				var bottom_border = 'border-bottom:none';
			}		 					   						
            //var price_sched_info_length = this.pricerecorddata.PRICE_SCH_DETAIL[i].PRICE_SCH_INFO.length
			amb_price_content_html.push('<tr id="' + this.pricerecorddata.CHARGE[i].CHARGE_ID + '" class="amb_price_row ' + amb_price_stripe_class + ' amb_content_search" style="' + bottom_border + '">');
			
			if(this.pricerecorddata.CHARGE[i].CHARGE_ID !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_checkbox_class amb_standard_search_td"><input type="checkBox" value="'+this.pricerecorddata.CHARGE[i].CHARGE_ID+'"/></td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_checkbox_class amb_standard_search_td">--</td>');			
			}
			
			if(this.pricerecorddata.CHARGE[i].CHARGE_TYPE !== ""){
			
				//alert(JSON.stringify(this.pricerecorddata))
				//alert(this.pricerecorddata.CHARGE[i].CHARGE_TYPE)
				//alert(this.pricerecorddata.CHARGE[i].CHARGE_ID)
				if(this.pricerecorddata.CHARGE[i].CHARGE_TYPE == "PP" ){
			       amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" title="Part Paid" id="amb_price_code_val"  class="cme_chg_chg_status_class amb_standard_search_td"><img src="I:/WININTEL/static_content/cme_rcm_chg_vw/css/images/money.png" alt=""></img></td>');          
				}
				if(this.pricerecorddata.CHARGE[i].CHARGE_TYPE == "FP" ){
			       amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" title="Full Paid" id="amb_price_code_val"  class="cme_chg_chg_status_class amb_standard_search_td"><img src="I:/WININTEL/static_content/cme_rcm_chg_vw/css/images/money_bag.png" alt=""></img></td>');          
				}
				if(this.pricerecorddata.CHARGE[i].CHARGE_TYPE == "NC" ){
			       amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" title="Not Covered" id="amb_price_code_val"  class="cme_chg_chg_status_class amb_standard_search_td"><img src="I:/WININTEL/static_content/cme_rcm_chg_vw/css/images/not_covered.png" alt=""></img></td>');          
				}
				if(this.pricerecorddata.CHARGE[i].CHARGE_TYPE == "ER" ){
			       amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" title="' +this.pricerecorddata.CHARGE[i].CHARGE_STATUS+'" id="amb_price_code_val"  class="cme_chg_chg_status_class amb_standard_search_td"><img src="I:/WININTEL/static_content/cme_rcm_chg_vw/css/images/error.png" alt=""></img></td>');          
				}
				if(this.pricerecorddata.CHARGE[i].CHARGE_TYPE == " " ){
					amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_chg_status_class amb_standard_search_td">--</td>');	
					
				}

			}else{
				
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_chg_status_class amb_standard_search_td">--</td>');			
			}

			
			if(this.pricerecorddata.CHARGE[i].CHARGE_DT_TM !== ""){
                if(this.pricerecorddata.CHARGE[i].CHARGE_OUTLIER == "1"){
			      amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_chgdate_out_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_DT_TM + '</td>');
                }else{
                    amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_chgdate_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_DT_TM + '</td>');                  
                }
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_chgdate_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_ACT_TYPE !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_acttype_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_ACT_TYPE + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_acttype_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_NAME !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_desc_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_NAME + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_desc_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_PHYS !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" title="' +this.pricerecorddata.CHARGE[i].CHARGE_PHYS_LICENSE+'" id="amb_price_code_val"  class="cme_chg_phyname_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_PHYS + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_phyname_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_QTY !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_qty_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_QTY + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_qty_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_CODE !== ""){
				if(this.pricerecorddata.CHARGE[i].CHARGE_CODE === "DRG"){
					amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_billcode_class amb_standard_search_td">' + this.pricerecorddata.DRG_CODE + '</td>');
				}else{
					amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_billcode_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_CODE + '</td>');
				}
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_billcode_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_GROSS !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_gross"  class="cme_chg_gross_class amb_price_code_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_GROSS + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_gross" class="cme_chg_gross_class amb_price_code_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_DISCOUNT !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_disc"  class="cme_chg_disc_class amb_price_code_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_DISCOUNT + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_disc" class="cme_chg_disc_class amb_price_code_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_NET !== ""){
				if(this.pricerecorddata.CHARGES_ACCESS == 1 && this.pricerecorddata.INV_CHARGE_ID !== 0){
					amb_price_content_html.push('<td id="ambpricefee_'+i+'" title="Update Charge" class="cme_chg_net_class amb_price_fee_class rowspan_class amb_pricesch_footer_prevclass amb_standard_search_td ambpricefee">' + this.pricerecorddata.CHARGE[i].CHARGE_NET + '</td>');
				}else{
					amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_net"  class="cme_chg_net_class amb_price_code_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_NET + '</td>');
				}
			}
			else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_net" class="cme_chg_net_class amb_price_code_class amb_standard_search_td">--</td>');			
			}
			
			if(this.pricerecorddata.CHARGE[i].CHARGE_PS !== "" ){
				if(this.pricerecorddata.CHARGES_ACCESS == 1 && this.pricerecorddata.INV_CHARGE_ID !== 0){
					amb_price_content_html.push('<td id="ambpricefee_'+i+'" title=" Non-Covered :' +this.pricerecorddata.CHARGE[i].CHARGE_NC+';Co-Pay :'+this.pricerecorddata.CHARGE[i].CHARGE_COPAY+';VAT :'+this.pricerecorddata.CHARGE[i].CHARGE_VAT+' " class="cme_chg_ps_class amb_price_fee_class rowspan_class amb_pricesch_footer_prevclass amb_standard_search_td ambpricefee">' + this.pricerecorddata.CHARGE[i].CHARGE_PS + '</td>');
				}else{
					amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_pat_share"  class="cme_chg_ps_class amb_price_code_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_PS 
+					+ '</td>');
				}
			}
			else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_pat_share" class="cme_chg_ps_class amb_price_code_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_BALANCE !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_bal"  class="cme_chg_bal_class amb_price_code_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_BALANCE + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_bal" class="cme_chg_bal_class amb_price_code_class amb_standard_search_td">--</td>');			
			}
			if(this.pricerecorddata.CHARGE[i].CHARGE_VAT !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_vat"  class="cme_chg_vat_class amb_price_code_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_VAT + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_vat" class="cme_chg_vat_class amb_price_code_class amb_standard_search_td">--</td>');			
			}
			
			if(this.pricerecorddata.CHARGE[i].CHARGE_PAY_TTL !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_pay_ttl"  class="cme_chg_pay_class amb_price_code_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_PAY_TTL + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_pay_ttl" class="cme_chg_pay_class amb_price_code_class amb_standard_search_td">--</td>');			
			}
			
			if(this.pricerecorddata.CHARGE[i].CHARGE_ADJ_TTL !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_adj_ttl"  class="cme_chg_adj_class amb_price_code_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_ADJ_TTL + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="cme_charge_adj_ttl" class="cme_chg_adj_class amb_price_code_class amb_standard_search_td">--</td>');			
			}	
	if (criterionObj.CRITERION.SEC_CRS== 1){				
			if(this.pricerecorddata.CHARGE[i].CHARGE_RT !== ""){
			  amb_price_content_html.push('<td id="ambpricefee_'+i+'" title="Update Charge" class="cme_chg_auth_class amb_price_fee_class rowspan_class amb_pricesch_footer_prevclass amb_standard_search_td ambpricefee2">'  + this.pricerecorddata.CHARGE[i].CHARGE_RT + '</td>');
			}else{
			   amb_price_content_html.push('<td id="ambpricefee_'+i+'" title="Update Charge" class="cme_chg_auth_class amb_price_fee_class rowspan_class amb_pricesch_footer_prevclass amb_standard_search_td ambpricefee2">--</td>');			
			}
	};			
	if (criterionObj.CRITERION.SEC_CAT== 1){				
			if(this.pricerecorddata.CHARGE[i].CHARGE_AUTH !== ""){
			 amb_price_content_html.push('<td id="ambpricefee_'+i+'" title="Update Charge" class="cme_chg_auth_class amb_price_fee_class rowspan_class amb_pricesch_footer_prevclass amb_standard_search_td ambpricefee2">'  + this.pricerecorddata.CHARGE[i].CHARGE_AUTH +  '</td>');
			}else{
			   amb_price_content_html.push('<td id="ambpricefee_'+i+'" title="Update Charge" class="cme_chg_auth_class amb_price_fee_class rowspan_class amb_pricesch_footer_prevclass amb_standard_search_td ambpricefee2">--</td>');			
			}
	};
	if (criterionObj.CRITERION.SEC_COB== 1){		
			if(this.pricerecorddata.CHARGE[i].CHARGE_OB !== ""){
			  amb_price_content_html.push('<td id="ambpricefee_'+i+'" title="Update Charge"  class="cme_chg_auth_class amb_price_fee_class rowspan_class amb_pricesch_footer_prevclass amb_standard_search_td ambpricefee2">' + this.pricerecorddata.CHARGE[i].CHARGE_OB + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_billcode_class amb_standard_search_td">--</td>');			
			}
	};	
	if (criterionObj.CRITERION.SEC_CDL== 1){		
			if(this.pricerecorddata.CHARGE[i].CHARGE_DENIAL !== ""){
			  amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val"  class="cme_chg_billcode_class amb_standard_search_td">' + this.pricerecorddata.CHARGE[i].CHARGE_DENIAL + '</td>');
			}else{
			   amb_price_content_html.push('<td style="border-left: solid 1px #DDDDDD;" id="amb_price_code_val" class="cme_chg_billcode_class amb_standard_search_td">--</td>');			
			}
				
		}
	};	
		$('#amb_price_rvu_tfoot_id').show();
	}	
	amb_price_content_row.html(amb_price_content_html.join(""));
	thiz.calcTotalonLoad();
	//if no price schedule found
	if(price_sch_length === 0){
		$('#amb_price_error_row_id').text('No results found for selected parameters.')
	}
	
	var price_content_rows = $("#amb_price_tbody_id")
	
    //price update handler
    price_content_rows.off('click', '.ambpricefee');
	price_content_rows.on('click', '.ambpricefee', function (event){

		var findindexclickelement = $(this).attr('id').split("_");
		var indexClicked = findindexclickelement[findindexclickelement.length -1]
		var modaltitle = '';
		var successmsg = ''
		var modifyind = 0;
		var buttontitle = '';
		var priceupdateHTML = [];        
		modaltitle = 'Charge Price Update';successmsg='Updated';buttontitle = 'Update';modifyind = 1

		priceupdateHTML.push('<div class="clwx_price_update_main">');
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Net:</span>&nbsp;<input id="net_chg_upd_id" maxlength="20" class="price_update_box_class"></input>');	 
	    priceupdateHTML.push('</dl>');	
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Co-Pay:</span>&nbsp;<input id="cp_chg_upd_id" maxlength="20" class="price_update_box_class"></input>');	 
	    priceupdateHTML.push('</dl>');	
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Non-Covered:</span>&nbsp;<input id="nc_chg_upd_id" maxlength="20" class="price_update_box_class"></input>');	 
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');

		
		

	
		MP_ModalDialog.deleteModalDialogObject("priceupdate")
	    var priceupdatemodalobj = new ModalDialog("priceupdate")		
	   	.setHeaderTitle(modaltitle)		
	   	.setTopMarginPercentage(25)
	   	.setRightMarginPercentage(35)
	   	.setBottomMarginPercentage(25)
	   	.setLeftMarginPercentage(35)
	   	.setIsBodySizeFixed(true)
	   	.setHasGrayBackground(true)
	   	.setIsFooterAlwaysShown(true);
	   priceupdatemodalobj.setBodyDataFunction(function (modalObj){
	   	  modalObj.setBodyHTML(priceupdateHTML.join(""));
	     });
	    var actionbtn = new ModalButton("chgupdatebtn");
   
	    actionbtn.setText(buttontitle).setCloseOnClick(false).setIsDithered(true).setOnClickFunction(function () {
			//price update or Add (disable button after 1click)
			var rctype = $("#rs_chg_upd_id").val();
			var attype = $("#at_chg_upd_id").val();
			var obtype = $("#ob_chg_upd_id").val();
			var ahtype = $("#ah_chg_upd_id").val();
			
			var priceUpdateArr = []
			priceUpdateArr = ["^MINE^", 
			thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_ID + ".0",
			$("#net_chg_upd_id").val(),
			$("#cp_chg_upd_id").val(),
			$("#nc_chg_upd_id").val()
			];
			  
			//loading and other important textbox to disable so user can not modify while things running behind the scene
			$('#clwx_price_update_row_price').after('<div class="clwx_update_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to modify database. Please wait...</span></div>');
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", true);
            $("#clwx_eff_updtdt_box").prop('disabled',true);			
			$("#price_update_box_id").prop('disabled',true);
			
			//update or add script
			PWX_CCL_Request("ME_RCM_UPD_CHRG_PRICE", priceUpdateArr, true, function () {		
		        
			
				if(this.DB_UPDATE_STATUS !== "S"){		
				   //if script fail then enable textbox back so user can pick different date and price
				   $('.clwx_update_loading_div').empty()
			       priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false);
                   $("#clwx_eff_updtdt_box").prop('disabled',false);			
		           $("#price_update_box_id").prop('disabled',false);				   
				   var error_text = "Failed to update database";
				   MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
				   var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
				   	.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")				   
			    }else{
				   var sucess_text = "Charge "+successmsg+" successfully.";
				   var notificationtitle = ""+modaltitle+" Notification"
				   MP_ModalDialog.deleteModalDialogObject("successmodal")
				   var feenotificationModalobj = new ModalDialog("successmodal")
				   	.setHeaderTitle(notificationtitle)
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   feenotificationModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
					 //refresh current selection upon Ok button click
					 var sendArrafterpriceupdate  = [];
					 var timerreqdata = [];
					 var timerreqdatapush = [];
					 var effdate = $("#amb_price_header_filter_eff_date_val").val();
					 var enddate = $("#amb_price_header_filter_end_date_val").val();
					 var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
					 var PriceSchArray = CreateParamArray(price_sch_array, 1);
					 var BillCodeArray = CreateParamArray(bill_code_array, 1);
				     MP_ModalDialog.closeModalDialog("successmodal")
					 MP_ModalDialog.closeModalDialog("priceupdate")
					 sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
					 timerreqdatapush.push("searchType: quicksearch");
					timerreqdatapush.push("Date: "+effdate);
					timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
					timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
					timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
					timerreqdatapush.push("ActivityType: All");
					timerreqdatapush.push("Exclude0: Yes");
					timerreqdata = timerreqdatapush.join(",");		
					 
					 $("tbody#amb_price_tbody_id").empty()
					 $("#amb_price_error_row_id").empty()
					 $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
					 thiz.clearPRICEObj(); //always clear object before it can used
					 thiz.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer) //call data gather script		
				   })
				   feenotificationModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
				   MP_ModalDialog.showModalDialog("successmodal")  
					//Hide close icon so they can exit modal by clicking ok button
				   $('.dyn-modal-hdr-close').css('display','none')
				}
	        }); 	  
	    })		
	    priceupdatemodalobj.addFooterButton(actionbtn)		   
	   var closebtn = new ModalButton("addCancel");
	   closebtn.setText("Close").setCloseOnClick(true);
	   priceupdatemodalobj.addFooterButton(closebtn)
	   MP_ModalDialog.addModalDialogObject(priceupdatemodalobj);
	   MP_ModalDialog.showModalDialog("priceupdate")
	   
        //restrict textbox to allow only certain number of inputs
		//valid price : 123, 123456, 123.45
        //Not valid price: 123. , 123.4, 123.345, aaa123, aabbcc, aa#$%, 1234567 (more than 6 digit so it is not valid) 
	    $("#cp_chg_upd_id, #net_chg_upd_id, #nc_chg_upd_id ,#at_chg_upd_id ,#ah_chg_upd_id, #rs_chg_upd_id,#ob_chg_upd_id").on("keypress keyup blur",function (event) {	
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false)	
		}) 
		
	
		//apply datepicker to modal
		//This area execute when user select dates
	    var dates = $("#clwx_eff_updtdt_box").datepicker({
			changeMonth : true,
			changeYear : true,
			minDate : new Date(new Date().getFullYear(), 0, 1),
			maxDate : new Date(new Date().getFullYear(), 12, 0),
			onSelect : function (selectedDate) {
				instance = $(this).data("datepicker"),
				date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
				dates.not(this).datepicker("option", date);								
			}
	    });
		$("#net_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_NET); 
		$("#cp_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_COPAY); 
		$("#nc_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_NC); 
		$("#at_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_AUTH);
		$("#rs_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_RT);
		$("#ob_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_OB);
		$("#ah_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_ATTACH);		
    })
	
	    //price update handler
		price_content_rows.off('click', '.ambpricefee2');
		price_content_rows.on('click', '.ambpricefee2', function (event){

		var findindexclickelement = $(this).attr('id').split("_");
		var indexClicked = findindexclickelement[findindexclickelement.length -1]
		var modaltitle = '';
		var successmsg = ''
		var modifyind = 0;
		var buttontitle = '';
		var priceupdateHTML = [];        
		modaltitle = 'Charge Update';successmsg='Updated';buttontitle = 'Update';modifyind = 1

		priceupdateHTML.push('<div class="clwx_price_update_main">');
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Resub Code:</span>&nbsp;<br/><select id = "rs_chg_upd_id" class="price_update_box_class"><option  value = "-1">Choose Resub Code</option>><option  value = "IC">IC</option>><option  value = "CR">CR</option></select>');	 
		priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Authorization Code:</span>&nbsp;<br/><textarea id="at_chg_upd_id" maxlength="250" class="price_update_box_class" name="textarea" cols="45" rows="4"></textarea>');
		
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Observation:</span>&nbsp;<br/><textarea id="ob_chg_upd_id" maxlength="250" class="price_update_box_class" name="textarea" cols="45" rows="4"></textarea>');	 
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		
		priceupdateHTML.push('<dl class="clwx_price_update_row" id="clwx_price_update_row_price">');
		priceupdateHTML.push('<span class="amb_grey">Attach Code:</span>&nbsp;<br/><textarea id="ah_chg_upd_id" maxlength="100" class="price_update_box_class" name="textarea" cols="30" rows="1"></textarea>');	
	    priceupdateHTML.push('</dl>');	
		priceupdateHTML.push('</div>');
		
		

	
		MP_ModalDialog.deleteModalDialogObject("priceupdate")
	    var priceupdatemodalobj = new ModalDialog("priceupdate")		
	   	.setHeaderTitle(modaltitle)		
	   	.setTopMarginPercentage(25)
	   	.setRightMarginPercentage(35)
	   	.setBottomMarginPercentage(25)
	   	.setLeftMarginPercentage(35)
	   	.setIsBodySizeFixed(true)
	   	.setHasGrayBackground(true)
	   	.setIsFooterAlwaysShown(true);
	   priceupdatemodalobj.setBodyDataFunction(function (modalObj){
	   	  modalObj.setBodyHTML(priceupdateHTML.join(""));
	     });
	    var actionbtn = new ModalButton("chgupdatebtn");
   
	    actionbtn.setText(buttontitle).setCloseOnClick(false).setIsDithered(true).setOnClickFunction(function () {
			//price update or Add (disable button after 1click)
			var rctype = $("#rs_chg_upd_id").val();
			var attype = $("#at_chg_upd_id").val();
			var obtype = $("#ob_chg_upd_id").val();
			var ahtype = $("#ah_chg_upd_id").val();
			
			var priceUpdateArr = []
			priceUpdateArr = ["^MINE^", 
			thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_ID + ".0",
			"^" + rctype + "^",
			"^" + attype + "^",
			"^" + obtype + "^",
			"^" + ahtype + "^"];
			  
			//loading and other important textbox to disable so user can not modify while things running behind the scene
			$('#clwx_price_update_row_price').after('<div class="clwx_update_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to modify database. Please wait...</span></div>');
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", true);
            $("#clwx_eff_updtdt_box").prop('disabled',true);			
			$("#price_update_box_id").prop('disabled',true);
			
			//update or add script
			PWX_CCL_Request("ME_RCM_UPD_CHRG_DETAILS", priceUpdateArr, true, function () {		
		        
			
				if(this.DB_UPDATE_STATUS !== "S"){		
				   //if script fail then enable textbox back so user can pick different date and price
				   $('.clwx_update_loading_div').empty()
			       priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false);
                   $("#clwx_eff_updtdt_box").prop('disabled',false);			
		           $("#price_update_box_id").prop('disabled',false);				   
				   var error_text = "Failed to update database";
				   MP_ModalDialog.deleteModalDialogObject("pwxerrormodal")
				   var pwxerrorModalobj = new ModalDialog("pwxerrormodal")
				   	.setHeaderTitle('<span class="pwx_alert">' + modaltitle + '</span>')
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   pwxerrorModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + error_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true);
				   pwxerrorModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(pwxerrorModalobj);
				   MP_ModalDialog.showModalDialog("pwxerrormodal")				   
			    }else{
				   var sucess_text = "Charge "+successmsg+" successfully.";
				   var notificationtitle = ""+modaltitle+" Notification"
				   MP_ModalDialog.deleteModalDialogObject("successmodal")
				   var feenotificationModalobj = new ModalDialog("successmodal")
				   	.setHeaderTitle(notificationtitle)
				   	.setTopMarginPercentage(30)
				   	.setRightMarginPercentage(35)
				   	.setBottomMarginPercentage(30)
				   	.setLeftMarginPercentage(35)
				   	.setIsBodySizeFixed(true)
				   	.setHasGrayBackground(true)
				   	.setIsFooterAlwaysShown(true);
				   feenotificationModalobj.setBodyDataFunction(
				   	function (modalObj){
				   	modalObj.setBodyHTML('<div style="padding-top:10px;"><p class="pwx_small_text">' + sucess_text + '</p></div>');
				   }
				   );
				   var closebtn = new ModalButton("addCancel");
				   closebtn.setText("OK").setCloseOnClick(true).setOnClickFunction(function () {
					 //refresh current selection upon Ok button click
					 var sendArrafterpriceupdate  = [];
					 var timerreqdata = [];
					 var timerreqdatapush = [];
					 var effdate = $("#amb_price_header_filter_eff_date_val").val();
					 var enddate = $("#amb_price_header_filter_end_date_val").val();
					 var bill_code = $("#amb_price_header_filter_bill_cd_val").val();
					 var PriceSchArray = CreateParamArray(price_sch_array, 1);
					 var BillCodeArray = CreateParamArray(bill_code_array, 1);
				     MP_ModalDialog.closeModalDialog("successmodal")
					 MP_ModalDialog.closeModalDialog("priceupdate")
					 sendArrafterpriceupdate = ["^MINE^", criterionObj.CRITERION.ENCNTRID + ".0", criterionObj.CRITERION.PRSNL_ID + ".0", "^" + effdate + "^", "^" + enddate + "^"];
					 timerreqdatapush.push("searchType: quicksearch");
					timerreqdatapush.push("Date: "+effdate);
					timerreqdatapush.push("BillCode: "+(bill_code == "")? "All" : bill_code);
					timerreqdatapush.push("PriceScheduleCnt : "+PriceSchArray.length);
					timerreqdatapush.push("BillCodeTypeCnt : "+BillCodeArray.length);
					timerreqdatapush.push("ActivityType: All");
					timerreqdatapush.push("Exclude0: Yes");
					timerreqdata = timerreqdatapush.join(",");		
					 
					 $("tbody#amb_price_tbody_id").empty()
					 $("#amb_price_error_row_id").empty()
					 $('#amb_price_content_id').html('<div id="amb_prvu_loading_div"><span class="amb_prvu_loading-spinner"></span><br/><span id="amb_prvu_loading_text">It may take few minutes to load. Please wait...</span></div>');
					 thiz.clearPRICEObj(); //always clear object before it can used
					 thiz.callPriceDataGather(sendArrafterpriceupdate, timerreqdata, timer) //call data gather script		
				   })
				   feenotificationModalobj.addFooterButton(closebtn)
				   MP_ModalDialog.addModalDialogObject(feenotificationModalobj);
				   MP_ModalDialog.showModalDialog("successmodal")  
					//Hide close icon so they can exit modal by clicking ok button
				   $('.dyn-modal-hdr-close').css('display','none')
				}
	        }); 	  
	    })		
	    priceupdatemodalobj.addFooterButton(actionbtn)		   
	   var closebtn = new ModalButton("addCancel");
	   closebtn.setText("Close").setCloseOnClick(true);
	   priceupdatemodalobj.addFooterButton(closebtn)
	   MP_ModalDialog.addModalDialogObject(priceupdatemodalobj);
	   MP_ModalDialog.showModalDialog("priceupdate")
	   
        //restrict textbox to allow only certain number of inputs
		//valid price : 123, 123456, 123.45
        //Not valid price: 123. , 123.4, 123.345, aaa123, aabbcc, aa#$%, 1234567 (more than 6 digit so it is not valid) 
	    $("#cp_chg_upd_id, #net_chg_upd_id, #nc_chg_upd_id ,#at_chg_upd_id ,#ah_chg_upd_id, #rs_chg_upd_id,#ob_chg_upd_id").on("keypress keyup blur",function (event) {	
			priceupdatemodalobj.setFooterButtonDither("chgupdatebtn", false)	
		}) 
		
	
		//apply datepicker to modal
		//This area execute when user select dates
	    var dates = $("#clwx_eff_updtdt_box").datepicker({
			changeMonth : true,
			changeYear : true,
			minDate : new Date(new Date().getFullYear(), 0, 1),
			maxDate : new Date(new Date().getFullYear(), 12, 0),
			onSelect : function (selectedDate) {
				instance = $(this).data("datepicker"),
				date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
				dates.not(this).datepicker("option", date);								
			}
	    });
		$("#net_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_NET); 
		$("#cp_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_COPAY); 
		$("#nc_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_NC); 
		$("#at_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_AUTH);
		$("#rs_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_RT);
		$("#ob_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_OB);
		$("#ah_chg_upd_id").val(thiz.pricerecorddata.CHARGE[indexClicked].CHARGE_ATTACH);		
    })
	
}


  