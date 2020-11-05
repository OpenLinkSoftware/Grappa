import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { GraphQlLdControl } from './GraphQlLdControl'

import graphQlLogo from './graphql2sparql.png'
import './App.css';

function App() {
  return (
    <>
      <Navbar className="navbar">
        <Navbar.Brand className="navbarBrand" href="">
          <img src={graphQlLogo} height="40" alt="logo" />
        &nbsp;&nbsp;
        Grappa : A GraphQL-SPARQL-Bridge test tool</Navbar.Brand>
      </Navbar>

      <Container className="appContainer" >
        <Row>
          <Col>
              <GraphQlLdControl />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
