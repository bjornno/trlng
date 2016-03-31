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
    Meteor.subscribe('userPresence', geo);
    let query = {};

    return {
      tasks: Tasks.find(query, {sort: {createdAt: 1}}).fetch(),
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
  componentDidMount() {
    React.findDOMNode(this.refs.tasks).scrollTop = 100000;
  },
  componentDidUpdate() {
    React.findDOMNode(this.refs.tasks).scrollTop = 100000;
  },
  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    let text = React.findDOMNode(this.refs.textInput).value.trim();
    let geo = Session.get('geo');
    Meteor.call("addTask", text, geo);
    if (text == "troll help") {
      Meteor.call("addBotTask", "Hi, you can ask me of anything ", geo);
    } else if (text.indexOf("troll ") == 0) {
      Meteor.call("addBotTask", Fake.fromArray(['banana', 'apple', 'strawberry', 'raspberry', 'pear']), geo);
    }

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
      <div >
        <header>
          <h1>TROLL AWAY</h1>
          { this.data.all_count} users online
          <AccountsUIWrapper />

          
        </header>
        <div className="content" ref="tasks">
        <ul>
          {this.renderTasks()}
        </ul>
        </div>
        <div className="footer">
        { this.data.currentUser ?
            <form className="new-task" onSubmit={this.handleSubmit} >
              <input
                type="text"
                ref="textInput"
                placeholder="new message.." />
            </form> : ''
          }
        </div>
      </div>
    );
  }
});
