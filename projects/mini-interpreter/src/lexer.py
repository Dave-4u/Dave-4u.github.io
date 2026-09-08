from .tokens import Token, TokenType


class LexerError(Exception):
    pass


class Lexer:
    def __init__(self, source: str) -> None:
        self.source = source
        self.start = 0
        self.current = 0
        self.line = 1

    def tokenize(self) -> list[Token]:
        tokens: list[Token] = []
        while not self._is_at_end():
            self.start = self.current
            token = self._scan_token()
            if token is not None:
                tokens.append(token)
        tokens.append(Token(TokenType.EOF, "", line=self.line))
        return tokens

    def _scan_token(self) -> Token | None:
        ch = self._advance()
        if ch in " \t\r":
            return None
        if ch == "\n":
            self.line += 1
            return None
        if ch == "+":
            return self._make(TokenType.PLUS)
        if ch == "-":
            return self._make(TokenType.MINUS)
        if ch == "*":
            return self._make(TokenType.STAR)
        if ch == "/":
            return self._make(TokenType.SLASH)
        if ch == "^":
            return self._make(TokenType.CARET)
        if ch == "(":
            return self._make(TokenType.LPAREN)
        if ch == ")":
            return self._make(TokenType.RPAREN)
        if ch == "=":
            return self._make(TokenType.ASSIGN)
        if ch == ";":
            return self._make(TokenType.SEMICOLON)
        if ch.isdigit() or (ch == "." and self._peek().isdigit()):
            return self._number()
        if ch.isalpha() or ch == "_":
            return self._identifier()
        raise LexerError(f"Unexpected character {ch!r} on line {self.line}")

    def _number(self) -> Token:
        while self._peek().isdigit():
            self._advance()
        if self._peek() == "." and self._peek_next().isdigit():
            self._advance()
            while self._peek().isdigit():
                self._advance()
        text = self.source[self.start : self.current]
        return Token(TokenType.NUMBER, text, float(text), self.line)

    def _identifier(self) -> Token:
        while self._peek().isalnum() or self._peek() == "_":
            self._advance()
        text = self.source[self.start : self.current]
        return Token(TokenType.IDENT, text, line=self.line)

    def _make(self, type_: TokenType) -> Token:
        text = self.source[self.start : self.current]
        return Token(type_, text, line=self.line)

    def _is_at_end(self) -> bool:
        return self.current >= len(self.source)

    def _advance(self) -> str:
        ch = self.source[self.current]
        self.current += 1
        return ch

    def _peek(self) -> str:
        if self._is_at_end():
            return "\0"
        return self.source[self.current]

    def _peek_next(self) -> str:
        if self.current + 1 >= len(self.source):
            return "\0"
        return self.source[self.current + 1]
