// Define a collection to hold our tasks
Tasks = new Mongo.Collection("tasks");



if (Meteor.isClient) {
  // This code is executed on the client only
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  let geo = Session.get('geo')
  Meteor.subscribe("tasks", geo);

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
}

if (Meteor.isServer) {
  Tasks._ensureIndex({'loc': '2dsphere'});
  Tasks._ensureIndex( { "createdAt": 4 }, { expireAfterSeconds: 3*24*60*60 } )

  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function (geo) {
    return Tasks.find({
      loc:
       { $near :
          {
            $geometry: { 
              type: "Point",  
              coordinates: [ geo.lng, geo.lat ] },
            $distanceField: "dist",
            $minDistance: 0,
            $maxDistance: 1000
          }
       }
    });
  });
}

Meteor.methods({
  addTask(text, geo) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    console.log("add task", geo);

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      loc: {
        type: "Point",
        coordinates: [geo.lng, geo.lat]
      }
    });
  },
});
