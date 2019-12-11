import camelCase from "lodash/camelCase";
import snakeCase from "lodash/snakeCase";
import kebabCase from "lodash/kebabCase";

/**
 * Does nothing to the string
 * @param str
 *
 * @return str unchanged
 */
export function NoOp(str: string): string {
	return str;
}

/**
 * convert strings like my_camel_string to myCamelString
 *
 * @param str
 *
 * @return myCamelString
 */
export function CamelCase(str: string): string {
	return camelCase(str);
}

/**
 * convert strings like MyCamelString to my_camel_string
 *
 * @param str
 *
 * @return my_snake_string
 */
export function SnakeCase(str: string): string {
	return snakeCase(str);
}

/**
 * convert strings like myCamelCase to my_camel_case
 * @param str
 *
 * @return my_underscore_case
 */
export function UnderscoreCase(str: string): string {
	return snakeCase(str);
}

/**
 * convert strings like my_camelCase to my-camel-case
 * @param str
 *
 * @return my-dash-case (or kebab-case)
 */
export function DashCase(str: string): string {
	return kebabCase(str);
}
