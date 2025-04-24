# Prometheus Metrics
from flask import Flask
from prometheus_flask_exporter import PrometheusMetrics # type: ignore

import app.config as gameConfig

class ServerMetrics:
	metrics = PrometheusMetrics.for_app_factory( # type: ignore
		excluded_paths=["/?res\\/.*", "/?src\\/.*", "/?doc\\/.*"]
	)

	# ReverSim Prometheus Metrics
	met_openLogs = metrics.info("reversim_logfile_count", "The number of open logfiles") # type: ignore
	met_playersConnected = metrics.info("reversim_player_count", # type: ignore
		"The number of players who are currently connected to the server"
	)
	met_clientErrors = metrics.info("reversim_client_errors",  # type: ignore
		"Number of error messages and exceptions reported by all clients"
	)

	@classmethod
	def createPrometheus(cls, app: Flask):
		"""Init Prometheus"""
		cls.metrics.init_app(app) # type: ignore
		cls.metrics.info('app_info', 'Application info', version=gameConfig.LOGFILE_VERSION) # type: ignore
