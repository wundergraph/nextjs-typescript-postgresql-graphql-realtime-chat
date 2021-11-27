import {
    configureWunderGraphHooksWithClient
} from "./generated/wundergraph.hooks.configuration";

// replace or add your own github email address
// to make yourself a super admin as well
const superAdmins = [
    "jens.neuse@gmx.de"
]

const wunderGraphHooks = configureWunderGraphHooksWithClient(client => ({
    authentication: {
        postAuthentication: async user => {
            if (user.email){
                await client.mutations.SetLastLogin({email: user.email});
            }
        },
        mutatingPostAuthentication: async user => {

            if (user.email_verified !== true) {
                return {
                    status: "deny",
                    message: "email not verified"
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
}));

export default wunderGraphHooks;