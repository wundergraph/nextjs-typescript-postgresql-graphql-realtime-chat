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
	users: "id" | "email" | "name" | "messages";
	messages: "id" | "user_id" | "message" | "users";
	MessagesCountAggregateOutputType: "id" | "user_id" | "message";
	MessagesAvgAggregateOutputType: "id" | "user_id";
	MessagesSumAggregateOutputType: "id" | "user_id";
	MessagesMinAggregateOutputType: "id" | "user_id" | "message";
	MessagesMaxAggregateOutputType: "id" | "user_id" | "message";
	AggregateMessages: "count" | "avg" | "sum" | "min" | "max";
	MessagesGroupByOutputType: "id" | "user_id" | "message" | "count" | "avg" | "sum" | "min" | "max";
	UsersCountAggregateOutputType: "id" | "email" | "name";
	UsersAvgAggregateOutputType: "id";
	UsersSumAggregateOutputType: "id";
	UsersMinAggregateOutputType: "id" | "email" | "name";
	UsersMaxAggregateOutputType: "id" | "email" | "name";
	AggregateUsers: "count" | "avg" | "sum" | "min" | "max";
	UsersGroupByOutputType: "id" | "email" | "name" | "count" | "avg" | "sum" | "min" | "max";
	AffectedRowsOutput: "count";
}

interface SourceFields {
	findFirstmessages: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
		distinct: null;
	};
	findManymessages: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
		distinct: null;
	};
	aggregatemessages: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
	};
	groupBymessages: {
		where: null;
		orderBy: null;
		by: null;
		having: null;
		take: null;
		skip: null;
	};
	findUniquemessages: {
		where: null;
	};
	findFirstusers: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
		distinct: null;
	};
	findManyusers: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
		distinct: null;
	};
	aggregateusers: {
		where: null;
		orderBy: null;
		cursor: null;
		take: null;
		skip: null;
	};
	groupByusers: {
		where: null;
		orderBy: null;
		by: null;
		having: null;
		take: null;
		skip: null;
	};
	findUniqueusers: {
		where: null;
	};
}

const linkBuilder = sourceStep<SourceFields, TargetTypes>();
export default linkBuilder;
