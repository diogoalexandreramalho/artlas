from core.config import Settings

_DUMMY_SECRET = "x" * 32


def _build(cors: object) -> Settings:
    return Settings(jwt_secret_key=_DUMMY_SECRET, cors_origins=cors)  # type: ignore[arg-type]


def test_cors_origins_comma_separated_string() -> None:
    settings = _build("http://a,http://b")
    assert settings.cors_origins == ["http://a", "http://b"]


def test_cors_origins_single_value_string() -> None:
    settings = _build("http://a")
    assert settings.cors_origins == ["http://a"]


def test_cors_origins_trims_whitespace_and_empty_segments() -> None:
    settings = _build("http://a, ,http://b")
    assert settings.cors_origins == ["http://a", "http://b"]


def test_cors_origins_passthrough_for_list() -> None:
    settings = _build(["http://a", "http://b"])
    assert settings.cors_origins == ["http://a", "http://b"]
