// @flow
import _ from 'lodash';
import util from '../util.js';
import type {Context} from '../types.js';
import Ast from '../jsast/ast.js';
import type {JsAst} from '../jsast/ast.js';

const items = (schema: Object, symbol: string, context: Context): JsAst => {
  if (Array.isArray(schema.items)) {
    // Tuple. Handle each item individually.
    const checks = _.map(schema.items, (subSchema, i) => {
      const fnSym = context.symbolForSchema(subSchema);
      return Ast.If(
        Ast.Binop.And(
          Ast.Binop.Lt(`${i}`, `${symbol}.length`),
          Ast.Binop.Neq(Ast.Call(fnSym, `${symbol}[${i}]`), 'null'),
        ),
        context.error(),
      );
    });
    return Ast.Body(...checks);
  } else if (schema.items) {
    const fnSym = context.symbolForSchema(schema.items);
    const counter = context.gensym();
    const result = context.gensym();
    const check = Ast.Body(
      Ast.Assignment(counter, '0'),
      Ast.Assignment(result, 'null'),
      Ast.For(
        Ast.Empty,
        Ast.Binop.Lt(counter, `${symbol}.length`),
        Ast.Literal(`${counter}++`),
        Ast.Body(
          Ast.Assignment(result, Ast.Call(fnSym, `${symbol}[${counter}]`)),
          Ast.If(Ast.Binop.Neq(result, 'null'), Ast.Return(result)),
        ),
      ),
    );
    return util.typeCheck('array', symbol, check);
  } else {
    return Ast.Empty;
  }
};

export default items;
