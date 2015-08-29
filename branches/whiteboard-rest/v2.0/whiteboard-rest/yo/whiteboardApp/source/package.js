enyo.depends(
	// for deploying (temporary fix) replace $lib/../ to $lib//
	"$lib/../jquery/dist/jquery.js",
	"$lib/../raphael/raphael.js",
	"$lib/../raphael.json/raphael.json.js",
	"$lib/../CryptoJS/src/core.js",
	"$lib/../CryptoJS/src/enc-base64.js",
	"$lib/../CryptoJS/src/sha256.js",
	"$lib/../raphael.export/raphael.export.js",
	"$lib/../raphael.free_transform/raphael.free_transform.js",
	"$lib/../jquery-dateFormat/dist/dateFormat.js",
	//"$lib/../jquery-file-upload/js/vendor/jquery.ui.widget.js",
	//"$lib/../jquery-file-upload/js/jquery.fileupload.js",
	"$lib/../dropzone/dist/dropzone.js",
	"$lib/../layout",
	"$lib/../onyx",
	"$lib/../../lib",
	"style",
	"data",
	"views",
	/** remove test in production **/
	"Test.js",
	"app.js"
)