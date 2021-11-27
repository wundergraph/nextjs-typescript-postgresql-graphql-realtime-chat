import Fastify from "fastify";
import axios from "axios";
import {
	AddMessageResponse,
	AddMessageInput,
	InternalAddMessageInput,
	InjectedAddMessageInput,
	AllUsersResponse,
	AllUsersInput,
	InternalAllUsersInput,
	InjectedAllUsersInput,
	ChangeUserNameResponse,
	ChangeUserNameInput,
	InternalChangeUserNameInput,
	InjectedChangeUserNameInput,
	DeleteAllMessagesByUserEmailResponse,
	DeleteAllMessagesByUserEmailInput,
	InternalDeleteAllMessagesByUserEmailInput,
	InjectedDeleteAllMessagesByUserEmailInput,
	MessagesResponse,
	MockQueryResponse,
	SetLastLoginResponse,
	SetLastLoginInput,
	InternalSetLastLoginInput,
	InjectedSetLastLoginInput,
	UserInfoResponse,
	InternalUserInfoInput,
	InjectedUserInfoInput,
} from "./models";
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

const internalClientAuthorizationHeader = "Bearer internalRequestToken";

const internalRequest = async (operationName: string, input?: any): Promise<any> => {
	const url = "http://localhost:9991/internal/api/main/operations/" + operationName;
	const res = await axios.post(url, JSON.stringify(input || {}), {
		headers: {
			"Content-Type": "application/json",
			Authorization: internalClientAuthorizationHeader,
		},
	});
	return res.data;
};

interface InternalClient {
	queries: {
		AllUsers: (input: InternalAllUsersInput) => Promise<AllUsersResponse>;
		Messages: () => Promise<MessagesResponse>;
		MockQuery: () => Promise<MockQueryResponse>;
		UserInfo: (input: InternalUserInfoInput) => Promise<UserInfoResponse>;
	};
	mutations: {
		AddMessage: (input: InternalAddMessageInput) => Promise<AddMessageResponse>;
		ChangeUserName: (input: InternalChangeUserNameInput) => Promise<ChangeUserNameResponse>;
		DeleteAllMessagesByUserEmail: (
			input: InternalDeleteAllMessagesByUserEmailInput
		) => Promise<DeleteAllMessagesByUserEmailResponse>;
		SetLastLogin: (input: InternalSetLastLoginInput) => Promise<SetLastLoginResponse>;
	};
}

const client = {
	queries: {
		AllUsers: async (input: InternalAllUsersInput) => internalRequest("AllUsers", input),
		Messages: async () => internalRequest("Messages"),
		MockQuery: async () => internalRequest("MockQuery"),
		UserInfo: async (input: InternalUserInfoInput) => internalRequest("UserInfo", input),
	},
	mutations: {
		AddMessage: async (input: InternalAddMessageInput) => internalRequest("AddMessage", input),
		ChangeUserName: async (input: InternalChangeUserNameInput) => internalRequest("ChangeUserName", input),
		DeleteAllMessagesByUserEmail: async (input: InternalDeleteAllMessagesByUserEmailInput) =>
			internalRequest("DeleteAllMessagesByUserEmail", input),
		SetLastLogin: async (input: InternalSetLastLoginInput) => internalRequest("SetLastLogin", input),
	},
};

export const configureWunderGraphHooksWithClient = (config: (client: InternalClient) => HooksConfig) =>
	configureWunderGraphHooks(config(client));

