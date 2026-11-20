import { BallCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { content } from '../content'
import { useGame } from '../state/store'
import { colors } from '../theme'
import { SECRET } from '../world/layout'

/** A mushroom hidden behind a big mossy boulder. Driving up to it lights it and shows a toast, once. */
export function Secret() {
  const found = useGame((s) => s.secretFound)
  const findSecret = useGame((s) => s.findSecret)
  const { mushroom, rock } = SECRET

  return (
    <>
      {/* The boulder that hides it, with a cap of moss */}
      <mesh position={[rock.x, rock.height * 0.38, rock.z]} scale={[rock.radius, rock.height * 0.62, rock.radius * 0.9]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={colors.stone} roughness={1} flatShading />
      </mesh>
      <mesh position={[rock.x, rock.height * 0.62, rock.z]} scale={[rock.radius * 0.8, rock.height * 0.32, rock.radius * 0.72]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={colors.moss} roughness={1} flatShading />
      </mesh>

      {/* The mushroom */}
      <group position={[mushroom.x, 0, mushroom.z]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.2, 0.7, 10]} />
          <meshStandardMaterial color={colors.cream} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={colors.mushroom}
            emissive={colors.ledAmber}
            emissiveIntensity={found ? 1.6 : 0}
            roughness={0.5}
          />
        </mesh>
      </group>

      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[rock.height / 2, rock.radius * 0.9]} position={[rock.x, rock.height / 2, rock.z]} />
        <BallCollider
          sensor
          args={[3]}
          position={[mushroom.x, 0.5, mushroom.z]}
          onIntersectionEnter={(e) => {
            if (e.other.rigidBodyObject?.userData?.car) findSecret(content.world.secret)
          }}
        />
      </RigidBody>
    </>
  )
}
