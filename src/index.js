// @flow
import type {BuildOptions, GraphQLParameters, Endpoint, GraphQLType, RootGraphQLSchema, SwaggerToGraphQLOptions, GraphQLTypeMap} from './types';
import rp from 'request-promise';
import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { getAllEndPoints, loadSchema, loadRefs } from './swagger';
import { createGQLObject, mapParametersToFields } from './typeMap';

type Endpoints = {[string]: Endpoint};

const schemaFromEndpoints = (endpoints: Endpoints, proxyUrl, options) => {
  const gqlTypes = {};
  const queryFields = getFields(endpoints, false, gqlTypes, proxyUrl, options);
  if (!Object.keys(queryFields).length) {
    throw new Error('Did not find any GET endpoints');
  }
  const rootType = new GraphQLObjectType({
    name: 'Query',
    fields: queryFields
  });

  const graphQLSchema: RootGraphQLSchema = {
    query: rootType
  };

  const mutationFields = getFields(endpoints, true, gqlTypes, proxyUrl, options);
  if (Object.keys(mutationFields).length) {
    graphQLSchema.mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields
    });
  }

  return new GraphQLSchema(graphQLSchema);
};

const resolver = (endpoint: Endpoint, proxyUrl: ?(Function | string), options = {}) =>
  async (_, args: GraphQLParameters, opts: SwaggerToGraphQLOptions) => {
    const proxy = !proxyUrl ? opts.GQLProxyBaseUrl : (typeof proxyUrl === 'function' ? proxyUrl(opts) : proxyUrl);
    const req = endpoint.request(args, proxy);
    if (opts && opts.headers) {
      const { host, ...otherHeaders } = opts.headers;
      req.headers = Object.assign(options.customHeaders || {}, req.headers, otherHeaders);
    }
    req.agentOptions = options.agentOptions;
    const res = await rp(req);
    return JSON.parse(res);
  };

const getFields = (endpoints, isMutation, gqlTypes, proxyUrl, options): GraphQLTypeMap => {
  return Object.keys(endpoints).filter((typeName: string) => {
    return !!endpoints[typeName].mutation === !!isMutation;
  }).reduce((result, typeName) => {
    const endpoint = endpoints[typeName];
    const type = createGQLObject(endpoint.response, typeName, false, gqlTypes);
    const gType: GraphQLType = {
      type,
      description: endpoint.description,
      args: mapParametersToFields(endpoint.parameters, typeName, gqlTypes),
      resolve: resolver(endpoint, proxyUrl, options)
    };
    result[typeName] = gType;
    return result;
  }, {});
};

const build = async (swaggerPath: string, proxyUrl: ?(Function | string) = null, options?: BuildOptions) => {
  const swaggerSchema = await loadSchema(swaggerPath);
  const refs = await loadRefs(swaggerPath);
  const endpoints = getAllEndPoints(swaggerSchema, refs);
  return schemaFromEndpoints(endpoints, proxyUrl, options);
};

export default build;
