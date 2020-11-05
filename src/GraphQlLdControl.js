import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap'

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

// ------------------------------------------------------------------

export function GraphQlLdControl(props) {

  const [queryResult, setQueryResult] = useState(null);
  const [query, setQuery] = useState(defaultQuery);
  const [status, setStatus] = useState(null);
  const [context, setContext] = useState(defaultContext);
  const [endpoint, setEndpoint] = useState(defaultEndpoint);

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
        <Form.Group>
          <Form.Label>Query result:</Form.Label>
          <div className="qryRsltContainer">
            {
              queryResult ?
                <JSONTree data={queryResult} theme={{ scheme: 'marakesh' }} /> :
                <div className="errorTxtContainer" />
            }
            {
              status ? <p className="errorTxt">{status}</p> : ''
            }
          </div>
        </Form.Group>
      </Form>
    </>
  );
}



