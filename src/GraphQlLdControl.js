import React, { useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap'

import { Client } from 'graphql-ld';
import { QueryEngineSparqlEndpoint } from 'graphql-ld-sparqlendpoint';

import JSONTree from 'react-json-tree'
// ReactJson (npm react-json-view) provides a possible alternative control to JSONTree

const defaultContext = `
{
  "@context": {
    "label": { 
        "@id": "http://www.w3.org/2000/01/rdf-schema#label", 
        "@language": "en" },
    "writer": { "@id": "http://dbpedia.org/property/writer" },
    "artist": { "@id": "http://dbpedia.org/ontology/artist" }
  }
}
`.trim();

const defaultEndpoint = 'http://dbpedia.org/sparql';
let client = null;

const defaultQuery = `
{ 
  label 
  writer(label: "Elvis Costello") 
  artist { label }
}
`.trim();

const outputFormats = [
  { label: "Tree", value: "TREE" },
  { label: "JSON (Compact)", value: "JSON_COMPACT" },
  { label: "JSON (Formatted)", value: "JSON_FORMATTED" },
];
const defaultOutputFormat = "TREE"

// ------------------------------------------------------------------

export function GraphQlLdControl(props) {

  const [queryResult, setQueryResult] = useState(null);
  const [query, setQuery] = useState(defaultQuery);
  const [status, setStatus] = useState(null);
  const [context, setContext] = useState(defaultContext);
  const [endpoint, setEndpoint] = useState(defaultEndpoint);
  const [outputFormat, setOutputFormat] = useState(defaultOutputFormat);

  const execQuery = async () => {
    let contextObj;

    try {
      let parsedEndpointUrl = new URL(endpoint);
      if (!parsedEndpointUrl || parsedEndpointUrl.origin === 'null')
        throw new Error('URL parsing error');
    }
    catch (ex) {
      setStatus('Invalid SPARQL endpoint URL: ' + ex.message);
      return null;
    }

    try {
      if (context.trim())
        contextObj = JSON.parse(context);
      else
        contextObj = null;
    }
    catch (ex) {
      setStatus('Invalid context: ' + ex.toString());
      return null;
    }

    try {
      if (!client) {
        client = new Client({ context: contextObj, queryEngine: new QueryEngineSparqlEndpoint(endpoint) });
      }
      const { data } = await client.query({ query });
      setQueryResult(data);
    }
    catch (ex) {
      setStatus('Query execution failed: ' + ex.toString());
      return null;
    }
  }

  const queryChangeHandler = (event) => {
    setQueryResult(null);
    setStatus(null);
    setQuery(event.target.value);
  }

  const contextChangeHandler = (event) => {
    client = null;
    setQueryResult(null);
    setStatus(null);
    setContext(event.target.value);
  }

  const endpointChangeHandler = (event) => {
    client = null;
    setQueryResult(null);
    setStatus(null);
    setEndpoint(event.target.value);
  }

  const outputFormatChangeHandler = (event) => {
    setOutputFormat(event.target.value);
  }

  const clearQueryResult = () => {
    setQueryResult(null);
    setStatus(null);
  }

  const resetDefaults = () => {
    client = null;
    setQueryResult(null);
    setStatus(null);
    setQuery(defaultQuery);
    setEndpoint(defaultEndpoint);
    setContext(defaultContext);
    setOutputFormat(defaultOutputFormat);
  }

  const renderedQueryResult = (format) => {
    let res;
    switch (format) {
      case "TREE":
        res = <JSONTree data={queryResult} theme={{ scheme: 'marakesh' }} />;
        break;
      case "JSON_COMPACT":
        res = <p className="qryRsltJsonText">{JSON.stringify(queryResult)}</p>;
        break;
      case "JSON_FORMATTED":
      default:
        res = <pre className="qryRsltJsonText">{JSON.stringify(queryResult, null, 2)}</pre>;
        break;
    }

    return res;
  }

  const queryResultMetaData = () => {
    if (queryResult) {
      let contextObj = context.trim() ? JSON.parse(context) : null;
      let metadata = contextObj ? contextObj : {};

      metadata.queryResult = queryResult;

      return (
        <script type="application/ld+json">
          {JSON.stringify(metadata)}
        </script>
      );
    }
    else {
      return null;
    }
  }

  return (
    <>
      <Form>
        <Form.Group>
          <Form.Label>SPARQL Endpoint:</Form.Label>
          <Form.Control className="inputCntrl1" value={endpoint} onChange={endpointChangeHandler} />
        </Form.Group>
        <div style={{ display: "flex" }}>
          <Form.Group style={{ flex: "1" }}>
            <Form.Label>GraphQL:</Form.Label>
            <Form.Control className="inputCntrl1 inputTextArea" as="textarea" rows={10}
              value={query} onChange={queryChangeHandler}
            />
          </Form.Group>
          <div>&nbsp;</div>
          <Form.Group style={{ flex: "1" }}>
            <Form.Label>Context:</Form.Label>
            <Form.Control className="inputCntrl1 inputTextArea" as="textarea" rows={10}
              value={context} onChange={contextChangeHandler}
            />
          </Form.Group>
        </div>
        <Button onClick={() => execQuery()}>Execute</Button> &nbsp;
        <Button onClick={() => clearQueryResult()}>Clear</Button> &nbsp;
        <Button onClick={() => resetDefaults()}>Reset</Button>
        <Row style={{ marginBottom: "5px" }}>
          <Col>
            <Form.Group>
              <Form.Label style={{ position: "relative", top: "5px" }}>Query result:</Form.Label>
            </Form.Group>
          </Col>
          <Col>
            <Form inline>
              <Form.Group className="d-flex justify-content-end" style={{ width: "100%" }}>
                <Form.Label style={{ paddingRight: "10px" }}>Output format:</Form.Label>
                <Form.Control as="select" value={outputFormat} onChange={outputFormatChangeHandler} style={{ fontSize: "90%" }}>
                  {outputFormats.map((format) => (
                    <option value={format.value}>{format.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form>
          </Col>
        </Row>
        <Form.Group>
          <div className="qryRsltContainer">
            {
              queryResult ?
                renderedQueryResult(outputFormat) :
                <div className="errorTxtContainer" />
            }
            {
              status ? <p className="errorTxt">{status}</p> : ''
            }
          </div>
        </Form.Group>
      </Form>
      {queryResultMetaData()}
    </>
  );
}



