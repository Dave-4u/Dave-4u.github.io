# Miniature Interpreter

A tiny expression language with a full front-end pipeline:

**source → lexer → tokens → parser → AST → evaluator**

## Language sketch

```
x = 10;
y = x * 2 + 1;
(2 + 3) * 4;
2 ^ 3 ^ 2;    # right-associative → 512
```

Supported: `+ - * / ^`, unary `+/-`, parentheses, identifiers, assignment, `;`-terminated statements.

## Layout

```
src/
  tokens.py      Token types
  lexer.py       Scanner
  ast_nodes.py   AST dataclasses
  parser.py      Recursive-descent parser
  evaluator.py   Tree-walk interpreter
  interpreter.py Public API + REPL
tests/
  test_interpreter.py
demo.py
```

## Run

```bash
cd projects/mini-interpreter
python demo.py
python -m unittest tests/test_interpreter.py -v
python -m src.interpreter
```

## Design notes

- Precedence climbing via layered grammar methods (`expression` / `term` / `power`)
- Exponentiation is right-associative
- Errors are typed (`LexerError`, `ParseError`, `RuntimeError_`) so tests can target each stage
