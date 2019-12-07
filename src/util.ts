import { SerializableType, InstantiationMethod } from "./interfaces";
import { isNil, isNull } from "lodash";

/** @internal */
export function getTarget<T>(
	type: SerializableType<T>,
	target: T,
	instantiationMethod?: InstantiationMethod
): T {
	if (!isNil(target)) return target;

	if (!isNull(type)) {
		switch (instantiationMethod) {
			case InstantiationMethod.New:
				return new type();

			case InstantiationMethod.ObjectCreate:
				return Object.create(type.prototype);
		}
	}

	return {} as T;
}

/** @internal */
export function isPrimitiveType(type: Function): boolean {
	return (
		type === String ||
		type === Boolean ||
		type === Number ||
		type === Date ||
		type === RegExp
	);
}

/** @internal */
export function setBitConditionally(
	value: number,
	bits: number,
	condition: boolean
): number {
	if (condition) {
		return value | bits;
	} else {
		return value & ~bits;
	}
}
