import {
    configureWunderGraphHooksWithClient
} from "./generated/wundergraph.hooks.configuration";

// replace or add your own github email address
// to make yourself a super admin as well
const superAdmins = [
    "jens@wundergraph.com",
]

const wunderGraphHooks = configureWunderGraphHooksWithClient(client => ({
    authentication: {
        postAuthentication: async user => {
            if (user.email){
                try {
                    await client.mutations.SetLastLogin({email: user.email});
                } catch (e) {
                    console.log(e)
                }
            }
        },
        mutatingPostAuthentication: async user => {

            if (!user.email){
                return {
                    status: "deny"
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