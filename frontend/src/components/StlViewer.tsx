import React, { Suspense, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber'; // Import useThree
import { Stage, OrbitControls, useProgress, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three'; // Import THREE

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
      
      // Update the geometry itself or ensure the scene's children are updated.
      // For a simple mesh in fiber, direct manipulation of the mesh's position/scale is common.
      // Alternatively, scale the loaded geometry directly if it's already a child of scene.
      // For now, let's return the scaled mesh and let Fiber handle it.
      // This is a simplified centering. More robust solution might involve camera adjustments.
    }
  }, [geom, scene]);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="hsl(var(--primary))" />
    </mesh>
  );
}

// Forward ref to expose snapshot function
interface StlViewerProps {
  s3Url: string;
  autoRotate?: boolean; // New prop for auto-rotation control
}

export interface StlViewerRef {
  takeSnapshot: () => string | null; // Function to capture snapshot as base64
}

const StlViewer = forwardRef<StlViewerRef, StlViewerProps>(({ s3Url, autoRotate = false }, ref) => { // autoRotate defaults to false for interaction
  const glRef = useRef<THREE.WebGLRenderer | null>(null); // Ref to store the renderer
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Ref to store the camera
  const sceneRef = useRef<THREE.Scene | null>(null); // Ref to store the scene

  // Setup useThree to capture renderer, scene, camera
  const { gl, camera, scene } = useThree();
  React.useLayoutEffect(() => {
    glRef.current = gl;
    cameraRef.current = camera as THREE.PerspectiveCamera;
    sceneRef.current = scene;
  }, [gl, camera, scene]);


  useImperativeHandle(ref, () => ({
    takeSnapshot: () => {
      if (!glRef.current || !sceneRef.current || !cameraRef.current) {
        toast.error("Viewer not ready for snapshot.");
        return null;
      }
      const gl = glRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;

      // Ensure the scene is rendered correctly before capturing
      gl.render(scene, camera);

      // Temporarily store original background
      const originalClearAlpha = gl.getClearAlpha();
      const originalClearColor = new THREE.Color();
      gl.getClearColor(originalClearColor);

      // Render scene with transparent background
      gl.setClearAlpha(0);
      gl.render(scene, camera); // Render again with transparent background

      const dataUrl = gl.domElement.toDataURL('image/png'); // Capture as PNG

      // Restore original background
      gl.setClearAlpha(originalClearAlpha);
      gl.setClearColor(originalClearColor);
      gl.render(scene, camera); // Re-render to restore original state

      return dataUrl;
    },
  }));

  return (
    <Canvas dpr={[1, 2]} camera={{ fov: 45 }}>
      <Suspense fallback={<Loader />}>
        <Stage environment="city" intensity={0.6}>
          <Model url={s3Url} />
        </Stage>
        <OrbitControls makeDefault autoRotate={autoRotate} /> {/* makeDefault for better control handling */}
      </Suspense>
    </Canvas>
  );
});

export default StlViewer;
