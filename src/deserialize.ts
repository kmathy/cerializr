import {
	Indexable,
	JsonArray,
	JsonObject,
	JsonType,
	SerializablePrimitiveType,
	SerializableType,
	InstantiationMethod,
} from "./interfaces";
import { getTarget, isPrimitiveType } from "./util";
import { MetaData, MetaDataFlag } from "./meta_data";
// import isNil from "lodash/isNil";
// import isUndefined from "lodash/isUndefined";
// import isObject from "lodash/isObject";
// import isFunction from "lodash/isFunction";
import { default as _ } from "./my-lodash";

export function DeserializeMap<T>(
	data: JsonObject,
	type: SerializableType<T>,
	target?: Indexable<T>,
	instantiationMethod?: InstantiationMethod
): Indexable<T> | null {
	if (_.isUndefined(instantiationMethod)) {
		instantiationMethod = MetaData.deserializeInstantationMethod;
	}

	if (typeof data !== "object") {
		throw new Error(
			"Expected input to be of type `object` but received: " + typeof data
		);
	}

	if (_.isNil(target)) target = {};

	if (_.isNil(data)) {
		return null;
	}

	const keys = Object.keys(data);
	for (const key of keys) {
		const value = data[key];
		if (!_.isUndefined(value)) {
			target[MetaData.deserializeKeyTransform(key)] = _Deserialize(
				data[key] as JsonObject,
				type,
				target[key],
				instantiationMethod
			) as T;
		}
	}
	return target;
}

export function DeserializeArray<T>(
	data: JsonArray,
	type: SerializableType<T>,
	target?: Array<T>,
	instantiationMethod?: InstantiationMethod
) {
	if (_.isUndefined(instantiationMethod)) {
		instantiationMethod = MetaData.deserializeInstantationMethod;
	}

	if (!Array.isArray(data)) {
		throw new Error(
			"Expected input to be an array but received: " + typeof data
		);
	}

	if (!Array.isArray(target)) target = new Array<T>();

	target = data.map(
		(val, i) =>
			_Deserialize(
				val as JsonObject,
				type,
				target![i],
				instantiationMethod
			) as T
	);

	return target;
}

function DeserializePrimitive(
	data: any,
	type: SerializablePrimitiveType,
	target?: Date
) {
	if (type === Date) {
		const deserializedDate = new Date(data as string);
		if (target instanceof Date) {
			target.setTime(deserializedDate.getTime());
		} else {
			return deserializedDate;
		}
	} else if (type === RegExp) {
		const fragments = data.match(/\/(.*?)\/([gimy])?$/);
		return new RegExp(fragments[1], fragments[2] || "");
	} else if (data === null) {
		return null;
	} else {
		return (type as any)(data);
	}
}

export function DeserializeJSON<T extends JsonType>(
	data: JsonType,
	transformKeys = true,
	target?: JsonType
): JsonType {
	if (Array.isArray(data)) {
		if (!Array.isArray(target)) target = new Array<any>(data.length);

		target = data.map((val, i) =>
			DeserializeJSON(val, transformKeys, (target as Array<JsonType>)[i])
		);

		return target;
	}

	if (_.isObject(data)) {
		const retn = (_.isObject(target) ? target : {}) as Indexable<JsonType>;

		const keys = Object.keys(data);

		for (const key of keys) {
			const value = (data as Indexable<JsonType>)[key];
			if (!_.isUndefined(value)) {
				const retnKey = transformKeys
					? MetaData.deserializeKeyTransform(key)
					: key;
				retn[retnKey] = DeserializeJSON(
					(data as Indexable<JsonType>)[key],
					transformKeys
				);
			}
		}

		return retn;
	} else if (_.isFunction(data)) {
		throw new Error(
			"Cannot deserialize a function, input is not a valid json object"
		);
	}
	//primitive case
	return data;
}

