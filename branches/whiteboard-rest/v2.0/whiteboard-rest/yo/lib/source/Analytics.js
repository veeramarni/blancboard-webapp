bjse.api.Analytics = (function() {
	return {
		EventType: {
			DOCUMENTS: "DOCUMENTS",
			CONFERENCE: "CONFERENCE",
			PROFILE: "PROFILE",
			SIGNUP: "SIGNUP",
			JOIN: "JOIN",
			REGISTER: "REGISTER",
			OPEN: "OPEN"
		},
		trackEvent: function(mainEvent, subEvent) {
			if (_gaq) {
				try {
					_gaq.push("_trackEvent", mainEvent, subEvent)
				} catch (err) {
					logError(err);
				}
			}
		}
	};
})();