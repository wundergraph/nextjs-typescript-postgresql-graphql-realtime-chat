export interface LinkDefinition {
	targetType: string;
	targetFieldName: string;
	sourceField: string;
	argumentSources: LinkFieldArgumentSourceDefinition[];
}

export interface LinkFieldArgumentSourceDefinition {
	name: string;
	type: "objectField" | "fieldArgument";
	path: string[];
}

class LinkBuilder<T, R extends {} = {}, TT = {}> {
	// @ts-ignore
	constructor(current: R = {}, sourceField: string, targetType: string, targetField: string) {
		this.current = current;
		this.sourceField = sourceField;
		this.targetType = targetType;
		this.targetField = targetField;
	}

	private readonly sourceField: string;
	private readonly targetType: string;
	private readonly targetField: string;

	// @ts-ignore
	private current: R = {};

	argument<P extends Exclude<keyof T, keyof R>, V extends T[P], S extends "fieldArgument" | "objectField">(
		key: P,
		source: S,
		value: S extends "fieldArgument" ? string : TT,
		...extraPath: string[]
	) {
		const extra: {} = { [key]: { source, path: [value, ...extraPath] } };

		const instance = {
			...(this.current as object),
			...extra,
		} as R & Pick<T, P>;

		return new LinkBuilder<T, R & Pick<T, P>, TT>(instance, this.sourceField, this.targetType, this.targetField);
	}

	build = (): LinkDefinition => {
		const args = this.current as { [key: string]: { path: string[]; source: "fieldArgument" | "objectField" } };
		return {
			argumentSources: Object.keys(args).map((key) => ({
				name: key,
				type: args[key].source,
				path: args[key].path,
			})),
			targetType: this.targetType,
			sourceField: this.sourceField,
			targetFieldName: this.targetField,
		};
	};
}

export const sourceStep = <T extends {}, R extends {}>() => ({
	source: <F extends keyof T>(field: F) => {
		return targetStep<T, F, R>(field);
	},
});

const targetStep = <T, F extends keyof T, R>(field: F) => ({
	target: <r extends keyof R>(targetType: r, targetField: string) => {
		return new LinkBuilder<T[F], {}, R[r]>({}, field as string, targetType as string, targetField);
	},
});

interface TargetTypes {
	UsersCountOutputType_db: "messages";
	users_db: "id" | "email" | "name" | "updatedat" | "lastlogin" | "messages" | "_count";
	messages_db: "id" | "user_id" | "message" | "users";
	MessagesCountAggregateOutputType_db: "id" | "user_id" | "message" | "_all";
	MessagesAvgAggregateOutputType_db: "id" | "user_id";
	MessagesSumAggregateOutputType_db: "id" | "user_id";
	MessagesMinAggregateOutputType_db: "id" | "user_id" | "message";
	MessagesMaxAggregateOutputType_db: "id" | "user_id" | "message";
	AggregateMessages_db: "_count" | "_avg" | "_sum" | "_min" | "_max";
	MessagesGroupByOutputType_db: "id" | "user_id" | "message" | "_count" | "_avg" | "_sum" | "_min" | "_max";
	UsersCountAggregateOutputType_db: "id" | "email" | "name" | "updatedat" | "lastlogin" | "_all";
	UsersAvgAggregateOutputType_db: "id";
	UsersSumAggregateOutputType_db: "id";
	UsersMinAggregateOutputType_db: "id" | "email" | "name" | "updatedat" | "lastlogin";
	UsersMaxAggregateOutputType_db: "id" | "email" | "name" | "updatedat" | "lastlogin";
	AggregateUsers_db: "_count" | "_avg" | "_sum" | "_min" | "_max";
	UsersGroupByOutputType_db:
		| "id"
		| "email"
		| "name"
		| "updatedat"
		| "lastlogin"
		| "_count"
		| "_avg"
		| "_sum"
		| "_min"
		| "_max";
	AffectedRowsOutput_db: "count";
}

interface SourceFields {
	db_findFirstmessages: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
		distinct: null;
	};
	db_findManymessages: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
		distinct: null;
	};
	db_aggregatemessages: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
	};
	db_groupBymessages: {
		where: null;
		orderBy: null;
		by: null;
		having: null;
		take: null;
		skip: null;
	};
	db_findUniquemessages: {
		where: null;
	};
	db_findFirstusers: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
		distinct: null;
	};
	db_findManyusers: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
		distinct: null;
	};
	db_aggregateusers: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
	};
	db_groupByusers: {
		where: null;
		orderBy: null;
		by: null;
		having: null;
		take: null;
		skip: null;
	};
	db_findUniqueusers: {
		where: null;
	};
}

const linkBuilder = sourceStep<SourceFields, TargetTypes>();
export default linkBuilder;
