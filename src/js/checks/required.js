// @flow
import _ from 'lodash';
import util from 'util.js';
import type {Context} from 'js/generate.js';
import Ast from 'js/jsast/ast.js';
import type {JsAst, VarType} from 'js/jsast/ast.js';

const required = (schema: JsonSchema, symbol: VarType, context: Context): JsAst => {
  if (Array.isArray(schema.required)) {
    const checks: Array<JsAst> = _.map(schema.required, (property) => {
      return Ast.If(Ast.Binop.Eq(Ast.PropertyAccess(symbol, property), Ast.Undefined), context.error());
    });
    return util.typeCheck('object', symbol, Ast.Body(...checks));
  } else {
    return Ast.Empty;
  }
};

export default required;
