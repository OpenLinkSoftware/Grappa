import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { GraphQlLdControl } from './GraphQlLdControl'

import graphQlLogo from './graphql2sparql.png'
import './App.css';

function App() {

  const appMetaData = () => {
    const ldJsonObj = {
      "@context": {
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "schema": "http://schema.org/",
        "skos": "http://www.w3.org/2004/02/skos/core#"
      },
      "@id": "#this",
      "@type": "schema:SoftwareApplication",
      "schema:description": "Provides a testbed for exercising a GraphQL to SPARQL bridge.",
      "schema:name": "Grappa",
      "skos:altLabel": "Grappa",
      "schema:relatedLink": {
        "@id": "https://github.com/OpenLinkSoftware/Grappa/tree/develop"
      }
    };

    return (
      <script type="application/ld+json">
        {JSON.stringify(ldJsonObj)}
      </script>
    )
  };

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
      {appMetaData()}
    </>
  );
}

export default App;
