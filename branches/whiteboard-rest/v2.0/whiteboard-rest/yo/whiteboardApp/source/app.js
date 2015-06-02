/**
	Define and instantiate your enyo.Application kind in this file.  Note,
	application rendering should be deferred until DOM is ready by wrapping
	it in a call to enyo.ready().
*/

enyo.kind({
	name: "blanc.Application",
	kind: "enyo.Application",
	view: "blanc.MainView"
	//view: "blanc.Settings"
});

enyo.ready(function() {
	var pm = blanc.Session.getPersistenceManager();
	pm.init(function() {
		new blanc.Application({
			name: "app"
		});
	}, function() {

	})

});