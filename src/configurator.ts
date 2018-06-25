import {sealed} from "./decorators";
import {struct} from "superstruct";
import {IGatewayBFFConfiguration, IStorefrontConfig} from "./types";
import {ERROR_CODES, PuzzleError} from "./errors";
import {
  HTTP_METHODS,
  INJECTABLE,
  RESOURCE_INJECT_TYPE,
  RESOURCE_JS_EXECUTE_TYPE,
  RESOURCE_LOCATION,
  RESOURCE_TYPE, TRANSFER_PROTOCOLS
} from "./enums";

const apiEndpointsStructure = struct({
  path: 'string',
  middlewares: struct.optional(['string']),
  method: struct.enum(Object.values(HTTP_METHODS)),
  controller: 'string',
  routeCache: 'number?',
  cacheControl: 'string?'
});

const spdyStructure = struct({
  key: struct.union(['string','buffer']),
  cert: struct.union(['string','buffer']),
  passphrase: 'string',
  protocols: [struct.enum(Object.values(TRANSFER_PROTOCOLS))],
});

const apiVersionStructure = struct({
  handler: 'string?',
  endpoints: [apiEndpointsStructure]
});

const apiStructure = struct({
  name: 'string',
  testCookie: 'string',
  liveVersion: 'string',
  versions: struct.dict(['string', apiVersionStructure])
});

const gatewayRenderStructure = struct({
  url: struct.union(['string', ['string']]),
  static: 'boolean?',
  selfReplace: 'boolean?',
  placeholder: 'boolean?',
  timeout: 'number?',
  middlewares: struct.optional(['string']),
  routeCache: 'number?'
});

const gatewayFragmentAssetsStructure = struct({
  name: 'string',
  type: struct.enum(Object.values(RESOURCE_TYPE)),
  injectType: struct.enum(Object.values(RESOURCE_INJECT_TYPE)),
  fileName: 'string',
  link: 'string?',
  location: struct.enum(Object.values(RESOURCE_LOCATION)),
  executeType: struct.optional(struct.enum(Object.values(RESOURCE_JS_EXECUTE_TYPE)))
});

const gatewayFragmentDependenctStructure = struct({
  name: 'string',
  type: struct.enum(Object.values(RESOURCE_TYPE)),
  link: 'string?',
  preview: 'string?',
  injectType: struct.optional(struct.enum(Object.values(RESOURCE_INJECT_TYPE)))
});

const gatewayFragmentVersionStructure = struct({
  assets: [gatewayFragmentAssetsStructure],
  dependencies: [gatewayFragmentDependenctStructure],
  handler: 'string?'
});

const gatewayFragmentStructure = struct({
  name: 'string',
  testCookie: 'string',
  render: gatewayRenderStructure,
  version: 'string',
  versions: struct.dict(['string', gatewayFragmentVersionStructure])
});

const gatewayStructure = struct({
  name: 'string',
  url: 'string',
  fragments: [gatewayFragmentStructure],
  api: [apiStructure],
  port: 'number',
  isMobile: 'boolean?',
  fragmentsFolder: 'string',
  corsDomains: struct.optional(['string']),
  spdy: struct.optional(spdyStructure)
});

const storefrontPageStructure = struct({
  html: 'string',
  url: struct.union(['string', ['string']])
});

const storefrontGatewaysStructure = struct({
  name: 'string',
  url: 'string',
  assetUrl: 'string?'
});

const storefrontDependencyStructure = struct({
  content: 'string?',
  link: 'string?'
});

const storefrontStructure = struct({
  gateways: [storefrontGatewaysStructure],
  port: 'number',
  pages: [storefrontPageStructure],
  pollInterval: 'number?',
  dependencies: [storefrontDependencyStructure],
  spdy: struct.optional(spdyStructure)
});


@sealed
export class Configurator {
  configuration: IGatewayBFFConfiguration | IStorefrontConfig;
  protected dependencies: { [name: string]: any } = {};

  register(name: string, type: INJECTABLE, dependency: any): void {
    if (!this.dependencies[type]) {
      this.dependencies[type] = {};
    }
    this.dependencies[type][name] = dependency;
  }

  get(name: string, type: INJECTABLE): any {
    return this.dependencies[type][name];
  }

  /**
   * Config json
   * @param {IStorefrontConfig | IGatewayBFFConfiguration} configuration
   */
  config(configuration: IStorefrontConfig | IGatewayBFFConfiguration) {
    this.validate(configuration);

    this.injectDependencies(configuration);

    this.configuration = Object.assign({}, configuration);
  }

  protected validate(configuration: IStorefrontConfig | IGatewayBFFConfiguration) {
    throw new PuzzleError(ERROR_CODES.CONFIGURATION_BASE_VALIDATION_ERROR);
  }

  protected injectDependencies(configuration: IStorefrontConfig | IGatewayBFFConfiguration) {
    throw new PuzzleError(ERROR_CODES.CONFIGURATION_BASE_VALIDATION_ERROR);
  }
}


@sealed
export class StorefrontConfigurator extends Configurator {
  configuration: IStorefrontConfig;

  protected validate(configuration: IStorefrontConfig) {
    storefrontStructure(configuration);
  }

  protected injectDependencies(configuration: IStorefrontConfig) {

  }
}


@sealed
export class GatewayConfigurator extends Configurator {
  configuration: IGatewayBFFConfiguration;

  protected validate(configuration: IGatewayBFFConfiguration) {
    gatewayStructure(configuration);
  }

  protected injectDependencies(configuration: IGatewayBFFConfiguration) {
    configuration.fragments.forEach(fragment => {
      (<any>Object.values(fragment.versions)).forEach((version: any) => {
        if (version.handler) {
          version.handler = this.dependencies[INJECTABLE.HANDLER][version.handler];
        }
      });

      fragment.render.middlewares = (<any>fragment.render.middlewares || []).map((middleware: string) => this.dependencies[INJECTABLE.MIDDLEWARE][middleware]);
    });

    configuration.api.forEach(api => {
      (<any>Object.values(api.versions)).forEach((version: any) => {
        if (version.handler) {
          version.handler = this.dependencies[INJECTABLE.HANDLER][version.handler];
        }

        version.endpoints.forEach((endpoint: any) => {
          endpoint.middlewares = (<any>endpoint.middlewares || []).map((middleware: string) => this.dependencies[INJECTABLE.MIDDLEWARE][middleware]);
        });
      });
    });
  }
}
