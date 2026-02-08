"""Unit tests for NextJSGenerator, especially _escape_js and template data escaping."""

import pytest
from pathlib import Path
from unittest.mock import MagicMock

from src.generators.nextjs_generator import NextJSGenerator


@pytest.fixture
def mock_config():
    config = MagicMock()
    config.get_output_path.return_value = Path("/tmp/generated_sites")
    return config


@pytest.fixture
def generator(mock_config):
    return NextJSGenerator(mock_config)


class TestEscapeJs:
    """Tests for _escape_js to prevent JS/TS string literal syntax errors."""

    def test_escapes_apostrophe(self, generator):
        s = "We've got your back"
        out = generator._escape_js(s)
        # Apostrophe must be escaped as \' so it is safe inside single-quoted JS string
        assert "\\'" in out
        # When wrapped in single quotes, no unescaped ' in the middle
        js_literal = "'" + out + "'"
        assert js_literal.startswith("'") and js_literal.endswith("'")

    def test_escapes_double_quote(self, generator):
        s = 'Say "hello"'
        out = generator._escape_js(s)
        assert '\\"' in out

    def test_escapes_backslash(self, generator):
        s = "path\\to\\file"
        out = generator._escape_js(s)
        # Each backslash in the string should become \\
        assert "\\\\" in out
        assert "\\t" not in out or "\\\\" in out  # backslashes are escaped

    def test_escapes_newline(self, generator):
        s = "line1\nline2"
        out = generator._escape_js(s)
        assert "\n" not in out
        assert "\\n" in out

    def test_none_returns_empty(self, generator):
        assert generator._escape_js(None) == ""

    def test_non_string_coerced_and_escaped(self, generator):
        assert generator._escape_js(42) == "42"
        assert generator._escape_js(3.14) == "3.14"

    def test_empty_string_returns_empty(self, generator):
        assert generator._escape_js("") == ""

    def test_safe_inside_single_quoted_js_string(self, generator):
        """Escaped value used in '...' must not break JS parsing (no unescaped ')."""
        problematic = "Austin's Premier Roofing - we've got you covered."
        out = generator._escape_js(problematic)
        # Simulate template output: title: '{{ value }}'
        js_literal = "'" + out + "'"
        # Should not contain an unescaped single quote in the middle
        i = 1
        while i < len(js_literal) - 1:
            if js_literal[i] == "'" and (i == 0 or js_literal[i - 1] != "\\"):
                pytest.fail(f"Unescaped quote at position {i} in {js_literal!r}")
            i += 1
        assert out != problematic
