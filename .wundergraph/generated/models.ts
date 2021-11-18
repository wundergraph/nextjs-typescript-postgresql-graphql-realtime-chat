export interface AddMessageInput {
	message: string;
}

export interface DeleteAllMessagesByUserEmailInput {
	email: string;
}

export interface InternalAddMessageInput {
	email: string;
	name: string;
	message: string;
}

export interface InternalDeleteAllMessagesByUserEmailInput {
	email: string;
}

export interface GraphQLError {
	message: string;
	path?: ReadonlyArray<string | number>;
}

export interface AddMessageResponse {
	data?: {
		createOnemessages?: {
			id: number;
			message: string;
		};
	};
	errors?: ReadonlyArray<GraphQLError>;
}

export interface AllUsersResponse {
	data?: {
		findManyusers: {
			id: number;
			email: string;
			name: string;
			messages?: {
				id: number;
				message: string;
			}[];
		}[];
	};
	errors?: ReadonlyArray<GraphQLError>;
}

export interface DeleteAllMessagesByUserEmailResponse {
	data?: {
		deleteManymessages?: {
			count: number;
		};
	};
	errors?: ReadonlyArray<GraphQLError>;
}

export interface MessagesResponse {
	data?: {
		findManymessages: {
			id: number;
			message: string;
			users: {
				id: number;
				name: string;
			};
		}[];
	};
	errors?: ReadonlyArray<GraphQLError>;
}

export interface MockQueryResponse {
	data?: {
		findFirstusers?: {
			id: number;
			email: string;
			name: string;
		};
	};
	errors?: ReadonlyArray<GraphQLError>;
}
