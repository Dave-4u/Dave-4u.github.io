from .ast_nodes import Assign, Binary, Expr, Number, Program, Unary, Variable
from .tokens import Token, TokenType


class ParseError(Exception):
    pass


class Parser:
    """Recursive-descent parser for:

    program     → statement* EOF
    statement   → assign ";" | expression ";"
    assign      → IDENT "=" expression
    expression  → term (("+" | "-") term)*
    term        → power (("*" | "/") power)*
    power       → unary ("^" power)?
    unary       → ("-" | "+") unary | primary
    primary     → NUMBER | IDENT | "(" expression ")"
    """

    def __init__(self, tokens: list[Token]) -> None:
        self.tokens = tokens
        self.current = 0

    def parse(self) -> Program:
        statements: list[Expr] = []
        while not self._check(TokenType.EOF):
            statements.append(self._statement())
        return Program(statements)

    def _statement(self) -> Expr:
        if self._check(TokenType.IDENT) and self._check_next(TokenType.ASSIGN):
            name = self._advance().lexeme
            self._consume(TokenType.ASSIGN, "Expected '=' after identifier")
            value = self._expression()
            self._consume(TokenType.SEMICOLON, "Expected ';' after statement")
            return Assign(name, value)
        expr = self._expression()
        self._consume(TokenType.SEMICOLON, "Expected ';' after expression")
        return expr

    def _expression(self) -> Expr:
        expr = self._term()
        while self._match(TokenType.PLUS, TokenType.MINUS):
            op = self._previous().lexeme
            right = self._term()
            expr = Binary(expr, op, right)
        return expr

    def _term(self) -> Expr:
        expr = self._power()
        while self._match(TokenType.STAR, TokenType.SLASH):
            op = self._previous().lexeme
            right = self._power()
            expr = Binary(expr, op, right)
        return expr

    def _power(self) -> Expr:
        expr = self._unary()
        if self._match(TokenType.CARET):
            right = self._power()
            expr = Binary(expr, "^", right)
        return expr

    def _unary(self) -> Expr:
        if self._match(TokenType.MINUS, TokenType.PLUS):
            op = self._previous().lexeme
            return Unary(op, self._unary())
        return self._primary()

    def _primary(self) -> Expr:
        if self._match(TokenType.NUMBER):
            return Number(self._previous().literal)  # type: ignore[arg-type]
        if self._match(TokenType.IDENT):
            return Variable(self._previous().lexeme)
        if self._match(TokenType.LPAREN):
            expr = self._expression()
            self._consume(TokenType.RPAREN, "Expected ')' after expression")
            return expr
        raise ParseError(f"Unexpected token {self._peek()!r}")

    def _match(self, *types: TokenType) -> bool:
        for t in types:
            if self._check(t):
                self._advance()
                return True
        return False

    def _consume(self, type_: TokenType, message: str) -> Token:
        if self._check(type_):
            return self._advance()
        raise ParseError(f"{message}; got {self._peek()!r}")

    def _check(self, type_: TokenType) -> bool:
        return self._peek().type == type_

    def _check_next(self, type_: TokenType) -> bool:
        if self.current + 1 >= len(self.tokens):
            return False
        return self.tokens[self.current + 1].type == type_

    def _advance(self) -> Token:
        if not self._is_at_end():
            self.current += 1
        return self._previous()

    def _is_at_end(self) -> bool:
        return self._peek().type == TokenType.EOF

    def _peek(self) -> Token:
        return self.tokens[self.current]

    def _previous(self) -> Token:
        return self.tokens[self.current - 1]
