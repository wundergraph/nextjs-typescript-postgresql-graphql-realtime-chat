import {
    Application,
    authProviders,
    configureWunderGraphApplication,
    cors,
    introspect,
    templates
} from "@wundergraph/sdk";
import operations from "./wundergraph.operations";
import wunderGraphHooks from "./wundergraph.hooks";

const db = introspect.postgresql({
    databaseURL: "postgresql://admin:admin@localhost:54322/example?schema=public",
});

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
    authorization: {
        roles: [
            "user",
            "superadmin"
        ],
    },
    authentication: {
        cookieBased: {
            providers: [
                authProviders.demo(),
            ],
            authorizedRedirectUris: [
                "http://localhost:3000/"
            ]
        }
    },
    operations,
    hooks: wunderGraphHooks.config,
});
