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

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
    apis: [countries, db],
    server,
    codeGenerators: [
        {
            templates: [
                // use all the typescript react templates to generate a client
                templates.typescript.operations,
                templates.typescript.linkBuilder,
                ...templates.typescript.all,
            ],
        },
        {
            templates: [
                ...templates.typescript.nextjs
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
