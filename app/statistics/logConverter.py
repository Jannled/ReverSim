
import argparse
from collections.abc import Iterable
import logging

from sqlalchemy import select

from app.model.LogEvents import LogEvent
from app.model.Participant import Participant
from app.storage.ParticipantLogger import ParticipantLogger, PseudonymCollision
from gameServer import createMinimalApp

from app.storage.database import db


def initLogConverter():
	# Since we use Flask-SQLAlchemy, we always need an application context.
	# Otherwise we would need to initialize SQLAlchemy manually...
	app = createMinimalApp()
	db.init_app(app)

	return app

app = initLogConverter()


def getAllParticipantsFromDB() -> Iterable[str]:
	with app.app_context():
		return db.session.scalars(statement=select(Participant.pseudonym).where(Participant.loggingEnabled)).all()


def getLogEntriesFromDB(pseudonym: str):
	""""""
	with app.app_context():
		events = db.session.scalars(statement=select(LogEvent).where(LogEvent.pseudonym == pseudonym))

		for event in events:
			yield event


def getLogEntriesFromDB_asLegacy(pseudonym: str, writeToFile: bool = False):
	eventLogger = ParticipantLogger(pseudonym, loggingEnabled=writeToFile)
	eventLogger.logPath = ParticipantLogger.getLogfilePath(f"{pseudonym}_db")

	# Marshall all log entries
	for event in getLogEntriesFromDB(pseudonym):

		# Insert a TimeSync event if necessary
		if event.timeClient is not None:
			timeSyncEvent = eventLogger.checkTimeDelta(
				clientTime=event.timeClient, # type: ignore
				serverTime=event.timeServer
			)

			if timeSyncEvent is not None:
				yield timeSyncEvent

		# Handle a single logfile entry
		eventHandler = eventLogger.EVENT_MAP[type(event).__name__]
		text = eventHandler(event)
		assert text is not None, "EventHandlers should always print some text"
		yield text


def initLogConverterStandalone():
	parser = argparse.ArgumentParser(
		description="A script to export the legacy logfiles from the new database format"
	)
	parser.add_argument("pseudonym", help="The pseudonym of the participant to export")
	parser.add_argument("-l", "--log", metavar='LEVEL', 
		help="Specify the log level, must be one of DEBUG, INFO, WARNING, ERROR or CRITICAL", 
		default="INFO"
	)

	args = parser.parse_args()
	try:
		logLevel = getattr(logging, args.log.upper())
	except Exception as e:
		print("Invalid log level: " + str(e))
		exit(-1)

	# Set logging format
	logging.basicConfig(
		format='[%(levelname)s] %(message)s',
		level=logLevel,
	)

	fileName = f"logFile_{args.pseudonym}_db.txt"

	try:
		# We need to actually use the iterator, otherwise next() will never be called
		for event in getLogEntriesFromDB_asLegacy(pseudonym=args.pseudonym, writeToFile=True):
			pass

		logging.info(f'Exported "{fileName}".')

	except PseudonymCollision:
		logging.error(f'"{fileName}" was already exported. Please delete it if you would like to export again')


# Main entry point
if __name__ == "__main__":
	initLogConverterStandalone()
