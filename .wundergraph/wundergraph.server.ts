import {configureWunderGraphServer} from "@wundergraph/sdk";
import type {HooksConfig} from "./generated/wundergraph.hooks";
import type {InternalClient} from "./generated/wundergraph.internal.client";

const superAdmins = [
    "jens@wundergraph.com",
]

export default configureWunderGraphServer<HooksConfig,
    InternalClient>((serverContext) => ({
    hooks: {
        global: {
            httpTransport: {
                onRequest: {
                    hook: async (ctx, request) => {
                        console.log(`onRequest hook: ${JSON.stringify(request)}`);
                        return {
                            ...request,
                        }
                    },
                    enableForOperations: [
                        "Countries"
                    ]
                }
            },
        },
        authentication: {
            postAuthentication: async (user) => {
                if (user.email){
                    try {
                        await serverContext.internalClient.mutations.SetLastLogin({email: user.email});
                    } catch (e) {
                        console.log(e);
                    }
                }
            },
            mutatingPostAuthentication: async user => {

                console.log(`mutatingPostAuthentication hook: ${JSON.stringify(user)}`);

                if (!user.email){
                    return {
                        status: "deny",
                        message: "No email address provided"
                    }
                }

                if (superAdmins.find(s => s === user.email) !== undefined) {
                    return {
                        status: "ok",
                        user: {
                            ...user,
                            roles: [
                                "user",
                                "superadmin"
                            ]
                        }
                    }
                }

                return {
                    status: "ok",
                    user: {
                        ...user,
                        roles: [
                            "user"
                        ]
                    }
                }
            }
        },
        queries: {
            MockQuery: {
                mockResolve: async () => {
                    return {
                        data: {
                            findFirstusers: {
                                id: 1,
                                email: "jens@wundergraph.com",
                                name: "Jens"
                            }
                        }
                    }
                }
            }
        },
        mutations: {},
    },
}));