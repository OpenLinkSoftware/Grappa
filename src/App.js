import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { GraphQlLdControl } from './GraphQlLdControl'

import graphQlLogo from './graphql2sparql.png'
import './App.css';

function App() {
  return (
    <>
      <Navbar style={{ backgroundColor: '#002b36' }}>
        <Navbar.Brand href="#" style={{ color: '#677a97' }}>
          <img src={graphQlLogo} height="40" alt="logo" />
        &nbsp;&nbsp;
        Grappa : A GraphQL-SPARQL-Bridge test tool</Navbar.Brand>
      </Navbar>

      <Container style={{ backgroundColor: '#002b36', marginTop: '30px', paddingTop: '30px', paddingBottom: '30px', borderRadius: "10px" }}>
        <Row>
          <Col>
            <div className="App">
              <div>
                <GraphQlLdControl />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
