import unittest
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.interpreter import interpret
from src.lexer import Lexer, LexerError
from src.parser import ParseError
from src.evaluator import RuntimeError_


class LexerTests(unittest.TestCase):
    def test_numbers_and_ops(self):
        tokens = Lexer("12.5 + x * (3)").tokenize()
        kinds = [t.type.name for t in tokens]
        self.assertEqual(
            kinds,
            ["NUMBER", "PLUS", "IDENT", "STAR", "LPAREN", "NUMBER", "RPAREN", "EOF"],
        )

    def test_unexpected_char(self):
        with self.assertRaises(LexerError):
            Lexer("2 @ 3").tokenize()


class InterpreterTests(unittest.TestCase):
    def test_arithmetic_precedence(self):
        self.assertEqual(interpret("2 + 3 * 4;"), [14.0])
        self.assertEqual(interpret("(2 + 3) * 4;"), [20.0])
        self.assertEqual(interpret("2 ^ 3 ^ 2;"), [512.0])  # right-assoc

    def test_assignment_and_vars(self):
        results = interpret("x = 10; y = x * 2 + 1; y;")
        self.assertEqual(results, [10.0, 21.0, 21.0])

    def test_unary(self):
        self.assertEqual(interpret("-5 + 2;"), [-3.0])

    def test_division_by_zero(self):
        with self.assertRaises(RuntimeError_):
            interpret("1 / 0;")

    def test_undefined_variable(self):
        with self.assertRaises(RuntimeError_):
            interpret("z;")

    def test_parse_error(self):
        with self.assertRaises(ParseError):
            interpret("1 + ;")


if __name__ == "__main__":
    unittest.main()
