import { engine, Name, Transform, MeshCollider, MeshRenderer } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { EntityNames } from '../assets/scene/entity-names'
import { createLeaderboardPanel, setTabData, LeaderboardPanelEntry } from './LeaderboardPanel'
import { getLeaderboardKills, getLeaderboardWaves } from './multiplayer/lobbyClient'

const PANEL_UPDATE_INTERVAL = 0.5

function formatLeaderboardName(displayName: string, address: string, maxLen: number = 14): string {
  const fallbackName = address.slice(0, 6)
  const baseName = displayName && displayName.length > 0 ? displayName : fallbackName
  const suffix = `#${address.slice(-4)}`
  const fullName = `${baseName}${suffix}`
  const safeMaxLen = Math.max(1, maxLen)

  if (fullName.length <= safeMaxLen) return fullName
  if (safeMaxLen <= suffix.length) return suffix.slice(0, safeMaxLen)
  if (safeMaxLen === suffix.length + 1) return `…${suffix}`

  const maxBaseLength = safeMaxLen - suffix.length
  return `${baseName.slice(0, Math.max(1, maxBaseLength - 1))}…${suffix}`
}

export function initLeaderboardWorldPanel(): void {
  let panelCreated = false
  let lastKillsKey = ''
  let lastWavesKey = ''
  let updateAccumulator = 0

  let panel: ReturnType<typeof createLeaderboardPanel> | null = null

  engine.addSystem((dt: number) => {
    if (!panelCreated) {
      for (const [entity, name] of engine.getEntitiesWith(Name)) {
        if (name.value !== EntityNames.leaderboard) continue
        const t = Transform.getOrNull(entity)
        if (!t) continue

        // Disable all collision on the scene plane — set mask to 0
        if (MeshCollider.has(entity)) {
          MeshCollider.getMutable(entity).collisionMask = 0
        }

        panel = createLeaderboardPanel({
          transform: {
            position: t.position,
            rotation: t.rotation,
            scale: Vector3.One()
          },
          size: Vector3.create(t.scale.x, t.scale.y, 1),
          tabs: ['KILLS', 'WAVES'],
          tabColumnHeaders: ['KILLS', 'WAVES'],
          tabData: [[], []],
          skipBackground: true
        })

        panelCreated = true
        break
      }
      return
    }

    if (!panel) return

    updateAccumulator += dt
    if (updateAccumulator < PANEL_UPDATE_INTERVAL) return
    updateAccumulator = 0

    const killsEntries = getLeaderboardKills()
    const killsData: LeaderboardPanelEntry[] = killsEntries.map((e) => ({
      name: formatLeaderboardName(e.displayName, e.address),
      value: String(e.value)
    }))
    const killsKey = killsData.map((e) => `${e.name}:${e.value}`).join('|')
    if (killsKey !== lastKillsKey) {
      lastKillsKey = killsKey
      setTabData(panel, 0, killsData)
    }

    const wavesEntries = getLeaderboardWaves()
    const wavesData: LeaderboardPanelEntry[] = wavesEntries.map((e) => ({
      name: formatLeaderboardName(e.displayName, e.address),
      value: String(e.value)
    }))
    const wavesKey = wavesData.map((e) => `${e.name}:${e.value}`).join('|')
    if (wavesKey !== lastWavesKey) {
      lastWavesKey = wavesKey
      setTabData(panel, 1, wavesData)
    }
  }, undefined, 'leaderboard-world-panel-system')
}