function _Deserialize<T extends Indexable>(
	data: JsonObject,
	type: SerializableType<T>,
	target?: T,
	instantiationMethod?: InstantiationMethod
): T | null {
	if (data === null) {
		return null;
	}

	const metadataList = MetaData.getMetaDataForType(type);

	if (metadataList === null) {
		if (typeof type === "function") {
			if (isPrimitiveType(type)) {
				return DeserializePrimitive(
					data,
					(type as unknown) as SerializablePrimitiveType,
					target as Date | undefined
				);
			}

			switch (instantiationMethod) {
				case InstantiationMethod.New:
					return new type();

				case InstantiationMethod.ObjectCreate:
					return Object.create(type.prototype);

				default:
					return {} as T;
			}
		}

		return null;
	}

	target = getTarget(type, target, instantiationMethod);

	for (let i = 0; i < metadataList.length; i++) {
		const metadata = metadataList[i];

		if (metadata.deserializedKey === null) continue;

		const source: any =
			data[
				metadata.transformKey
					? metadata.getDeserializedKey()
					: metadata.deserializedKey
			];

		if (_.isUndefined(source)) continue;

		let keyName = metadata.keyName;
		const flags = metadata.flags;
		if (target) {
			if ((flags & MetaDataFlag.DeserializeMap) !== 0) {
				(target as Indexable)[keyName] = DeserializeMap(
					source,
					metadata.deserializedType,
					target[keyName],
					instantiationMethod
				);
			} else if ((flags & MetaDataFlag.DeserializeArray) !== 0) {
				(target as Indexable)[keyName] = DeserializeArray(
					source,
					metadata.deserializedType,
					(target as Indexable)[keyName],
					instantiationMethod
				);
			} else if ((flags & MetaDataFlag.DeserializePrimitive) !== 0) {
				(target as Indexable)[keyName] = DeserializePrimitive(
					source,
					metadata.deserializedType as SerializablePrimitiveType,
					target[keyName]
				);
			} else if ((flags & MetaDataFlag.DeserializeObject) !== 0) {
				(target as Indexable)[keyName] = _Deserialize(
					source,
					metadata.deserializedType,
					target[keyName],
					instantiationMethod
				);
			} else if ((flags & MetaDataFlag.DeserializeJSON) !== 0) {
				(target as Indexable)[keyName] = DeserializeJSON(
					source,
					metadata.transformKey,
					instantiationMethod
				);
			} else if ((flags & MetaDataFlag.DeserializeUsing) !== 0) {
				(target as Indexable)[
					keyName
				] = (metadata.deserializedType as any)(
					source,
					target[keyName],
					instantiationMethod
				);
			}
		}
	}

	if (_.isFunction(type.onDeserialized)) {
		const value = type.onDeserialized(
			data,
			target as T,
			instantiationMethod
		);
		if (value !== void 0) return value as any;
	}

	return target as T;
}

export function Deserialize<T>(
	data: JsonObject,
	type: SerializableType<T>,
	target?: T,
	instantiationMethod?: InstantiationMethod
): T | null {
	if (_.isUndefined(instantiationMethod)) {
		instantiationMethod = MetaData.deserializeInstantationMethod;
	}

	return _Deserialize(data, type, target, instantiationMethod);
}

export function DeserializeRaw<T>(
	data: JsonObject,
	type: SerializableType<T>,
	target?: T
): T | null {
	return _Deserialize(data, type, target, InstantiationMethod.None);
}

export function DeserializeArrayRaw<T>(
	data: JsonArray,
	type: SerializableType<T>,
	target?: Array<T>
): Array<T> | null {
	return DeserializeArray(data, type, target, InstantiationMethod.None);
}

export function DeserializeMapRaw<T>(
	data: Indexable<JsonType>,
	type: SerializableType<T>,
	target?: Indexable<T>
): Indexable<T> | null {
	return DeserializeMap(data, type, target, InstantiationMethod.None);
}
