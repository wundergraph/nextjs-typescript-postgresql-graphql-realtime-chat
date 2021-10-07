import { JSONSchema7 } from "json-schema";

interface Schema {
	AddMessage: {
		input: JSONSchema7;
		response: JSONSchema7;
	};
	Messages: {
		input: JSONSchema7;
		response: JSONSchema7;
	};
}

const jsonSchema: Schema = {
	AddMessage: {
		input: {
			type: "object",
			properties: { message: { type: "string" } },
			additionalProperties: false,
			required: ["message"],
		},
		response: {
			type: "object",
			properties: {
				data: {
					type: "object",
					properties: {
						createOnemessages: {
							type: "object",
							properties: { id: { type: "integer" }, message: { type: "string" } },
							additionalProperties: false,
							required: ["id", "message"],
						},
					},
					additionalProperties: false,
				},
			},
			additionalProperties: false,
		},
	},
	Messages: {
		input: { type: "object", properties: {}, additionalProperties: false },
		response: {
			type: "object",
			properties: {
				data: {
					type: "object",
					properties: {
						findManymessages: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "integer" },
									message: { type: "string" },
									users: {
										type: "object",
										properties: { id: { type: "integer" }, name: { type: "string" } },
										additionalProperties: false,
										required: ["id", "name"],
									},
								},
								additionalProperties: false,
								required: ["id", "message", "users"],
							},
						},
					},
					additionalProperties: false,
					required: ["findManymessages"],
				},
			},
			additionalProperties: false,
		},
	},
};
export default jsonSchema;
