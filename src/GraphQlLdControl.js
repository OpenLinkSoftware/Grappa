import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap'

import { Client } from 'graphql-ld';
import { QueryEngineSparqlEndpoint } from 'graphql-ld-sparqlendpoint';

import JSONTree from 'react-json-tree'

// Control ReactJson (npm react-json-view) provides a possible alternative to JSONTree

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
          <Form.Label style={{ color: 'white' }}>SPARQL Endpoint:</Form.Label>
          <Form.Control value={endpoint} onChange={endpointChangeHandler}
            style={{ backgroundColor: "#002b36", color: "#657b83", borderColor: "gray", clear: "both", marginBottom: "10px" }} />
        </Form.Group>
        <div style={{ display: "flex" }}>
          <Form.Group style={{ flex: "1" }}>
            <Form.Label style={{ color: 'white' }}>GraphQL:</Form.Label>
            <Form.Control as="textarea" rows={10} value={query} onChange={queryChangeHandler}
              style={{
                backgroundColor: "#002b36", color: "#657b83", borderColor: "gray", height: "200px", clear: "both",
                marginBottom: "10px", resize: "none", overflowY: "scroll"
              }} />
          </Form.Group>
          <div>&nbsp;</div>
          <Form.Group style={{ flex: "1" }}>
            <Form.Label style={{ color: 'white' }}>Context:</Form.Label>
            <Form.Control as="textarea" rows={10} value={context} onChange={contextChangeHandler}
              style={{
                backgroundColor: "#002b36", color: "#657b83", borderColor: "gray", height: "200px", clear: "both",
                marginBottom: "10px", resize: "none", overflowY: "scroll"
              }} />
          </Form.Group>
        </div>
        <Button onClick={() => execQuery()}>Execute</Button> &nbsp;
      <Button onClick={() => clearQueryResult()}>Clear</Button> &nbsp;
      <Button onClick={() => resetDefaults()}>Reset</Button>
        <Form.Group>
          <Form.Label style={{ color: 'white' }}>Query result:</Form.Label>
          <div style={{ border: "1px solid gray", borderRadius: "3px", minHeight: "150px", clear: "both", textAlign: "left", paddingLeft: "10px" }}>
            {
              queryResult ? <JSONTree data={queryResult} theme={{ scheme: 'marakesh' }} /> : <div style={{ height: "10px" }} />
            }

            {
              status ? <p style={{ color: "red" }}>{status}</p> : ''
            }
          </div>
        </Form.Group>
      </Form>
    </>
  );
}



