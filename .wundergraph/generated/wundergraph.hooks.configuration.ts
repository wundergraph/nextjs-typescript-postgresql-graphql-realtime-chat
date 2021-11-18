import Fastify from "fastify";
import {
	AddMessageInput,
	AddMessageResponse,
	AllUsersResponse,
	DeleteAllMessagesByUserEmailInput,
	DeleteAllMessagesByUserEmailResponse,
	MessagesResponse,
	MockQueryResponse,
} from "./models";
import { InternalAddMessageInput, InternalDeleteAllMessagesByUserEmailInput } from "./models";
import { HooksConfiguration } from "@wundergraph/sdk/dist/configure";

declare module "fastify" {
	interface FastifyRequest {
		/**
		 * Coming soon!
		 */
		ctx: Context;
	}
}

export interface Context {
	user?: User;
}

export interface User {
	provider?: string;
	provider_id?: string;
	email?: string;
	email_verified?: boolean;
	name?: string;
	first_name?: string;
	last_name?: string;
	nick_name?: string;
	description?: string;
	user_id?: string;
	avatar_url?: string;
	location?: string;
	roles?: Role[];
}

export type Role = "user" | "superadmin";

export type AuthenticationResponse = AuthenticationOK | AuthenticationDeny;

export interface AuthenticationOK {
	status: "ok";
	user: User;
	message?: never;
}

export interface AuthenticationDeny {
	status: "deny";
	user?: never;
	message?: string;
}

export interface HooksConfig {
	authentication?: {
		postAuthentication?: (user: User) => Promise<void>;
		mutatingPostAuthentication?: (user: User) => Promise<AuthenticationResponse>;
		revalidate?: (user: User) => Promise<AuthenticationResponse>;
	};
	queries?: {
		AllUsers?: {
			mockResolve?: (ctx: Context) => Promise<AllUsersResponse>;
			preResolve?: (ctx: Context) => Promise<void>;
			postResolve?: (ctx: Context, response: AllUsersResponse) => Promise<void>;
			mutatingPostResolve?: (ctx: Context, response: AllUsersResponse) => Promise<AllUsersResponse>;
		};
		Messages?: {
			mockResolve?: (ctx: Context) => Promise<MessagesResponse>;
			preResolve?: (ctx: Context) => Promise<void>;
			postResolve?: (ctx: Context, response: MessagesResponse) => Promise<void>;
			mutatingPostResolve?: (ctx: Context, response: MessagesResponse) => Promise<MessagesResponse>;
		};
		MockQuery?: {
			mockResolve?: (ctx: Context) => Promise<MockQueryResponse>;
			preResolve?: (ctx: Context) => Promise<void>;
			postResolve?: (ctx: Context, response: MockQueryResponse) => Promise<void>;
			mutatingPostResolve?: (ctx: Context, response: MockQueryResponse) => Promise<MockQueryResponse>;
		};
	};
	mutations?: {
		AddMessage?: {
			mockResolve?: (ctx: Context, input: InternalAddMessageInput) => Promise<AddMessageResponse>;
			preResolve?: (ctx: Context, input: InternalAddMessageInput) => Promise<void>;
			mutatingPreResolve?: (ctx: Context, input: InternalAddMessageInput) => Promise<InternalAddMessageInput>;
			postResolve?: (ctx: Context, input: InternalAddMessageInput, response: AddMessageResponse) => Promise<void>;
			mutatingPostResolve?: (
				ctx: Context,
				input: InternalAddMessageInput,
				response: AddMessageResponse
			) => Promise<AddMessageResponse>;
		};
		DeleteAllMessagesByUserEmail?: {
			mockResolve?: (
				ctx: Context,
				input: InternalDeleteAllMessagesByUserEmailInput
			) => Promise<DeleteAllMessagesByUserEmailResponse>;
			preResolve?: (ctx: Context, input: InternalDeleteAllMessagesByUserEmailInput) => Promise<void>;
			mutatingPreResolve?: (
				ctx: Context,
				input: InternalDeleteAllMessagesByUserEmailInput
			) => Promise<InternalDeleteAllMessagesByUserEmailInput>;
			postResolve?: (
				ctx: Context,
				input: InternalDeleteAllMessagesByUserEmailInput,
				response: DeleteAllMessagesByUserEmailResponse
			) => Promise<void>;
			mutatingPostResolve?: (
				ctx: Context,
				input: InternalDeleteAllMessagesByUserEmailInput,
				response: DeleteAllMessagesByUserEmailResponse
			) => Promise<DeleteAllMessagesByUserEmailResponse>;
		};
	};
}

