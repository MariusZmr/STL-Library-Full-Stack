import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Stage, OrbitControls, useProgress, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// A simple loader component to show while the model is loading
function Loader() {
  const { progress } = useProgress();
  return <Html center>{Math.round(progress)} % loaded</Html>;
}

// The component that loads and displays the STL model
function Model({ url }: { url: string }) {
  const geom = useLoader(STLLoader, url);
  
  return (
    <mesh geometry={geom} scale={0.05}>
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

interface StlViewerProps {
  s3Url: string;
}

const StlViewer: React.FC<StlViewerProps> = ({ s3Url }) => {
  return (
    <div style={{ height: '140px', width: '100%', background: '#f0f0f0' }}>
      <Canvas dpr={[1, 2]} camera={{ fov: 45 }}>
        <Suspense fallback={<Loader />}>
          <Stage environment="city" intensity={0.6}>
            <Model url={s3Url} />
          </Stage>
          <OrbitControls autoRotate />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default StlViewer;
