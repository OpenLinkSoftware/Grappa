# Grappa

A simple test application for exercising the GraphQL to SPARQL bridge
[SPARQL Endpoint for GraphQL-LD](https://github.com/rubensworks/graphql-ld-sparqlendpoint.js)

## See Also

* branch [develop](https://github.com/OpenLinkSoftware/Grappa/tree/develop) (build from this branch, rather than `master`)
* [GraphQL-LD: Linked Data Querying with GraphQL](https://comunica.github.io/Article-ISWC2018-Demo-GraphQlLD/)

## Demo Instance
A demo instance of Grappa is available at
<http://ods-qa.openlinksw.com/grappa/>.
It includes a preconfigured GraphQL query which executes against a DBpedia SPARQL endpoint.

## Overview

[Grappa](https://github.com/OpenLinkSoftware/Grappa/tree/develop) is a simple SPA demonstrating a GraphQL to SPARQL bridge. The bridge itself is provided by [SPARQL Endpoint for GraphQL-LD](https://github.com/rubensworks/graphql-ld-sparqlendpoint.js) from [Ruben Taelman](https://github.com/rubensworks).

[SPARQL Endpoint for GraphQL-LD](https://github.com/rubensworks/graphql-ld-sparqlendpoint.js) is a [GraphQL-LD](https://github.com/rubensworks/graphql-ld.js) engine for executing queries against a remote SPARQL endpoint. GraphQL-LD allows Linked Data to be queried via GraphQL queries and a JSON-LD context.

The input GraphQL-LD query and JSON-LD context are converted to a SPARQL query which is sent to a SPARQL query engine for execution. The query engine can be local or a remote endpoint. The SPARQL query results are then converted into a tree-based structure corresponding to the original GraphQL query.

As outlined in their [overview article on GraphQL-LD](https://comunica.github.io/Article-ISWC2018-Demo-GraphQlLD/), the authors' motivation for the bridge was to lower the barrier to entry for front-end developers wanting to consume Linked Data, based on the observation that GraphQL, not SPARQL, is the query language of choice in popular front-end Web application frameworks such as React and Angular.

## Deployment

The Grappa SPA is based on a [Create React App](https://create-react-app.dev/) template. Creating a production build of the app is simply a matter of running `npm run build` as detailed in  [README_CRA](https://github.com/OpenLinkSoftware/Grappa/blob/develop/README_CRA.md), then copying the contents of the `build` folder to your favoured http server.

Alternatively, the SPA can be served from a Virtuoso WebDAV folder. The demo instance above uses this approach.

The VHOST definition for <http://ods-qa.openlinksw.com/grappa> used to map the containing WebDAV folder to http server path `/grappa` is listed below.

```
DB.DBA.VHOST_REMOVE (
	 lhost=>'*ini*',
	 vhost=>'*ini*',
	 lpath=>'/grappa'
);

DB.DBA.VHOST_DEFINE (
	 lhost=>'*ini*',
	 vhost=>'*ini*',
	 lpath=>'/grappa',
	 ppath=>'/DAV/home/cblakeley/Public/grappa',
	 is_dav=>1,
	 is_brws=>0,
	 def_page=>'index.html',
	 ses_vars=>0,
	 opts=>vector ('cors', '*', 'cors_restricted', 0),
	 is_default_host=>0
);
```

### Example steps for a WebDAV deployment:

```
git clone https://github.com/OpenLinkSoftware/Grappa.git
cd Grappa
git checkout develop
npm i
npm run build
copy the contents of the build directory to, for example, 
    http://{deploymentHost}/DAV/home/{owner}/Public/grappa
run the above VHOST_REMOVE/VHOST_DEFINE commands 
    with ppath adjusted to match the target WebDAV folder
```
The Grappa SPA should then be launched by visiting `http://{deploymentHost}/grappa`
