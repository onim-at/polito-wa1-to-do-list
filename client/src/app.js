import React from 'react';
import Header from "./js/header.js"
import { MainContent } from "./js/mainContent.js"
import { Sidebar } from "./js/sidebar.js"
import { ModalTaskForm } from './js/taskForm.js';
import * as API from "./js/API.js"
import Task from './js/task.js';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { LoginModal } from "./js/login.js"
import Alert from "react-bootstrap/Alert"
import Col from "react-bootstrap/Col"

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			taskList: [],
			project: [],
			filter: "All",
			currentTask: null,
			openMobileMenu: false,
			user: '',
			id: '',
			logged: false,
			csrfToken: null
		};
	}

	getProjects(taskList) {
		return [...new Set(taskList.map(task => task.project).filter(a => a != null))]
	}

	componentDidMount() {
		API.getTasks().then((taskList) => this.setState({
			taskList: [...taskList],
			projects: this.getProjects(taskList)
		}));
	}

	setFilter = (filterName, filterId) => {
		API.getTasks(filterId, this.state.csrfToken, this.state.id).then((taskList) => {
			this.setState({ taskList: [...taskList], filter: filterName });

			if (filterName.localeCompare("All") === 0) {
				this.setState({ projects: this.getProjects(taskList) });
			}
		});

	}

	addOrEditTask = (task) => {
		if (task.id == null) {
			API.addTask(Task.from(task), this.state.csrfToken, this.state.id).then((data) => {
				if (data) {
					task.id = data.id;
					this.setState((state) => {
						let newTaskList = [...this.state.taskList];
						newTaskList.push(task);
						return { taskList: newTaskList, projects: this.getProjects(newTaskList) };
					})
				}
			});
		}
		else {
			API.updateTask(Task.from(task), this.state.csrfToken).then(() => {
				this.setState((state) => {
					let newTaskList = this.state.taskList.filter((t) => t.id !== task.id);
					newTaskList.push(Task.from(task));
					return { taskList: [...newTaskList], projects: this.getProjects(newTaskList) };
				})
			});
		}

	};
	completedTask = (task) => {
		task.completed = !task.completed;
		API.updateTask(Task.from(task), this.state.csrfToken).then(() => {
			this.setState((state) => {
				let newTaskList = this.state.taskList.filter((t) => t.id !== task.id);
				newTaskList.push(Task.from(task));
				return { taskList: [...newTaskList] };
			})
		});
	}
	deleteTask = (id) => {
		API.deleteTask(id, this.state.csrfToken).then(async (response) => {
			this.setState((state) => {
				let newTaskList = this.state.taskList.filter((t) => t.id !== id);
				return { taskList: [...newTaskList] }
			})
		})
	}

	showSidebar = () => {
		this.setState((state) => ({ openMobileMenu: !state.openMobileMenu }));
	}

	userLogin = (user, pass) => {
		return new Promise((resolve, reject) => {
			API.userLogin(user, pass).then(
				(userObj) => {
					console.log(userObj)
					this.setState({ logged: true, user: userObj.name, id: userObj.id });
					this.setFilter("All", "all");
					API.getCSRFToken().then((response) => this.setState({ csrfToken: response.csrfToken }));
					resolve("done");
				}
			).catch(
				() => { console.log("ERROR"); this.setState({ logged: false }); resolve(null) }
			);
		})
	}

	userLogout = () => {
		API.userLogout().then(
			() => {
				this.setState({
					logged: false, user: '', id: '',
					taskList: [],
					projects: []
				})
			}
		);
	}


	render() {
		return <>
			<Router>
				<Header showSidebar={this.showSidebar} logged={this.state.logged} user={this.state.user} userLogout={this.userLogout}></Header>
				<Container fluid>
					<Row className="row vheight-100">
						{this.state.user !== "" && <>
							<Sidebar projects={this.state.projects} setFilter={this.setFilter} openMobileMenu={this.state.openMobileMenu}></Sidebar>
							<MainContent taskList={this.state.taskList} filter={this.state.filter} deleteTask={this.deleteTask} completedTask={this.completedTask}></MainContent>
							<Link to="/add"><Button size='lg' variant="primary" className='fixed-right-bottom' id="addButton">&#43;</Button></Link>
						</>}
						{this.state.user === "" &&
							<Col sm={9} className="below-nav" >
								<Alert variant="success">
									<Alert.Heading>Hey, nice to see you</Alert.Heading>
									<p>
										This web app allows you to save your to-dos list, modify the item and
										share some of them with other user. Currently there is no option to
										create a new account, you can login with (user1 - password) or
										(user2 - password)
  								</p>
									<hr />
									<p className="mb-0">
										I've created this small web app during the master degree "Wep Application 1"
										course of politecnico di Torino.
  								</p>
								</Alert>
							</Col>

						}
						<Switch>
							<Route path="/update/:id" render={({ match }) => {
								let task = this.state.taskList.find((m) => (m.id === parseInt(match.params.id)));
								console.log(task);
								return <ModalTaskForm show={true} taskFormMode={"Update"} addOrEditTask={this.addOrEditTask} task={task}></ModalTaskForm>
							}} />
							<Route path="/add" render={({ match }) => {
								return <ModalTaskForm show={true} taskFormMode={"Add"} addOrEditTask={this.addOrEditTask}></ModalTaskForm>
							}} />

							<Route path="/login" render={({ match }) => {
								return <LoginModal show={true} userLogin={this.userLogin} ></LoginModal>
							}} />

						</Switch>
					</Row>
				</Container>
			</Router>
		</>
	}
}

export default App;