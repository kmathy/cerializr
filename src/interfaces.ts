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

export enum InstantiationMethod {
	None = 0,
	New = 1,
	ObjectCreate = 2,
}

export interface JsonObject {
	[idx: string]: JsonType | JsonObject;
}

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
