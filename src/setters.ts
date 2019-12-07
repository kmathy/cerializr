import { MetaData } from "./meta_data";
import { NoOp } from "./string_transforms";
import { InstantiationMethod } from "./interfaces";
import { isFunction, isNull } from "lodash";

/**
 * Use one of the provided function or use your own custom function.
 *
 * No function provided will result to an unchanged string property.
 *
 * @example```js
    import { SetSerializeKeyTransform, CamelCase } from "cerializr";
	
	SetSerializeKeyTransform(CamelCase);```
 *
 * @param fn
 */
export function SetSerializeKeyTransform(fn: (str: string) => string): void {
	MetaData.serializeKeyTransform = isFunction(fn) ? fn : NoOp;
}

/**
 * Use one of the provided function or use your own custom function.
 *
 * No function provided will result to an unchanged string property.
 *
 * @example```js
    import { SetDeserializeKeyTransform, CamelCase } from "cerializr";
	
	SetDeserializeKeyTransform(CamelCase);```
 *
 * @param fn
 */
export function SetDeserializeKeyTransform(fn: (str: string) => string): void {
	MetaData.deserializeKeyTransform = isFunction(fn) ? fn : NoOp;
}

/**
 * Change the default InstantiationMethod
 * @param instantiationMethod
 */
export function SetDefaultInstantiationMethod(
	instantiationMethod: InstantiationMethod | null
): void {
	MetaData.deserializeInstantationMethod = isNull(instantiationMethod)
		? InstantiationMethod.New
		: instantiationMethod;
}
