import {
  engine,
  Entity,
  GltfContainer,
  Name,
  Transform
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { EntityNames } from '../assets/scene/entity-names'
import { isLocalPlayerInsideLobbyTrigger } from './lobbyWorldPanel'
import { RoomId, getArenaRoomConfig } from './shared/roomConfig'

const POST_TUTORIAL_ARROW_SRC = 'assets/scene/Models/arrow.glb'
const POST_TUTORIAL_TARGET_ROOM_ID: RoomId = 'room_2'
const POST_TUTORIAL_ARROW_HEIGHT = 0.05
const POST_TUTORIAL_ARROW_SHOW_SCALE = Vector3.create(1, 1, 1)
const POST_TUTORIAL_ARROW_HIDE_SCALE = Vector3.create(0, 0, 0)
const POST_TUTORIAL_ARROW_ARRIVE_DISTANCE = 2.2

let postTutorialArrowEntity: Entity | null = null
let postTutorialArrowTargetEntity: Entity | null = null
let postTutorialArrowActive = false

function requireSceneEntity(entityName: EntityNames): Entity {
  for (const [entity, name] of engine.getEntitiesWith(Name)) {
    if (name.value === entityName) return entity
  }

  throw new Error(`[PostTutorialArrow] Scene entity not found: ${entityName}`)
}

export function initPostTutorialArrow(): void {
  if (postTutorialArrowEntity !== null) return

  const roomConfig = getArenaRoomConfig(POST_TUTORIAL_TARGET_ROOM_ID)
  postTutorialArrowTargetEntity = requireSceneEntity(roomConfig.triggerEntityName)
  postTutorialArrowEntity = engine.addEntity()

  Transform.create(postTutorialArrowEntity, {
    parent: engine.PlayerEntity,
    position: Vector3.create(0, POST_TUTORIAL_ARROW_HEIGHT, 0),
    scale: POST_TUTORIAL_ARROW_HIDE_SCALE
  })

  GltfContainer.create(postTutorialArrowEntity, {
    src: POST_TUTORIAL_ARROW_SRC
  })

  engine.addSystem(postTutorialArrowSystem, undefined, 'post-tutorial-arrow-system')
}

export function activatePostTutorialArrow(): void {
  postTutorialArrowActive = true
}

export function deactivatePostTutorialArrow(): void {
  postTutorialArrowActive = false
  if (postTutorialArrowEntity === null || !Transform.has(postTutorialArrowEntity)) return
  Transform.getMutable(postTutorialArrowEntity).scale = POST_TUTORIAL_ARROW_HIDE_SCALE
}

function postTutorialArrowSystem(): void {
  if (!postTutorialArrowActive || postTutorialArrowEntity === null || postTutorialArrowTargetEntity === null) return
  if (isLocalPlayerInsideLobbyTrigger()) {
    deactivatePostTutorialArrow()
    return
  }
  if (!Transform.has(engine.PlayerEntity) || !Transform.has(postTutorialArrowEntity) || !Transform.has(postTutorialArrowTargetEntity)) {
    return
  }

  const playerTransform = Transform.get(engine.PlayerEntity)
  const targetPosition = Transform.get(postTutorialArrowTargetEntity).position
  const dx = targetPosition.x - playerTransform.position.x
  const dz = targetPosition.z - playerTransform.position.z
  const distance = Math.sqrt(dx * dx + dz * dz)
  const arrowTransform = Transform.getMutable(postTutorialArrowEntity)

  if (distance < POST_TUTORIAL_ARROW_ARRIVE_DISTANCE) {
    deactivatePostTutorialArrow()
    return
  }

  const worldAngle = Math.atan2(dx, dz) * (180 / Math.PI)
  const playerRotation = playerTransform.rotation
  const playerYAngle =
    Math.atan2(
      2 * (playerRotation.y * playerRotation.w + playerRotation.x * playerRotation.z),
      1 - 2 * (playerRotation.y * playerRotation.y + playerRotation.x * playerRotation.x)
    ) *
    (180 / Math.PI)

  arrowTransform.rotation = Quaternion.fromEulerDegrees(0, worldAngle - playerYAngle, 0)
  arrowTransform.scale = POST_TUTORIAL_ARROW_SHOW_SCALE
}
