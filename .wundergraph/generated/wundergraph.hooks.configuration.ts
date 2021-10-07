import Fastify from "fastify";
import { AddMessageInput, AddMessageResponse, MessagesResponse } from "./models";
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
}

export interface HooksConfig {
	queries?: {
		Messages?: {
			preResolve?: (ctx: Context) => Promise<void>;
			postResolve?: (ctx: Context, response: MessagesResponse) => Promise<void>;
			mutatingPostResolve?: (ctx: Context, response: MessagesResponse) => Promise<MessagesResponse>;
		};
	};
	mutations?: {
		AddMessage?: {
			preResolve?: (ctx: Context, input: AddMessageInput) => Promise<void>;
			mutatingPreResolve?: (ctx: Context, input: AddMessageInput) => Promise<AddMessageInput>;
			postResolve?: (ctx: Context, input: AddMessageInput, response: AddMessageResponse) => Promise<void>;
			mutatingPostResolve?: (
				ctx: Context,
				input: AddMessageInput,
				response: AddMessageResponse
			) => Promise<AddMessageResponse>;
		};
	};
}

export const configureWunderGraphHooks = (config: HooksConfig) => {
	const hooksConfig: HooksConfiguration = {
		queries: config.queries as { [name: string]: { preResolve: any; postResolve: any; mutatingPostResolve: any } },
		mutations: config.mutations as { [name: string]: { preResolve: any; postResolve: any; mutatingPostResolve: any } },
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

			/**
			 * Queries
			 */

			// preResolve
			fastify.post("/Messages/preResolve", async (request, reply) => {
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
			fastify.post<{ Body: { response: MessagesResponse } }>("/Messages/postResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					await config?.queries?.Messages?.postResolve?.(request.ctx, request.body.response);
					return { op: "Messages", hook: "postResolve" };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "Messages", hook: "postResolve", error: err };
				}
			});
			// mutatingPostResolve
			fastify.post<{ Body: { response: MessagesResponse } }>(
				"/Messages/mutatingPostResolve",
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

			/**
			 * Mutations
			 */

			// preResolve
			fastify.post<{ Body: { input: AddMessageInput } }>("/AddMessage/preResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					await config?.mutations?.AddMessage?.preResolve?.(request.ctx, request.body.input);
					return { op: "AddMessage", hook: "preResolve" };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "AddMessage", hook: "preResolve", error: err };
				}
			});
			// postResolve
			fastify.post<{ Body: { input: AddMessageInput; response: AddMessageResponse } }>(
				"/AddMessage/postResolve",
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
			fastify.post<{ Body: { input: AddMessageInput } }>("/AddMessage/mutatingPreResolve", async (request, reply) => {
				reply.type("application/json").code(200);
				try {
					const mutated = await config?.mutations?.AddMessage?.mutatingPreResolve?.(request.ctx, request.body.input);
					return { op: "AddMessage", hook: "mutatingPreResolve", input: mutated };
				} catch (err) {
					request.log.error(err);
					reply.code(500);
					return { op: "AddMessage", hook: "mutatingPreResolve", error: err };
				}
			});
			// mutatingPostResolve
			fastify.post<{ Body: { input: AddMessageInput; response: AddMessageResponse } }>(
				"/AddMessage/mutatingPostResolve",
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
