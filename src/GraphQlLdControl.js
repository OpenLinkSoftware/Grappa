import React, { useState, useEffect } from 'react';
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
  { label: "Tree", value: "fmt_tree" },
  { label: "JSON (Compact)", value: "fmt_json" },
  { label: "JSON (Formatted)", value: "fmt_json_formatted" },
];
const defaultOutputFormat = "fmt_tree"

// ------------------------------------------------------------------

export function GraphQlLdControl(props) {

  const { qsEndpoint, qsQuery, qsContext, qsOutputFormat  } = getQueryStringParams(props.pageUrl);

  const [queryResult, setQueryResult] = useState(null);
  const [query, setQuery] = useState(qsQuery ? qsQuery : defaultQuery);
  const [status, setStatus] = useState(null);
  const [context, setContext] = useState(qsContext ? qsContext : defaultContext);
  const [endpoint, setEndpoint] = useState(qsEndpoint ? qsEndpoint : defaultEndpoint);
  const [outputFormat, setOutputFormat] = useState(qsOutputFormat ? qsOutputFormat : defaultOutputFormat);

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

    window.history.pushState({}, document.title, new URL(props.pageUrl).pathname);
  }

  const renderedQueryResult = (format) => {
    let res;
    switch (format) {
      case "fmt_tree":
        res = <JSONTree data={queryResult} theme={{ scheme: 'marakesh' }} />;
        break;
      case "fmt_json":
        res = <p className="qryRsltJsonText">{JSON.stringify(queryResult)}</p>;
        break;
      case "fmt_json_formatted":
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

  function getQueryStringParams(pageUrl) {
    try {
      let params, qsEndpoint, qsQuery, qsContext, qsOutputFormat;

      params = new URL(pageUrl).searchParams;
      qsEndpoint = params.has('endpoint') ? decodeURIComponent(params.get('endpoint')).trim() : null;
      qsQuery = params.has('query') ? decodeURIComponent(params.get('query')).trim() : null;
      qsContext = params.has('context') ? decodeURIComponent(params.get('context')).trim() : null;
      qsOutputFormat = params.has('format') ? decodeURIComponent(params.get('format')).trim() : null;
      return { qsEndpoint, qsQuery, qsContext, qsOutputFormat };
    }
    catch (e) {
      return {};
    }
  }

  // If the page URL specifies a query then execute it on page load.
  // Note: useEffect(..., []) is equivalent to componentDidMount
  useEffect(() => {
    if (qsEndpoint && qsQuery && qsContext && !queryResult)
    execQuery();
    // eslint-disable-next-line
  }, []);

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
        <Button onClick={() => resetDefaults()}>Defaults</Button>
        <Row style={{ marginBottom: "5px" }}>
          <Col>
            <Form.Group>
              <Form.Label style={{ position: "relative", top: "5px" }}>Query result:</Form.Label>
            </Form.Group>
          </Col>
          <Col>
            <div className="form-inline">
              <Form.Group className="d-flex justify-content-end" style={{ width: "100%" }}>
                <Form.Label style={{ paddingRight: "10px" }}>Output format:</Form.Label>
                <Form.Control as="select" value={outputFormat} onChange={outputFormatChangeHandler} style={{ fontSize: "90%" }}>
                  {outputFormats.map((format) => (
                    <option value={format.value}>{format.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
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



