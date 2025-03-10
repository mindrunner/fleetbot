import { Faction } from '../lib/util/galaxy-sectors-data'

export const getRandomFleetName = (
    chance: Chance.Chance,
    maxLen: number,
    faction: Faction,
): string => {
    // Validate inputs
    if (maxLen < 7) {
        // Minimum reasonable fleet name length
        throw new Error('Maximum length must be at least 7 characters')
    }

    // Define faction-specific naming schemes
    const factionSchemes = {
        // ONI - Alien faction: Mysterious, organic, ethereal naming convention
        [Faction.ONI]: {
            prefixes: [
                'Void',
                'Nebula',
                'Hive',
                'Swarm',
                'Harmony',
                'Drift',
                'Essence',
                'Echo',
                'Whisper',
                'Tide',
                'Mindflow',
                'Overmind',
                'Symbiosis',
                'Thought',
                'Dream',
                'Abyss',
                'Consciousness',
                'Luminous',
                'Ancient',
            ],
            suffixes: [
                'Clutch',
                'Collective',
                'Chorus',
                'Brood',
                'Symphony',
                'Convergence',
                'Unity',
                'Hivemind',
                'Network',
                'Nexus',
                'Hegemony',
                'Communion',
            ],
            patterns: [
                (p: string, s: string) => `${p} ${s}`,
                (p: string, s: string) => `${s} of ${p}`,
                (p: string, s: string) => `The ${p} ${s}`,
            ],
        },

        // UST - Robot faction: Precise, mechanical, numerical naming convention
        [Faction.UST]: {
            prefixes: [
                'Alpha',
                'Beta',
                'Delta',
                'Omega',
                'Tactical',
                'Strategic',
                'Autonomous',
                'Prime',
                'Quantum',
                'Mainframe',
                'Precision',
                'Protocol',
                'Silicon',
                'Logic',
                'Binary',
                'Circuit',
                'Processor',
                'Vector',
                'Algorithm',
                'Integrated',
            ],
            suffixes: [
                'Unit',
                'Division',
                'Array',
                'Matrix',
                'Battalion',
                'Directive',
                'Initiative',
                'Grid',
                'Cluster',
                'Assembly',
                'Framework',
                'Network',
                'Legion',
                'Contingent',
            ],
            patterns: [
                (p: string, s: string) => `${p}-${s}`,
                (p: string, s: string) => `${p} ${s}`,
                (p: string, s: string) =>
                    `${s} ${p}-${chance.integer({ min: 1, max: 9999 })}`,
            ],
        },

        // MUD - Human faction: Traditional, heroic, historical naming convention
        [Faction.MUD]: {
            prefixes: [
                'Valiant',
                'Defiant',
                'Intrepid',
                'Dauntless',
                'Liberty',
                'Justice',
                'Freedom',
                'Thunder',
                'Crimson',
                'Guardian',
                'Sentinel',
                'Sovereign',
                'Redemption',
                'Resolute',
                'Vigilant',
                'Triumph',
                'Valor',
                'Heritage',
            ],
            suffixes: [
                'Fleet',
                'Armada',
                'Squadron',
                'Brigade',
                'Command',
                'Task Force',
                'Vanguard',
                'Defenders',
                'Regiment',
                'Corps',
                'Alliance',
                'Flotilla',
            ],
            patterns: [
                (p: string, s: string) => `${p} ${s}`,
                (_: string, s: string) => `${chance.city()} ${s}`,
                (p: string, s: string) => `${s} of ${p}`,
            ],
        },
    }

    // Get the appropriate scheme for the faction
    const scheme = factionSchemes[faction]

    // Set maximum attempts to prevent infinite loops
    const maxAttempts = 100
    let attempts = 0

    // Try to generate a valid name
    while (attempts < maxAttempts) {
        const prefix = chance.pickone(scheme.prefixes)
        const suffix = chance.pickone(scheme.suffixes)
        const pattern = chance.pickone(scheme.patterns)

        const name = pattern(prefix, suffix)

        if (name.length <= maxLen) {
            return name
        }

        attempts++
    }

    // Fallback names by faction
    const fallbacks = {
        [Faction.ONI]: 'Void Nexus',
        [Faction.UST]: 'Alpha-Unit',
        [Faction.MUD]: 'Valiant Fleet',
    }

    return fallbacks[faction].substring(0, maxLen)
}
