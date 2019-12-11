import {
	Indexable,
	JsonObject,
	JsonType,
	SerializablePrimitiveType,
	SerializableType,
} from "./interfaces";
import { isPrimitiveType } from "./util";
import { MetaData, MetaDataFlag } from "./meta_data";
import { default as _ } from "./my-lodash";
import isObjectLike from "lodash/isObjectLike";

/**
 * takes an indexable object ie `<T>{ [idx: string] : T }` and for each key serializes
     the object using the provided class type.
 * @param source - an indexable object
 * @param type - Type to serialize
 * 
 * @return Indexable object of JsonType
 */
export function SerializeMap<T extends Indexable>(
	source: T,
	type: SerializableType<T>
): Indexable<JsonType> {
	const target: Indexable<JsonType> = {};
	const keys = Object.keys(source);

	keys.forEach(key => {
		const value = source[key];
		if (!_.isUndefined(value)) {
			target[MetaData.serializeKeyTransform(key)] = Serialize(
				value,
				type
			);
		}
	});

	return target;
}

/**
 * takes an array of objects and serializes each entry using the provided class type
 *
 * @param source - An array of objects
 * @param type - Type to serialize each entry of the array
 *
 * @return Array of JsonType
 */
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
	if (_.isNil(source)) {
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

/**
 * takes any value and serializes it as json, no structure is assumed 
    and any serialization annotations on any processed objects are totally ignored.
 * @param source 
 * @param transformKeys 
 * 
 * @return JsonType
 */
export function SerializeJSON(source: any, transformKeys = true): JsonType {
	if (_.isNil(source)) return null;

	if (Array.isArray(source)) {
		return source.map(val => SerializeJSON(val, transformKeys));
	}

	if (isObjectLike(source)) {
		if (_.isDate(source) || _.isRegExp(source)) {
			return source.toString();
		} else {
			const sourceIndexed: Indexable<JsonType> = {};
			const keys = Object.keys(source);
			keys.forEach(key => {
				const value = source[key];
				if (!_.isUndefined(value)) {
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
	} else if (_.isFunction(source)) {
		return null;
	}

	return source;
}

/**
 * takes a single object and serializes it using the provided class type.
 * @param instance - A single object to serialize
 * @param type - Type to serialize the instance
 *
 * @return A JsonObject or null
 */
export function Serialize<T>(
	instance: T,
	type: SerializableType<T>
): JsonObject | null {
	if (_.isNil(instance)) {
		return null;
	}

	const metadataList = MetaData.getMetaDataForType(type);

	// todo -- maybe move this to a Generic deserialize
	if (metadataList === null) {
		return isPrimitiveType(type)
			? (SerializePrimitive(
					(instance as unknown) as SerializablePrimitiveType,
					type as any
			  ) as JsonObject)
			: {};
	}

	const target: Indexable<JsonType> = {};

	metadataList.forEach(metadata => {
		if (metadata.serializedKey === null) return;

		const source = (instance as any)[metadata.keyName];

		if (_.isUndefined(source)) return;

		const keyName = metadata.getSerializedKey();

		target[keyName] = serializeByFlag(source, metadata);
	});

	if (_.isFunction(type.onSerialized)) {
		const value = type.onSerialized(target, instance);
		if (!_.isUndefined(value)) {
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
			return SerializeJSON(source, metadata.transformKey);
		case !!(flags & MetaDataFlag.SerializeUsing):
			return (metadata.serializedType as any)(source);
		default:
			return null;
	}
}
