/**
 * 
 */
declare var gamerules: {
	"enableLogging": boolean,
	"showHelp": boolean,
	"insertTutorials": boolean,
	"scoreValues": {
		"startValue": number,
		"minimumScore": number,
		"switchClick": number,
		"simulate": number,
		"wrongSolution": number,
		"correctSolution": number,
		"penaltyMultiplier": number
	},
	"phaseDifficulty": {
		"Quali": "EASY" | "MEDIUM" | "ADVANCED" | "HARD",
		"Competition": "EASY" | "MEDIUM" | "ADVANCED" | "HARD",
		"Skill": "EASY" | "MEDIUM" | "ADVANCED" | "HARD"
	},
	"reminderTime": number,
	"mediumShowSimulateButton": boolean,
	"competitionShowSkipButton": "always" | "never" | "struggling",
	"skillShowSkipButton": "always" | "never" | "struggling",
	"wrongSolutionCooldown": number,
	"wrongSolutionCooldownLimit": number,
	"wrongSolutionMultiplier": number,
	"tutorialAllowSkip": "yes" | "no" | "always",
	"simulationAllowAnnotate": boolean,

	"textPostSurveyNotice": string, // LanguageDict Entry

	"pause"?: {
		"after": number, // Time after which the pause screen is inserted
		"duration": number, // Duration before the pause screen can be skipped
		"startEvent": string | null // Any of the existing Phases
		"fileName"?: string // The file path (relative to special/pause/) of the pause special slide
	},

	"allowRepetition": boolean, // Allow the player to participate multiple times in this group

	"footer": {
		"impressum": string,
		"research": string,
		"privacy": string
	},

	"disclaimer": string,
	
	"urlPreSurvey": string | null,
	"urlPostSurvey": string | null,

	"hide": boolean
};

/** The games short git hash advertised by the server */
declare var game_hash: string

/** The group the player was initially assigned to. */
declare var group: string

/** Pseudonym/ui of this player */
declare var user: string

/** Default language send by the server */
declare var lang: string