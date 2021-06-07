import {
    Application,
    authProviders,
    configureWunderGraphApplication,
    cors,
    introspect,
    templates
} from "@wundergraph/sdk";
import {ConfigureOperations} from "./generated/operations";

const db = introspect.postgresql({
    database_querystring: "postgresql://admin:admin@localhost:54322/example?schema=public",
});

const operations: ConfigureOperations = {
    defaultConfig: {
        authentication: {
            required: false
        }
    },
    queries: config => ({
        ...config,
        caching: {
            enable: false,
            staleWhileRevalidate: 60,
            maxAge: 60,
            public: true
        },
        liveQuery: {
            enable: true,
            pollingIntervalSeconds: 2,
        }
    }),
    mutations: config => ({
        ...config
    }),
    subscriptions: config => ({
        ...config,
    }),
    custom: {}
}

const myApplication = new Application({
    name: "app",
    apis: [
        db,
    ],
})

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
    application: myApplication,
    codeGenerators: [
        {
            templates: [
                // use all the typescript react templates to generate a client
                templates.typescript.operations,
                templates.typescript.mocks,
                templates.typescript.linkBuilder,
                ...templates.typescript.react
            ],
        },
    ],
    cors: {
        ...cors.allowAll,
        allowedOrigins: process.env.NODE_ENV === "production" ?
            [
                "http://localhost:3000"
            ] :
            [
                "http://localhost:3000",
            ]
    },
    authentication: {
        cookieBased: {
            providers: [
                authProviders.demo(),
            ]
        }
    },
    operations: operations,
});
