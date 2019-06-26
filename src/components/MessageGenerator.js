import React, { Component } from "react";
import {
  Jumbotron,
  Row,
  Col,
  Container,
  Button,
  Form,
  FormControl,
  Modal
} from "react-bootstrap";
import guests from "../data/Guests.json";
import companies from "../data/Companies.json";
import templates from "../data/Templates.json";
import { Typeahead } from "react-bootstrap-typeahead";
import { format } from "util";
const { DateTime } = require("luxon");

// Populate Dropdown Options Arrays from data files
const guestOptions = guests.map(guest => {
  const container = {};
  container.value = guest.id;
  container.firstName = guest.firstName;
  container.lastName = guest.lastName;
  return container;
});

const companiesOptions = companies.map(company => {
  const container = {};
  container.value = company.id;
  container.label = company.company;
  return container;
});


class MessageGenerator extends Component {
  state = {
    show: false,
    cId: null,
    gId: null,
    tId: null,
    message: null,
    greeting: "",
    template: {
      name: "",
      sequence: [],
      text: [],
      display: ""
    },
    radioVal: 0,
    text: "",
    validated: {
      template: true,
      guest: true,
      company: true
    },
    templateOptions: []
  };

  // Generate Greeting
  generateGreeting = () => {
    const { cId } = this.state;

    const c = companies.find(function(c) {
      return c.id === cId;
    });

    const dt = DateTime.local().setZone(c.timezone);

    if (dt.hour < 12) {
      return "Good Morning";
    } else if (dt.hour >= 12 && dt.hour < 6) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  componentDidMount() {
    let templateOptions = templates.map(template => {
      const container = {};
      container.value = template.id;
      container.label = template.name;
      return container;
    });
  
    this.setState({ templateOptions  });
  }

  validate = () => {
    const { tId, gId, cId } = this.state;
    let validated = {};

    validated.template = tId ? true : false;
    validated.guest = gId ? true : false;
    validated.company = cId ? true : false;

    this.setState({ validated });

    return tId && gId && cId;
  };

  // For Dropdown Changes
  handleChange = (selected, name) => {
    if (selected.length) {
      this.setState({ [name]: selected[0].value });
    }
  };

  handleRadio = value => {
    this.setState({ radioVal: value });
  };

  handleTemplateSubmit = () => {
    let newId = templates[templates.length - 1].id + 1;
    let template = this.state.template;
    let templateOptions = this.state.templateOptions;
    let templateOption = {};

    templateOption.value = newId;
    templateOption.label = template.name;

    template.id = newId;
    templates.push(template);
    templateOptions.push(templateOption);

  
    this.setState({ templateOptions  });
    this.setState({ show : false  });

     
  };

  handleTemplateData = () => {
    const data = this.state.radioVal;
    let template = this.state.template;

    template.sequence.push(data);
    template.display += "[" + data + "]";

    this.setState({ template });
  };

  handleTextChange = event => {
    this.setState({ text: event.target.value });
  };

  handleNameChange = event => {
    let template = this.state.template;
    template.name = event.target.value;
    this.setState({ template });
  };

  handleTemplateText = e => {
    const data = this.state.text;
    let template = this.state.template;

    template.text.push(data);
    template.sequence.push("text");
    template.display += data;
    this.setState({ template });
  };

  handleClose= () => {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  }


  // Genearte Message from Inputs
  handleGenerate = event => {
    event.preventDefault();
    const valid = this.validate();

    const { gId, tId, cId } = this.state;

    if (!valid) {
      return;
    }
    const greeting = this.generateGreeting();

    let message = "";
    let i = 0;
    let template = templates.find(function(t) {
      return t.id === tId;
    });
    let company = companies.find(function(c) {
      return c.id === cId;
    });
    let guest = guests.find(function(g) {
      return g.id === gId;
    });

    template.sequence.forEach(function(e) {
      // For each element in the template sequence array, if the element is a keyword for a data element, append the data element to the message.
      // If the keyword is for a text element i.e. text3, then enter append the text element to the messasge
      switch (e) {
        case "greeting":
          message += greeting;
          break;
        case "firstName":
          message += guest.firstName;
          break;
        case "lastName":
          message += guest.lastName;
          break;
        case "city":
          message += company.city;
          break;
        case "roomNumber":
          message += guest.reservation.roomNumber;
          break;
        case "company":
          message += company.company;
          break;
        case "text":
          message += template.text[i];
          i++;
          break;
        default:
          message += "";
          break;
      }
    });

    this.setState({ message });
  };

  render() {
    const { message, validated, radioVal, text, template, templateOptions } = this.state;

    return (
      <Container>
        <Jumbotron>
          <h1 className="text-center">Message Generator</h1>
        </Jumbotron>

        <Button className="mb-3" variant="primary" onClick={this.handleShow}>
          Create Template
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create Custom Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <h6>Template Name</h6>
          <FormControl
            onChange={this.handleNameChange}
            className="mb-2"
          />
          <Form.Check
            onClick={() => this.handleRadio("greeting")}
            aria-label="radio 1"
            type="radio"
            label="Greeting"
            checked={radioVal === "greeting" ? true : false}
          />
          <Form.Check
            onClick={() => this.handleRadio("firstName")}
            aria-label="radio 1"
            type="radio"
            label="First Name"
            checked={radioVal === "firstName" ? true : false}
          />
          <Form.Check
            onClick={() => this.handleRadio("lastName")}
            type="radio"
            label="Last Name"
            checked={radioVal === "lastName" ? true : false}
          />
          <Form.Check
            onClick={() => this.handleRadio("city")}
            aria-label="radio 1"
            type="radio"
            label="City"
            checked={radioVal === "city" ? true : false}
          />
          <Form.Check
            onClick={() => this.handleRadio("company")}
            aria-label="radio 1"
            type="radio"
            label="Company"
            checked={radioVal === "company" ? true : false}
          />
          <Form.Check
            onClick={() => this.handleRadio("roomNumber")}
            aria-label="radio 1"
            type="radio"
            label="Room Number"
            checked={radioVal === "roomNumber" ? true : false}
          />

        <Button
          className="mt-3 my-2"
          onClick={this.handleTemplateData}
          variant="primary"
          type="submit"
        >
          Add Data
        </Button>
        <FormControl
          onChange={this.handleTextChange}
          placeholder="Custom Text"
          value={text}
        />

        <Button
          className="mt-3"
          onClick={this.handleTemplateText}
          variant="primary"
          type="submit"
        >
          Add Text
        </Button>

        <p className="my-3 border">{template.display}</p>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button
          onClick={this.handleTemplateSubmit}
          variant="primary"
          type="submit"
        >
          Submit New Template
        </Button>
          </Modal.Footer>
        </Modal>

        

        <Row>
          <Col md={6}>
            <h5>Guest</h5>
            <Typeahead
              labelKey={option => `${option.firstName} ${option.lastName}`}
              multiple={false}
              isInvalid={!validated.guest}
              options={guestOptions}
              placeholder="Select guest..."
              onChange={selected => this.handleChange(selected, "gId")}
            />
          </Col>
          <Col md={6}>
            <h5>Company</h5>
            <Typeahead
              labelKey="label"
              multiple={false}
              isInvalid={!validated.company}
              options={companiesOptions}
              placeholder="Select hotel..."
              onChange={selected => this.handleChange(selected, "cId")}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <h5 className="mt-3">Message Template</h5>
            <Typeahead
              labelKey="label"
              multiple={this.state.show ? false : false}
              isInvalid={!validated.template}
              options={this.state.templateOptions}
              placeholder="Select template..."
              onChange={selected => this.handleChange(selected, "tId")}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Button
              className="mt-3"
              onClick={this.handleGenerate}
              variant="primary"
              type="submit"
            >
              Generate
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <h5 className="mt-5">Message Output</h5>
            <Form.Control as="textarea" value={message} rows="3" />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default MessageGenerator;
