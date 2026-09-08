from .evaluator import Evaluator
from .lexer import Lexer
from .parser import Parser


def interpret(source: str) -> list[float | None]:
    tokens = Lexer(source).tokenize()
    program = Parser(tokens).parse()
    return Evaluator().run(program)


def repl() -> None:
    print("Mini interpreter — enter statements ending with ';'. Ctrl-D to exit.")
    evaluator = Evaluator()
    buffer = ""
    while True:
        try:
            line = input(">>> " if not buffer else "... ")
        except EOFError:
            print()
            break
        buffer += line + "\n"
        if ";" not in line:
            continue
        try:
            from .lexer import Lexer
            from .parser import Parser

            tokens = Lexer(buffer).tokenize()
            program = Parser(tokens).parse()
            results = evaluator.run(program)
            for value in results:
                if value is not None:
                    print(value)
        except Exception as exc:  # noqa: BLE001 — show all user-facing errors
            print(f"Error: {exc}")
        buffer = ""


if __name__ == "__main__":
    repl()
