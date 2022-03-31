import {
    Application,
    authProviders,
    configureWunderGraphApplication,
    cors, EnvironmentVariable,
    introspect,
    templates
} from "@wundergraph/sdk";
import operations from "./wundergraph.operations";
import server from "./wundergraph.server";

const db = introspect.postgresql({
    apiNamespace: "db",
    databaseURL: "postgresql://admin:admin@localhost:54322/example?schema=public",
});

const countries = introspect.graphql({
    apiNamespace: "countries",
    url: "https://countries.trevorblades.com/",
});

const myApplication = new Application({
    name: "api",
    apis: [
        countries,
        db,
    ],
});

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
    application: myApplication,
    server,
    codeGenerators: [
        {
            templates: [
                // use all the typescript react templates to generate a client
                templates.typescript.operations,
                templates.typescript.linkBuilder,
            ],
        },
        {
            templates: [
                ...templates.typescript.react
            ],
            path: "../components/generated/",
        }
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
                "http://localhost:3000"
            ]
        },
    },
    operations,
    security:{
        enableGraphQLEndpoint: process.env.NODE_ENV !== "production",
    }
});
