import argparse
import shutil
import os
import sys
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
PYTHON_PACKAGES = WORKSPACE_ROOT / ".python-packages"
FIREBIRD_25_ROOT = WORKSPACE_ROOT / ".tools" / "firebird-2.5.9"
FIREBIRD_50_ROOT = WORKSPACE_ROOT / ".tools" / "firebird-5.0.3"
FIREBIRD_LOCK = WORKSPACE_ROOT / ".tools" / "firebird-lock"
FIREBIRD_TMP = WORKSPACE_ROOT / ".tools" / "firebird-tmp"
WORKING_COPY_DIR = WORKSPACE_ROOT / ".db-working-copy"
DEFAULT_DATABASE = Path(r"D:\ZAMBOANGUITA.FDB")

if str(PYTHON_PACKAGES) not in sys.path:
    sys.path.insert(0, str(PYTHON_PACKAGES))

import fdb  # noqa: E402


FIELD_TYPE_NAMES = {
    7: "SMALLINT",
    8: "INTEGER",
    10: "FLOAT",
    12: "DATE",
    13: "TIME",
    14: "CHAR",
    16: "BIGINT",
    23: "BOOLEAN",
    24: "DECFLOAT(16)",
    25: "DECFLOAT(34)",
    26: "INT128",
    27: "DOUBLE",
    28: "TIME WITH TIME ZONE",
    29: "TIMESTAMP WITH TIME ZONE",
    35: "TIMESTAMP",
    37: "VARCHAR",
    261: "BLOB",
}


def get_client_library(client_version: str) -> tuple[Path, Path]:
    if client_version == "2.5":
        client_root = FIREBIRD_25_ROOT
        client_lib = client_root / "fbembed.dll"
    elif client_version == "5.0":
        client_root = FIREBIRD_50_ROOT
        client_lib = client_root / "fbclient.dll"
    else:
        raise ValueError(f"Unsupported client version: {client_version}")
    return client_root, client_lib


def configure_client(client_version: str) -> Path:
    client_root, client_lib = get_client_library(client_version)
    if not client_lib.exists():
        raise FileNotFoundError(f"Firebird client DLL not found: {client_lib}")
    FIREBIRD_LOCK.mkdir(parents=True, exist_ok=True)
    FIREBIRD_TMP.mkdir(parents=True, exist_ok=True)
    os.environ["FIREBIRD"] = str(client_root)
    os.environ["FIREBIRD_LOCK"] = str(FIREBIRD_LOCK)
    os.environ["FIREBIRD_TMP"] = str(FIREBIRD_TMP)
    fdb.load_api(str(client_lib))
    return client_lib


def get_connection(args: argparse.Namespace) -> fdb.Connection:
    return fdb.connect(
        dsn=str(args.connect_database),
        user=args.user,
        password=args.password,
        charset=args.charset,
    )


def prepare_database(args: argparse.Namespace) -> Path:
    if not args.make_copy:
        return args.database
    WORKING_COPY_DIR.mkdir(parents=True, exist_ok=True)
    target = WORKING_COPY_DIR / args.database.name
    source_mtime = args.database.stat().st_mtime
    copy_needed = True
    if target.exists():
        copy_needed = target.stat().st_mtime < source_mtime or target.stat().st_size != args.database.stat().st_size
    if copy_needed:
        print(f"Copying database to workspace: {target}")
        shutil.copy2(args.database, target)
    return target


def list_tables(cursor: fdb.Cursor) -> None:
    cursor.execute(
        """
        SELECT TRIM(rdb$relation_name)
        FROM rdb$relations
        WHERE COALESCE(rdb$system_flag, 0) = 0
          AND rdb$view_blr IS NULL
        ORDER BY 1
        """
    )
    rows = cursor.fetchall()
    if not rows:
        print("No user tables found.")
        return
    print("Tables:")
    for (table_name,) in rows:
        print(f"  {table_name}")


def describe_table(cursor: fdb.Cursor, table: str) -> None:
    cursor.execute(
        """
        SELECT
            TRIM(rf.rdb$field_name) AS field_name,
            f.rdb$field_type AS field_type_code,
            f.rdb$field_length,
            rf.rdb$null_flag
        FROM rdb$relation_fields rf
        JOIN rdb$fields f ON rf.rdb$field_source = f.rdb$field_name
        WHERE rf.rdb$relation_name = ?
        ORDER BY rf.rdb$field_position
        """,
        (table.upper(),),
    )
    rows = cursor.fetchall()
    if not rows:
        print(f"Table not found or has no columns: {table}")
        return
    print(f"Columns for {table}:")
    for field_name, field_type_code, field_length, null_flag in rows:
        nullable = "NOT NULL" if null_flag else "NULLABLE"
        type_name = FIELD_TYPE_NAMES.get(field_type_code, str(field_type_code))
        print(
            f"  {field_name:<30} type={type_name:<24} "
            f"length={field_length:<5} {nullable}"
        )


def preview_table(cursor: fdb.Cursor, table: str, limit: int) -> None:
    query = f"SELECT FIRST {limit} * FROM {table}"
    cursor.execute(query)
    column_names = [item[0].strip() for item in cursor.description]
    print("Columns:", ", ".join(column_names))
    rows = cursor.fetchall()
    if not rows:
        print("No rows returned.")
        return
    print(f"Preview rows from {table}:")
    for row in rows:
        print(row)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Read a Firebird .fdb database using the workspace-local client."
    )
    parser.add_argument(
        "--database",
        type=Path,
        default=Path(os.environ.get("FIREBIRD_DATABASE", DEFAULT_DATABASE)),
        help=f"Path to the .fdb database. Default: {DEFAULT_DATABASE}",
    )
    parser.add_argument(
        "--user",
        default=os.environ.get("FIREBIRD_USER", "SYSDBA"),
        help="Database username. Default: SYSDBA",
    )
    parser.add_argument(
        "--password",
        default=os.environ.get("FIREBIRD_PASSWORD", "masterkey"),
        help="Database password. Default: masterkey",
    )
    parser.add_argument(
        "--charset",
        default=os.environ.get("FIREBIRD_CHARSET", "UTF8"),
        help="Connection charset. Default: UTF8",
    )
    parser.add_argument(
        "--client-version",
        choices=["2.5", "5.0"],
        default=os.environ.get("FIREBIRD_CLIENT_VERSION", "2.5"),
        help="Firebird client version to use. Default: 2.5",
    )
    parser.add_argument(
        "--no-copy",
        dest="make_copy",
        action="store_false",
        help="Open the source database path directly instead of a workspace copy.",
    )
    parser.set_defaults(make_copy=True)
    parser.add_argument(
        "--list-tables",
        action="store_true",
        help="List user tables in the database.",
    )
    parser.add_argument(
        "--describe",
        metavar="TABLE",
        help="Describe columns for a table.",
    )
    parser.add_argument(
        "--preview",
        metavar="TABLE",
        help="Preview rows from a table.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=5,
        help="Row count for --preview. Default: 5",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.database.exists():
        print(f"Database file not found: {args.database}", file=sys.stderr)
        return 1

    try:
        client_lib = configure_client(args.client_version)
        args.connect_database = prepare_database(args)
        print(f"Using Firebird client: {client_lib}")
        print(f"Opening database: {args.connect_database}")
        with get_connection(args) as connection:
            cursor = connection.cursor()
            if args.describe:
                describe_table(cursor, args.describe)
            elif args.preview:
                preview_table(cursor, args.preview, args.limit)
            else:
                list_tables(cursor)
    except Exception as exc:
        print(f"Failed to read database: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
