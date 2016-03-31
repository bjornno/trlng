Accounts.ui.config({
	passwordSignupFields: "USERNAME_ONLY"
});

Meteor.startup(function () {
	Tracker.autorun(function () {
	  let loc = Geolocation.latLng();
	  if (loc) {
	    Session.set('geo', {
	      lat: parseFloat(loc.lat.toFixed(3)), 
	      lng: parseFloat(loc.lng.toFixed(3))
	    });
	  }
	}); 
	React.render(<App />, document.getElementById("render-target"));
});

Presence.state = function() {
	let geo = Session.get('geo');
  return {
        type: "Point",
        coordinates: [geo.lng, geo.lat]
      };
}