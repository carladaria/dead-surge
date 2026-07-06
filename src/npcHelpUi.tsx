import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { beginUiPointerCapture, endUiPointerCapture } from './gameplayInput'
import { isMobile } from './ui'
import { restartTutorial } from './tutorial'

let npcHelpOpen = false

export function openNpcHelpUi(): void {
  npcHelpOpen = true
}

export function closeNpcHelpUi(): void {
  if (!npcHelpOpen) return
  npcHelpOpen = false
  endUiPointerCapture()
}

export function isNpcHelpUiOpen(): boolean {
  return npcHelpOpen
}

// Source image is assets/images/tutorials/npc.png (1024x683). Button rects below
// are pixel coordinates measured against that source image.
const NPC_HELP_IMAGE_SRC = 'assets/images/tutorials/npc_kira.png'
const NPC_HELP_IMAGE_WIDTH = 1024
const NPC_HELP_IMAGE_HEIGHT = 683
const NPC_HELP_PANEL_WIDTH_DESKTOP = 900
const NPC_HELP_PANEL_WIDTH_MOBILE = 836

const NPC_HELP_CLOSE_ICON_RECT = { left: 888, top: 35, width: 82, height: 88 }
const NPC_HELP_TUTORIAL_BUTTON_RECT = { left: 451, top: 507, width: 269, height: 88 }
const NPC_HELP_CLOSE_BUTTON_RECT = { left: 748, top: 507, width: 217, height: 88 }

function scaleRect(
  rect: { left: number; top: number; width: number; height: number },
  panelWidth: number,
  panelHeight: number
) {
  return {
    left: Math.round((panelWidth * rect.left) / NPC_HELP_IMAGE_WIDTH),
    top: Math.round((panelHeight * rect.top) / NPC_HELP_IMAGE_HEIGHT),
    width: Math.round((panelWidth * rect.width) / NPC_HELP_IMAGE_WIDTH),
    height: Math.round((panelHeight * rect.height) / NPC_HELP_IMAGE_HEIGHT)
  }
}

function handleRestartTutorial(): void {
  closeNpcHelpUi()
  restartTutorial()
}

export function NpcHelpUi() {
  if (!npcHelpOpen) return null

  const panelWidth = isMobile() ? NPC_HELP_PANEL_WIDTH_MOBILE : NPC_HELP_PANEL_WIDTH_DESKTOP
  const panelHeight = Math.round((panelWidth * NPC_HELP_IMAGE_HEIGHT) / NPC_HELP_IMAGE_WIDTH)
  const closeIconRect = scaleRect(NPC_HELP_CLOSE_ICON_RECT, panelWidth, panelHeight)
  const tutorialButtonRect = scaleRect(NPC_HELP_TUTORIAL_BUTTON_RECT, panelWidth, panelHeight)
  const closeButtonRect = scaleRect(NPC_HELP_CLOSE_BUTTON_RECT, panelWidth, panelHeight)

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        alignItems: 'center',
        justifyContent: 'center',
        pointerFilter: 'block',
        zIndex: 20
      }}
    >
      <UiEntity
        uiTransform={{
          width: panelWidth,
          height: panelHeight,
          positionType: 'relative'
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: { src: NPC_HELP_IMAGE_SRC, filterMode: 'tri-linear', wrapMode: 'clamp' }
        }}
      >
        <UiEntity
          uiTransform={{
            width: closeIconRect.width,
            height: closeIconRect.height,
            positionType: 'absolute',
            position: { left: closeIconRect.left, top: closeIconRect.top }
          }}
          uiBackground={{ color: Color4.create(1, 1, 1, 0) }}
          onMouseDown={() => {
            beginUiPointerCapture()
            closeNpcHelpUi()
          }}
          onMouseUp={endUiPointerCapture}
        />
        <UiEntity
          uiTransform={{
            width: tutorialButtonRect.width,
            height: tutorialButtonRect.height,
            positionType: 'absolute',
            position: { left: tutorialButtonRect.left, top: tutorialButtonRect.top }
          }}
          uiBackground={{ color: Color4.create(1, 1, 1, 0) }}
          onMouseDown={() => {
            beginUiPointerCapture()
            handleRestartTutorial()
          }}
          onMouseUp={endUiPointerCapture}
        />
        <UiEntity
          uiTransform={{
            width: closeButtonRect.width,
            height: closeButtonRect.height,
            positionType: 'absolute',
            position: { left: closeButtonRect.left, top: closeButtonRect.top }
          }}
          uiBackground={{ color: Color4.create(1, 1, 1, 0) }}
          onMouseDown={() => {
            beginUiPointerCapture()
            closeNpcHelpUi()
          }}
          onMouseUp={endUiPointerCapture}
        />
      </UiEntity>
    </UiEntity>
  )
}
