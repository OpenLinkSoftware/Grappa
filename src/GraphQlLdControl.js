import React, { useState, useEffect, useLayoutEffect } from 'react';
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
  const pageUrl = new URL(props.pageUrl);

  const [queryResult, setQueryResult] = useState(null);
  const [query, setQuery] = useState(qsQuery ? qsQuery : defaultQuery);
  const [status, setStatus] = useState(null);
  const [context, setContext] = useState(qsContext ? qsContext : defaultContext);
  const [endpoint, setEndpoint] = useState(qsEndpoint ? qsEndpoint : defaultEndpoint);
  const [outputFormat, setOutputFormat] = useState(qsOutputFormat ? qsOutputFormat : defaultOutputFormat);
  const [queryPermalink, setQueryPermalink] = useState(props.pageUrl);

  const execQuery = async () => {
    let contextObj;

    clearQueryResult();
    try {
      let parsedEndpointUrl = new URL(endpoint);
      if (!parsedEndpointUrl || parsedEndpointUrl.origin === 'null')
        throw new Error('URL parsing error');
    }
    catch (ex) {
      setStatus('Invalid SPARQL endpoint URL: ' + ex.message);
      return;
    }

    try {
      if (context.trim())
        contextObj = JSON.parse(context);
      else
        contextObj = null;
    }
    catch (ex) {
      setStatus('Invalid context: ' + ex.toString());
      return;
    }

    try {
      if (!client) {
        client = new Client({ context: contextObj, queryEngine: new QueryEngineSparqlEndpoint(endpoint) });
      }
      const { data } = await client.query({ query });
      setQueryResult(data);
      return;
    }
    catch (ex) {
      setStatus('Query execution failed: ' + ex.toString());
      return;
    }
  }

  const queryChangeHandler = (event) => {
    clearQueryResult();
    setQuery(event.target.value);
  }

  const contextChangeHandler = (event) => {
    client = null;
    clearQueryResult();
    setContext(event.target.value);
  }

  const endpointChangeHandler = (event) => {
    client = null;
    clearQueryResult();
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
    clearQueryResult();
    setQuery(defaultQuery);
    setEndpoint(defaultEndpoint);
    setContext(defaultContext);
    setOutputFormat(defaultOutputFormat);

    // Strip off any query string provided initially,
    // i.e. any query permalink which was executed on page load
    window.history.pushState({}, document.title, pageUrl.pathname); 
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

  function makeQueryPermalink() {
    let validQuery;
    let tQuery = query.trim();
    let tContext = context.trim();
    let tEndpoint = endpoint.trim();

    // Allow bookmarks to queries which may not execute successfully.
    validQuery = tQuery && tContext && tEndpoint;

    // Only allow bookmarks to queries which have executed successfully.
    // validQuery = tQuery && tContext && tEndpoint && queryResult;

    let permalink = new URL(props.pageUrl);
    permalink.search = '';

    if (validQuery) {
      permalink.search += `endpoint=${encodeURIComponent(tEndpoint)}`;
      permalink.search += `&format=${encodeURIComponent(outputFormat)}`;
      permalink.search += `&query=${encodeURIComponent(tQuery)}`;
      permalink.search += `&context=${encodeURIComponent(tContext)}`;
    }
    return permalink.href;
  }

  // If the page URL specifies a query then execute it on page load.
  // Note: useEffect(..., []) is equivalent to componentDidMount
  useEffect(() => {
    if (qsEndpoint && qsQuery && qsContext && !queryResult)
      execQuery();
    // eslint-disable-next-line
  }, []);

  // Only generate a query permalink once the states on which it depends
  // have been updated (asynchronously). To ensure this is the case, we 
  // use useLayoutEffect.
  useLayoutEffect(() => setQueryPermalink(makeQueryPermalink()),
    // queryPermalink and makeQueryPermalink purposely omitted from the dependency array.
    [queryResult, query, context, endpoint, outputFormat]); 

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
        <Button onClick={() => resetDefaults()}>Defaults</Button>&nbsp;
        <a title="Query bookmark" href={queryPermalink} onClick={e => e.preventDefault()}>
          <span className="oi oi-link-intact" style={{marginLeft: "5px", color: "white"}}></span>
        </a>
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



