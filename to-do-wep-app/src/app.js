import React from 'react';
import {Navbar} from "./navbar.js"
import {PageContent} from "./pageContent.js"

/*
const fakeExams = [
    {id: 1, description: "Complete Lab 7", important: true, privateTask: true, deadline: moment('2020-05-09'), project: "WebApp I", completed: false},
    {id: 1, description: "Complete Lab 4", important: false, privateTask: true, deadline: moment('2020-05-11'), project: "ProgSys", completed: false},
    {id: 1, description: "Third delivery: testing", important: true, privateTask: false, deadline: moment('2020-05-17'), project: "Softeng", completed: false},
    {id: 1, description: "I'll follow the sun", important: false, privateTask: false, deadline: moment('2020-05-15'), project: "Guitar", completed: false},
    {id: 1, description: "Vita spericolata", important: false, privateTask: false, deadline: moment('2020-05-15'), project: "Guitar", completed: false}

];*/

class App extends React.Component {
    render() {
        return <div className="App">
            <Navbar></Navbar>
            <PageContent></PageContent>
        </div>
        
    }

}

export default App;