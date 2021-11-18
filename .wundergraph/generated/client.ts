import {
	AddMessageInput,
	AddMessageResponse,
	AllUsersResponse,
	DeleteAllMessagesByUserEmailInput,
	DeleteAllMessagesByUserEmailResponse,
	MessagesResponse,
	MockQueryResponse,
} from "./models";

export const WUNDERGRAPH_S3_ENABLED = false;
export const WUNDERGRAPH_AUTH_ENABLED = true;

export type Response<T> =
	| ResponseOK<T>
	| CachedResponse<T>
	| Refetch<T>
	| Loading
	| Aborted
	| Error
	| None
	| RequiresAuthentication;

export interface ResponseOK<T> {
	status: "ok";
	body: T;
}

export interface CachedResponse<T> {
	status: "cached";
	body: T;
}

export interface RequiresAuthentication {
	status: "requiresAuthentication";
}

export interface Loading {
	status: "loading";
}

export interface Refetch<T> extends ResponseOK<T> {
	refetching: true;
}

export interface Aborted {
	status: "aborted";
}

export interface Error {
	status: "error";
	message: string;
}

export interface None {
	status: "none";
}
interface FetchConfig {
	method: "GET" | "POST";
	path: string;
	input?: Object;
	abortSignal?: AbortSignal;
	liveQuery?: boolean;
}

export interface MutateRequestOptions<Input = never> {
	input?: Input;
	abortSignal?: AbortSignal;
	refetchMountedQueriesOnSuccess?: boolean;
}

export interface RequestOptions<Input = never, InitialState = never> {
	input?: Input;
	abortSignal?: AbortSignal;
	initialState?: InitialState;
	refetchOnWindowFocus?: boolean;
}

export interface SubscriptionRequestOptions<Input = never> {
	input?: Input;
	abortSignal?: AbortSignal;
	stopOnWindowBlur?: boolean;
}

export type UserListener = (user: User | null) => void;

export interface User {
	provider: string;
	provider_id: string;
	email: string;
	email_verified: boolean;
	name: string;
	first_name: string;
	last_name: string;
	nick_name: string;
	description: string;
	user_id: string;
	avatar_url: string;
	location: string;
	roles: string[];
}

export interface ClientConfig {
	baseURL?: string;
	extraHeaders?: HeadersInit;
}

export enum AuthProviderId {
	"github" = "github",
}

export interface AuthProvider {
	id: AuthProviderId;
	login: (redirectURI?: string) => void;
}

