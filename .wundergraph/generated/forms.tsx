import React, { useEffect, useState } from "react";
import { Response } from "./client";
import {
	AddMessageInput,
	AddMessageResponse,
	DeleteAllMessagesByUserEmailInput,
	DeleteAllMessagesByUserEmailResponse,
} from "./models";
import { useMutation } from "./hooks";
import jsonSchema from "./jsonschema";
import Form from "@rjsf/core";

export interface FormProps<T> {
	onResult?: (result: T) => void;
	liveValidate?: boolean;
}

export interface MutationFormProps<T> extends FormProps<T> {
	refetchMountedQueriesOnSuccess?: boolean;
}

export const AddMessageForm: React.FC<MutationFormProps<Response<AddMessageResponse>>> = ({
	onResult,
	refetchMountedQueriesOnSuccess,
	liveValidate,
}) => {
	const [formData, setFormData] = useState<AddMessageInput>();
	const { mutate, response } = useMutation.AddMessage({ refetchMountedQueriesOnSuccess });
	useEffect(() => {
		if (onResult) {
			onResult(response);
		}
	}, [response]);
	return (
		<div>
			<Form
				schema={jsonSchema.AddMessage.input}
				formData={formData}
				liveValidate={liveValidate}
				onChange={(e) => {
					setFormData(e.formData);
				}}
				onSubmit={async (e) => {
					await mutate({ input: e.formData, refetchMountedQueriesOnSuccess });
					setFormData(undefined);
				}}
			/>
		</div>
	);
};
export const DeleteAllMessagesByUserEmailForm: React.FC<
	MutationFormProps<Response<DeleteAllMessagesByUserEmailResponse>>
> = ({ onResult, refetchMountedQueriesOnSuccess, liveValidate }) => {
	const [formData, setFormData] = useState<DeleteAllMessagesByUserEmailInput>();
	const { mutate, response } = useMutation.DeleteAllMessagesByUserEmail({ refetchMountedQueriesOnSuccess });
	useEffect(() => {
		if (onResult) {
			onResult(response);
		}
	}, [response]);
	return (
		<div>
			<Form
				schema={jsonSchema.DeleteAllMessagesByUserEmail.input}
				formData={formData}
				liveValidate={liveValidate}
				onChange={(e) => {
					setFormData(e.formData);
				}}
				onSubmit={async (e) => {
					await mutate({ input: e.formData, refetchMountedQueriesOnSuccess });
					setFormData(undefined);
				}}
			/>
		</div>
	);
};
