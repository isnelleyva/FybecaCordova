__unit("index.html");

__uses("packages.js");
__uses("RSAKeyFormat.js");
__uses("RSAMessageFormat.js");
__uses("RSAMessageFormatSOAEP.js");
__uses("RSAMessageFormatBitPadding.js");
__uses("RSA.init1.js");
__uses("RSA.init2.js");

var RSA = __import(this, "titaniumcore.crypto.RSA");
var RSAMessageFormatSOAEP = __import(this, "titaniumcore.crypto.RSAMessageFormatSOAEP");
var RSAMessageFormatBitPadding = __import(this, "titaniumcore.crypto.RSAMessageFormatBitPadding");
var RSAKeyFormat = __import(packageRoot, "titaniumcore.crypto.RSAKeyFormat");

RSA.installKeyFormat(RSAKeyFormat);
RSA.installMessageFormat(RSAMessageFormatSOAEP);

var defaultText = '';

function stringBreak(s, col) {
	var result = "";
	for ( var i = 0; i < s.length; i++) {
		result += s.charAt(i);
		if (((i + 1) % col == 0) && (0 < i)) {
			result += "\n";
		}
	}
	return result;
}
function pack(s) {
	var result = "";
	for ( var i = 0; i < s.length; i++) {
		var c = s.charAt(i);
		if (c == " " || c == "\t" || c == "\r" || c == "\n") {
		} else {
			result += c;
		}
	}
	return result;
}

function encrypt(text) {

	var result = '';

	var rsa = readPublicKey(createRSA());
	if (!publicCheckEncryption(rsa, text)) {
		return;
	}
	try {
		result = base64_encode(rsa.publicEncrypt(text));
	} catch (e) {
		alert(e);
	}
	console.log(result);
};

function createRSA() {
	var rsa = new RSA();
	// if (document.form1.requirePaddingCheckbox.checked) {
	// rsa.messageFormat = RSAMessageFormatSOAEP;
	// } else {
	rsa.messageFormat = RSAMessageFormatBitPadding;
	// }
	return rsa;
};

function readPublicKey(rsa) {
	rsa.publicKeyBytes(base64x_decode('bqvgHLzQjv8hKzz5mGtyLpHacgDpOWjCUQs3VqkO1xxTRpnD0k7XSmjbX5mrsLuPKs1wfuHpPErPrPxbDxajHJ8pfHCwCMDihWKSJCcGcOh1P4'));
	return rsa;
}

function publicCheckEncryption(rsa, text) {
	var maxsize = rsa.publicEncryptMaxSize();
	var size = str2utf8(text).length;
	if (maxsize < size) {
		alert("text length (" + size + ") exceeds the maximum length(" + maxsize + ") for this RSA key");
		return false;
	}
	return true;
}