import {
  Scene,
  Vector3,
  DirectionalLight,
  CubeTexture,
  FreeCamera,
  Engine,
  ShadowGenerator,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Texture,
  Color4,
  ArcRotateCamera,
  Angle,
} from '@babylonjs/core';
import '@babylonjs/loaders'; // Plugins for loading glTF files
import { ShadowOnlyMaterial } from '@babylonjs/materials';

const globals = window as any;

/**
 * A base class for AR scenes. This class provides a lighting and camera setup
 * appropriate for AR. It also provides the ability to run in a non-AR mode.
 */
class ArSceneBase extends Scene {
  /**
   * A ShadowGenerator for the scene's primary light. If you'd like a mesh in
   * your scene to cast shadows, use...
```
this.shadowGenerator.addShadowCaster(mesh);
```
   */
  protected shadowGenerator!: ShadowGenerator;

  /**
   * The ground mesh for this scene.
   */
  protected ground!: Mesh;

  /**
   * Indicates if the scene is running in AR mode. Controlled by the `disableAR`
   * constructor parameter.
   */
  protected isArEnabled = false;

  /**
   * Constructor.
   * @param engine The Babylon engine instance to use
   * @param disableAr A value of true will result in a scene that contains
   * a visible ground plane and a non-AR camera.
   */
  constructor(engine: Engine, disableAr = false) {
    super(engine);

    this.isArEnabled = !disableAr;

    this.setUpEnvironment();
    this.setUpLighting();
    this.setUpCamera();
  }

  /**
   * Called automatically during construction to build the base 3D environment
   * elements, for example, a ground plane.
   */
  protected setUpEnvironment(): void {
    if (this.isArEnabled) {
      this.setUpArEnvironment();
    } else {
      this.setUpNonArEnvironment();
    }
  }

  /**
   * Called automatically during construction when the `disableAR` constructor
   * argument is `false`.
   */
  protected setUpArEnvironment(): void {
    this.ground = MeshBuilder.CreateGround('Ground', { width: 20, height: 20 });
    this.ground.receiveShadows = true;
    this.ground.alphaIndex = -1;

    // Use a transparent, shadow only material when in AR mode.
    const material = new ShadowOnlyMaterial('GroundMat');
    material.alpha = 0.4;

    this.ground.material = material;
  }

  /**
   * Called automatically during construction when the `disableAR` constructor
   * argument is `true`.
   */
  protected setUpNonArEnvironment(): void {
    // Use black environment background.
    this.clearColor = new Color4(0, 0, 0, 1);

    this.ground = MeshBuilder.CreateGround('Ground', { width: 20, height: 20 });
    this.ground.receiveShadows = true;
    this.ground.alphaIndex = -1;

    // Use a grid material when in non AR mode.
    const material = new PBRMaterial('GroundMat');
    material.opacityTexture = new Texture('./assets/textures/ground-fade.png');
    const diffuseTexture = new Texture('./assets/textures/grey-grid.png');
    diffuseTexture.uScale = 12;
    diffuseTexture.vScale = 12;
    material.albedoTexture = diffuseTexture;
    material.roughness = 1;

    this.ground.material = material;
  }

  /**
   * Called automatically during custruction to create lighting for the scene,
   * inluding shadow casting.
   */
  protected setUpLighting(): void {
    // Set up image-based lighting (IBL).
    const iblTexture = new CubeTexture('./assets/textures/comfy_cafe_1k.env', this);
    this.environmentTexture = iblTexture;
    this.environmentIntensity = 0.8;

    // Create a key light.
    const keyLight = new DirectionalLight('KeyLight', new Vector3(-0.3, -2, 0.7), this);
    keyLight.position.y = 4;
    keyLight.intensity = 0.5;

    this.shadowGenerator = new ShadowGenerator(1024, keyLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.useKernelBlur = true;
    this.shadowGenerator.blurKernel = 16;
    this.shadowGenerator.blurScale = 4;
  }

  /**
   * Called automatically during cunsturction to create an appropriate camera
   * for the scene.
   */
  protected setUpCamera(): void {
    if (this.isArEnabled) {
      const camera = new FreeCamera('Camera', new Vector3(0, 1, 0), this);

      // Connect the camera to the XR engine and show camera feed.
      if (globals.XR8) {
        camera.addBehavior(globals.XR8.Babylonjs.xrCameraBehavior(), true);
      }
    } else {
      const target = new Vector3(0, 0.3, 0);
      const rotation = Angle.FromDegrees(-20);
      const pitch = Angle.FromDegrees(60);
      const distance = 5;
      const camera = new ArcRotateCamera('Camera', rotation.radians(), pitch.radians(), distance, target);
      camera.minZ = 0.001; // the camera's near clipping limit
      camera.lowerRadiusLimit = 0.01; // how close the camera can get to the cameraTarget
      camera.wheelPrecision = 20;
      camera.attachControl();
    }
  }
}

export default ArSceneBase;