export class Client {
	constructor(config?: ClientConfig) {
		this.baseURL = config?.baseURL || this.baseURL;
		this.extraHeaders = config?.extraHeaders;
		this.user = null;
	}
	private logoutCallback: undefined | (() => void);
	public setLogoutCallback(cb: () => void) {
		this.logoutCallback = cb;
	}
	public setExtraHeaders = (headers: HeadersInit) => {
		this.extraHeaders = headers;
	};
	private extraHeaders?: HeadersInit;
	private readonly baseURL: string = "http://localhost:9991";
	private readonly applicationHash: string = "019110c7";
	private readonly applicationPath: string = "api/main";
	private readonly sdkVersion: string = "0.43.0";
	private csrfToken: string | undefined;
	private user: User | null;
	private userListener: UserListener | undefined;
	public setUserListener = (listener: UserListener) => {
		this.userListener = listener;
	};
	private setUser = (user: User | null) => {
		if (
			(user === null && this.user !== null) ||
			(user !== null && this.user === null) ||
			JSON.stringify(user) !== JSON.stringify(this.user)
		) {
			this.user = user;
			if (this.userListener !== undefined) {
				this.userListener(this.user);
			}
		}
	};
	public query = {
		AllUsers: async (options: RequestOptions<never, AllUsersResponse>) => {
			return await this.doFetch<AllUsersResponse>({
				method: "GET",
				path: "AllUsers",
				input: options.input,
				abortSignal: options.abortSignal,
			});
		},
		Messages: async (options: RequestOptions<never, MessagesResponse>) => {
			return await this.doFetch<MessagesResponse>({
				method: "GET",
				path: "Messages",
				input: options.input,
				abortSignal: options.abortSignal,
			});
		},
		MockQuery: async (options: RequestOptions<never, MockQueryResponse>) => {
			return await this.doFetch<MockQueryResponse>({
				method: "GET",
				path: "MockQuery",
				input: options.input,
				abortSignal: options.abortSignal,
			});
		},
	};
	public mutation = {
		AddMessage: async (options: RequestOptions<AddMessageInput, AddMessageResponse>) => {
			return await this.doFetch<AddMessageResponse>({
				method: "POST",
				path: "AddMessage",
				input: options.input,
				abortSignal: options.abortSignal,
			});
		},
		DeleteAllMessagesByUserEmail: async (
			options: RequestOptions<DeleteAllMessagesByUserEmailInput, DeleteAllMessagesByUserEmailResponse>
		) => {
			return await this.doFetch<DeleteAllMessagesByUserEmailResponse>({
				method: "POST",
				path: "DeleteAllMessagesByUserEmail",
				input: options.input,
				abortSignal: options.abortSignal,
			});
		},
	};
	public liveQuery = {
		AllUsers: (
			options: RequestOptions<never, AllUsersResponse>,
			cb: (response: Response<AllUsersResponse>) => void
		) => {
			return this.startSubscription<AllUsersResponse>(
				{
					method: "GET",
					path: "AllUsers",
					input: options.input,
					abortSignal: options.abortSignal,
					liveQuery: true,
				},
				cb
			);
		},
		Messages: (
			options: RequestOptions<never, MessagesResponse>,
			cb: (response: Response<MessagesResponse>) => void
		) => {
			return this.startSubscription<MessagesResponse>(
				{
					method: "GET",
					path: "Messages",
					input: options.input,
					abortSignal: options.abortSignal,
					liveQuery: true,
				},
				cb
			);
		},
		MockQuery: (
			options: RequestOptions<never, MockQueryResponse>,
			cb: (response: Response<MockQueryResponse>) => void
		) => {
			return this.startSubscription<MockQueryResponse>(
				{
					method: "GET",
					path: "MockQuery",
					input: options.input,
					abortSignal: options.abortSignal,
					liveQuery: true,
				},
				cb
			);
		},
	};
	private doFetch = async <T>(fetchConfig: FetchConfig): Promise<Response<T>> => {
		try {
			const params =
				fetchConfig.method !== "POST"
					? this.queryString({
							wg_variables: fetchConfig.input,
							wg_api_hash: this.applicationHash,
					  })
					: "";
			if (fetchConfig.method === "POST" && this.csrfToken === undefined) {
				const res = await fetch(this.baseURL + "/" + this.applicationPath + "/auth/cookie/csrf", {
					credentials: "include",
					mode: "cors",
				});
				this.csrfToken = await res.text();
			}
			const headers: Headers = new Headers({
				...this.extraHeaders,
				Accept: "application/json",
				"WG-SDK-Version": this.sdkVersion,
			});
			if (fetchConfig.method === "POST") {
				if (this.csrfToken) {
					headers.set("X-CSRF-Token", this.csrfToken);
				}
			}
			const body = fetchConfig.method === "POST" ? JSON.stringify(fetchConfig.input) : undefined;
			const data = await this.fetch(
				this.baseURL + "/" + this.applicationPath + "/operations/" + fetchConfig.path + params,
				{
					headers,
					body,
					method: fetchConfig.method,
					signal: fetchConfig.abortSignal,
					credentials: "include",
					mode: "cors",
				}
			);
			return {
				status: "ok",
				body: data,
			};
		} catch (e: any) {
			return {
				status: "error",
				message: e,
			};
		}
	};
	private inflight: {
		[key: string]: {
			reject: (reason?: any) => void;
			resolve: (value: globalThis.Response | PromiseLike<globalThis.Response>) => void;
		}[];
	} = {};
	private fetch = (input: globalThis.RequestInfo, init?: RequestInit): Promise<any> => {
		const key = input.toString();
		return new Promise<any>(async (resolve, reject) => {
			if (this.inflight[key]) {
				this.inflight[key].push({ resolve, reject });
				return;
			}
			this.inflight[key] = [{ resolve, reject }];
			try {
				const res = await fetch(input, init);
				const inflight = this.inflight[key];
				if (res.status === 200) {
					const json = await res.json();
					delete this.inflight[key];
					process.nextTick(() => inflight.forEach((cb) => cb.resolve(json)));
				}
				if (res.status >= 401 && res.status <= 499) {
					this.csrfToken = undefined;
					delete this.inflight[key];
					inflight.forEach((cb) => cb.reject("unauthorized"));
					this.fetchUser();
				}
			} catch (e: any) {
				const inflight = this.inflight[key];
				delete this.inflight[key];
				inflight.forEach((cb) => cb.reject(e));
			}
		});
	};
	private startSubscription = <T>(fetchConfig: FetchConfig, cb: (response: Response<T>) => void) => {
		(async () => {
			try {
				const params = this.queryString({
					wg_variables: fetchConfig.input,
					wg_live: fetchConfig.liveQuery === true ? true : undefined,
				});
				const response = await fetch(
					this.baseURL + "/" + this.applicationPath + "/operations/" + fetchConfig.path + params,
					{
						headers: {
							...this.extraHeaders,
							"Content-Type": "application/json",
							"WG-SDK-Version": this.sdkVersion,
						},
						method: fetchConfig.method,
						signal: fetchConfig.abortSignal,
						credentials: "include",
						mode: "cors",
					}
				);
				if (response.status === 401) {
					this.csrfToken = undefined;
					return;
				}
				if (response.status !== 200 || response.body == null) {
					return;
				}
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let message: string = "";
				while (true) {
					const { value, done } = await reader.read();
					if (done) break;
					if (!value) continue;
					message += decoder.decode(value);
					if (message.endsWith("\n\n")) {
						cb({
							status: "ok",
							body: JSON.parse(message.substring(0, message.length - 2)),
						});
						message = "";
					}
				}
			} catch (e: any) {
				cb({
					status: "error",
					message: e,
				});
			}
		})();
	};
	private queryString = (input?: Object): string => {
		if (!input) {
			return "";
		}
		const query = (Object.keys(input) as Array<keyof typeof input>)
			// @ts-ignore
			.filter((key) => input[key] !== undefined && input[key] !== "")
			.map((key) => {
				const value = typeof input[key] === "object" ? JSON.stringify(input[key]) : input[key];
				const encodedKey = encodeURIComponent(key);
				// @ts-ignore
				const encodedValue = encodeURIComponent(value);
				return `${encodedKey}=${encodedValue}`;
			})
			.join("&");
		return query === "" ? query : "?" + query;
	};
	public fetchUser = async (revalidate?: boolean): Promise<User | null> => {
		const revalidateTrailer = revalidate === undefined ? "" : "?revalidate=true";
		const response = await fetch(this.baseURL + "/" + this.applicationPath + "/auth/cookie/user" + revalidateTrailer, {
			headers: {
				...this.extraHeaders,
				"Content-Type": "application/json",
				"WG-SDK-Version": this.sdkVersion,
			},
			method: "GET",
			credentials: "include",
			mode: "cors",
		});
		if (response.status === 200) {
			const user = await response.json();
			this.setUser(user);
			return this.user;
		}
		this.setUser(null);
		return null;
	};
	public login: Record<AuthProviderId, AuthProvider["login"]> = {
		github: (redirectURI?: string): void => {
			this.startLogin(AuthProviderId.github, redirectURI);
		},
	};
	public authProviders: Array<AuthProvider> = [
		{
			id: AuthProviderId.github,
			login: this.login[AuthProviderId.github],
		},
	];
	public logout = async (): Promise<boolean> => {
		const response = await fetch(this.baseURL + "/" + this.applicationPath + "/auth/cookie/user/logout", {
			headers: {
				...this.extraHeaders,
				"Content-Type": "application/json",
				"WG-SDK-Version": this.sdkVersion,
			},
			method: "GET",
			credentials: "include",
			mode: "cors",
		});
		this.setUser(null);
		if (this.logoutCallback) {
			this.logoutCallback();
		}
		return response.status === 200;
	};
	private startLogin = (providerID: AuthProviderId, redirectURI?: string) => {
		const query = this.queryString({
			redirect_uri: redirectURI || window.location.toString(),
		});
		window.location.replace(`${this.baseURL}/${this.applicationPath}/auth/cookie/authorize/${providerID}${query}`);
	};
}
