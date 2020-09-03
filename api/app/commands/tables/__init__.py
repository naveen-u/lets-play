import click
from flask.cli import AppGroup, with_appcontext
from app import flask_app, db

populate_db_methods = {}

tables_cli = AppGroup("tables", short_help="Populate and clear the LetsPlay! database.")


@tables_cli.command("populate")
@click.option(
    "-l",
    "--list",
    "shouldList",
    is_flag=True,
    default=False,
    help="List the tables that can be populated.",
)
@click.argument("name", required=False)
@with_appcontext
def populate_tables(shouldList, name=None):
    """
    Populate game-specific tables.
    """
    if shouldList:
        print("The following are available to be populated.\n")
        for i, name in enumerate(populate_db_methods.keys()):
            print(f"\t{i+1}. {name}")
        return
    if name is not None and name.lower() in populate_db_methods:
        populate_db_methods[name.lower()]()
    elif name is None:
        for func in populate_db_methods.values():
            func()
    else:
        print(
            "Could not find an option by that name. Run the populate command with --list or -l to see the available options."
        )


def register_populate_db_method(name=None):
    if name is None:

        def wrapper(f):
            if f.__name__ in populate_db_methods:
                raise RuntimeError(
                    f"A method by the name {f.__name__.lower()} is already registered"
                )
            populate_db_methods[f.__name__.lower()] = f

    else:

        def wrapper(f):
            func_name = name.lower()
            if func_name in populate_db_methods:
                raise RuntimeError(
                    f"A method by the name {func_name} is already registered"
                )
            populate_db_methods[func_name] = f

    return wrapper


@tables_cli.command("reset")
@with_appcontext
def reset_tables():
    """
    Clear all tables.
    """
    tables = []
    for clazz in db.Model._decl_class_registry.values():
        try:
            tables.append({"name": clazz.__tablename__, "model": clazz})
        except:
            pass
    for table in tables:
        deleted = table.get("model").query.delete()
        print(
            f"Deleted {deleted} {'entry' if deleted == 1 else 'entries'} from table {table.get('name')}"
        )
    db.session.commit()


@tables_cli.command("list")
@with_appcontext
def list_tables():
    """
    List database tables.
    """
    tables = []
    for clazz in db.Model._decl_class_registry.values():
        try:
            tables.append(clazz.__tablename__)
        except:
            pass
    print("The following tables are present in the database:\n")
    for i, table in enumerate(tables):
        print(f"\t{i+1}. {table}")
    db.session.commit()


flask_app.cli.add_command(tables_cli)

from .codenames import *
