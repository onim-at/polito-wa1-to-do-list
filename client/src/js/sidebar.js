import React from 'react';
import ListGroup from "react-bootstrap/ListGroup"
import Col from "react-bootstrap/Col"
import Collapse from 'react-bootstrap/Collapse'

const filter_list = ["All", "Important", "Today", "Next 7 Days", "Private", "Shared With..."];
const filter_filter_id
    = ["all", "important", "today", "week", "private", "shared"];
const filter_number = 6;
class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active_id: 0
        }
    }

    setActiveId = (id) => {
        this.setState({ active_id: id });
    }
    render() {
        return (
            <Collapse in={this.props.openMobileMenu}>
                <Col sm={3} bg="light" id="left-sidebar" className="collapse d-sm-block below-nav">
                    <ListGroup defaultActiveKey="#all" variant="flush">
                        {filter_list.map((filter, index) => (<Filter key={index} index={index} filter={filter} filter_id={filter_filter_id[index]}
                            setActiveId={this.setActiveId} setFilter={this.props.setFilter} />))}

                        <h5 className="border-bottom border-gray p-3 mt-3">Projects</h5>
                        {this.props.projects &&
                            this.props.projects.map((project, index) => (<Filter key={index + filter_number} index={index + filter_number} filter={project} filter_id={project}
                                setActiveId={this.setActiveId} setFilter={this.props.setFilter} />))}
                    </ListGroup>
                </Col>
            </Collapse>
        )
    }
}

function Filter(props) {
    return (
        <ListGroup.Item action href={"#" + props.filter_id} id={props.filter_id}
            onClick={() => { props.setFilter(props.filter, props.filter_id); }}>
            {props.filter}
        </ListGroup.Item>
    )
}


export { Sidebar }