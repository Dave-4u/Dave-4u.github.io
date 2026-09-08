from .ast_nodes import Assign, Binary, Expr, Number, Program, Unary, Variable


class RuntimeError_(Exception):
    pass


class Environment:
    def __init__(self) -> None:
        self.values: dict[str, float] = {}

    def define(self, name: str, value: float) -> None:
        self.values[name] = value

    def get(self, name: str) -> float:
        if name not in self.values:
            raise RuntimeError_(f"Undefined variable '{name}'")
        return self.values[name]


class Evaluator:
    def __init__(self) -> None:
        self.env = Environment()

    def run(self, program: Program) -> list[float | None]:
        results: list[float | None] = []
        for stmt in program.statements:
            results.append(self._eval(stmt))
        return results

    def _eval(self, node: Expr) -> float | None:
        if isinstance(node, Number):
            return node.value
        if isinstance(node, Variable):
            return self.env.get(node.name)
        if isinstance(node, Unary):
            right = self._eval(node.right)
            assert right is not None
            if node.op == "-":
                return -right
            if node.op == "+":
                return right
            raise RuntimeError_(f"Unknown unary operator {node.op}")
        if isinstance(node, Binary):
            left = self._eval(node.left)
            right = self._eval(node.right)
            assert left is not None and right is not None
            if node.op == "+":
                return left + right
            if node.op == "-":
                return left - right
            if node.op == "*":
                return left * right
            if node.op == "/":
                if right == 0:
                    raise RuntimeError_("Division by zero")
                return left / right
            if node.op == "^":
                return left**right
            raise RuntimeError_(f"Unknown binary operator {node.op}")
        if isinstance(node, Assign):
            value = self._eval(node.value)
            assert value is not None
            self.env.define(node.name, value)
            return value
        raise RuntimeError_(f"Unsupported node type {type(node)!r}")
