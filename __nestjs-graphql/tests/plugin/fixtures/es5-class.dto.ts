export const es5CreateCatDtoText = `
import { Status } from './status';
import { CONSTANT_STRING, CONSTANT_OBJECT } from './constants';

export class CreateCatDtoEs5 {
  name: string = CONSTANT_STRING;
  status: Status = Status.ENABLED;
  obj = CONSTANT_OBJECT;
}
`;

export const es5CreateCatDtoTextTranspiled = `\"use strict\";
Object.defineProperty(exports, \"__esModule\", { value: true });
exports.CreateCatDtoEs5 = void 0;
var status_1 = require(\"./status\");
var constants_1 = require(\"./constants\");
var CreateCatDtoEs5 = /** @class */ (function () {
    function CreateCatDtoEs5() {
        this.name = constants_1.CONSTANT_STRING;
        this.status = status_1.Status.ENABLED;
        this.obj = constants_1.CONSTANT_OBJECT;
    }
    CreateCatDtoEs5._GRAPHQL_METADATA_FACTORY = function () {
        return { name: { nullable: false, type: function () { return String; } }, status: { nullable: false, type: function () { return Object; } }, obj: { nullable: false, type: function () { return Object; } } };
    };
    return CreateCatDtoEs5;
}());
exports.CreateCatDtoEs5 = CreateCatDtoEs5;
`;
