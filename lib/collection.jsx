Tasks = new Mongo.Collection("tasks");

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
  addBotTask(text, geo) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    console.log("add task", geo);

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      username: "Troll",
      loc: {
        type: "Point",
        coordinates: [geo.lng, geo.lat]
      }
    });
  }
});