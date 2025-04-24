import logging
import random
import sqlite3
import string
import timeit
from typing import Any

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, event
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.pool import NullPool, StaticPool, QueuePool

from sqlalchemy.engine.interfaces import DBAPIConnection

DIALECT_SQLITE = 'sqlite'


class Base(DeclarativeBase):
	"""Base Model that all Model classes that should be persisted have to extend."""
	pass

class DefaultFlaskSettings:
	SQLALCHEMY_DATABASE_URI = "sqlite+pysqlite:///performance_test.db" # instance/*.db
	SQLALCHEMY_ECHO = False


# Some default options added to the gameServer.py@DefaultFlaskSettings
_sqlalchemy_args: dict[str, Any] = {
	"model_class": Base,
	"engine_options": {
		# NullPool is more robust against wsgi server implementations, that use multiprocessing / os.fork
		# https://docs.sqlalchemy.org/en/20/core/pooling.html#using-connection-pools-with-multiprocessing-or-os-fork
		#"poolclass": NullPool,
		"poolclass": StaticPool,
		#"poolclass": QueuePool,

		"connect_args": {
			"autocommit": sqlite3.LEGACY_TRANSACTION_CONTROL
		}
	}
}


def createApp():
	# Start the webserver
	app = Flask(__name__, 
		static_url_path='', 
		static_folder='./static', 
		template_folder='./templates'
	)

	# Load config object
	app.config.from_object(DefaultFlaskSettings)
	return app


def createDatabase(app: Flask):
	db = SQLAlchemy(**_sqlalchemy_args)
	db.init_app(app)

	
	def do_connect(dbapi_connection: DBAPIConnection, connection_record: Any):
		# disable pysqlite's emitting of the BEGIN statement entirely.
		# also stops it from emitting COMMIT before any DDL.
		assert app is not None
		with app.app_context():
			dbapi_connection.isolation_level = None # type: ignore


	def do_begin(conn: Any):
		# emit our own BEGIN
		global app
		assert app is not None
		with app.app_context():
			# NOTE: When not in EXCLUSIVE mode, a transaction can later be upgraded to a
			# write, in which case multiple reads are no longer possible as the other 
			# transaction might have performed a dirty read and the ACID principle would
			# be violated. This is probably the reason, why this will not timeout other
			# transactions but instead immediately throws an SQLITE_BUSY error.
			conn.exec_driver_sql("BEGIN EXCLUSIVE")


	# Create or upgrade the database
	with app.app_context():
		db.create_all()
		db.session.commit()
	
		if db.engine.dialect.name == DIALECT_SQLITE:
			event.listen(db.engine, "connect", do_connect)
			event.listen(db.engine, "begin", do_begin)
		

	return db


# --- Main ---
# Init Flask
app = createApp()

# Init the DB
db: SQLAlchemy = createDatabase(app)


class DemoTable(db.Model):
	rowID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
	randomValue: Mapped[float] = mapped_column()
	randomString: Mapped[str] = mapped_column(String(4096))


	def __init__(self) -> None:
		super().__init__()
		self.randomValue = random.randrange(0, int(10e9))
		self.randomString = ''.join(random.choices(
			string.ascii_uppercase + string.ascii_letters, k=4000
		))


def fillDummyData(numElements: int = 10000):
	logging.info(f"Filling database with {numElements} dummy elements.")
	with app.app_context():
		db.create_all()

		for i in range(0, numElements):
			db.session.add(DemoTable())
		
		db.session.commit()
		db.session.flush()


def testAccess():
	with app.app_context():
		demoData = db.session.get(DemoTable, random.randrange(0, 10000))
		logging.debug(demoData)


if __name__ == '__main__':
	logging.basicConfig(
		level=logging.INFO
	)

	try:
		poolImplName = _sqlalchemy_args['engine_options']['poolclass'].__name__ # type: ignore
		logging.info(f'Database speed comparison using Pool class "{poolImplName}".')

		result = timeit.timeit(stmt=testAccess, setup=fillDummyData, number=10000)
		logging.warning(f'Result: {round(result, 2)}s')

	except SystemExit as e:
		logging.info(str(e))