export interface HooksConfig {
	authentication?: {
		postAuthentication?: (user: User) => Promise<void>;
		mutatingPostAuthentication?: (user: User) => Promise<AuthenticationResponse>;
		revalidate?: (user: User) => Promise<AuthenticationResponse>;
	};
	queries?: {
		AllUsers?: {
			mockResolve?: (ctx: Context, input: InjectedAllUsersInput) => Promise<AllUsersResponse>;
			preResolve?: (ctx: Context, input: InjectedAllUsersInput) => Promise<void>;
			mutatingPreResolve?: (ctx: Context, input: InjectedAllUsersInput) => Promise<InjectedAllUsersInput>;
			postResolve?: (ctx: Context, input: InjectedAllUsersInput, response: AllUsersResponse) => Promise<void>;
			mutatingPostResolve?: (
				ctx: Context,
				input: InjectedAllUsersInput,
				response: AllUsersResponse
			) => Promise<AllUsersResponse>;
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
		UserInfo?: {
			mockResolve?: (ctx: Context, input: InjectedUserInfoInput) => Promise<UserInfoResponse>;
			preResolve?: (ctx: Context, input: InjectedUserInfoInput) => Promise<void>;
			mutatingPreResolve?: (ctx: Context, input: InjectedUserInfoInput) => Promise<InjectedUserInfoInput>;
			postResolve?: (ctx: Context, input: InjectedUserInfoInput, response: UserInfoResponse) => Promise<void>;
			mutatingPostResolve?: (
				ctx: Context,
				input: InjectedUserInfoInput,
				response: UserInfoResponse
			) => Promise<UserInfoResponse>;
		};
	};
	mutations?: {
		AddMessage?: {
			mockResolve?: (ctx: Context, input: InjectedAddMessageInput) => Promise<AddMessageResponse>;
			preResolve?: (ctx: Context, input: InjectedAddMessageInput) => Promise<void>;
			mutatingPreResolve?: (ctx: Context, input: InjectedAddMessageInput) => Promise<InjectedAddMessageInput>;
			postResolve?: (ctx: Context, input: InjectedAddMessageInput, response: AddMessageResponse) => Promise<void>;
			mutatingPostResolve?: (
				ctx: Context,
				input: InjectedAddMessageInput,
				response: AddMessageResponse
			) => Promise<AddMessageResponse>;
		};
		ChangeUserName?: {
			mockResolve?: (ctx: Context, input: InjectedChangeUserNameInput) => Promise<ChangeUserNameResponse>;
			preResolve?: (ctx: Context, input: InjectedChangeUserNameInput) => Promise<void>;
			mutatingPreResolve?: (ctx: Context, input: InjectedChangeUserNameInput) => Promise<InjectedChangeUserNameInput>;
			postResolve?: (
				ctx: Context,
				input: InjectedChangeUserNameInput,
				response: ChangeUserNameResponse
			) => Promise<void>;
			mutatingPostResolve?: (
				ctx: Context,
				input: InjectedChangeUserNameInput,
				response: ChangeUserNameResponse
			) => Promise<ChangeUserNameResponse>;
		};
		DeleteAllMessagesByUserEmail?: {
			mockResolve?: (
				ctx: Context,
				input: InjectedDeleteAllMessagesByUserEmailInput
			) => Promise<DeleteAllMessagesByUserEmailResponse>;
			preResolve?: (ctx: Context, input: InjectedDeleteAllMessagesByUserEmailInput) => Promise<void>;
			mutatingPreResolve?: (
				ctx: Context,
				input: InjectedDeleteAllMessagesByUserEmailInput
			) => Promise<InjectedDeleteAllMessagesByUserEmailInput>;
			postResolve?: (
				ctx: Context,
				input: InjectedDeleteAllMessagesByUserEmailInput,
				response: DeleteAllMessagesByUserEmailResponse
			) => Promise<void>;
			mutatingPostResolve?: (
				ctx: Context,
				input: InjectedDeleteAllMessagesByUserEmailInput,
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
			fastify.post<{ Body: { input: InjectedAllUsersInput } }>(
				"/operation/AllUsers/mockResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.AllUsers?.mockResolve?.(request.ctx, request.body.input);
						return { op: "AllUsers", hook: "mock", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AllUsers", hook: "mock", error: err };
					}
				}
			);

			// preResolve
			fastify.post<{ Body: { input: InjectedAllUsersInput } }>(
				"/operation/AllUsers/preResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.queries?.AllUsers?.preResolve?.(request.ctx, request.body.input);
						return { op: "AllUsers", hook: "preResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AllUsers", hook: "preResolve", error: err };
					}
				}
			);
			// postResolve
			fastify.post<{ Body: { input: InjectedAllUsersInput; response: AllUsersResponse } }>(
				"/operation/AllUsers/postResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.queries?.AllUsers?.postResolve?.(request.ctx, request.body.input, request.body.response);
						return { op: "AllUsers", hook: "postResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AllUsers", hook: "postResolve", error: err };
					}
				}
			);
			// mutatingPreResolve
			fastify.post<{ Body: { input: InjectedAllUsersInput } }>(
				"/operation/AllUsers/mutatingPreResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.AllUsers?.mutatingPreResolve?.(request.ctx, request.body.input);
						return { op: "AllUsers", hook: "mutatingPreResolve", input: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "AllUsers", hook: "mutatingPreResolve", error: err };
					}
				}
			);
			// mutatingPostResolve
			fastify.post<{ Body: { input: InjectedAllUsersInput; response: AllUsersResponse } }>(
				"/operation/AllUsers/mutatingPostResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.AllUsers?.mutatingPostResolve?.(
							request.ctx,
							request.body.input,
							request.body.response
						);
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

			// mock
			fastify.post<{ Body: { input: InjectedUserInfoInput } }>(
				"/operation/UserInfo/mockResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.UserInfo?.mockResolve?.(request.ctx, request.body.input);
						return { op: "UserInfo", hook: "mock", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "UserInfo", hook: "mock", error: err };
					}
				}
			);

			// preResolve
			fastify.post<{ Body: { input: InjectedUserInfoInput } }>(
				"/operation/UserInfo/preResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.queries?.UserInfo?.preResolve?.(request.ctx, request.body.input);
						return { op: "UserInfo", hook: "preResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "UserInfo", hook: "preResolve", error: err };
					}
				}
			);
			// postResolve
			fastify.post<{ Body: { input: InjectedUserInfoInput; response: UserInfoResponse } }>(
				"/operation/UserInfo/postResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.queries?.UserInfo?.postResolve?.(request.ctx, request.body.input, request.body.response);
						return { op: "UserInfo", hook: "postResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "UserInfo", hook: "postResolve", error: err };
					}
				}
			);
			// mutatingPreResolve
			fastify.post<{ Body: { input: InjectedUserInfoInput } }>(
				"/operation/UserInfo/mutatingPreResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.UserInfo?.mutatingPreResolve?.(request.ctx, request.body.input);
						return { op: "UserInfo", hook: "mutatingPreResolve", input: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "UserInfo", hook: "mutatingPreResolve", error: err };
					}
				}
			);
			// mutatingPostResolve
			fastify.post<{ Body: { input: InjectedUserInfoInput; response: UserInfoResponse } }>(
				"/operation/UserInfo/mutatingPostResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.queries?.UserInfo?.mutatingPostResolve?.(
							request.ctx,
							request.body.input,
							request.body.response
						);
						return { op: "UserInfo", hook: "mutatingPostResolve", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "UserInfo", hook: "mutatingPostResolve", error: err };
					}
				}
			);

			/**
			 * Mutations
			 */

			// mock
			fastify.post<{ Body: { input: InjectedAddMessageInput } }>(
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
			fastify.post<{ Body: { input: InjectedAddMessageInput } }>(
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
			fastify.post<{ Body: { input: InjectedAddMessageInput; response: AddMessageResponse } }>(
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
			fastify.post<{ Body: { input: InjectedAddMessageInput } }>(
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
			fastify.post<{ Body: { input: InjectedAddMessageInput; response: AddMessageResponse } }>(
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
			fastify.post<{ Body: { input: InjectedChangeUserNameInput } }>(
				"/operation/ChangeUserName/mockResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.mutations?.ChangeUserName?.mockResolve?.(request.ctx, request.body.input);
						return { op: "ChangeUserName", hook: "mock", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "ChangeUserName", hook: "mock", error: err };
					}
				}
			);

			// preResolve
			fastify.post<{ Body: { input: InjectedChangeUserNameInput } }>(
				"/operation/ChangeUserName/preResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.mutations?.ChangeUserName?.preResolve?.(request.ctx, request.body.input);
						return { op: "ChangeUserName", hook: "preResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "ChangeUserName", hook: "preResolve", error: err };
					}
				}
			);
			// postResolve
			fastify.post<{ Body: { input: InjectedChangeUserNameInput; response: ChangeUserNameResponse } }>(
				"/operation/ChangeUserName/postResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						await config?.mutations?.ChangeUserName?.postResolve?.(
							request.ctx,
							request.body.input,
							request.body.response
						);
						return { op: "ChangeUserName", hook: "postResolve" };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "ChangeUserName", hook: "postResolve", error: err };
					}
				}
			);
			// mutatingPreResolve
			fastify.post<{ Body: { input: InjectedChangeUserNameInput } }>(
				"/operation/ChangeUserName/mutatingPreResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.mutations?.ChangeUserName?.mutatingPreResolve?.(
							request.ctx,
							request.body.input
						);
						return { op: "ChangeUserName", hook: "mutatingPreResolve", input: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "ChangeUserName", hook: "mutatingPreResolve", error: err };
					}
				}
			);
			// mutatingPostResolve
			fastify.post<{ Body: { input: InjectedChangeUserNameInput; response: ChangeUserNameResponse } }>(
				"/operation/ChangeUserName/mutatingPostResolve",
				async (request, reply) => {
					reply.type("application/json").code(200);
					try {
						const mutated = await config?.mutations?.ChangeUserName?.mutatingPostResolve?.(
							request.ctx,
							request.body.input,
							request.body.response
						);
						return { op: "ChangeUserName", hook: "mutatingPostResolve", response: mutated };
					} catch (err) {
						request.log.error(err);
						reply.code(500);
						return { op: "ChangeUserName", hook: "mutatingPostResolve", error: err };
					}
				}
			);

			// mock
			fastify.post<{ Body: { input: InjectedDeleteAllMessagesByUserEmailInput } }>(
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
			fastify.post<{ Body: { input: InjectedDeleteAllMessagesByUserEmailInput } }>(
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
				Body: { input: InjectedDeleteAllMessagesByUserEmailInput; response: DeleteAllMessagesByUserEmailResponse };
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
			fastify.post<{ Body: { input: InjectedDeleteAllMessagesByUserEmailInput } }>(
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
				Body: { input: InjectedDeleteAllMessagesByUserEmailInput; response: DeleteAllMessagesByUserEmailResponse };
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
