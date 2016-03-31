Tasks._ensureIndex({'loc': '2dsphere'});
Tasks._ensureIndex( { "createdAt": 4 }, { expireAfterSeconds: 3*24*60*60 } )
Presences._ensureIndex({'state': '2dsphere'});

  // Only publish tasks that are public or belong to the current user
Meteor.publish("tasks", function (geo) {
	if (geo) {
		return Tasks.find({
		  loc:
		   { $near :
		      {
		        $geometry: { 
		          type: "Point",  
		          coordinates: [ geo.lng, geo.lat ] },
		        $distanceField: "dist",
		        $minDistance: 0,
		        $maxDistance: 100
		      }
		   }
		})
	} else {
		return null;
	}
});

Meteor.publish('userPresence', function (geo) {
  // Setup some filter to find the users your user
  // cares about. It's unlikely that you want to publish the 
  // presences of _all_ the users in the system.

  // If for example we wanted to publish only logged in users we could apply:
  // filter = { userId: { $exists: true }};
  var filter = {}; 

  return Presences.find({
		  state:
		   { $near :
		      {
		        $geometry: { 
		          type: "Point",  
		          coordinates: [ geo.lng, geo.lat ] },
		        $distanceField: "dist",
		        $minDistance: 0,
		        $maxDistance: 100
		      }
		   }
		}, { fields: { state: true, userId: true }});
});