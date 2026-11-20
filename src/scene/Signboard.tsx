import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { colors } from '../theme'
import { SilkLabel } from './SilkLabel'

interface SignboardProps {
  text: string
  /** Ground position of the sign's centre, in metres. */
  x: number
  z: number
  /** Rotation around Y. At 0 the front of the sign faces +Z. */
  yaw: number
  /** Gap between the two posts; the road passes between them. */
  span: number
}

const POST_SIZE = 0.35
const BOARD_HEIGHT = 1.9
const BOARD_DEPTH = 0.25
const BOARD_BOTTOM = 2.6 // clear of the car, below the chase camera
const POST_HEIGHT = BOARD_BOTTOM + BOARD_HEIGHT
const RIM = 0.12
const TEXT_SIZE = 1.25 // letter height in metres; long titles shrink to fit

/** An overhead wooden sign on two log posts, spanning the road. The title is burnt into both faces. */
export function Signboard({ text, x, z, yaw, span }: SignboardProps) {
  const width = span + POST_SIZE
  const boardY = BOARD_BOTTOM + BOARD_HEIGHT / 2
  const postX = span / 2

  return (
    <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
      {[-postX, postX].map((px) => (
        <mesh key={px} position={[px, POST_HEIGHT / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[POST_SIZE * 0.6, POST_SIZE * 0.7, POST_HEIGHT + 0.3, 10]} />
          <meshStandardMaterial color={colors.log} roughness={0.9} />
        </mesh>
      ))}
      {/* Plank board with a lighter wooden frame */}
      <mesh position={[0, boardY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + RIM * 2, BOARD_HEIGHT + RIM * 2, BOARD_DEPTH - 0.04]} />
        <meshStandardMaterial color={colors.woodLight} roughness={0.85} />
      </mesh>
      <mesh position={[0, boardY, 0]}>
        <boxGeometry args={[width, BOARD_HEIGHT, BOARD_DEPTH]} />
        <meshStandardMaterial color={colors.woodDark} roughness={0.85} />
      </mesh>
      {[0, Math.PI].map((face) => (
        <group key={face} rotation={[0, face, 0]}>
          <SilkLabel
            text={text}
            width={width - 0.4}
            height={BOARD_HEIGHT - 0.2}
            size={TEXT_SIZE}
            color={colors.cream}
            flat={false}
            position={[0, boardY, BOARD_DEPTH / 2 + 0.01]}
          />
        </group>
      ))}

      {/* Only the posts are solid; the car drives underneath the board. */}
      <RigidBody type="fixed" colliders={false}>
        {[-postX, postX].map((px) => (
          <CuboidCollider key={px} args={[POST_SIZE / 2, POST_HEIGHT / 2, POST_SIZE / 2]} position={[px, POST_HEIGHT / 2, 0]} />
        ))}
      </RigidBody>
    </group>
  )
}