export const configureWunderGraphHooks = (config: HooksConfig) => {
	const hooksConfig: HooksConfiguration = {
		queries: config.queries as { [name: string]: { preResolve: any; postResolve: any; mutatingPostResolve: any } },
		mutations: config.mutations as { [name: string]: { preResolve: any; postResolve: any; mutatingPostResolve: any } },
		authentication: config.authentication as {
			postAuthentication?: any;
			mutatingPostAuthentication?: any;
			revalidate?: any;
		},
	};
	const server = {
		config: hooksConfig,
		start() {
			const fastify = Fastify({
				logger: true,
			});

			fastify.addHook<{ Body: { user: User } }>("preHandler", async (req, reply) => {
				req.ctx = {
					user: req.body.user,
				};
			});

			// authentication
			fastify.post("/authentication/postAuthentication", async (request, reply) => {
				reply.type("application/json").code(200);
				if (config.authentication?.postAuthentication !== undefined && request.ctx.user !== undefined) {
					try {
						await config.authentication.postAuthentication(request.ctx.user);
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { hook: "postAuthentication", error: err };
					}
				}
				return {
					hook: "postAuthentication",
				};
			});
			fastify.post("/authentication/mutatingPostAuthentication", async (request, reply) => {
				reply.type("application/json").code(200);
				if (config.authentication?.mutatingPostAuthentication !== undefined && request.ctx.user !== undefined) {
					try {
						const out = await config.authentication.mutatingPostAuthentication(request.ctx.user);
						return {
							hook: "mutatingPostAuthentication",
							response: out,
						};
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { hook: "mutatingPostAuthentication", error: err };
					}
				}
			});
			fastify.post("/authentication/revalidateAuthentication", async (request, reply) => {
				reply.type("application/json").code(200);
				if (config.authentication?.revalidate !== undefined && request.ctx.user !== undefined) {
					try {
						const out = await config.authentication.revalidate(request.ctx.user);
						return {
							hook: "revalidateAuthentication",
							response: out,
						};
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { hook: "revalidateAuthentication", error: err };
					}
				}
			});

			/**
			 * Queries
			 */

			// mock
			fastify.post("/operation/AllUsers/mockResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					const mutated = await config?.queries?.AllUsers?.mockResolve?.(request.ctx);
					return { op: "AllUsers", hook: "mock", response: mutated };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "AllUsers", hook: "mock", error: err };
				}
			});

			// preResolve
			fastify.post("/operation/AllUsers/preResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					await config?.queries?.AllUsers?.preResolve?.(request.ctx);
					return { op: "AllUsers", hook: "preResolve" };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "AllUsers", hook: "preResolve", error: err };
				}
			});
			// postResolve
			fastify.post<{ Body: { response: AllUsersResponse } }>(
				"/operation/AllUsers/postResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.queries?.AllUsers?.postResolve?.(request.ctx, request.body.response);
						return { op: "AllUsers", hook: "postResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AllUsers", hook: "postResolve", error: err };
					}
				}
			);
			// mutatingPostResolve
			fastify.post<{ Body: { response: AllUsersResponse } }>(
				"/operation/AllUsers/mutatingPostResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.AllUsers?.mutatingPostResolve?.(request.ctx, request.body.response);
						return { op: "AllUsers", hook: "mutatingPostResolve", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AllUsers", hook: "mutatingPostResolve", error: err };
					}
				}
			);

			// mock
			fastify.post("/operation/Messages/mockResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					const mutated = await config?.queries?.Messages?.mockResolve?.(request.ctx);
					return { op: "Messages", hook: "mock", response: mutated };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "Messages", hook: "mock", error: err };
				}
			});

			// preResolve
			fastify.post("/operation/Messages/preResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					await config?.queries?.Messages?.preResolve?.(request.ctx);
					return { op: "Messages", hook: "preResolve" };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "Messages", hook: "preResolve", error: err };
				}
			});
			// postResolve
			fastify.post<{ Body: { response: MessagesResponse } }>(
				"/operation/Messages/postResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.queries?.Messages?.postResolve?.(request.ctx, request.body.response);
						return { op: "Messages", hook: "postResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "Messages", hook: "postResolve", error: err };
					}
				}
			);
			// mutatingPostResolve
			fastify.post<{ Body: { response: MessagesResponse } }>(
				"/operation/Messages/mutatingPostResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.Messages?.mutatingPostResolve?.(request.ctx, request.body.response);
						return { op: "Messages", hook: "mutatingPostResolve", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "Messages", hook: "mutatingPostResolve", error: err };
					}
				}
			);

			// mock
			fastify.post("/operation/MockQuery/mockResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					const mutated = await config?.queries?.MockQuery?.mockResolve?.(request.ctx);
					return { op: "MockQuery", hook: "mock", response: mutated };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "MockQuery", hook: "mock", error: err };
				}
			});

			// preResolve
			fastify.post("/operation/MockQuery/preResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					await config?.queries?.MockQuery?.preResolve?.(request.ctx);
					return { op: "MockQuery", hook: "preResolve" };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "MockQuery", hook: "preResolve", error: err };
				}
			});
			// postResolve
			fastify.post<{ Body: { response: MockQueryResponse } }>(
				"/operation/MockQuery/postResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.queries?.MockQuery?.postResolve?.(request.ctx, request.body.response);
						return { op: "MockQuery", hook: "postResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "MockQuery", hook: "postResolve", error: err };
					}
				}
			);
			// mutatingPostResolve
			fastify.post<{ Body: { response: MockQueryResponse } }>(
				"/operation/MockQuery/mutatingPostResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.MockQuery?.mutatingPostResolve?.(request.ctx, request.body.response);
						return { op: "MockQuery", hook: "mutatingPostResolve", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "MockQuery", hook: "mutatingPostResolve", error: err };
					}
				}
			);

			/**
			 * Mutations
			 */

			// mock
			fastify.post<{ Body: { input: InternalAddMessageInput } }>(
				"/operation/AddMessage/mockResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.mutations?.AddMessage?.mockResolve?.(request.ctx, request.body.input);
						return { op: "AddMessage", hook: "mock", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AddMessage", hook: "mock", error: err };
					}
				}
			);

			// preResolve
			fastify.post<{ Body: { input: InternalAddMessageInput } }>(
				"/operation/AddMessage/preResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.mutations?.AddMessage?.preResolve?.(request.ctx, request.body.input);
						return { op: "AddMessage", hook: "preResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AddMessage", hook: "preResolve", error: err };
					}
				}
			);
			// postResolve
			fastify.post<{ Body: { input: InternalAddMessageInput; response: AddMessageResponse } }>(
				"/operation/AddMessage/postResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.mutations?.AddMessage?.postResolve?.(request.ctx, request.body.input, request.body.response);
						return { op: "AddMessage", hook: "postResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AddMessage", hook: "postResolve", error: err };
					}
				}
			);
			// mutatingPreResolve
			fastify.post<{ Body: { input: InternalAddMessageInput } }>(
				"/operation/AddMessage/mutatingPreResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.mutations?.AddMessage?.mutatingPreResolve?.(request.ctx, request.body.input);
						return { op: "AddMessage", hook: "mutatingPreResolve", input: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AddMessage", hook: "mutatingPreResolve", error: err };
					}
				}
			);
			// mutatingPostResolve
			fastify.post<{ Body: { input: InternalAddMessageInput; response: AddMessageResponse } }>(
				"/operation/AddMessage/mutatingPostResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.mutations?.AddMessage?.mutatingPostResolve?.(
							request.ctx,
							request.body.input,
							request.body.response
						);
						return { op: "AddMessage", hook: "mutatingPostResolve", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AddMessage", hook: "mutatingPostResolve", error: err };
					}
				}
			);

			// mock
			fastify.post<{ Body: { input: InternalDeleteAllMessagesByUserEmailInput } }>(
				"/operation/DeleteAllMessagesByUserEmail/mockResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.mutations?.DeleteAllMessagesByUserEmail?.mockResolve?.(
							request.ctx,
							request.body.input
						);
						return { op: "DeleteAllMessagesByUserEmail", hook: "mock", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "DeleteAllMessagesByUserEmail", hook: "mock", error: err };
					}
				}
			);

			// preResolve
			fastify.post<{ Body: { input: InternalDeleteAllMessagesByUserEmailInput } }>(
				"/operation/DeleteAllMessagesByUserEmail/preResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.mutations?.DeleteAllMessagesByUserEmail?.preResolve?.(request.ctx, request.body.input);
						return { op: "DeleteAllMessagesByUserEmail", hook: "preResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "DeleteAllMessagesByUserEmail", hook: "preResolve", error: err };
					}
				}
			);
			// postResolve
			fastify.post<{
				Body: { input: InternalDeleteAllMessagesByUserEmailInput; response: DeleteAllMessagesByUserEmailResponse };
			}>("/operation/DeleteAllMessagesByUserEmail/postResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					await config?.mutations?.DeleteAllMessagesByUserEmail?.postResolve?.(
						request.ctx,
						request.body.input,
						request.body.response
					);
					return { op: "DeleteAllMessagesByUserEmail", hook: "postResolve" };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "DeleteAllMessagesByUserEmail", hook: "postResolve", error: err };
				}
			});
			// mutatingPreResolve
			fastify.post<{ Body: { input: InternalDeleteAllMessagesByUserEmailInput } }>(
				"/operation/DeleteAllMessagesByUserEmail/mutatingPreResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.mutations?.DeleteAllMessagesByUserEmail?.mutatingPreResolve?.(
							request.ctx,
							request.body.input
						);
						return { op: "DeleteAllMessagesByUserEmail", hook: "mutatingPreResolve", input: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "DeleteAllMessagesByUserEmail", hook: "mutatingPreResolve", error: err };
					}
				}
			);
			// mutatingPostResolve
			fastify.post<{
				Body: { input: InternalDeleteAllMessagesByUserEmailInput; response: DeleteAllMessagesByUserEmailResponse };
			}>("/operation/DeleteAllMessagesByUserEmail/mutatingPostResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					const mutated = await config?.mutations?.DeleteAllMessagesByUserEmail?.mutatingPostResolve?.(
						request.ctx,
						request.body.input,
						request.body.response
					);
					return { op: "DeleteAllMessagesByUserEmail", hook: "mutatingPostResolve", response: mutated };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "DeleteAllMessagesByUserEmail", hook: "mutatingPostResolve", error: err };
				}
			});

			fastify.listen(9992, (err, address) => {
				if (err) {
					console.error(err);
					process.exit(0);
				}
				console.log(`hooks server listening at ${address}`);
			});
		},
	};

	if (process.env.START_HOOKS_SERVER === "true") {
		server.start();
	}

	return server;
};
