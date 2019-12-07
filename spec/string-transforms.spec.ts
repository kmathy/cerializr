import {
	NoOp,
	CamelCase,
	SnakeCase,
	DashCase,
} from "./../src/string_transforms";
import {
	SetSerializeKeyTransform,
	SetDeserializeKeyTransform,
} from "./../src/setters";
import { serializeAs, Serialize, deserializeAs, Deserialize } from "../src";

describe("Serialization", function() {
	function runTests(
		nameTest: string,
		fn: (input: string) => string,
		output: any
	) {
		it("SetSerializeKeyTransform - " + nameTest, function() {
			SetSerializeKeyTransform(fn);

			class Test {
				@serializeAs(String) valueOne: string;
				@serializeAs(String) value_two: string;
			}

			const test = new Test();
			test.valueOne = "test";
			test.value_two = "test";

			const json = Serialize(test, Test);

			expect(json).not.toBeNull();
			expect(json).toEqual(output);
		});
	}

	runTests("NoOp", NoOp, { valueOne: "test", value_two: "test" });
	runTests("CamelCase", CamelCase, { valueOne: "test", valueTwo: "test" });
	runTests("SnakeCase", SnakeCase, { value_one: "test", value_two: "test" });
	runTests("DashCase / KebabCase", DashCase, {
		"value-one": "test",
		"value-two": "test",
	});
	runTests("Custom - UpperCase", str => str.toUpperCase(), {
		VALUEONE: "test",
		VALUE_TWO: "test",
	});
});

describe("Deserialization", function() {
	function runTests(
		nameTest: string,
		fn: (input: string) => string,
		output: any
	) {
		it("SetDeserializeKeyTransform - " + nameTest, function() {
			SetDeserializeKeyTransform(fn);

			class Test {
				@deserializeAs(String) valueOne: string;
				@deserializeAs(String) value_two: string;
			}

			const json = { valueOne: "test", value_two: "test" };

			const test = Deserialize(json, Test);

			expect(test).not.toBeNull();
			expect(test).toEqual(output);
		});
	}

	runTests("NoOp", NoOp, { valueOne: "test", value_two: "test" });
	runTests("CamelCase", CamelCase, { valueOne: "test" });
	runTests("SnakeCase", SnakeCase, { value_two: "test" });
	runTests("DashCase / KebabCase", DashCase, {});
});
