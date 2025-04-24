# Documentation HRE Statistics Tool
Read all log files stored in `statistics/logFiles` and use one of the csvGenerator scripts to gather the attributes 
which will be written into the CSV file.

The group filter also resides inside the generator script (scripts are located in `app/statistics/csvGenerator`)

## Usage
`python3 -m app.statistics.statistics2 [generatorName]`


For additional information, see: `python3 -m app.statistics.statistics2 --help`

## Special Cases
The legend for all special cases, that are printed if the log level is increased to debug 
(by adding the `--log debug` flag)

1. In older logfiles, Infos might miss the load event (v0.1.0).
2. In older logfiles, the user also had to repeat the IntroduceDrawingTools after a failed Quali attempt.
3. Since the Confirm Click event and the Level Solved Feedback Dialogue are fired at the same time, the order might be 
messed up.
4. The minimum switch clicks is wrong in levels where one switch is already enabled
5. The confirm click when the level is solved is missing in some logs
6. The grid numbers in the ZVT alternative task are offset by -1 (-1 should be 0, 0 should be 1, etc)
7. The debug prefix is swallowed and therefore is wrong in the group assignement event. But maybe it can be parsed from 
the redirect event.
8. In older logfiles, the info events might be missing entirely
9. In older logfiles, the fail quali event will use a confirm click in the frontend to update the ui, which should not 
but does end up in the log
10. In older logfiles, the new Level (level load) is not followed by a started level event (v0.1.0)
11. The GameIntro is not reported anymore, since the pseudonym is generated after clicking play (v0.6.6b)
12. The covert/camou slides had no `new SlideName` event and only `Tutorial covert` and `Tutorial camouflage` in the level-type field of `loaded` event (v0.)