from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Expr:
    pass


@dataclass
class Number(Expr):
    value: float


@dataclass
class Variable(Expr):
    name: str


@dataclass
class Unary(Expr):
    op: str
    right: Expr


@dataclass
class Binary(Expr):
    left: Expr
    op: str
    right: Expr


@dataclass
class Assign(Expr):
    name: str
    value: Expr


@dataclass
class Program:
    statements: list[Expr]
