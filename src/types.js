import type {GraphQLOutputType, GraphQLInputType, GraphQLObjectType} from 'graphql/type/definition.js.flow';

//import type { NetConnectOpts } from 'net';

export type SwaggerToGraphQLOptions = {
  GQLProxyBaseUrl: string,
  BearerToken?: string
}
export type BuildOptions = {
  customHeaders?: {[string]: string},
  agentOptions?: AgentOptions
}

// Todo: Switch to NetConnectOpts
export type AgentOptions = {
  ca: Uint8Array,
  key: Uint8Array,
  cert: Uint8Array
}

type Param = {
  type: string,
  name: string
}

type EndpointParam = {
  type: string,
  name: string,
  jsonSchema: string
}

export type RootGraphQLSchema = {
  query: GraphQLObjectType,
  mutation?: GraphQLObjectType
}

export type GraphQLParameters = {[string]: any};

export type GraphQLTypeMap = {[string]: GraphQLType};

export type Endpoint = {
  parameters: Array<EndpointParam>,
  description?: string,
  response: Object,
  request: (args:GraphQLParameters, url: string) => Object,
  mutation: boolean
}


export type GraphQLType = GraphQLOutputType | GraphQLInputType;

export type Responses = {
        [string|number] : {
          schema?: Object
        }
      };

export type JSONSchemaType = {
  $ref?: string,
  schema?: JSONSchemaType,
  type?: string,
  properties?: Array<string>,
  title?: string,
  description?: string,
  required?: boolean | Array<string>
}

export type SwaggerSchema = {
  paths: {
    [string]: {
      description?: string,
      operationId?: string,
      parameters?: Array<Param>,
      responses: Responses
    }
  }
}

export type RefType = {
  $Ref: SwaggerSchema
}
