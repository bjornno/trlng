// Define a collection to hold our tasks
Tasks = new Mongo.Collection("tasks");



if (Meteor.isClient) {
  // This code is executed on the client only
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
  });
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  let geo = Session.get('geo')
  Meteor.subscribe("tasks", geo);

  Meteor.startup(function () {
    // Use Meteor.startup to render the component after the page is ready
    React.render(<App />, document.getElementById("render-target"));
  });
}

if (Meteor.isServer) {
  Tasks._ensureIndex({'loc': '2dsphere'});
  Tasks._ensureIndex( { "createdAt": 4 }, { expireAfterSeconds: 3*24*60*60 } )

  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function (geo) {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ],
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

  removeTask(taskId) {
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },

  setChecked(taskId, setChecked) {
    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },

  setPrivate(taskId, setToPrivate) {
    const task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});
