import React from "react";

const ExhibitionLights: React.FC = () => {
  return (
    <>
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <ambientLight intensity={0.5} />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <pointLight
        position={[0, 3, 5]}
        intensity={1.5}
        color="#fffbe6"
        castShadow
      />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <pointLight
        position={[-1.5, 2.5, 4]}
        intensity={1.1}
        color="#fffbe6"
        castShadow
      />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <pointLight
        position={[1.5, 2.5, 4]}
        intensity={1.1}
        color="#fffbe6"
        castShadow
      />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <pointLight position={[0, 2, -3]} intensity={0.3} />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <pointLight position={[3, 2, 0]} intensity={0.3} />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <pointLight position={[-3, 2, 0]} intensity={0.3} />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <pointLight position={[1.5, -2, 1.5]} intensity={0.2} />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <pointLight position={[-1.5, -2, 1.5]} intensity={0.2} />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <spotLight
        position={[0, 5, 2]}
        angle={0.35}
        penumbra={0.5}
        intensity={0.7}
        castShadow
        color="#fffbe6"
        target-position={[0, 0, 0]}
      />
      {/* sonarlint-disable-next-line typescript:S6747 */}
      <directionalLight position={[0, 10, 0]} intensity={0.3} castShadow />
    </>
  );
};

export default ExhibitionLights;
