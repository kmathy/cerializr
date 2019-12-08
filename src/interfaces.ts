export type JsonType =
	| null
	| string
	| number
	| boolean
	| JsonObject
	| JsonArray;
export type Serializer<T> = (target: T) => JsonType;
export type Deserializer<T> = (
	data: JsonType,
	target?: T,
	instantiationMethod?: InstantiationMethod
) => T;
export type IConstructable = { constructor: Function };
export type SerializeFn = <T>(data: T) => JsonType;
export type SerializablePrimitiveType =
	| DateConstructor
	| NumberConstructor
	| BooleanConstructor
	| RegExpConstructor
	| StringConstructor;

/**
 * #### InstantiationMethod.New:
 * The constructor will be invoked when a new instance needs to be created.
 *
 * #### InstantiationMethod.ObjectCreate:
 * The object will be created without invoking its constructor, which is useful for systems where constructed objects immediately freeze themselves
 *
 * #### InstantiationMethode.None:
 * *deserializeXXX* functions will return a plain object instead, which can be useful for systems like Redux that expect / require plain objects and not class instances.
 */
export enum InstantiationMethod {
	None = 0,
	New = 1,
	ObjectCreate = 2,
}

export interface JsonObject extends Indexable<JsonType | JsonObject> {}

export interface JsonArray extends Array<JsonType> {}

export interface ISerializer<T> {
	Serialize: Serializer<T>;
	Deserialize: Deserializer<T>;
}

export interface Indexable<T = any | null> {
	[idx: string]: T;
}

export interface SerializableType<T> {
	new (...args: any[]): T;

	onSerialized?: (data: JsonObject, instance: T) => JsonObject | void;
	onDeserialized?: (
		data: JsonObject,
		instance: T,
		instantiationMethod?: InstantiationMethod
	) => T | void;
}

export interface CerializrAsJsonOptions {
	keyName: string;
	transformKey: boolean;
}
