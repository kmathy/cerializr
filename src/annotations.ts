import { MetaData, MetaDataFlag } from "./meta_data";
import { isPrimitiveType, setBitConditionally } from "./util";
import {
	IConstructable,
	SerializableType,
	SerializeFn,
	ISerializer,
	CerializrAsJsonOptions,
} from "./interfaces";

export function serializeUsing(serializer: SerializeFn, keyName?: string) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.serializedKey = keyName ? keyName : actualKeyName;
		metadata.serializedType = serializer as any;
		metadata.flags |= MetaDataFlag.SerializeUsing;
	};
}

export function serializeAs(type: SerializableType<any>, keyName?: string) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.serializedKey = keyName ? keyName : actualKeyName;
		metadata.serializedType = type;
		metadata.flags |= MetaDataFlag.SerializeObject;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.SerializePrimitive,
			isPrimitiveType(type)
		);
	};
}

export function serializeAsArray<T>(
	type: SerializableType<T>,
	keyName?: string
) {
	return function(target: any, actualKeyName: string): any {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.serializedKey = keyName ? keyName : actualKeyName;
		metadata.serializedType = type;
		metadata.flags |= MetaDataFlag.SerializeArray;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.SerializePrimitive,
			isPrimitiveType(type)
		);
	};
}

export function serializeAsMap<T>(type: SerializableType<T>, keyName?: string) {
	return function(target: any, actualKeyName: string): any {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.serializedKey = keyName ? keyName : actualKeyName;
		metadata.serializedType = type;
		metadata.flags |= MetaDataFlag.SerializeMap;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.SerializePrimitive,
			isPrimitiveType(type)
		);
	};
}

export function serializeAsJson(
	{ keyName, transformKey }: Partial<CerializrAsJsonOptions> = {
		transformKey: true,
	}
) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.serializedKey = keyName || actualKeyName;
		metadata.flags |= MetaDataFlag.SerializeJSON;
		metadata.transformKey = transformKey!;
	};
}

export function deserializeUsing(serializer: SerializeFn, keyName?: string) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.deserializedKey = keyName ? keyName : actualKeyName;
		metadata.deserializedType = serializer as any;
		metadata.flags |= MetaDataFlag.DeserializeUsing;
	};
}

export function deserializeAs(type: SerializableType<any>, keyName?: string) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.deserializedKey = keyName ? keyName : actualKeyName;
		metadata.deserializedType = type;
		metadata.flags |= MetaDataFlag.DeserializeObject;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.DeserializePrimitive,
			isPrimitiveType(type)
		);
	};
}

export function deserializeAsArray(
	type: SerializableType<any>,
	keyName?: string
) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.deserializedKey = keyName ? keyName : actualKeyName;
		metadata.deserializedType = type;
		metadata.flags |= MetaDataFlag.DeserializeArray;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.DeserializePrimitive,
			isPrimitiveType(type)
		);
	};
}

export function deserializeAsMap(
	type: SerializableType<any>,
	keyName?: string
) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.deserializedKey = keyName ? keyName : actualKeyName;
		metadata.deserializedType = type;
		metadata.flags |= MetaDataFlag.DeserializeMap;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.DeserializePrimitive,
			isPrimitiveType(type)
		);
	};
}

export function deserializeAsJson(
	{ keyName, transformKey }: Partial<CerializrAsJsonOptions> = {
		transformKey: true,
	}
) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		metadata.deserializedKey = keyName || actualKeyName;
		metadata.flags |= MetaDataFlag.DeserializeJSON;
		metadata.transformKey = transformKey!;
	};
}

export function autoserializeUsing(
	serializer: ISerializer<any>,
	keyName?: string
) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		const key = keyName ? keyName : actualKeyName;
		metadata.serializedKey = key;
		metadata.deserializedKey = key;
		metadata.serializedType = serializer.Serialize as any;
		metadata.deserializedType = serializer.Deserialize as any;
		metadata.flags |= MetaDataFlag.AutoUsing;
	};
}

export function autoserializeAs(type: SerializableType<any>, keyName?: string) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		const key = keyName ? keyName : actualKeyName;
		metadata.deserializedKey = key;
		metadata.serializedKey = key;
		metadata.deserializedType = type;
		metadata.serializedType = type;
		metadata.flags |=
			MetaDataFlag.SerializeObject | MetaDataFlag.DeserializeObject;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.AutoPrimitive,
			isPrimitiveType(type)
		);
	};
}

export function autoserializeAsArray(
	type: SerializableType<any>,
	keyName?: string
) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		const key = keyName ? keyName : actualKeyName;
		metadata.deserializedKey = key;
		metadata.serializedKey = key;
		metadata.deserializedType = type;
		metadata.serializedType = type;
		metadata.flags |=
			MetaDataFlag.SerializeArray | MetaDataFlag.DeserializeArray;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.AutoPrimitive,
			isPrimitiveType(type)
		);
	};
}

export function autoserializeAsMap(
	type: SerializableType<any>,
	keyName?: string
) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		const key = keyName ? keyName : actualKeyName;
		metadata.deserializedKey = key;
		metadata.serializedKey = key;
		metadata.deserializedType = type;
		metadata.serializedType = type;
		metadata.flags |=
			MetaDataFlag.SerializeMap | MetaDataFlag.DeserializeMap;
		metadata.flags = setBitConditionally(
			metadata.flags,
			MetaDataFlag.AutoPrimitive,
			isPrimitiveType(type)
		);
	};
}

export function autoserializeAsJson(
	{ keyName, transformKey }: Partial<CerializrAsJsonOptions> = {
		transformKey: true,
	}
) {
	return function(target: IConstructable, actualKeyName: string): void {
		const metadata = MetaData.getMetaData(
			target.constructor,
			actualKeyName
		);
		const key = keyName || actualKeyName;
		metadata.deserializedKey = key;
		metadata.serializedKey = key;
		metadata.flags |=
			MetaDataFlag.SerializeJSON | MetaDataFlag.DeserializeJSON;
		metadata.transformKey = transformKey!;
	};
}

export function inheritSerialization(parentType: IConstructable) {
	return function(childType: Function) {
		MetaData.inheritMetaData(parentType, childType);
	};
}
