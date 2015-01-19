window.TypeTester = {
    trimArray: function (array) {
        var out = [];
        var val;
        for (var i = 0; i < array.length; i++) {
            val = array[i].trim();
            if (typeof val != "string" || val.length > 0) {
                out.push(val);
            }
        }
        return out;
    },
    isOptional: function (argument) {
        return argument.indexOf("[optional]") == 0;
    },
    extractParameter: function (parameter) {
        var name, isOptional = false, type = "any";

        if (parameter && parameter.indexOf("/*") == 0) {
            name = parameter.split("*/")[1].trim();
            type = parameter.split("/*")[1].split("*/")[0].trim();
            isOptional = this.isOptional(type);
            if (isOptional) {
                type = type.replace("[optional]", "").trim();
            }
        } else {
            name = parameter;
        }

        return {
            name: name,
            optional: isOptional,
            type: type
        };
    },
    check: function () {
        var fullFunction = arguments.callee.caller.toString();
        var functionName = fullFunction.replace(/\r*\n*/, "").split("(")[0].split("function")[1].trim();
        var parameterPart = fullFunction.replace(/\r*\n*/, "").split("(")[1].split(")")[0];
        var parameters = parameterPart.split(",");
        parameters = this.trimArray(parameters);

        var parentArguments = arguments.callee.caller.arguments;

        if (parentArguments.length > parameters.length) {
            console.warn("Too many arguments passed to the function '" + functionName + "'.\nExpected " + parameters.length + " but got " + parentArguments.length)
        }

        var i, parameter;
        for (i = 0; i < parentArguments.length; i++) {
            parameter = this.extractParameter(parameters[i]);

            if (parentArguments[i] == undefined || parentArguments[i] == null) {
                if (!parameter.optional) {
                    console.warn("Missing required parameter '" + parameter.name + "' in function '" + functionName + "' at index " + i + " but got " + parentArguments[i]);
                }
            } else {
                var actual = typeof(parentArguments[i]);

                var isCorrect = true;
                switch (parameter.type) {
                    case "any":
                        //Nothing to check
                        break;
                    case "int":
                        isCorrect = parameter.type == "number" && parentArguments[i].toString().match(/^[0-9]+$/);
                        break;
                    case "float":
                        isCorrect = parameter.type == "number" && parentArguments[i].toString().match(/^[0-9]+(\.[0-9])?*$/);
                        break;
                    case "array":
                        isCorrect = parentArguments[i] instanceof Array;
                        break;
                    default:
                        isCorrect = parameter.type == actual;
                }
                if (!isCorrect) {
                    console.warn("Wrong type given to parameter '" + parameter.name + "' in function '" + functionName + "'.\nExpected a '" + parameter.type + "' but got type " + actual + ":" + JSON.stringify(parentArguments[i], null, 4));
                }
            }
        }

        for (i = parentArguments.length; i < parameters.length; i++) {
            parameter = this.extractParameter(parameters[i]);
            if (!parameter.optional) {
                console.warn("Missing required parameter '" + parameter.name + "' in function '" + functionName + "' at index " + i);
            }
        }
    }
};
