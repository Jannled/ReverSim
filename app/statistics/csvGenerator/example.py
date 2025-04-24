from typing import Callable, List, Union

from app.statistics.csvFile import LEVEL_ATTRIB_T, convertTimestamp, getLevelAttributes
from app.statistics.staticConfig import TableHeader, TableHeaderLevel
from app.statistics.statsParticipant import StatsParticipant
from app.statistics.statsPhase import StatsPhase
from app.statistics.statsLevel import StatsLevel
from app.utilsGame import PhaseType

# SEE doc/StatisticsTool.md for additional explanations

# EXPLANATION
# th: The table header name specified in `header`
# globalIdx: The level index, global means the ids are unique globally and not only per phase
LEVEL_HEADER_FORMAT = "%(th)s (%(globalIdx)d)"

# Filter all groups that are relevant for the exported csv. They must have the same phase structure and the same number 
# of levels. The example group `paper` has the following phase layout: 
# ["IntroduceElements", "IntroduceDrawingTools", "Quali", "Competition", "FinalScene"]
groupFilter = ['paper']

# These will become the header (first row) of the CSV file. 'LEVELS_QUALI' and 'LEVELS_COMPETITION' will be expanded by
# the headers specified inside `levelHeader`
header: List[str] = [
	TableHeader.GENERAL_UI.value,
	'Groups',
	TableHeader.GENERAL_ISDEBUGGROUP.value,
	'Num Events',
	TableHeader.GENERAL_TRAINING.value, # Has started 'IntroduceElements' and 'IntroduceDrawingTools'
	TableHeader.GENERAL_QUALIFICATION.value,
	TableHeader.GENERAL_COMPETITION.value,
	TableHeader.GENERAL_FINAL_SCENE.value,
	TableHeader.GENERAL_QUALI_ITERATIONS.value,
	'Beginning',
	'End',
	TableHeader.TIME_TOTAL.value,
	TableHeader.TIME_TRAINING.value,
	TableHeader.TIME_QUALIFICATION.value,
	TableHeader.TIME_COMPETITION.value,
	'LEVELS_QUALI', # Will get replaced by `levelHeader` table
	'LEVELS_COMPETITION', # Will get replaced by `levelHeader` table
]

# The level headers will be appended to the end of the main `header`. For every level the entire header is appended by
# following the scheme defined by `LEVEL_HEADER_FORMAT`
levelHeader: List[str] = [
	TableHeaderLevel.SOLVED.value,
	TableHeaderLevel.POSITION.value,
	TableHeaderLevel.N_SWITCH_CLICKS.value,
	TableHeaderLevel.N_CONFIRM_CLICKS.value,
	TableHeaderLevel.DRAW_TOOLS.value,
	TableHeaderLevel.TIME_SPENT.value,
	TableHeaderLevel.TIME_FIRST_TRY.value,
	TableHeaderLevel.MIN_SWITCH_CLICKS.value,
	TableHeaderLevel.EFFICIENCY_SCORE.value,
	TableHeaderLevel.ESCORE_FIRST_TRY.value,
]

# Actual logic that will generate the csv column entries, one list entry for each entry in `header`
attributes: List[Callable[[StatsParticipant], Union[LEVEL_ATTRIB_T, List[LEVEL_ATTRIB_T]]]] = [
	lambda p: p.pseudonym,
	lambda p: ' & '.join(p.groups),
	lambda p: p.isDebug,
	lambda p: p.numEvents,
	lambda p: PhaseType.ElementIntro in p.phasesStarted and PhaseType.DrawTools in p.phasesStarted,
	lambda p: PhaseType.Quali in p.phasesStarted,
	lambda p: PhaseType.Competition in p.phasesStarted,
	lambda p: PhaseType.FinalScene in p.phasesStarted,
	lambda p: p.getQualiIterations(),
	lambda p: convertTimestamp(p.startTime),
	lambda p: convertTimestamp(p.endTime),
	lambda p: p.getDuration(),
	lambda p: p.getPhaseByName(PhaseType.ElementIntro).getDuration() + p.getPhaseByName(PhaseType.DrawTools).getDuration(),
	lambda p: p.getPhaseByName(PhaseType.Quali).getDuration(),
	lambda p: p.getPhaseByName(PhaseType.Competition).getDuration() if PhaseType.Competition in p.phasesStarted else '',
	lambda p: getLevelAttributes(p, PhaseType.Quali, levelAttributes, levelHeader),
	lambda p: getLevelAttributes(p, PhaseType.Competition, levelAttributes, levelHeader)
]

# lambda Participant, Scene/Phase, Level
levelAttributes: List[Callable[[StatsParticipant, StatsPhase, StatsLevel], LEVEL_ATTRIB_T]] = [
	lambda p, s, l: l.getStatus().value,
	lambda p, s, l: l.position+1,
	lambda p, s, l: l.getInt('switchClicks'),
	lambda p, s, l: l.getInt('confirmClicks'),
	lambda p, s, l: l.getInt('drawn'),
	lambda p, s, l: l.getDuration(),
	lambda p, s, l: l.getDuration('firstTryTime') if levelConfirmed(l) else '',
	lambda p, s, l: l.getInt('minSwitchClicks') if l.isSolved() else '',
	lambda p, s, l: l.getIES() if l.isSolved() else '',
	lambda p, s, l: l.getIES(firstTry=True) if l.isSolved() else '',
]

# If the confirm button was clicked at least once
levelConfirmed: Callable[[StatsLevel], bool] = lambda l: l.getInt('confirmClicks') > 0

def clicksOverPar(level: StatsLevel, firstRun: bool = True) -> int:	
	"""Return the number of unnecessary (switch) clicks"""
	scTot = level.getAttribute('switchClicks', int, firstRun=firstRun)
	scMin = level.getAttribute('minSwitchClicks', int, firstRun=firstRun)

	assert isinstance(scTot, int)
	assert isinstance(scMin, int)

	return scTot - scMin
