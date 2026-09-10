const MODEL_PATH = "./assets/models/object.glb";
const USDZ_PATH = "./assets/models/object.usdz";

const container = document.querySelector("#three-container");
const status = document.querySelector("#model-status");
const arStatus = document.querySelector("#ar-status");

function setStatus(text) {
  if (status) status.textContent = text;
}


/* =========================================================
   VISOR 3D
========================================================= */

async function initViewer() {

  if (!container) return;

  try {

    const THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
    );

    const { OrbitControls } = await import(
      "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js"
    );

    const { GLTFLoader } = await import(
      "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js"
    );


    /* =====================================================
       RENDERER
    ===================================================== */

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);


    /* =====================================================
       ESCENA
    ===================================================== */

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xe8e6df);


    /* =====================================================
       CÁMARA
    ===================================================== */

    const camera = new THREE.PerspectiveCamera(
      32,
      container.clientWidth / container.clientHeight,
      0.01,
      1000
    );

    camera.position.set(2, 1.4, 3);


    /* =====================================================
       CONTROLES
    ===================================================== */

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    controls.enablePan = false;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;

    controls.minDistance = 0.1;
    controls.maxDistance = 100;


    /* =====================================================
       ILUMINACIÓN
    ===================================================== */

    scene.add(
      new THREE.HemisphereLight(
        0xffffff,
        0x888888,
        2.2
      )
    );


    const key = new THREE.DirectionalLight(
      0xffffff,
      3
    );

    key.position.set(3, 5, 4);

    key.castShadow = true;

    scene.add(key);


    const fill = new THREE.DirectionalLight(
      0xffffff,
      1.2
    );

    fill.position.set(-4, 2, -2);

    scene.add(fill);


    /* =====================================================
       CARGAR GLB
    ===================================================== */

    const loader = new GLTFLoader();

    const gltf = await loader.loadAsync(
      MODEL_PATH
    );

    const model = gltf.scene;


    model.traverse((object) => {

      if (object.isMesh) {

        object.castShadow = true;
        object.receiveShadow = true;

      }

    });


    scene.add(model);


    /* =====================================================
       CENTRAR MODELO
    ===================================================== */

    const box = new THREE.Box3().setFromObject(
      model
    );

    const size = box.getSize(
      new THREE.Vector3()
    );

    const center = box.getCenter(
      new THREE.Vector3()
    );

    model.position.sub(center);


    /* =====================================================
       ESCALA
    ===================================================== */

    const maxDim = Math.max(
      size.x,
      size.y,
      size.z
    );

    const targetSize = 2.15;

    model.scale.setScalar(
      targetSize / maxDim
    );


    /* =====================================================
       AJUSTAR CÁMARA
    ===================================================== */

    const scaledBox =
      new THREE.Box3().setFromObject(model);

    const scaledSize =
      scaledBox.getSize(
        new THREE.Vector3()
      );

    const radius = Math.max(
      scaledSize.x,
      scaledSize.y,
      scaledSize.z
    );


    camera.position.set(
      radius * 1.6,
      radius * 1.05,
      radius * 1.8
    );


    camera.near = Math.max(
      0.001,
      radius / 100
    );

    camera.far = radius * 100;

    camera.updateProjectionMatrix();


    controls.target.set(
      0,
      scaledSize.y * 0.05,
      0
    );

    controls.maxDistance =
      radius * 5;

    controls.minDistance =
      radius * 0.35;


    /* =====================================================
       ESTADO
    ===================================================== */

    setStatus("GLB cargado");


    /* =====================================================
       INTERACCIÓN
    ===================================================== */

    controls.addEventListener(
      "start",
      () => {

        controls.autoRotate = false;

      }
    );


    controls.addEventListener(
      "end",
      () => {

        setTimeout(() => {

          if (!document.hidden) {
            controls.autoRotate = true;
          }

        }, 1200);

      }
    );


    /* =====================================================
       REDIMENSIONAMIENTO
    ===================================================== */

    const resize = () => {

      const width =
        container.clientWidth;

      const height =
        container.clientHeight;

      if (!width || !height) return;

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );

    };


    window.addEventListener(
      "resize",
      resize
    );


    /* =====================================================
       ANIMACIÓN
    ===================================================== */

    function animate() {

      requestAnimationFrame(
        animate
      );

      controls.update();

      renderer.render(
        scene,
        camera
      );

    }

    animate();


  } catch (error) {

    console.error(
      "Error cargando visor 3D:",
      error
    );

    setStatus(
      "No se pudo cargar el modelo 3D"
    );

  }

}


/* =========================================================
   REALIDAD AUMENTADA
========================================================= */

function setupARButtons() {

  const buttons =
    document.querySelectorAll(
      ".ar-link"
    );


  /* URLs ABSOLUTAS */

  const glbURL =
    new URL(
      MODEL_PATH,
      window.location.href
    ).href;


  const usdzURL =
    new URL(
      USDZ_PATH,
      window.location.href
    ).href;


  /* DETECTAR DISPOSITIVO */

  const isAndroid =
    /Android/i.test(
      navigator.userAgent
    );


  const isIOS =
    /iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );


  buttons.forEach(
    (button) => {


      /* ===================================================
         ANDROID
      =================================================== */

      if (isAndroid) {

        const sceneViewerURL =
          "https://arvr.google.com/scene-viewer/1.0" +
          "?file=" +
          encodeURIComponent(glbURL) +
          "&mode=ar_preferred" +
          "&title=" +
          encodeURIComponent("NexiCare");


        button.href =
          sceneViewerURL;

        button.removeAttribute(
          "rel"
        );


        if (arStatus) {

          arStatus.textContent =
            "En Android, NexiCare se abrirá mediante Google Scene Viewer.";

        }


      }


      /* ===================================================
         IPHONE / IPAD
      =================================================== */

      else if (isIOS) {

        button.href =
          usdzURL;

        button.setAttribute(
          "rel",
          "ar"
        );


        if (arStatus) {

          arStatus.textContent =
            "En iPhone y iPad, NexiCare se abrirá mediante Apple Quick Look.";

        }

      }


      /* ===================================================
         COMPUTADORA
      =================================================== */

      else {

        button.href =
          glbURL;

        button.removeAttribute(
          "rel"
        );


        if (arStatus) {

          arStatus.textContent =
            "En computadora se abrirá el modelo 3D GLB.";

        }

      }

    }
  );

}


/* =========================================================
   COMPROBAR ARCHIVOS
========================================================= */

async function checkFiles() {

  try {

    const glbResponse =
      await fetch(
        MODEL_PATH,
        {
          method: "HEAD",
          cache: "no-store"
        }
      );


    if (!glbResponse.ok) {

      throw new Error(
        "GLB no encontrado"
      );

    }


    if (arStatus) {

      arStatus.textContent =
        "Modelo preparado para realidad aumentada.";

    }

  } catch (error) {

    console.warn(
      "No se pudo comprobar el GLB:",
      error
    );

  }

}


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initViewer();

    setupARButtons();

    checkFiles();

  }
);
