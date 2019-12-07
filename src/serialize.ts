import {
	Indexable,
	isPrimitiveType,
	JsonObject,
	JsonType,
	SerializablePrimitiveType,
	SerializableType,
} from "./util";
import { MetaData, MetaDataFlag } from "./meta_data";
import {
	isNil,
	isNull,
	isUndefined,
	isObjectLike,
	isFunction,
	isRegExp,
	isDate,
} from "lodash";

export function SerializeMap<T extends Indexable>(
	source: T,
	type: SerializableType<T>
): Indexable<JsonType> {
	const target: Indexable<JsonType> = {};
	const keys = Object.keys(source);

	keys.forEach(key => {
		const value = source[key];
		if (!isUndefined(value)) {
			target[MetaData.serializeKeyTransform(key)] = Serialize(
				value,
				type
			);
		}
	});

	return target;
}

export function SerializeArray<T>(
	source: Array<T>,
	type: SerializableType<T>
): Array<JsonType> {
	return source.map<JsonType>(val => Serialize(val, type));
}

export function SerializePrimitive<T>(
	source: SerializablePrimitiveType,
	type: SerializablePrimitiveType
): JsonType {
	if (isNil(source)) {
		return null;
	}

	switch (type) {
		case Boolean:
			return Boolean(source);
		case Number:
			const value = Number(source);
			if (isNaN(value)) return null;
			return value;
		case String:
		case Date:
		case RegExp:
		default:
			return source.toString();
	}
}

export function SerializeJSON(source: any, transformKeys = true): JsonType {
	if (isNil(source)) return null;

	if (Array.isArray(source)) {
		return source.map(val => SerializeJSON(val, transformKeys));
	}

	if (isObjectLike(source)) {
		if (isDate(source) || isRegExp(source)) {
			return source.toString();
		} else {
			const sourceIndexed: Indexable<JsonType> = {};
			const keys = Object.keys(source);
			keys.forEach(key => {
				const value = source[key];
				if (!isUndefined(value)) {
					const sourceIndexedKey = transformKeys
						? MetaData.serializeKeyTransform(key)
						: key;
					sourceIndexed[sourceIndexedKey] = SerializeJSON(
						value,
						transformKeys
					);
				}
			});
			return sourceIndexed;
		}
	} else if (isFunction(source)) {
		return null;
	}

	return source;
}

export function Serialize<T>(
	instance: T,
	type: SerializableType<T>
): JsonObject | null {
	if (isNil(instance)) {
		return null;
	}

	const metadataList = MetaData.getMetaDataForType(type);

	// todo -- maybe move this to a Generic deserialize
	if (isNull(metadataList)) {
		return isPrimitiveType(type)
			? (SerializePrimitive(
					(instance as unknown) as SerializablePrimitiveType,
					type as any
			  ) as JsonObject)
			: {};
	}

	const target: Indexable<JsonType> = {};

	metadataList.forEach(metadata => {
		if (isNull(metadata.serializedKey)) return;

		const source = (instance as any)[metadata.keyName];

		if (isUndefined(source)) return;

		const keyName = metadata.getSerializedKey();

		target[keyName] = serializeByFlag(source, metadata);
	});

	if (isFunction(type.onSerialized)) {
		const value = type.onSerialized(target, instance);
		if (!isUndefined(value)) {
			return value as JsonObject;
		}
	}

	return target;
}

function serializeByFlag(source: any, metadata: MetaData): JsonType {
	const flags = metadata.flags;
	switch (true) {
		case !!(flags & MetaDataFlag.SerializeMap):
			return SerializeMap(source, metadata.serializedType);
		case !!(flags & MetaDataFlag.SerializeArray):
			return SerializeArray(source, metadata.serializedType);
		case !!(flags & MetaDataFlag.SerializePrimitive):
			return SerializePrimitive(
				source,
				metadata.serializedType as SerializablePrimitiveType
			);
		case !!(flags & MetaDataFlag.SerializeObject):
			return Serialize(source, metadata.serializedType);
		case !!(flags & MetaDataFlag.SerializeJSON):
			return SerializeJSON(
				source,
				!!(flags & MetaDataFlag.SerializeJSONTransformKeys)
			);
		case !!(flags & MetaDataFlag.SerializeUsing):
			return (metadata.serializedType as any)(source);
		default:
			return null;
	}
}
