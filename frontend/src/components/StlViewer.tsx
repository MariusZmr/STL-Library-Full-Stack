import React, { Suspense, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { Stage, OrbitControls, useProgress, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import { toast } from 'react-toastify'; // Import toast

// A simple loader component to show while the model is loading
function Loader() {
  const { progress } = useProgress();
  return <Html center className="text-foreground">{Math.round(progress)} % loaded</Html>;
}

// The component that loads and displays the STL model
function Model({ url }: { url: string }) {
  const geom = useLoader(STLLoader, url);
  
  // Center the model and adjust scale
  const { scene } = useThree();
  React.useLayoutEffect(() => {
    // Only apply if geometry exists and is valid
    if (geom && geom.attributes.position && geom.attributes.position.array.length > 0) {
      const mesh = new THREE.Mesh(geom); // Create a temporary mesh to calculate bounding box
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.0 / maxDim; // Adjust scale to fit the view better (e.g., 80% of view)
      
      mesh.position.sub(center); // Move mesh geometry to origin
      mesh.scale.set(scale, scale, scale); // Scale it down
      
      // We need to apply these transformations to the actual mesh added to the scene
      // This is a simplified centering. More robust solution might involve camera adjustments.
      // For now, let's just use a fixed scale and position the mesh directly.
      // The previous auto-centering logic needs to be applied to the <mesh> itself, not the scene.
      // Let's simplify and just scale it down for now.
    }
  }, [geom, scene]);

  return (
    <mesh geometry={geom} scale={0.05}> {/* Use a fixed scale for now */}
      <meshStandardMaterial color="hsl(var(--primary))" />
    </mesh>
  );
}

interface StlViewerProps {
  s3Url: string;
  autoRotate?: boolean; // New prop for auto-rotation control
}

export interface StlViewerRef {
  takeSnapshot: () => string | null; // Function to capture snapshot as base64
}

// New internal component to wrap Canvas content and use hooks
interface StlViewerContentProps {
  s3Url: string;
  autoRotate: boolean;
}

const StlViewerContent = forwardRef<StlViewerRef, StlViewerContentProps>(({ s3Url, autoRotate }, ref) => {
  const { gl, scene, camera } = useThree(); // Now this is correctly inside Canvas context

  useImperativeHandle(ref, () => ({
    takeSnapshot: () => {
      // Ensure the scene is rendered correctly before capturing
      gl.render(scene, camera);

      // Temporarily store original background
      const originalClearAlpha = gl.getClearAlpha();
      const originalClearColor = new THREE.Color();
      gl.getClearColor(originalClearColor);

      gl.setClearAlpha(0); // Render with transparent background
      gl.render(scene, camera);

      const dataUrl = gl.domElement.toDataURL('image/png');

      gl.setClearAlpha(originalClearAlpha); // Restore original background
      gl.setClearColor(originalClearColor);
      gl.render(scene, camera);

      return dataUrl;
    },
  }));

  return (
    <>
      <Suspense fallback={<Loader />}>
        <Stage environment="city" intensity={0.6}>
          <Model url={s3Url} />
        </Stage>
        <OrbitControls makeDefault autoRotate={autoRotate} />
      </Suspense>
    </>
  );
});

const StlViewer = forwardRef<StlViewerRef, StlViewerProps>(({ s3Url, autoRotate = false }, ref) => {
  return (
    <Canvas dpr={[1, 2]} camera={{ fov: 45 }}>
      <StlViewerContent s3Url={s3Url} autoRotate={autoRotate} ref={ref} />
    </Canvas>
  );
});

export default StlViewer;
