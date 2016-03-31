// App component - represents the whole app
App = React.createClass({

  // This mixin makes the getMeteorData method work
  mixins: [ReactMeteorData],

  // Loads items from the Tasks collection and puts them on this.data.tasks
  getMeteorData() {
    let geo = Session.get('geo');
    if (geo == null) {
      console.log("no geo");
    }
    Meteor.subscribe("tasks", geo);
    Meteor.subscribe('userPresence');
    let query = {};

    return {
      tasks: Tasks.find(query, {sort: {createdAt: -1}}).fetch(),
      currentUser: Meteor.user(),
      all_count: Presences.find().count()
    };
  },

  renderTasks() {
    // Get tasks from this.data.tasks
    return this.data.tasks.map((task) => {
      const currentUserId = this.data.currentUser && this.data.currentUser._id;

      return <Task
        key={task._id}
        task={task} />;
    });
  },

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    let text = React.findDOMNode(this.refs.textInput).value.trim();

    let geo = Session.get('geo');
    Meteor.call("addTask", text, geo);

    // Clear form
    React.findDOMNode(this.refs.textInput).value = "";
  },

  toggleHideCompleted() {
    this.setState({
      hideCompleted: ! this.state.hideCompleted
    });
  },

  render() {
    return (
      <div className="container">
        <header>
          <h1>TROLL AWAY</h1>
          { this.data.all_count} users online
          <AccountsUIWrapper />

          { this.data.currentUser ?
            <form className="new-task" onSubmit={this.handleSubmit} >
              <input
                type="text"
                ref="textInput"
                placeholder="new message.." />
            </form> : ''
          }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
});
