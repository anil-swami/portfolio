import { colors } from '../theme'
import { SilkLabel } from './SilkLabel'

interface WoodSignProps {
  text: string
  /** Board size in metres. */
  width: number
  height: number
  /** Height of the board's centre above the ground. */
  boardY: number
  /** Letter height in metres; long text shrinks to fit. */
  textSize: number
  /** 'wood': cream letters burnt into planks. 'paper': a pinned paper notice with dark ink. */
  style?: 'wood' | 'paper'
  /** Print the text on the back too. */
  twoSided?: boolean
}

const POST = 0.16
const DEPTH = 0.14

/** A small standing sign on two posts. Its front faces +Z; place and turn it with a parent group. */
export function WoodSign({ text, width, height, boardY, textSize, style = 'wood', twoSided = false }: WoodSignProps) {
  const top = boardY + height / 2
  const paper = style === 'paper'
  const face = (
    <SilkLabel
      text={text}
      width={width - (paper ? 0.5 : 0.25)}
      height={height - (paper ? 0.5 : 0.2)}
      size={textSize}
      color={paper ? colors.ink : colors.cream}
      flat={false}
      position={[0, boardY, DEPTH / 2 + (paper ? 0.02 : 0.01)]}
    />
  )

  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - POST), top / 2, -DEPTH / 2 - POST / 2]} castShadow>
          <boxGeometry args={[POST, top + 0.1, POST]} />
          <meshStandardMaterial color={colors.woodDark} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, boardY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, DEPTH]} />
        <meshStandardMaterial color={colors.wood} roughness={0.85} />
      </mesh>
      {paper && (
        <mesh position={[0, boardY, DEPTH / 2 + 0.01]}>
          <planeGeometry args={[width - 0.35, height - 0.35]} />
          <meshStandardMaterial color={colors.paper} roughness={0.95} />
        </mesh>
      )}
      {face}
      {twoSided && <group rotation={[0, Math.PI, 0]}>{face}</group>}
    </group>
  )
}
